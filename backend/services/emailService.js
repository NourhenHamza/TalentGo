// emailService.js - Corrigé

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

export const sendInvitationEmail = async (email, professorId) => {
  try {
    console.log('Attempting to connect to Gmail...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // CORRECTION: Utiliser le bon URL avec des tirets et le bon chemin
    const registrationUrl = `${process.env.FRONTEND_URL}/professor-registration/${professorId}`;
    
    console.log('Registration URL:', registrationUrl); // Debug log pour vérifier l'URL
    
    console.log('Creating email options...');
    const mailOptions = {
      from: `"University Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Complete Your Professor Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin-bottom: 10px;">🎓 Professor Registration Invitation</h1>
              <div style="width: 50px; height: 3px; background-color: #3498db; margin: 0 auto;"></div>
            </div>
            
            <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Dear Professor,</p>
            
            <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
              You have been invited to join our university platform as a professor. 
              We're excited to have you as part of our academic community!
            </p>
            
            <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
              Please click the button below to complete your registration:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${registrationUrl}" 
                 style="display: inline-block; padding: 15px 30px; background-color: #3498db; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3); transition: all 0.3s ease;">
                Complete Registration ✨
              </a>
            </div>
            
            <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #7f8c8d; font-size: 14px; margin: 0; text-align: center;">
                ⏰ This invitation will expire in 24 hours
              </p>
            </div>
            
            <p style="color: #7f8c8d; font-size: 14px; line-height: 1.5;">
              If you didn't request this invitation, please ignore this email.
              If you have any questions, please contact the university administration.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center;">
              <p style="font-size: 12px; color: #95a5a6; margin: 0;">
                © ${new Date().getFullYear()} University Platform. All rights reserved.
              </p>
              <p style="font-size: 12px; color: #95a5a6; margin: 5px 0 0 0;">
                This is an automated email, please do not reply.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
Professor Registration Invitation

Dear Professor,

You have been invited to join our university platform as a professor.

Please visit this link to complete your registration:
${registrationUrl}

This invitation will expire in 24 hours.

If you didn't request this invitation, please ignore this email.

© ${new Date().getFullYear()} University Platform. All rights reserved.
      `
    };

    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
      registrationUrl
    };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw new Error(`Failed to send invitation email: ${error.message}`);
  }
};