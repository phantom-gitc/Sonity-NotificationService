import {config as dotenvConfig} from 'dotenv';


dotenvConfig();


const _config = {
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS, // Gmail App Password (not regular password)
    JWT_SECRET: process.env.JWT_SECRET,
    RABITMQ_URI: process.env.RABITMQ_URI,
}

export default Object.freeze(_config);