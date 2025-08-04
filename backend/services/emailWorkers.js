import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendRecruiterInvitation = async (email, companyName, companyId) => {
  try {
    const mailOptions = {
      from: `"${companyName} Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Invitation to join ${companyName} as Recruiter`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">You're invited to join ${companyName}</h2>
          <p>Click the button below to complete your registration:</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL}/recruiter-signup?email=${encodeURIComponent(email)}&entreprise_id=${companyId}" 
               style="display: inline-block; padding: 12px 24px; background-color: #2563eb; 
                      color: white; text-decoration: none; border-radius: 6px;">
              Complete Registration
            </a>
          </div>
          
          <p>If you didn't request this invitation, please ignore this email.</p>
        </div>
      `,
      text: `You're invited to join ${companyName} as a Recruiter\n\n` +
            `Click this link to register: ${process.env.FRONTEND_URL}/recruiter-signup?email=${encodeURIComponent(email)}&entreprise_id=${companyId}\n\n` +
            `If you didn't request this invitation, please ignore this email.`
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send invitation email');
  }
};

export const sendSupervisorInvitation = async (email, companyName, companyId) => {
  try {
    const mailOptions = {
      from: `"${companyName} Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Invitation to join ${companyName} as PFE Supervisor`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">You're invited to join ${companyName}</h2>
          <p>Click the button below to complete your registration as a PFE Supervisor:</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL}/supervisor-signup?email=${encodeURIComponent(email)}&entreprise_id=${companyId}" 
               style="display: inline-block; padding: 12px 24px; background-color: #2563eb; 
                      color: white; text-decoration: none; border-radius: 6px;">
              Complete Registration
            </a>
          </div>
          
          <p>If you didn't request this invitation, please ignore this email.</p>
        </div>
      `,
      text: `You're invited to join ${companyName} as a PFE Supervisor\n\n` +
            `Click this link to register: ${process.env.FRONTEND_URL}/supervisor-signup?email=${encodeURIComponent(email)}&entreprise_id=${companyId}\n\n` +
            `If you didn't request this invitation, please ignore this email.`
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send invitation email');
  }
};