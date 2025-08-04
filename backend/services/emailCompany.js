import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

export const sendCompanyRegistrationEmail = async (email, companyName, companyId) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const registrationLink = `${process.env.FRONTEND_URL}/complete-registration-company/${companyId}`;
    
    const mailOptions = {
      from: `"Company Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Complete Your Company Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Welcome to Our Platform!</h2>
          <p>Dear ${companyName},</p>
          <p>Your company application has been approved. Please complete your registration by setting up your password.</p>
          <p>Click the link below to finalize your registration:</p>
          <a href="${registrationLink}" 
             style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">
            Complete Registration
          </a>
          <p>If you have any questions, please contact our support team.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #7f8c8d;">
            © ${new Date().getFullYear()} Company Platform. All rights reserved.
          </p>
        </div>
      `,
      text: `Welcome to Our Platform!\n\nDear ${companyName},\n\nYour company application has been approved. Please complete your registration by setting up your password.\n\nComplete your registration using this link:\n${registrationLink}\n\nIf you have any questions, please contact our support team.`
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending company registration email:', error);
    throw error;
  }
};

