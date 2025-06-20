import { debounce } from "lodash";
import { memo, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Card,
  IconButton,
  Switch,
  Text,
  Tooltip,
  useTheme,
} from "react-native-paper";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Dish } from "@stores/state.interface";
import { convertPaymentAmount } from "@constants/utils";
import { BLURHASH, DishStatus } from "@constants/common";
import { useUpdateDishMutation } from "@stores/apiSlices/dishApi.slice";

const DishCard = ({
  dish,
  openMenu,
  containerWidth = 0,
}: {
  dish: Dish;
  openMenu?: (dish: Dish, event: any) => void;
  containerWidth?: number;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const cardWidth = Math.min(300, containerWidth * 0.48);
  const [onSale, setOnSale] = useState(dish.status === DishStatus.activated);

  const [updateDish, { isLoading: updateDishLoading }] =
    useUpdateDishMutation();

  const onToggleSwitch = () => {
    setOnSale((prev) => !prev);
    if (updateDishLoading) return;

    updateDishStatus(!onSale);
  };

  const updateDishStatus = useMemo(
    () =>
      debounce(async (activated) => {
        await updateDish({
          dishId: dish.id,
          shopId: dish.shopId,
          status: activated ? DishStatus.activated : DishStatus.deactivated,
        }).unwrap();
      }, 500),
    [dish, updateDish],
  );

  if (cardWidth < 1) {
    return;
  }

  return (
    <Card style={{ width: cardWidth, height: 300 }}>
      {dish.status === DishStatus.deactivated && (
        <View
          style={{
            position: "absolute",
            width: "100%",
            height: 180,
            zIndex: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: theme.colors.inverseSurface,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              opacity: 0.5,
            }}
          />

          <Text
            style={{
              opacity: 1,
              color: theme.colors.inverseOnSurface,
              fontWeight: "bold",
              fontSize: 24,
            }}
          >
            {t("sold_out")}
          </Text>
        </View>
      )}
      <Image
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        source={dish.imageUrls[0] || require("@assets/images/savora.png")}
        placeholder={{ blurhash: BLURHASH }}
        style={{
          width: "100%",
          height: 180,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      />
      <Card.Title
        title={
          <Tooltip title={dish.name} leaveTouchDelay={100}>
            <Text numberOfLines={2} style={{ fontSize: 16 }}>
              {dish.name}
            </Text>
          </Tooltip>
        }
        titleNumberOfLines={2}
        subtitle={
          <Tooltip
            title={convertPaymentAmount(dish.price)}
            leaveTouchDelay={100}
          >
            <Text numberOfLines={1} style={{ fontSize: 16 }}>
              {convertPaymentAmount(dish.price)}
            </Text>
          </Tooltip>
        }
        right={(props) => {
          if (!openMenu) return;

          return (
            <IconButton
              {...props}
              icon="dots-vertical"
              onPress={(event) => openMenu(dish, event)}
            />
          );
        }}
        style={{ paddingLeft: 8 }}
      />
      <Card.Actions>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            margin: 0,
          }}
        >
          <Text>{t("on_sale")}</Text>
          <Switch value={onSale} onValueChange={onToggleSwitch} />
        </View>
      </Card.Actions>
    </Card>
  );
};

export default DishCard;
export const MemoizedDishCard = memo(DishCard);
