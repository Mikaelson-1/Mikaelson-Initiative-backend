import { createTransporter } from "../config/nodemailer";
import nodemailer from "nodemailer";
import { getHoursLeftToday } from "../utils/date";
import { logger } from "../utils";
import { Resend } from "resend";
const resend = new Resend("re_Gy7pVzSf_Q4ebTQrnWDsYjFxC3RodCVVt");

export const sendNewUserEmail = async (email: string) => {
  const transporter = await createTransporter();
  const info = await transporter.sendMail({
    from: "noreply@mikaelson-initiative-org.com",
    to: email,
    subject: "Welcome to The Mikaelson Initiative",
    text: `Welcome to The Mikaelson Initiative!

We're thrilled to have you join our growing community of innovators and changemakers.

At The Mikaelson Initiative, we believe in building, leading, and empowering others to create impact 
that lasts. You’re now part of a family that values excellence, growth, and collaboration.

Let’s make something extraordinary together.

— The Mikaelson Initiative Team`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #222; padding: 20px;">
        <h2 style="color: #319de6ff;">Welcome to The Mikaelson Initiative!</h2>
        <p>We're thrilled to have you join our growing community of innovators and changemakers.</p>
        <p>At <strong>The Mikaelson Initiative</strong>, we believe in building, leading, and empowering others to 
        create impact that lasts. You’re now part of a family that values excellence, growth, and collaboration.</p>
        <p>Let’s make something extraordinary together.</p>
        <br/>
        <p>— <em>The Mikaelson Initiative Team</em></p>
      </div>
    `,
  });

  logger.info("Message sent:" + info.messageId);
  //logger.info("Preview URL:" + nodemailer.getTestMessageUrl(info));
};

export const sendReminderEmail = async (
  task: string,
  time: string,
  email: string,
  taskId?: string
) => {
  const transporter = await createTransporter();
  const hoursLeft = getHoursLeftToday();
  const [Time] = time.split(" ");
  const info = await transporter.sendMail({
    from: "noreply@mikaelson-initiative-org.com",
    to: email,
    subject: "Task Reminder",
    text: !taskId
      ? `You have less than ${hoursLeft} hour(s) left to complete "${task}" for today. Keep going!`
      : `You have less than ${time} before this task is due`,
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>⏰ Task Reminder</h2>
      <p>Hi there 👋,</p>
      <p>This is a friendly reminder about your task:</p>
      <blockquote style="border-left: 4px solid #007bff; margin: 10px 0; padding-left: 10px;">
        <strong>${task}</strong>
      </blockquote>
${
  !taskId
    ? `<p>You have less than <strong>${hoursLeft} hour${
        hoursLeft === 1 ? "" : "s"
      }</strong> left before the day ends.</p>`
    : `<p>You have less than ${time} before this task is due.</p>`
}
      <p>Stay focused and get it done — your future self will thank you!</p>
      <br/>
      <p>Best,<br/>
      <strong>The Mikaelson Initiative Team</strong></p>
      <hr/>
      <small style="color: #777;">This is an automated reminder. Please don’t reply to this email.</small>
    </div>`,
  });

  logger.info("Message sent:" + info.messageId);
  //logger.info("Preview URL:"+ nodemailer.getTestMessageUrl(info));
};

export const sendTaskOverDueEmail = async (
  task: string,
  dueTime: Date,
  email: string
) => {
  const transporter = await createTransporter();
  const now = new Date();

  const diffMs = dueTime.getTime() - now.getTime(); // difference in milliseconds
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60)); // convert to hours

  let messageText: string;
  if (diffHours > 0) {
    messageText = `You have about ${diffHours} hour(s) left to complete "${task}". Keep going!`;
  } else {
    messageText = `⚠️ Your task "${task}" is overdue! Please complete it as soon as possible.`;
  }

  const info = await transporter.sendMail({
    from: "noreply@mikaelson-initiative-org.com",
    to: email,
    subject: "Task Reminder",
    text: messageText,
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>⏰ Task Reminder</h2>
      <p>Hi there 👋,</p>
      <p>${
        diffHours > 0
          ? `This is a friendly reminder about your task:<br/><strong>${task}</strong><br/>You have approximately <strong>${diffHours} hour(s)</strong> left before the due time.`
          : `⚠️ Your task <strong>${task}</strong> is overdue! Please complete it as soon as possible.`
      }
      </p>
      <p>Stay focused and get it done — your future self will thank you!</p>
      <br/>
      <p>Best,<br/>
      <strong>The Mikaelson Initiative Team</strong></p>
      <hr/>
      <small style="color: #777;">This is an automated reminder. Please don’t reply to this email.</small>
    </div>`,
  });

  logger.info("Message sent:" + info.messageId);
  //logger.info("Preview URL:"+ nodemailer.getTestMessageUrl(info));
};

export const waitListEmail = async (email: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Mikaelson Community  <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to the Mikaelson Community Waitlist",
      text: `Welcome to the Mikaelson Community Waitlist!

Hello,

Thank you for joining the Mikaelson Community waitlist, you're now part of a movement committed to building discipline, opportunity, and long-term transformation for young people across Africa.

You'll be among the first to access our platform when we go live. This includes:

1. Early updates on our programs and tools
2. Priority access to new features as they roll out
3. Exclusive insight into how the Initiative is growing

We're building something designed to shift mindsets, expand capacity, and equip thousands of young people with the structure they need to create a better future.

You're now part of that journey.
More updates coming soon.

Warm regards,
The Mikaelson Community Team`,
      html: `
    <div style="font-family: Arial, sans-serif; background-color: #f7f9fb; padding: 30px;">
      <div style="
        max-width: 600px;
        margin: auto;
        background: #ffffff;
        border-radius: 10px;
        padding: 30px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      ">
        <h2 style="color: #319DE6; margin-top: 0; font-size: 24px;">
          Welcome to The Mikaelson Community Waitlist!
        </h2>

        <p style="font-size: 15px; color: #333; line-height: 1.6;">
          Hello,
        </p>

        <p style="font-size: 15px; color: #333; line-height: 1.6;">
          Thank you for joining the <strong>Mikaelson Community</strong> waitlist!
          You're now part of a movement dedicated to building discipline, structure, 
          and long-term transformation for young people across Africa.
        </p>

        <p style="font-size: 15px; color: #333; line-height: 1.6;">
          As an early member, you'll receive:
        </p>

        <ul style="font-size: 15px; color: #333; line-height: 1.6; padding-left: 20px;">
          <li>Early updates on our programs and tools</li>
          <li>Priority access to new features as they roll out</li>
          <li>Exclusive insight into the growth of the Initiative</li>
        </ul>

        <p style="font-size: 15px; color: #333; line-height: 1.6;">
          We're building something designed to shift mindsets, expand capacity, 
          and equip thousands of young Africans with the structure they need to build 
          a better future.
        </p>

        <p style="font-size: 15px; color: #333; line-height: 1.6;">
          You're now part of that journey. More updates coming soon.
        </p>

        <br />

        <p style="font-size: 15px; color: #555;">
          Warm regards,<br/>
          <strong>The Mikaelson Community Team</strong>
        </p>

        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
          <p style="font-size: 12px; color: #999;">
            © 2025 The Mikaelson Initiative — Building excellence and opportunity across Africa.
          </p>
        </div>
      </div>
    </div>
  `,
    });

    if (error) {
      logger.error("Email send error:" + JSON.stringify(error, null, 2));
      throw error;
    }

    logger.info("Message sent: " + data?.id);
    return data;
  } catch (error) {
    logger.error("Failed to send waitlist email:" + error);
    throw error;
  }
};
