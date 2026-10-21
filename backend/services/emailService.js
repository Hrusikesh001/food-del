
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export const sendEmail = async ({ to, subject, text }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error.message);
    return false;
  }
};
