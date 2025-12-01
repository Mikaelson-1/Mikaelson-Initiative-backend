import nodemailer from "nodemailer";

export const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    pool: true,            
    maxConnections: 1,
    maxMessages: 5,
    rateDelta: 20000,
    rateLimit: 5,
  });
};
