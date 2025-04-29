import { FastifyPluginAsync } from 'fastify';
import * as nodemailer from 'nodemailer';

const emailPlugin: FastifyPluginAsync = async (fastify) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
  });

  fastify.decorate('emailTransporter', transporter);
};

// Extend Fastify instance types
declare module 'fastify' {
  interface FastifyInstance {
    emailTransporter: nodemailer.Transporter;
  }
}

export default emailPlugin;