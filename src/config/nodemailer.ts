import nodemailer from "nodemailer";

export const createTransporter = async () => {
  // Generate a test SMTP account
  const testAccount = await nodemailer.createTestAccount();

  // Create a transporter using the test account
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for port 465, false for others
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log("Ethereal test account:", testAccount);
  console.log("Preview URL will be available in console after sending email.");

  return transporter;
};
