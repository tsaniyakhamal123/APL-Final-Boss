import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'aplproject2026@gmail.com',
    pass: process.env.EMAIL_PASS || '',
  },
});

export const sendEmail = async ({ to, subject, text }) => {
  if (!to) throw new Error('Email recipient wajib diisi');
  await transporter.sendMail({
    from: `"Project Hub" <${process.env.EMAIL_USER}>`,
    to, subject, text,
  });
  console.log(`[Email] Terkirim ke ${to}`);
};