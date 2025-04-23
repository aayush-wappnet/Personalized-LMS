import { FastifyPluginAsync } from 'fastify';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

const emailPlugin: FastifyPluginAsync = async (fastify) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Or another email service
    auth: {
      user: process.env.EMAIL_USER, // Add to .env
      pass: process.env.EMAIL_PASS, // Add to .env
    },
  });

  fastify.decorate('email', {
    send: async (to: string, subject: string, text: string) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
      };
      await transporter.sendMail(mailOptions);
    },
  });
};

export default emailPlugin;