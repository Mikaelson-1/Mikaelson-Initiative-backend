import nodemailer from "nodemailer";

export const createTransporter = async () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD, // App password
    },
  });
};
