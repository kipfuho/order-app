import { useGetServedHistoriesRequestQuery } from "@/stores/apiSlices/kitchenApi.slice";
import { Shop } from "@/stores/state.interface";
import { RootState } from "@/stores/store";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Icon,
  Portal,
  Surface,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { useSelector } from "react-redux";
import { LoaderBasic } from "../Loader";
import { DatePickerModal } from "react-native-paper-dates";
import { View } from "react-native";
import { format } from "date-fns";
import { styles } from "@/constants/styles";
import { useInfiniteScrollingQuery } from "@/hooks/useInfiniteScrolling";
import { oneSecondBeforeTodayUTC } from "@/constants/utils";
import FlatListWithoutScroll from "../FlatList/FlatListWithoutScroll";
import { ItemTypeFlatList } from "../FlatList/FlatListUtil";

const KitchenServingHistory = () => {
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
    data: servedHistories = [],
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: getServedHistoryLoading,
  } = useInfiniteScrollingQuery(shop.id, useGetServedHistoriesRequestQuery, {
    from: range.startDate,
    to: range.endDate,
  });

  if (getServedHistoryLoading) {
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
          validRange={{ endDate: oneSecondBeforeTodayUTC() }}
          onConfirm={({ startDate, endDate }) => {
            setOpen(false);
            setRange({ startDate, endDate });
          }}
        />
      </Portal>
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
              {isFetchingNextPage ? (
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
          <FlatListWithoutScroll
            groups={[{ id: "all" }]}
            itemByGroup={{ all: servedHistories }}
            itemType={ItemTypeFlatList.KITCHEN_SERVED_HISTORY}
            shouldShowGroup={false}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
          />
        </Surface>
      </Surface>
    </>
  );
};

export default memo(KitchenServingHistory);
