import Queue from 'bull';
import 'dotenv/config'; // Load .env file
import { readFileSync } from 'fs';
import handlebars from 'handlebars';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { join } from 'path';
import { createClient } from 'redis';

// Load environment variables
const {
  MONGODB_URI,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  REDIS_TLS,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,
} = process.env;

// 1. Test MongoDB Connection
async function testMongoDB() {
  console.log('Testing MongoDB connection...');
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// 2. Test Redis Connection
async function testRedis() {
  console.log('\nTesting Redis connection...');
  const client = createClient({
    socket: {
      host: REDIS_HOST,
      port: Number(REDIS_PORT),
    },
    password: REDIS_PASSWORD,
    tls: REDIS_TLS === 'true',
  });

  client.on('error', (err) => {
    console.error('❌ Redis connection failed:', err.message);
  });

  try {
    await client.connect();
    console.log('✅ Redis connected successfully');
    await client.ping();
    console.log('✅ Redis PING successful');
  } catch (error) {
    console.error('❌ Redis error:', error.message);
  } finally {
    await client.quit();
  }
}

// 3. Test SMTP Connection and Email Sending
async function testSMTP() {
  console.log('\nTesting SMTP connection...');
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    logger: true, // Enable logging
    debug: true,  // Enable debug output
  });

  // Verify SMTP connection
  try {
    await transporter.verify();
    console.log('✅ SMTP server is ready to take messages');
  } catch (error) {
    console.error('❌ SMTP verification failed:', error.message);
    return;
  }

  // Test sending an email
  console.log('\nTesting email sending...');
  const mailOptions = {
    from: SMTP_USER,
    to: 'test-recipient@example.com', // Replace with a valid test email
    subject: 'Test Email from Gestion PFE',
    text: 'This is a test email to verify SMTP configuration.',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
  }
}

// 4. Test Handlebars Template Rendering
async function testTemplate() {
  console.log('\nTesting Handlebars template rendering...');
  const templatePath = join(process.cwd(), 'templates', 'emails', 'defense-accepted.hbs');

  try {
    // Check if template file exists
    if (!readFileSync(templatePath)) {
      console.error('❌ Template file not found at:', templatePath);
      return;
    }

    // Load and compile template
    const source = readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);

    // Test rendering with sample data
    const sampleData = {
      subject: 'Soutenance acceptée !',
      content: `
        <p>Félicitations ! Votre demande de soutenance a été acceptée.</p>
        <div class='highlight-box'>
          <h3>Détails de la soutenance</h3>
          <p><strong>Statut:</strong> Acceptée</p>
        </div>
        <p>Veuillez consulter votre espace personnel pour plus de détails et les prochaines étapes.</p>
      `,
      actionUrl: 'http://localhost:5173/soutenance',
      actionText: 'Voir ma soutenance',
      priority: 'high',
      priorityLabel: 'High Priority',
    };

    const rendered = template(sampleData);
    console.log('✅ Template rendered successfully');
    console.log('Rendered output (first 200 chars):', rendered.substring(0, 200));
  } catch (error) {
    console.error('❌ Template rendering failed:', error.message);
  }
}

// 5. Test Redis Queue (using Bull)
async function testQueue() {
  console.log('\nTesting Redis Queue (Bull)...');
  const emailQueue = new Queue('email-queue', {
    redis: {
      host: REDIS_HOST,
      port: Number(REDIS_PORT),
      password: REDIS_PASSWORD,
      tls: REDIS_TLS === 'true' ? {} : null,
    },
  });

  // Test adding a job
  try {
    await emailQueue.add({
      from: SMTP_USER,
      to: 'test-recipient@example.com',
      subject: 'Test Queue Email',
      text: 'This is a test email from the queue.',
    });
    console.log('✅ Job added to queue successfully');
  } catch (error) {
    console.error('❌ Failed to add job to queue:', error.message);
  }

  // Test-country processing a job
  emailQueue.process(async (job) => {
    console.log('✅ Processing queue job:', job.data);
    return { status: 'processed' };
  });

  // Check queue status
  const jobs = await emailQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
  console.log('Queue jobs:', jobs.map(job => ({ id: job.id, status: job.status })));

  await emailQueue.close();
}

// Main function to run all tests
async function runTests() {
  console.log('Starting test script...\n');
  await testMongoDB();
  await testRedis();
  await testSMTP();
  await testTemplate();
  await testQueue();
  console.log('\nAll tests completed.');
}

runTests().catch((error) => {
  console.error('Test script failed:', error.message);
  process.exit(1);
});