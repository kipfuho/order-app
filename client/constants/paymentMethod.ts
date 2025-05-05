import BankTransferPayment from "../components/ui/payments/BankTransferPayment";
import GeneralPayment from "../components/ui/payments/GeneralPayment";

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export const PaymentComponentMap = {
  [PaymentMethod.CASH]: GeneralPayment,
  [PaymentMethod.BANK_TRANSFER]: BankTransferPayment,
};
