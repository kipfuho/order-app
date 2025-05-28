import BankTransferPayment from "@components/ui/payments/BankTransferPayment";
import GeneralPayment from "@components/ui/payments/GeneralPayment";

export enum PaymentMethod {
  CASH = "cash",
  BANK_TRANSFER = "bank_transfer",
  CREDIT_CARD = "credit_card",
  VNPAY = "vnpay",
}

export const PaymentComponentMap = {
  [PaymentMethod.CASH]: GeneralPayment,
  [PaymentMethod.BANK_TRANSFER]: GeneralPayment,
  [PaymentMethod.CREDIT_CARD]: GeneralPayment,
  [PaymentMethod.VNPAY]: BankTransferPayment,
};
