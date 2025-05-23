import { IconButton, Surface, Text } from "react-native-paper";
import { useGetCheckoutCartHistoryQuery } from "../../../stores/apiSlices/cartApi.slice";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/store";
import { Shop, Table } from "../../../stores/state.interface";
import { ScrollView, View } from "react-native";
import { LoaderBasic } from "../Loader";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { Dispatch, SetStateAction } from "react";
import VerticalDivider from "../VerticalDivider";
import { convertPaymentAmount } from "../../../constants/utils";

export default function CartCheckoutHistory({
  setVisible,
}: {
  setVisible: Dispatch<SetStateAction<boolean>>;
}) {
  const { t } = useTranslation();

  const { shop, table } = useSelector((state: RootState) => state.customer) as {
    shop: Shop;
    table: Table;
  };
  const { data: histories = [], isLoading: historyLoading } =
    useGetCheckoutCartHistoryQuery(shop.id);

  if (historyLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <Surface style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <IconButton icon="arrow-left" onPress={() => setVisible(false)} />
          <Text
            variant="titleLarge"
            style={{
              fontWeight: "bold",
              marginLeft: 12,
            }}
          >
            {t("order_history")}
          </Text>
        </View>
        <View style={{ flex: 1, padding: 16 }}>
          <ScrollView
            style={{ marginTop: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {histories.map((history) => (
              <Surface key={history.id}>{history.id}</Surface>
            ))}
          </ScrollView>
          <View
            style={{
              flexDirection: "row",
              gap: 3,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 4,
            }}
          >
            <Text
              variant="titleMedium"
              style={{ fontWeight: "bold", marginRight: 8 }}
            >
              {t("total")}
            </Text>
            <Text variant="titleMedium">{`${0} ${t("dish_item")}`}</Text>
            <VerticalDivider />
            <Text variant="titleMedium">{convertPaymentAmount(0)}</Text>
          </View>
        </View>
      </Surface>
    </>
  );
}
