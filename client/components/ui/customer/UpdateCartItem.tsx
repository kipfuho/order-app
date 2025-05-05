import { Dispatch, SetStateAction, useState } from "react";
import {
  Button,
  Divider,
  Icon,
  IconButton,
  Surface,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { Dish } from "../../../stores/state.interface";
import { Image, Pressable, ScrollView, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { updateCartSingleDish } from "../../../stores/customerSlice";
import { convertPaymentAmount } from "../../../constants/utils";
import { useTranslation } from "react-i18next";
import { RootState } from "../../../stores/store";

export default function UpdateCartItem({
  cartItemId,
  dish,
  setVisible,
}: {
  cartItemId: string;
  dish?: Dish;
  setVisible: Dispatch<SetStateAction<boolean>>;
}) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { t } = useTranslation();

  const cartItem = useSelector(
    (state: RootState) => state.customer.currentCartItem[cartItemId]
  );

  const [note, setNote] = useState("");
  const [currentItemQuantity, setCurrentQuantity] = useState(
    cartItem?.quantity ?? 0
  );

  const handleUpdateCartItem = () => {
    if (!cartItem || !dish) return;

    dispatch(
      updateCartSingleDish({
        id: cartItemId,
        dish,
        quantity: currentItemQuantity,
      })
    );
    setVisible(false);
  };

  if (!cartItem || !dish) {
    return;
  }

  return (
    <Surface style={{ flex: 1 }}>
      <ScrollView>
        {/* Top image with close icon */}
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: dish.imageUrls[0] || "https://picsum.photos/700" }}
            style={{ width: "100%", height: 200 }}
            resizeMode="cover"
          />
          <IconButton
            icon="close"
            onPress={() => setVisible(false)}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "#fff",
            }}
          />
        </View>

        {/* Content */}
        <View style={{ padding: 16 }}>
          {/* Title and quantity */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              variant="titleMedium"
              style={{
                fontWeight: "bold",
                flex: 1,
                marginRight: 8,
              }}
            >
              {dish.name}
            </Text>

            {/* Quantity buttons */}
            <Surface
              style={{
                padding: 8,
                borderRadius: 20,
                alignSelf: "center",
                alignItems: "center",
                width: "auto",
                flexDirection: "row", // Align children in a row (horizontal)
                justifyContent: "space-between", // Space between the buttons and quantity text
                minWidth: 120,
                flexWrap: "wrap",
              }}
            >
              <TouchableRipple
                style={{
                  backgroundColor: theme.colors.onBackground,
                  borderRadius: 20,
                }}
                onPress={() =>
                  setCurrentQuantity((prev) => Math.max(prev - 1, 0))
                }
              >
                <Icon
                  source="minus"
                  size={24}
                  color={theme.colors.background}
                />
              </TouchableRipple>
              <Pressable
                style={{ flex: 1, alignItems: "center" }}
                onPress={() => {
                  // do sth here
                }}
              >
                <Text
                  style={{
                    maxWidth: "auto",
                    paddingHorizontal: 5,
                    fontSize: 18,
                  }}
                >
                  {cartItem.quantity}
                </Text>
              </Pressable>
              <TouchableRipple
                style={{
                  backgroundColor: theme.colors.onBackground,
                  borderRadius: 20,
                }}
                onPress={() => setCurrentQuantity((prev) => prev + 1)}
              >
                <Icon source="plus" size={24} color={theme.colors.background} />
              </TouchableRipple>
            </Surface>
          </View>

          {/* Price */}
          <Text
            variant="titleMedium"
            style={{ fontWeight: "bold", marginTop: 4 }}
          >
            {convertPaymentAmount(dish.price)}
          </Text>

          {/* Description */}
          <Text style={{ marginTop: 4 }}>{dish.description}</Text>

          {/* Note */}
          <TextInput
            mode="flat"
            placeholder={t("note")}
            value={note}
            onChangeText={setNote}
          />
        </View>
      </ScrollView>

      <Divider style={{ marginVertical: 8 }} />

      {/* Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 16,
          gap: 8,
        }}
      >
        <Button
          mode="contained"
          icon="cart"
          onPress={handleUpdateCartItem}
          style={{ flex: 1, borderRadius: 8 }}
        >
          {t("update_cart")}
        </Button>
        <Button
          mode="contained-tonal"
          icon="close"
          onPress={() => setVisible(false)}
          style={{ flex: 1, borderRadius: 8 }}
        >
          {t("close")}
        </Button>
      </View>
    </Surface>
  );
}
