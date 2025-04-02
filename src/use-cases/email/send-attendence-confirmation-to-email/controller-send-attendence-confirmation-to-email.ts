
import { Request, Response } from 'express';
import prismaClient from '../../../service/prisma-client';
import { PrismaUserRepository } from '../../../repositories/in-prisma/user-in-prisma-repository';
import { PrismaHistoryRepository } from '../../../repositories/in-prisma/history-in-prisma-repository';
import { SendAttendeceConfirmationEmailCase } from './use-case-send-attendence-confirmation-to-email';

interface ISendAttendenceConfimationEmailParams {
  proposal:{
    endDate: Date;
    startDate: Date;
    proposalId: string;
    clientName: string;
    hostMessage: string | null;
  },
  guest:{
    id: string;
    name: string;
    email: string;
  }
  venue:{
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

class SendAttendeceConfirmationEmailController {
  constructor() { }

  async handle(req: Request, res: Response) {
    const body : ISendAttendenceConfimationEmailParams = req.body;

    const sendOrcamentoToEmail = new SendAttendeceConfirmationEmailCase();

    const sendOrcamentoEmailCase = sendOrcamentoToEmail;

    try {
      await sendOrcamentoEmailCase.execute(body);

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

export { SendAttendeceConfirmationEmailController };

/* resp.json(orcamentoEmail);
resp.status(400).json({ error: error.message }); */