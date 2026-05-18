import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "aplproject2026@gmail.com",
    pass: "mpwn hfhb foly xpqj",
  },
});

export async function sendEmail(event) {
  const subject =
    event.status === "ACCEPTED"
      ? "Bidding Accepted"
      : "Bidding Rejected";

  const text = `
Halo,

Status bidding kamu: ${event.status}
Project ID: ${event.project_id}

Terima kasih.
`;

  try {
    await transporter.sendMail({
      from: "ProjectHub <aplproject2026@gmail.com>",
      to: event.email,
      subject,
      text,
    });

    console.log("Email berhasil dikirim");
    return "SUCCESS";
  } catch (error) {
    console.error("Gagal kirim email:", error);
    return "FAILED";
  }
}