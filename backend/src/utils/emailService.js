import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const createTransporter = () => {
  try {
    console.log('📧 Creating Gmail transporter...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Missing');

    // ✅ WORKING GMAIL CONFIGURATION FROM SEARCH RESULTS
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
      // ✅ REMOVED: Don't add extra SSL configs for Gmail service
    });

    return transporter;
  } catch (error) {
    console.error('❌ Failed to create transporter:', error);
    throw new Error('Email transporter creation failed');
  }
};

export const sendPasswordResetEmail = async (email, resetLink, userName) => {
  try {
    console.log('🔄 Sending email to:', email);
    
    const transporter = createTransporter();

    // ✅ VERIFY CONNECTION FIRST (from search results)
    await transporter.verify();
    console.log('✅ Gmail connection verified');

    const mailOptions = {
      from: process.env.EMAIL_USER, // ✅ SIMPLIFIED: Just use the email
      to: email,
      subject: 'Password Reset - Task Trackr',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${userName || 'User'},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>Link: ${resetLink}</p>
        <p>This link expires in 1 hour.</p>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};
