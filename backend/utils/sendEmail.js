import createTransporter from '../config/mail.js';

const sendEmail = async (options) => {
  try {
    // Validate required options
    if (!options.to || !options.subject) {
      throw new Error('Recipient email and subject are required');
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html || options.text,
      text: options.text,
    };

    // Add timeout protection
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timeout')), 30000);
    });

    const result = await Promise.race([sendPromise, timeoutPromise]);
    
    // Log success without exposing sensitive data
    console.log('Email sent successfully:', {
      to: options.to,
      subject: options.subject,
      messageId: result.messageId
    });

    return result;
  } catch (error) {
    // Log error without exposing sensitive data
    console.error('Email sending failed:', {
      to: options.to,
      subject: options.subject,
      error: error.message,
      code: error.code || 'UNKNOWN'
    });
    
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

export default sendEmail;
