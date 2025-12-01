import { Job, Worker } from "bullmq";
import { createTransporter } from "../config/nodemailer";
import { logger } from "../utils";
import { bullRedis } from "../utils/bullmq-redis";

interface emailJobType {
  email: string;
  type?: string;
}

export const emailWorker = new Worker<emailJobType>(
  "emails",
  async (job: Job<emailJobType>) => {
    const { email, type } = job.data;
    switch (type) {
      case "welcomeEmail": {
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
        break;
      }

      case "waitListEmail": {
        const transporter = await createTransporter();
        const info = await transporter.sendMail({
          from: "noreply@mikaelson-initiative-org.com",
          to: email,
          subject: "Welcome to the Mikaelson Community Waitlist",
          text: `Welcome to the Mikaelson Community Waitlist!

  Hello,

Thank you for joining the Mikaelson Community waitlist, you’re now part of a movement committed to building discipline, opportunity, and long-term transformation for young people across Africa.

You’ll be among the first to access our platform when we go live. This includes:

1. Early updates on our programs and tools
2. Priority access to new features as they roll out
3. Exclusive insight into how the Initiative is growing

We’re building something designed to shift mindsets, expand capacity, and equip thousands of young people with the structure they need to create a better future.

You’re now part of that journey.
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
        You’re now part of a movement dedicated to building discipline, structure, 
        and long-term transformation for young people across Africa.
      </p>

      <p style="font-size: 15px; color: #333; line-height: 1.6;">
        As an early member, you’ll receive:
      </p>

      <ul style="font-size: 15px; color: #333; line-height: 1.6; padding-left: 20px;">
        <li>Early updates on our programs and tools</li>
        <li>Priority access to new features as they roll out</li>
        <li>Exclusive insight into the growth of the Initiative</li>
      </ul>

      <p style="font-size: 15px; color: #333; line-height: 1.6;">
        We’re building something designed to shift mindsets, expand capacity, 
        and equip thousands of young Africans with the structure they need to build 
        a better future.
      </p>

      <p style="font-size: 15px; color: #333; line-height: 1.6;">
        You’re now part of that journey. More updates coming soon.
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

        logger.info("Message sent:" + info.messageId);
        break;
      }

      default:
        logger.info("Unknown email Type:" + type);
    }
  },
  { connection: bullRedis!, concurrency: 5 }
);
