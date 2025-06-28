import _ from "lodash";
import { CartItem } from "@stores/state.interface";
import { Countries, CurrencyText } from "./common";
import { CustomMD3Theme } from "./theme";

const logger = {
  log: (...args: any) => {
    if (process.env.NODE_ENV === "production") return;
    // eslint-disable-next-line no-console
    console.log(...args);
  },
  debug: (...args: any) => {
    if (process.env.NODE_ENV === "production") return;
    // eslint-disable-next-line no-console
    console.debug(...args);
  },
  error: (...args: any) => {
    if (process.env.NODE_ENV === "production") return;
    // eslint-disable-next-line no-console
    console.error(...args);
  },
};

const getCountryCurrency = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const store = require("../stores/store").default;
    const state = store.getState();
    const country = state.shop.currentShop?.country || Countries.VietNam;
    return CurrencyText[country.currency as keyof typeof CurrencyText];
  } catch {
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

const getMinuteForDisplay = ({
  now,
  dateTimeString,
  epochTime,
}: {
  now: number;
  dateTimeString?: string;
  epochTime?: number;
}) => {
  let ms: number | undefined;

  if (dateTimeString) {
    let parsedDate: Date | undefined;

    const isoDate = new Date(dateTimeString);
    if (dateTimeString.includes("T") && !isNaN(isoDate.getTime())) {
      // Looks like ISO format
      parsedDate = isoDate;
    } else {
      const timeDateRegex = /^(\d{1,2}):(\d{2}) (\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      const dateOnlyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

      let match;
      if ((match = dateTimeString.match(timeDateRegex))) {
        const [, hh, mm, dd, MM, yyyy] = match.map(Number);
        parsedDate = new Date(yyyy, MM - 1, dd, hh, mm);
      } else if ((match = dateTimeString.match(dateOnlyRegex))) {
        const [, dd, MM, yyyy] = match.map(Number);
        parsedDate = new Date(yyyy, MM - 1, dd);
      }
    }

    if (parsedDate) {
      ms = now - parsedDate.getTime();
    }
  }

  // If no valid date string, use epoch time
  if (ms === undefined && epochTime !== undefined) {
    ms = now - epochTime;
  }

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

const convertHourForDisplay = (hour?: number) => {
  if (!hour) {
    return "N/A";
  }
  const paddedHour = hour.toString().padStart(2, "0");
  return `${paddedHour}:00`;
};

const oneSecondBeforeTodayUTC = () => {
  const now = new Date();
  const startOfTodayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  return new Date(startOfTodayUTC.getTime() - 1000);
};

const normalizeVietnamese = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD") // separate base characters and accents
    .replace(/[\u0300-\u036f]/g, "") // remove diacritical marks
    .replace(/đ/g, "d") // replace đ
    .replace(/[^a-z0-9\s]/g, "") // remove punctuation/special chars if needed
    .replace(/\s+/g, " ") // collapse multiple spaces
    .trim(); // remove leading/trailing spaces
};

const base64ToBlob = (
  base64Data: string,
  contentType: string = "image/jpeg",
) => {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let i = 0; i < byteCharacters.length; i += 512) {
    const slice = byteCharacters.slice(i, i + 512);
    const byteNumbers = new Array(slice.length);
    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: contentType });
};

export {
  logger,
  getCountryCurrency,
  convertPaymentAmount,
  mergeCartItems,
  getMinuteForDisplay,
  getStatusColor,
  convertHourForDisplay,
  oneSecondBeforeTodayUTC,
  normalizeVietnamese,
  base64ToBlob,
};
