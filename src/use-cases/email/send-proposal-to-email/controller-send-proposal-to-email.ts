
import { Request, Response } from 'express';
import prismaClient from '../../../service/prisma-client';
import { SendOrcamentoEmailCase } from './use-case-send-proposal-to-email';
import { PrismaUserRepository } from '../../../repositories/in-prisma/user-in-prisma-repository';
import { PrismaHistoryRepository } from '../../../repositories/in-prisma/history-in-prisma-repository';

interface ISenEmailProps {
  proposal: {
    proposalId: string;
    clientName: string;
    clientEmail: string;
  }
  userId?: string;
  username?: string;
}

class SendOrcamentoEmailController {
  constructor() { }

  async handle(req: Request, res: Response) {
    const { proposal, userId, username }: ISenEmailProps = req.body;
    const { clientEmail, clientName, proposalId } = proposal

    const prismaUserRepository = new PrismaUserRepository(prismaClient);
    const prismahistoryRepository = new PrismaHistoryRepository(prismaClient);
    const sendOrcamentoToEmail = new SendOrcamentoEmailCase(
      prismaUserRepository,
      prismahistoryRepository,
    );

    const sendOrcamentoEmailCase = sendOrcamentoToEmail;

    try {
      await sendOrcamentoEmailCase.execute({
        userId,
        username,
        proposal: {
          proposalId,
          clientEmail,
          clientName
        }
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

export { SendOrcamentoEmailController };

/* resp.json(orcamentoEmail);
resp.status(400).json({ error: error.message }); */