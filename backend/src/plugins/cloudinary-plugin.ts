import { FastifyPluginAsync } from 'fastify';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const cloudinaryPlugin: FastifyPluginAsync = async (fastify) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Missing Cloudinary environment variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET');
  }

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    // Test the configuration
    await cloudinary.api.ping();
    console.log('Cloudinary configuration successful');
    fastify.decorate('cloudinary', cloudinary);
  } catch (error) {
    console.error('Failed to initialize Cloudinary:', error);
    throw new Error('Failed to initialize Cloudinary');
  }
};

export default cloudinaryPlugin;