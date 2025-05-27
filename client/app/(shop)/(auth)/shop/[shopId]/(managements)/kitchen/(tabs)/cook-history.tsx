import React, { useMemo, useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import {
  Surface,
  Text,
  IconButton,
  Button,
  Divider,
  useTheme,
  Badge,
  Card,
  Icon,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import {
  KitchenDishOrder,
  Shop,
} from "../../../../../../../../stores/state.interface";
import {
  useGetUncookedDishOrdersQuery,
  useUpdateUncookedDishOrdersRequestMutation,
} from "../../../../../../../../stores/apiSlices/kitchenApi.slice";
import { LoaderBasic } from "../../../../../../../../components/ui/Loader";
import _ from "lodash";
import { LegendList } from "@legendapp/list";
import { SwipeablePage } from "../../../../../../../../components/SwipeablePage";

export default function CookHistory() {
  return (
    <SwipeablePage>
      <Surface>
        <Text>CookHistory</Text>
      </Surface>
    </SwipeablePage>
  );
}
