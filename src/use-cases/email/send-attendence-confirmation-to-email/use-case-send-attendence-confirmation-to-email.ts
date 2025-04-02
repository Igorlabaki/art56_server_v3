import { format } from "date-fns";
import nodemailer from "nodemailer";

interface ISendAttendenceConfimationEmailParams {
  proposal: {
    endDate: Date;
    startDate: Date;
    proposalId: string;
    clientName: string;
    hostMessage: string | null;
  },
  guest: {
    id: string;
    name: string;
    email: string;
  }
  venue: {
    name: string;
    email: string;
    city: string;
    state: string;
    street: string;
    streetNumber: string;
    neighborhood: string;
  }

  userId?: string;
  username?: string;
}


export class SendAttendeceConfirmationEmailCase {

  async execute({ proposal, userId, username, venue, guest }: ISendAttendenceConfimationEmailParams) {

    const startDay = format(proposal.startDate, "dd/MM/yyyy");
    const endDay = format(proposal.endDate, "dd/MM/yyyy");

    const startTime = format(proposal.startDate, "HH:mm");
    const endTime = format(proposal.endDate, "HH:mm");

    const eventDateTime =
  startDay === endDay
    ? `no começar no dia ${startDay} às ${startTime} até ${endTime}`
    : `no começar no dia ${startDay} às ${startTime} até ${endDay} às ${endTime}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 587,
      secure: false,
      auth: {
        user: "contato@ar756.com", // Seu endereço de e-mail
        pass: process.env.EMAIL_PASSWORD, // Sua senha de e-mail
      },
    });

    const mailOptions = {
      from: '"AR756" <contato@ar756.com>',
      to: guest.email, // E-mail do convidado cadastrado
      subject: "Confirmação de Presença - Evento AR756",
      html: `
        <div style="font-family: Arial, sans-serif; height: 990px;">
          <table style="width: 100%; height: 100%; background-image: url('https://res.cloudinary.com/dzvyh5r33/image/upload/v1729000947/file_6_hrlmuh_rx6o37.jpg'); background-size: cover;">
            <tr>
              <td>
                <table style="background-color: white; margin: auto; padding: 20px; width: 50%; height: 690px; border-radius: 10px;">
                  <tr>
                    <td style="text-align: center;">
                      <img style="width: 200px; height: 120px; margin: 0 auto;" src="https://res.cloudinary.com/dzvyh5r33/image/upload/v1729510932/WhatsApp_Image_2024-09-23_at_18.11.28_ivgong.jpg" alt="logo AR756" />
                      <h1 style="color: #333; width: 100%; text-align: center; margin-top: 10px;">Olá ${guest.name}, você foi convidado para um evento!</h1>
                        ${proposal.hostMessage
          ? `<p style="font-size: 14px; width: 60%; margin: 10px auto; text-align: center; font-style: italic;">"${proposal.hostMessage}"</p>`
          : ""
        }
                      <p style="font-size: 14px; width: 60%; margin: 10px auto; text-align: center;">O evento ocorrerá ${eventDateTime} no local ${venue.name}, ${venue.street},${venue.streetNumber} no bairro ${venue.neighborhood} - ${venue.city}/${venue.state} . Por favor, confirme sua presença clicando no botão abaixo.</p>
                      <div style="width: 100%; text-align: center;margin-top: 40px;">
                        <a href="https://ar756.com/confirmAttendeceEmail/${guest.id}?confirmAttendanceEmail=true" style="text-decoration: none;">
                          <button style="background-color: green; color: white; font-size: 20px; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-right: 10px;">Confirmar Presença</button>
                        </a>
                        <a href="https://ar756.com/confirmAttendeceEmail/${guest.id}?confirmAttendanceEmail=false" style="text-decoration: none;">
                          <button style="background-color: red; color: white; font-size: 20px; padding: 10px 20px; border-radius: 5px; display: inline-block;">Não Poderei Ir</button>
                        </a>
                      </div>
                      <h2 style="font-size: 14px; width: 60%; margin: 10px auto; text-align: center; margin-top: 40px;">SIGA-NOS</h2>
                      <div style="text-align: center;">
                        <a href="https://www.tiktok.com/@ar756_" style="text-decoration: none; margin-right: 10px;"><img src="https://res.cloudinary.com/dzvyh5r33/image/upload/v1729510932/icons8-tiktok-48_to1o5t.png" alt="Logo TikTok" /></a>
                        <a href="https://www.instagram.com/ar756_/" style="text-decoration: none; margin-right: 10px;"><img src="https://res.cloudinary.com/dzvyh5r33/image/upload/v1729510932/icons8-instagram-48_ezz3z6.png" alt="Logo Instagram" /></a>
                        <a href="https://www.facebook.com/profile.php?id=100085832906065" style="text-decoration: none;"><img src="https://res.cloudinary.com/dzvyh5r33/image/upload/v1729510932/icons8-facebook-48_x31mos.png" alt="Logo Facebook" /></a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `,
    };

    try {
      const email = await transporter.sendMail(mailOptions);

      // Verifica se o e-mail foi aceito pelo servidor de e-mail
      if (email.accepted.length > 0) {
        console.log("E-mail enviado com sucesso:", email.messageId);

        // Mensagem de confirmação ou retorno de sucesso
        return {
          status: "success",
          message: "E-mail enviado com sucesso",
          messageId: email.messageId,
        };
      } else {
        console.log("O e-mail foi rejeitado:", email.rejected);
        // Retorno de falha caso tenha sido rejeitado
        return {
          status: "failure",
          message: "Falha ao enviar o e-mail",
          rejected: email.rejected,
        };
      }
    } catch (error) {
      console.error("Erro ao enviar o e-mail:", error);
      // Retorno do erro para tratamento
      if (error instanceof Error) {
        return {
          status: "error",
          message: "Erro ao enviar o e-mail",
          error: error.message,
        };
      }
    }
  }
}