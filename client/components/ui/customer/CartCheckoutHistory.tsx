import _ from "lodash";
import { IconButton, Surface, Text } from "react-native-paper";
import { Dispatch, SetStateAction, useCallback } from "react";
import { useSelector } from "react-redux";
import { View } from "react-native";
import { RootState } from "@stores/store";
import { useTranslation } from "react-i18next";
import {
  OrderCartCheckoutHistory,
  OrderSessionCartCheckoutHistory,
  Shop,
} from "@stores/state.interface";
import { LoaderBasic } from "../Loader";
import {
  useGetCheckoutCartHistoryQuery,
  useGetUnconfirmedCheckoutCartHistoryQuery,
} from "@stores/apiSlices/cartApi.slice";
import { styles } from "@/constants/styles";
import CartCheckoutHistoryCard from "./CartCheckoutHistoryCard";
import { useInfiniteScrollingQuery } from "@/hooks/useInfiniteScrolling";
import { LegendList } from "@legendapp/list";
import UnconfirmedCartCheckoutHistoryCard from "./UnconfirmedCartCheckoutHistoryCard";

export default function CartCheckoutHistory({
  setVisible,
}: {
  setVisible: Dispatch<SetStateAction<boolean>>;
}) {
  const { t } = useTranslation();
  const { shop } = useSelector((state: RootState) => state.customer) as {
    shop: Shop;
  };

  const {
    data: unconfirmedHistories = [],
    fetchNextPage: unconfirmedHistoriesFetchNextPage,
    hasNextPage: unconfirmedHistoriesHasNextPage,
    isFetchingNextPage: unconfirmedHistoriesIsFetchingNextPage,
    isLoading: unconfirmedHistoryLoading,
  } = useInfiniteScrollingQuery(
    shop.id,
    useGetUnconfirmedCheckoutCartHistoryQuery,
  );

  const {
    data: confirmedHistories = [],
    fetchNextPage: confirmedHistoriesFetchNextPage,
    hasNextPage: confirmedHistoriesHasNextPage,
    isFetchingNextPage: confirmedHistoriesIsFetchingNextPage,
    isLoading: confirmedHistoriesLoading,
  } = useInfiniteScrollingQuery(shop.id, useGetCheckoutCartHistoryQuery);

  const handleEndReached = useCallback(() => {
    if (
      unconfirmedHistoriesHasNextPage &&
      !unconfirmedHistoriesIsFetchingNextPage &&
      unconfirmedHistoriesFetchNextPage
    ) {
      unconfirmedHistoriesFetchNextPage();
    }

    if (
      !unconfirmedHistoriesHasNextPage &&
      confirmedHistoriesHasNextPage &&
      !confirmedHistoriesIsFetchingNextPage &&
      confirmedHistoriesFetchNextPage
    ) {
      confirmedHistoriesFetchNextPage();
    }
  }, [
    confirmedHistoriesFetchNextPage,
    confirmedHistoriesHasNextPage,
    confirmedHistoriesIsFetchingNextPage,
    unconfirmedHistoriesFetchNextPage,
    unconfirmedHistoriesHasNextPage,
    unconfirmedHistoriesIsFetchingNextPage,
  ]);

  const renderItem = useCallback(
    ({
      item,
    }: {
      item: OrderCartCheckoutHistory | OrderSessionCartCheckoutHistory;
    }) => {
      // Order Session
      if (!_.isEmpty(_.get(item, "orders"))) {
        const orderSession = item as OrderSessionCartCheckoutHistory;
        return <CartCheckoutHistoryCard orderSession={orderSession} />;
      }

      // Order
      const order = item as OrderCartCheckoutHistory;
      return <UnconfirmedCartCheckoutHistoryCard order={order} />;
    },
    [],
  );

  if (unconfirmedHistoryLoading || confirmedHistoriesLoading) {
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
        <View style={styles.baseContainer}>
          <LegendList
            data={[...unconfirmedHistories, ...confirmedHistories]}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            estimatedItemSize={150}
            initialContainerPoolRatio={1.5}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            contentContainerStyle={{ padding: 10, gap: 16 }}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </Surface>
    </>
  );
}
