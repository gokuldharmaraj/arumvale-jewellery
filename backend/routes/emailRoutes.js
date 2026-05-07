import express from 'express';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

// POST /api/email/test - Send test email
router.post('/test', async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    // Default to configured email if no recipient provided
    const recipient = to || process.env.EMAIL_USER;
    const emailSubject = subject || 'Test Email from Arumvale Jewellery';
    const emailMessage = message || 'This is a test email from your jewellery shop backend!';
    
    const result = await sendEmail({
      to: recipient,
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d4af37;">Arumvale Jewellery</h2>
          <p style="color: #333;">${emailMessage}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated test email from your jewellery shop backend.
            <br>
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
      text: `${emailMessage}\n\nSent from Arumvale Jewellery backend at ${new Date().toLocaleString()}`
    });
    
    res.json({ 
      success: true, 
      message: 'Test email sent successfully',
      data: {
        to: recipient,
        subject: emailSubject,
        messageId: result.messageId,
        response: result.response
      }
    });
  } catch (error) {
    console.error('Test email endpoint error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send test email',
      error: error.message 
    });
  }
});

export default router;
