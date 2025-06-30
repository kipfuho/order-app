import { debounce } from "lodash";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  const updateDishStatusRef = useRef(
    debounce(async (activated: boolean) => {
      await updateDish({
        dishId: dish.id,
        shopId: dish.shopId,
        status: activated ? DishStatus.activated : DishStatus.deactivated,
      }).unwrap();
    }, 500),
  ).current;

  const onToggleSwitch = useCallback(() => {
    if (updateDishLoading) return;
    const newStatus = !onSale;
    setOnSale(newStatus);
    updateDishStatusRef(newStatus);
  }, [onSale, updateDishLoading, updateDishStatusRef]);

  const RightActions = useMemo(() => {
    if (!openMenu) return undefined;

    return function ActionButton(props: any) {
      return (
        <IconButton
          {...props}
          icon="dots-vertical"
          onPress={(event) => openMenu(dish, event)}
        />
      );
    };
  }, [dish, openMenu]);

  useEffect(() => {
    return () => {
      updateDishStatusRef.cancel();
    };
  }, [updateDishStatusRef]);

  return (
    <Card style={[styles.card, { width: cardWidth }]}>
      {dish.status === DishStatus.deactivated && (
        <View style={styles.overlay}>
          <View
            style={[
              styles.overlayBg,
              { backgroundColor: theme.colors.inverseSurface },
            ]}
          />

          <Text
            style={[
              styles.overlayText,
              { color: theme.colors.inverseOnSurface },
            ]}
          >
            {t("sold_out")}
          </Text>
        </View>
      )}
      <Image
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        source={dish.imageUrls[0] || require("@assets/images/savora.png")}
        placeholder={{ blurhash: BLURHASH }}
        style={styles.image}
        recyclingKey={`dish-${dish.id}`} // Helps recycle image components
        cachePolicy="memory-disk" // Aggressive caching
        priority="normal" // Don't compete with high-priority images
        transition={null} // Disable transitions during scrolling
        allowDownscaling // Allow image downscaling
        contentFit="cover" // Efficient fit mode
      />
      <Card.Title
        title={
          <Tooltip title={dish.name} leaveTouchDelay={100}>
            <Text numberOfLines={2} style={styles.titleText}>
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
            <Text numberOfLines={1} style={styles.titleText}>
              {convertPaymentAmount(dish.price)}
            </Text>
          </Tooltip>
        }
        right={RightActions}
        style={styles.cardTitle}
      />
      <Card.Actions>
        <View style={styles.actionsRow}>
          <Text>{t("on_sale")}</Text>
          <Switch value={onSale} onValueChange={onToggleSwitch} />
        </View>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 300,
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: 180,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  overlayText: {
    opacity: 1,
    fontWeight: "bold",
    fontSize: 24,
  },
  image: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  titleText: {
    fontSize: 16,
  },
  cardTitle: {
    paddingLeft: 8,
  },
  actionsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 0,
  },
});

export default DishCard;
export const MemoizedDishCard = memo(DishCard);
