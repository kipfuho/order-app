export const BLURHASH =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export enum DiscountType {
  PRODUCT = "product",
  INVOICE = "invoice",
}

export enum OrderSessionStatus {
  unpaid = "unpaid",
  paid = "paid",
  cancelled = "cancelled",
}

export enum CurrencyText {
  VND = "đ",
  USD = "$",
}

export const Countries = {
  VietNam: {
    name: "Việt Nam",
    currency: "VND",
  },
};

export enum DishStatus {
  activated = "activated",
  deactivated = "deactivated",
}

export enum DiscountValueType {
  PERCENTAGE = "percentage",
  ABSOLUTE = "absolute",
}

export enum DishOrderStatus {
  confirmed = "confirmed",
  cooked = "cooked",
  served = "served",
}

export enum ReportPeriod {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
}

export const UNIVERSAL_WIDTH_PIVOT = 600;
export const UNIVERSAL_MAX_WIDTH_SIDEBAR = 200;
