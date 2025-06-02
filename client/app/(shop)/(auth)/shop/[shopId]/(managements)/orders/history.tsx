import { useRouter } from "expo-router";
import { AppBar } from "@components/AppBar";
import { goToOrderSessionDetail, goToShopHome } from "@apis/navigate.service";
import {
  Surface,
  Text,
  Portal,
  ActivityIndicator,
  Divider,
  TouchableRipple,
  useTheme,
  Icon,
} from "react-native-paper";
import { Shop } from "@stores/state.interface";
import { RootState } from "@stores/store";
import { useSelector } from "react-redux";
import { useGetOrderSessionHistoryQuery } from "@stores/apiSlices/orderApi.slice";
import { DatePickerModal } from "react-native-paper-dates";
import { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { format } from "date-fns";
import { LoaderBasic } from "@components/ui/Loader";
import { useTranslation } from "react-i18next";
import OrderHistoryCard from "@components/ui/orders/OrderHistoryCard";
import { styles } from "@/constants/styles";

export default function OrderManagementHistoryPage() {
  const router = useRouter();
  const { i18n, t } = useTranslation();
  const theme = useTheme();

  const { currentShop } = useSelector((state: RootState) => state.shop);
  const shop = currentShop as Shop;

  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({ startDate: undefined, endDate: undefined });

  const {
    data: orderHistories = [],
    isLoading: getOrderSessionHistoryLoading,
    isFetching: getOrderSessionHistoryFetching,
  } = useGetOrderSessionHistoryQuery({
    shopId: shop.id,
    from: range.startDate,
    to: range.endDate,
  });

  if (getOrderSessionHistoryLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <Portal>
        <DatePickerModal
          locale={i18n.language.split("-")[0]}
          mode="range"
          visible={open}
          startDate={range.startDate}
          endDate={range.endDate}
          onDismiss={() => setOpen(false)}
          validRange={{ endDate: new Date(Date.now()) }}
          onConfirm={({ startDate, endDate }) => {
            setOpen(false);
            setRange({ startDate, endDate });
          }}
        />
      </Portal>
      <AppBar
        title={t("history")}
        goBack={() => {
          goToShopHome({ router, shopId: shop.id });
        }}
      />

      <Surface style={{ flex: 1 }}>
        <View style={{ marginVertical: 16 }}>
          <TouchableRipple
            onPress={() => setOpen(true)}
            style={{
              backgroundColor: theme.colors.secondaryContainer,
              margin: 10,
              padding: 10,
              borderRadius: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {getOrderSessionHistoryFetching ? (
                <ActivityIndicator />
              ) : (
                <Text style={{ color: theme.colors.onSecondaryContainer }}>
                  {range.startDate && range.endDate
                    ? `${t("from")}: ${format(
                        range.startDate,
                        "dd/MM/yyyy",
                      )} ${t("to")}: ${format(range.endDate, "dd/MM/yyyy")}`
                    : t("choose_time_range")}
                </Text>
              )}
              {(range.startDate || range.endDate) && (
                <TouchableRipple
                  onPress={() =>
                    setRange({ startDate: undefined, endDate: undefined })
                  }
                  style={{ marginLeft: 15 }}
                >
                  <Icon source="close-circle-outline" size={25} />
                </TouchableRipple>
              )}
            </View>
          </TouchableRipple>
        </View>

        <Surface style={styles.baseContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Surface mode="flat" style={{ gap: 16 }}>
              {orderHistories?.map((orderHistory, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={() =>
                    goToOrderSessionDetail({
                      router,
                      shopId: shop.id,
                      orderSessionId: orderHistory.id,
                    })
                  }
                >
                  <OrderHistoryCard orderHistory={orderHistory} />
                  <Divider style={{ marginVertical: 8 }} />
                </TouchableOpacity>
              ))}
            </Surface>
          </ScrollView>
        </Surface>
      </Surface>
    </>
  );
}
