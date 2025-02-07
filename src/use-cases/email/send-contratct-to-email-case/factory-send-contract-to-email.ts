import { SendContratoEmailController } from "./controller-send-contrato-to-email";

export const sendContractEmailFactory = () => {
  const sendContratoEmailController = new SendContratoEmailController();

  return sendContratoEmailController;
};
