import _ from "lodash";
import { CartItem, DishOrder } from "../stores/state.interface";
import store from "../stores/store";
import { Countries, CurrencyText } from "./common";
import { CustomMD3Theme } from "./theme";

const getCountryCurrency = () => {
  try {
    const state = store.getState();
    const country = state.shop.currentShop?.country || Countries.VietNam;
    return CurrencyText[country.currency as keyof typeof CurrencyText];
  } catch (error) {
    return CurrencyText.USD;
  }
};

const convertPaymentAmount = (paymentAmount: number = 0) => {
  const amount = paymentAmount ?? 0;
  return `${amount.toLocaleString()} ${getCountryCurrency()}`;
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

const getMinuteForDisplay = (ms?: number) => {
  return Math.floor((ms || 0) / 60000);
};

// universal status color
// 1-10: green
// 10-20: yellow
// 20+: red
const getStatusColor = (theme: CustomMD3Theme, minutes: number) => {
  if (minutes <= 10) {
    return {
      view: theme.colors.greenContainer,
      onView: theme.colors.onGreenContainer,
    };
  }
  if (minutes <= 20) {
    return {
      view: theme.colors.yellowContainer,
      onView: theme.colors.onYellowContainer,
    };
  }
  return {
    view: theme.colors.error,
    onView: theme.colors.onError,
  };
};

export {
  getCountryCurrency,
  convertPaymentAmount,
  mergeCartItems,
  getMinuteForDisplay,
  getStatusColor,
};
