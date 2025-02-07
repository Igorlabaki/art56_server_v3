import { SendOrcamentoEmailController } from './controller-send-proposal-to-email';

export const sendProposalEmailFactory = () => {
  const sendOrcamentoEmailController = new SendOrcamentoEmailController();

  return sendOrcamentoEmailController;
};
