import { subscribeToQueue } from "./rabbit.js";
import sendEmail from "../utils/email.js";


function startListener() {
  const buildTemplate = ({ firstName, lastName, role, welcomeBack = false }) => `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />

                <style>

                    body{
                        margin:0;
                        padding:0;
                        background-color:#f4f7fb;
                        font-family: Arial, Helvetica, sans-serif;
                    }

                    .container{
                        max-width:600px;
                        margin:40px auto;
                        background:#ffffff;
                        border-radius:16px;
                        overflow:hidden;
                        box-shadow:0 5px 20px rgba(0,0,0,0.1);
                    }

                    .header{
                        background:linear-gradient(135deg,#6366f1,#8b5cf6);
                        color:white;
                        text-align:center;
                        padding:40px 20px;
                    }

                    .header h1{
                        margin:0;
                        font-size:32px;
                    }

                    .content{
                        padding:40px 30px;
                        color:#333;
                        line-height:1.7;
                    }

                    .badge{
                        display:inline-block;
                        background:#eef2ff;
                        color:#4f46e5;
                        padding:8px 16px;
                        border-radius:999px;
                        font-size:14px;
                        font-weight:bold;
                        margin-top:10px;
                    }

                    .button{
                        display:inline-block;
                        margin-top:30px;
                        padding:14px 28px;
                        background:#6366f1;
                        color:white !important;
                        text-decoration:none;
                        border-radius:10px;
                        font-weight:bold;
                    }

                    .features{
                        margin-top:30px;
                        background:#f9fafb;
                        padding:20px;
                        border-radius:12px;
                    }

                    .features li{
                        margin-bottom:10px;
                    }

                    .footer{
                        text-align:center;
                        padding:20px;
                        font-size:13px;
                        color:#777;
                        background:#f9fafb;
                    }

                </style>

            </head>

            <body>

                <div class="container">

                    <div class="header">
                        <h1>${welcomeBack ? '👋 Welcome Back!' : '🎵 Welcome Aboard!'}</h1>
                        <p>${welcomeBack ? 'Nice to see you again.' : 'Your music journey starts now'}</p>
                    </div>

                    <div class="content">

                        <h2>Hello ${firstName} ${lastName} 👋</h2>

                        <p>
                            ${welcomeBack ? 'You have successfully logged in to your account.' : 'Welcome to our Audio Streaming Platform. We’re super excited to have you with us.'}
                        </p>

                        <div class="badge">
                            Role: ${role}
                        </div>

                        <p>
                            ${welcomeBack ? 'Continue exploring your favorite music and playlists.' : 'Your account has been successfully created and you can now explore unlimited music, playlists, podcasts, and much more.'}
                        </p>

                        <div class="features">

                            <h3>✨ What You Can Do</h3>

                            <ul>
                                <li>🎧 Stream high quality audio</li>
                                <li>❤️ Create and manage playlists</li>
                                <li>🔥 Discover trending tracks</li>
                                <li>🎙️ Listen to podcasts anytime</li>
                                <li>📱 Access across multiple devices</li>
                            </ul>

                        </div>

                        <center>
                            <a href="#" class="button">
                                ${welcomeBack ? 'Continue Listening 🚀' : 'Start Listening 🚀'}
                            </a>
                        </center>

                        <p style="margin-top:40px;">
                            If you have any questions, feel free to reach out to our support team anytime.
                        </p>

                        <p>
                            Cheers, <br />
                            <strong>Audio Streaming Team</strong>
                        </p>

                    </div>

                    <div class="footer">
                        © 2026 Audio Streaming Platform. All rights reserved.
                    </div>

                </div>

            </body>
            </html>
            `;


    //Send Welcome Email on User Creation 
  subscribeToQueue("user_created", async (msg) => {
    try {
      const {
        email,role, fullName: { firstName, lastName },} = msg;

      const template = buildTemplate({ firstName, lastName, role, welcomeBack: false });

      // Send a welcome email to the user when they are created

      await sendEmail(
        email,
        "🎉 Welcome to Sonity",
        `Welcome to Sonity, ${firstName} ${lastName}!`,
        template
      );

      console.log(`✅ Welcome email sent to ${email}`);
    } catch (error) {
      console.log("❌ Error while sending email:", error);
    }
  });


  // Send Login Email on User Login
  
  subscribeToQueue("user_logged_in", async (msg) => {
    try {
      const {
        email,role, fullName: { firstName, lastName },} = msg;

      const template = buildTemplate({ firstName, lastName, role, welcomeBack: true });

      await sendEmail(
        email,
        "👋 Welcome back to Sonity",
        `Welcome back to Sonity, ${firstName} ${lastName}!`,
        template
      );

      console.log(`✅ Login email sent to ${email}`);
    } catch (error) {
      console.log("❌ Error while sending login email:", error);
    }
  });

  // Send Password Reset Email
  subscribeToQueue("password_reset", async (msg) => {
    try {
      const { email, fullName: { firstName, lastName }, resetLink } = msg;

      const template = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { background-color: #f4f7fb; font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .header { text-align: center; color: #6366f1; }
            .button { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { font-size: 12px; color: #777; text-align: center; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="header">🔑 Reset Your Password</h2>
            <p>Hello ${firstName} ${lastName},</p>
            <p>We received a request to reset the password for your Sonity account. Click the button below to choose a new password. This link is valid for 1 hour.</p>
            <center>
              <a href="${resetLink}" class="button">Reset Password</a>
            </center>
            <p>If you did not request a password reset, you can safely ignore this email.</p>
            <p class="footer">Sonity Audio Streaming Platform</p>
          </div>
        </body>
        </html>
      `;

      await sendEmail(
        email,
        "🔒 Reset Your Sonity Password",
        `Reset your Sonity password here: ${resetLink}`,
        template
      );

      console.log(`✅ Password reset email sent to ${email}`);
    } catch (error) {
      console.log("❌ Error while sending password reset email:", error);
    }
  });
}

export default startListener;
