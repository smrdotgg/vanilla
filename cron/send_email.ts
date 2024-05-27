import { createTransport } from "nodemailer";

export async function sendWithCustomData({
  SMTPHost,
  SMTPPort,
  username,
  password,
  fromEmail,
  targetAddress,
  subject,
  body,
}: {
  SMTPHost: string;
  SMTPPort: number;
  username: string;
  password: string;
  fromEmail: string;
  targetAddress: string;
  subject: string;
  body: string;
}) {
  const transporter = createTransport({
    host: SMTPHost,
    secure: true,
    port: SMTPPort,
    auth: {
      user: username,
      pass: password,
    },
  });
  const info = await transporter.sendMail({
    from: fromEmail,
    to: targetAddress,
    subject: subject,
    html: body,
  });
  return info;
}
