import { Dish } from "../../../stores/state.interface";
import {
  Card,
  IconButton,
  Text,
  Tooltip,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { memo, useCallback, useState } from "react";
import { View } from "react-native";
import { convertPaymentAmount } from "../../../constants/utils";
import { Image } from "expo-image";
import { BLURHASH, DishStatus } from "../../../constants/common";
import { useTranslation } from "react-i18next";
import { useUpdateDishMutation } from "../../../stores/apiSlices/dishApi.slice";
import { debounce } from "lodash";
import { SymbolSwitch } from "../../SymbolSwitch";

const DishCard = ({
  dish,
  openMenu,
  containerWidth = 0,
}: {
  dish: Dish;
  openMenu: (dish: Dish, event: any) => void;
  containerWidth?: number;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const cardWidth = Math.min(300, containerWidth * 0.48);
  const [onSale, setOnSale] = useState(dish.status === DishStatus.activated);

  const [updateDish, { isLoading: updateDishLoading }] =
    useUpdateDishMutation();

  const onToggleSwitch = () => {
    setOnSale(!onSale);
    updateDishStatus(!onSale);
  };

  const updateDishStatus = useCallback(
    debounce(async (activated) => {
      if (updateDishLoading) {
        return;
      }

      await updateDish({
        dishId: dish.id,
        shopId: dish.shop,
        status: activated ? DishStatus.activated : DishStatus.deactivated,
      }).unwrap();
    }, 500),
    []
  );

  if (cardWidth < 1) {
    return;
  }

  return (
    <Card style={{ width: cardWidth, height: 300 }}>
      <Image
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
        right={(props) => (
          <IconButton
            {...props}
            icon="dots-vertical"
            onPress={(event) => openMenu(dish, event)}
          />
        )}
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
          <SymbolSwitch
            value={onSale}
            onChange={onToggleSwitch}
            activeColor={theme.colors.primary}
            inactiveColor={theme.colors.secondary}
          />
        </View>
      </Card.Actions>
    </Card>
  );
};

export default DishCard;
export const MemoizedDishCard = memo(DishCard);
