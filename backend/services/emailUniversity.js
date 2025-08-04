import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

// Helper function to send approval email
export const sendApprovalEmail = async (email, universityName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const loginUrl = `${process.env.FRONTEND_URL}/university-email-check`;
    
    const mailOptions = {
      from: `"University Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your University Application Has Been Approved',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">University Application Approved</h2>
          <p>Dear ${universityName} Administrator,</p>
          <p>We are pleased to inform you that your application to join our platform has been approved.</p>
          <p>You can now access your university dashboard using the link below:</p>
          <a href="${loginUrl}" 
             style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">
            Access Your Dashboard
          </a>
          <p>If you have any questions, please contact our support team.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #7f8c8d;">
            © ${new Date().getFullYear()} University Platform. All rights reserved.
          </p>
        </div>
      `,
      text: `University Application Approved\n\nDear ${universityName} Administrator,\n\nWe are pleased to inform you that your application to join our platform has been approved.\n\nYou can now access your university dashboard using this link:\n${loginUrl}\n\nIf you have any questions, please contact our support team.`
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw error;
  }
};
 