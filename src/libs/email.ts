import { createTransporter } from "../config/nodemailer";
import nodemailer from "nodemailer";

// Wrap in an async IIFE so we can use await.
export const sendNewUserEmail = async () => {
  const transporter = await createTransporter();
  const info = await transporter.sendMail({
    from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
    to: "bar@example.com, baz@example.com",
    subject: "Hello ✔",
    text: "Hello world?", // plain‑text body
    html: "<b>Hello world?</b>", // HTML body
  });

  console.log("Message sent:", info.messageId);
};

export const sendReminderEmail = async (
  task: string,
  time: string,
  email: string
) => {
  const transporter = await createTransporter();
  const hour = time.split(" ")[0];
  const hourToNumber = Number(hour);
  const calcHoursLeft = 24 - hourToNumber;
  const info = await transporter.sendMail({
    from: "noreply@mikaelson-initiative-org.com",
    to: email,
    subject: "Task Reminder",
    text: `You have about ${calcHoursLeft} hour(s) left to complete "${task}". Keep going!`,
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>⏰ Task Reminder</h2>
      <p>Hi there 👋,</p>
      <p>This is a friendly reminder about your task:</p>
      <blockquote style="border-left: 4px solid #007bff; margin: 10px 0; padding-left: 10px;">
        <strong>${task}</strong>
      </blockquote>
      <p>You have approximately <strong>${calcHoursLeft} hour${
      calcHoursLeft === 1 ? "" : "s"
    }</strong> left before the day ends.</p>
      <p>Stay focused and get it done — your future self will thank you!</p>
      <br/>
      <p>Best,<br/>
      <strong>The Mikaelson Initiative Team</strong></p>
      <hr/>
      <small style="color: #777;">This is an automated reminder. Please don’t reply to this email.</small>
    </div>`,
  });

  console.log("Message sent:", info.messageId);
  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
};
