import nodemailer from "nodemailer";

export async function sendForgotPasswordEmail(email: string, token: string) {
  // Configure seu transporter conforme seu provedor de e-mail
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: "igorlabakig@gmail.com", // Seu endereço de e-mail
        pass: process.env.EMAIL_PASSWORD, // Sua senha de e-mail
    },
  });

  const resetUrl = `http://localhost:8080/reset-password?token=${token}`;

  await transporter.sendMail({
    from: '"EventHub" <igorlabakig@gmail.com>',
    to: email,
    subject: "Recuperação de senha",
    html: `<p>Para redefinir sua senha, clique no link abaixo:</p>
           <a href="${resetUrl}">${"Link de recuperação de senha"}</a>`,
  });
}