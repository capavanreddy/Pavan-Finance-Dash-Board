import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER,
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS,
  },
});

import { getEmailFromName } from "./taskUtils";

export async function sendEmail({
  to,
  cc,
  subject,
  html,
  attachments,
}: {
  to: string;
  cc?: string;
  subject: string;
  html: string;
  attachments?: any[];
}) {
  if (!(process.env.EMAIL_USER || process.env.SMTP_USER) || !(process.env.EMAIL_PASS || process.env.SMTP_PASS)) {
    const msg = "SMTP credentials not set. Please configure EMAIL_USER and EMAIL_PASS in environment variables.";
    console.error(msg);
    throw new Error(msg);
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Task Manager" <${process.env.EMAIL_USER || process.env.SMTP_USER}>`,
      to,
      cc,
      subject,
      html,
      attachments,
    });
    console.log(`Email sent to ${to} successfully.`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Throwing error so caller knows it failed
  }
}
