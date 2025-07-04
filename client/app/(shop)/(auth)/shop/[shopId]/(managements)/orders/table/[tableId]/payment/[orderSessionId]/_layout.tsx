import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@stores/store";
import { LoaderBasic } from "@components/ui/Loader";
import { useGetActiveOrderSessionsQuery } from "@stores/apiSlices/orderApi.slice";
import { updateCurrentOrderSession } from "@stores/shop.slice";
import { Shop, Table } from "@stores/state.interface";
import { OrderSessionStatus } from "@constants/common";

export default function PaymentOrderSessionLayout() {
  const { orderSessionId } = useLocalSearchParams() as {
    orderSessionId: string;
  };
  const dispatch = useDispatch();

  const { currentShop, currentTable, currentOrderSession } = useSelector(
    (state: RootState) => state.shop,
  );
  const shop = currentShop as Shop;
  const table = currentTable as Table;

  const {
    data: activeOrderSessions = [],
    isLoading: activeOrderSessionLoading,
    isFetching: activeOrderSessionFetching,
  } = useGetActiveOrderSessionsQuery({
    shopId: shop.id,
    tableId: table.id,
  });

  const activeOrderSession = useMemo(
    () =>
      activeOrderSessions.find(
        (orderSession) => orderSession.id === orderSessionId,
      ),
    [activeOrderSessions, orderSessionId],
  );

  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (activeOrderSession) {
      dispatch(updateCurrentOrderSession(activeOrderSession));
    }

    if (
      !activeOrderSession ||
      activeOrderSession.status === OrderSessionStatus.paid
    ) {
      const timeout = setTimeout(() => {
        setShouldRedirect(true);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [
    orderSessionId,
    activeOrderSessionFetching,
    dispatch,
    activeOrderSession,
  ]);

  if (activeOrderSessionLoading || !currentOrderSession) {
    return <LoaderBasic />;
  }

  // về màn quản lý order
  if (shouldRedirect) {
    return <Redirect href={`/shop/${shop.id}/orders/`} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
