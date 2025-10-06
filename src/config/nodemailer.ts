import nodemailer from "nodemailer";

export const createTransporter = async () => {
  // Generate a test SMTP account
  const testAccount = await nodemailer.createTestAccount();

  // Create a transporter using the test account
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for others
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  console.log("Ethereal test account:", testAccount);
  console.log("Preview URL will be available in console after sending email.");

  return transporter;
};
