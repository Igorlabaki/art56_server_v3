import { SendAttendeceConfirmationEmailController } from "./controller-send-attendence-confirmation-to-email";

export const sendProposalEmailFactory = () => {
  const sendOrcamentoEmailController = new SendAttendeceConfirmationEmailController();

  return sendOrcamentoEmailController;
};
