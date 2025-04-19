import _ from "lodash";
import { CartItem } from "../stores/state.interface";
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

const mergeCartItems = (currentCartItem: Record<string, CartItem>) => {
  const cardItemByKey: Record<string, CartItem> = {};

  for (const item of Object.values(currentCartItem)) {
    const key = `${item.dishId}_${item.note || ""}`;

    const previousItem = cardItemByKey[key];

    cardItemByKey[key] = {
      id: previousItem?.id || item.id,
      dishId: item.dishId,
      quantity: (previousItem?.quantity || 0) + item.quantity,
      note: previousItem?.note || item.note,
    };
  }

  return _.filter(Object.values(cardItemByKey), (item) => item.quantity > 0);
};

export { getCountryCurrency, convertPaymentAmount, mergeCartItems };
