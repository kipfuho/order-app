import store from "../stores/store";
import { Countries, CurrencyText } from "./common";

const getCountryCurrency = () => {
  try {
    const state = store.getState();
    const country = state.shop.currentShop?.country || Countries.VietNam;
    return CurrencyText[country.currency as keyof typeof CurrencyText];
  } catch (error) {
    return CurrencyText.USD;
  }
};

const convertPaymentAmount = (paymentAmount: number) => {
  return `${paymentAmount.toLocaleString()}${getCountryCurrency()}`;
};

export { getCountryCurrency, convertPaymentAmount };
