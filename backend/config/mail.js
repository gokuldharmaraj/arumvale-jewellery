import nodemailer from "nodemailer";

const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 60000, // 60 seconds
  });

  // Verify transporter configuration on creation
  transporter.verify((error, success) => {
    if (error) {
      console.error("Email transporter verification failed:", {
        error: error.message,
        code: error.code,
        command: error.command,
      });
    } else {
      console.log("Email transporter is ready to send messages");
    }
  });

  return transporter;
};

export default createTransporter;
