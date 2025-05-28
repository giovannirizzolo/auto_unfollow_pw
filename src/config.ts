import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
    instagram: {
        username: process.env.INSTAGRAM_USERNAME,
        password: process.env.INSTAGRAM_PASSWORD,
    },
    test: {
        headless: process.env.HEADLESS === 'true',
        slowMo: parseInt(process.env.SLOW_MO || '50', 10),
        timeout: parseInt(process.env.PW_TEST_TIMEOUT || '30000', 10),
    },
};

// Validate required environment variables
const requiredEnvVars = ['INSTAGRAM_USERNAME', 'INSTAGRAM_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
        'Please create a .env file based on .env.example'
    );
} 