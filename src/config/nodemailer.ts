import nodemailer from "nodemailer";
import { logger } from "../utils";

export const createTransporter = async () => {
  logger.info(process.env.SMTP_PASSWORD);
    logger.info(process.env.SMTP_EMAIL);
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  transporter.verify((error, success) => {
    if (error) console.log("SMTP connection failed:", error);
    else console.log("SMTP ready to send emails");
  });

  return transporter;
};
