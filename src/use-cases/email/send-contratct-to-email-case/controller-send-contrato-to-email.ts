
import { SendContratoEmailCase } from './use-case-send-contract-to-email';
import { Request, Response } from 'express';

interface ISenEmailProps {
  pdfBase64: string;
  clientName: string;
  clientEmail: string;
}

class SendContratoEmailController {
  constructor() { }

  async handle(req: Request, res: Response) {
    const data: ISenEmailProps = req.body;
    const sendContratoEmailCase = new SendContratoEmailCase();

    try {
      await sendContratoEmailCase.execute({
        pdfBase64: data.pdfBase64,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
      });
      return res.status(200).json({ message: "E-mail enviado com sucesso" });
    } catch (error) {
      if (error instanceof Error) {
        // Verifica se o erro é do tipo Error
        console.error("Erro ao enviar e-mail:", error); // Log para depuração
        return res.status(400).json({ message: "Erro ao enviar e-mail", error: error.message });
      }
      // Caso o erro não seja do tipo Error
      console.error("Erro desconhecido ao enviar e-mail:", error);
      return res.status(400).json({ message: "Erro desconhecido ao enviar e-mail" })
    }
  }
}

export { SendContratoEmailController };

/* resp.json(contratoEmail);
resp.status(400).json({ error: error.message }); */