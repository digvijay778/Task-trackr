// ✅ OPTION 2: ES6 import syntax (if package.json has "type": "module")
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const testGmailConnection = async () => {
  try {
    console.log('🔄 Testing Gmail configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS length:', process.env.EMAIL_PASS?.length);

    // ✅ CORRECT: Use createTransport (not createTransporter)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Test connection
    console.log('🔄 Verifying connection...');
    await transporter.verify();
    console.log('✅ Gmail connection verified successfully!');

    // Send test email
    console.log('🔄 Sending test email...');
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test Email from Task Trackr',
      text: 'This is a test email to verify your Gmail configuration is working!'
    });

    console.log('✅ Test email sent successfully:', result.messageId);
    console.log('📧 Check your inbox for the test email');
  } catch (error) {
    console.error('❌ Gmail test failed:', error);
    
    if (error.code === 'EAUTH') {
      console.error('🔑 Authentication failed. Check your app password.');
    } else if (error.code === 'ECONNECTION') {
      console.error('🌐 Connection failed. Check your internet connection.');
    }
  }
};

testGmailConnection();
