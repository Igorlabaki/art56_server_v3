import nodemailer from 'nodemailer';
import { UserRepositoryInterface } from '../../../repositories/interface/user-repository-interface';
import { HttpResourceNotFoundError } from '../../../errors/errors-type/http-resource-not-found-error';
import { HistoryRepositoryInterface } from '../../../repositories/interface/history-repository-interface';

interface ISendOrcamentoEmailParams {
  proposal:{
    proposalId: string;
    clientName: string;
    clientEmail: string;
  }
  userId?: string;
  username?: string;
}


export class SendOrcamentoEmailCase {
  constructor(
    private userRepository: UserRepositoryInterface,
    private historyRepository: HistoryRepositoryInterface,
  ) { }

  async execute({ proposal, userId,username }: ISendOrcamentoEmailParams) {
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
      to: proposal.clientEmail,
      subject: "Confirmacao de presenca",
      html: `
             <div style="font-family: Arial, sans-serif; height: 990px;">
                <table style="width: 100%; height: 100%; background-image: url('https://res.cloudinary.com/dzvyh5r33/image/upload/v1729000947/file_6_hrlmuh_rx6o37.jpg'); background-size: cover;">
                    <tr>
                        <td>
                        <table style="background-color: white; margin: auto; padding: 20px; width: 50%; height: 690px; border-radius: 10px;">
                            <tr>
                            <td style="text-align: center;">
                                <img style="width: 200px; height: 120px; margin: 0 auto;" src="https://res.cloudinary.com/dzvyh5r33/image/upload/v1729510932/WhatsApp_Image_2024-09-23_at_18.11.28_ivgong.jpg" alt="logo AR756" />
                                <h1 style="color: #333; width: 100%; text-align: center; margin-top: 10px;">Olá ${proposal.clientName}, recebemos a sua mensagem!</h1>
                                <p style="font-size: 14px; width: 60%; margin: 10px auto; text-align: center;">Agradecemos o seu interesse em conhecer a AR756. Simulamos um orçamento para seu evento, por gentileza clique no botão abaixo para ver a proposta.</p>
                                <div style="width: 100%; text-align: center;margin-top: 40px;">
                                <a href="https://ar756.com/orcamento/byId/${proposal.proposalId}" style="text-decoration: none;">
                                    <button style="background-color: black; color: white; font-size: 20px; padding: 10px 20px; border-radius: 5px; display: inline-block;">Orçamento</button>
                                </a>
                                </div>
                                <h2 style="font-size: 14px; width: 60%; margin: 10px auto; text-align: center; margin-top: 40px;">SIGA-NOS</h2>
                                <div style="text-align: center;">
                                <a href="https://www.tiktok.com/@ar756_" style="text-decoration: none; margin-right: 10px;"><img src="https://res.cloudinary.com/dzvyh5r33/image/upload/v1729510932/icons8-tiktok-48_to1o5t.png" alt="Logo TiTok" /></a>
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
      /*   attachments: base64Files.map((item:any) => {
                return {
                filename: item.fileName,
                content: item.base64String,
                encoding: 'base64'
                }
            })  */
    };
    
    try {
      const email = await transporter.sendMail(mailOptions);
    
      // Verifica se o e-mail foi aceito pelo servidor de e-mail
      if (email.accepted.length > 0) {
        console.log("E-mail enviado com sucesso:", email.messageId);

        if (userId) {
          const user = await this.userRepository.getById(userId)

          if (!user) {
              throw new HttpResourceNotFoundError("Usuario")
          }

          await this.historyRepository.create({
              userId: user.id,
              proposalId: proposal.proposalId,
              action: `${username} enviou este orcamento ao cliente pelo email`,
          });
      }
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