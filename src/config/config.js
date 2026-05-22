import {config as dotenvConfig} from 'dotenv';


dotenvConfig();


const _config = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    REFRESH_TOKEN: process.env.REFRESH_TOKEN,
    EMAIL_USER: process.env.EMAIL_USER,
    JWT_SECRET: process.env.JWT_SECRET,
    RABITMQ_URI: process.env.RABITMQ_URI,
    

}

export default Object.freeze(_config);