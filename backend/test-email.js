
require('dotenv').config();
const nodemailer = require('nodemailer');

// This script will test your email credentials directly.

const sendTestEmail = async () => {
    console.log("Attempting to create transporter with the following credentials:");
    console.log("EMAIL_SERVICE:", process.env.EMAIL_SERVICE);
    console.log("EMAIL_USERNAME:", process.env.EMAIL_USERNAME);
    // Do NOT log the password, even in a test.

    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
        console.error("Error: EMAIL_USERNAME or EMAIL_PASSWORD is not set in your .env file.");
        return;
    }

    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_USERNAME, // Sending to yourself for a safe test
        subject: 'Nodemailer Test from School App',
        text: 'This is a test email. If you received this, your credentials are correct!'
    };

    try {
        console.log("\nSending test email...");
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Success! Email sent successfully.");
        console.log("Message ID:", info.messageId);
        console.log("---------------------------------------------------------");
        console.log("This confirms your .env credentials are CORRECT.");
        console.log("You can now delete this test-email.js file.");

    } catch (err) {
        console.error("❌ Failure! Email could not be sent.");
        console.error("Error Details:", err);
        console.log("---------------------------------------------------------");
        console.log("This confirms the error is with the credentials in your .env file.");
        console.log("Please double-check them or generate a new App Password.");
    }
};

sendTestEmail();

