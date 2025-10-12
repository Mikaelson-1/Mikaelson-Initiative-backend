import { Job, Worker } from "bullmq";
import { createTransporter } from "../config/nodemailer";
import { logger } from "../utils";
import { bullRedis } from "../utils/bullmq-redis";

interface emailJobType {
  email: string;
}

export const emailWorker = new Worker<emailJobType>(
  "emails",
  async (job: Job<emailJobType>) => {
    const { email } = job.data;
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
  },
  { connection: bullRedis, concurrency: 5 }
);
