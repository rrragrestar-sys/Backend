import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function testEmail() {
  console.log("Testing connection with:", process.env.SMTP_MAIL);
  
  const configs = [
    { service: 'gmail' },
    { host: 'smtp.gmail.com', port: 465, secure: true },
    { host: 'smtp.gmail.com', port: 587, secure: false }
  ];

  for (const config of configs) {
    console.log(`\n--- Testing with config: ${JSON.stringify(config)} ---`);
    const transporter = nodemailer.createTransport({
      ...config,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    try {
      await transporter.verify();
      console.log("SUCCESS: Connection successful!");
      return;
    } catch (error) {
      console.error(`FAILED: ${error.message}`);
    }
  }
}

testEmail();
