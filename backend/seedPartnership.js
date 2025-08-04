// seedPartnership.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Partnership from './models/Partnership.js'; // update this path if needed

dotenv.config();

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/pfe_management_db';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  seedPartnerships();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
});

async function seedPartnerships() {
  try {
    const data = [
      {
        initiator_type: 'University',
        initiator_id: '6859d9f6ef9899d47d831234', // University
        target_type: 'Company',
        target_id: '685ff461d520f46c6e3b41c9',   // Company
        status: 'pending',
        request_message: 'We are interested in collaboration opportunities for research and internships.',
      },
      {
        initiator_type: 'Company',
        initiator_id: '685ff461d520f46c6e3b41c9', // Company
        target_type: 'University',
        target_id: '6859d9f6ef9899d47d831234',   // University
        status: 'accepted',
        request_message: 'Let’s collaborate on internship programs.',
        response_message: 'Great idea! We’re on board.',
      }
    ];

    await Partnership.deleteMany(); // Optional: clears old data
    const inserted = await Partnership.insertMany(data);

    console.log('✅ Seeded partnerships:', inserted);
  } catch (error) {
    console.error('❌ Error seeding partnerships:', error.message);
  } finally {
    mongoose.connection.close();
  }
}
