import nodemailer from "nodemailer";

export const myHometownTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MHT_GMAIL_APP_USERNAME,
    pass: process.env.MHT_GMAIL_APP_PASSWORD,
  },
});
