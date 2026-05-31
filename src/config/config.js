import {config as dotenvConfig} from 'dotenv';


dotenvConfig();


const _config = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT, 10) || 3001,
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD, // Gmail App Password (not regular password)
    JWT_SECRET: process.env.JWT_SECRET,
    RABBITMQ_URI: process.env.RABBITMQ_URI || process.env.RABITMQ_URI,
    RABITMQ_URI: process.env.RABBITMQ_URI || process.env.RABITMQ_URI,
}

["JWT_SECRET", "EMAIL_USER", "EMAIL_PASS"].forEach((envVar) => {
    if (!_config[envVar]) {
        console.warn(`Warning: Missing required environment variable: ${envVar}`);
    }
});

export default Object.freeze(_config);
