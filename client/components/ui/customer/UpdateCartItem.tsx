import _ from "lodash";
import { Dispatch, SetStateAction, useState } from "react";
import {
  Button,
  Dialog,
  Divider,
  Icon,
  IconButton,
  Portal,
  Surface,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Dish } from "@stores/state.interface";
import { updateCartSingleDish } from "@stores/customerSlice";
import { convertPaymentAmount } from "@constants/utils";
import { RootState } from "@stores/store";
import { BLURHASH } from "@constants/common";
import Toast from "react-native-toast-message";

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
  const { height } = useWindowDimensions();

  const cartItem = useSelector(
    (state: RootState) => state.customer.currentCartItem[cartItemId],
  );

  const [dialogVisible, setDialogVisible] = useState(false);
  const [note, setNote] = useState("");
  const [currentItemQuantity, setCurrentQuantity] = useState(
    cartItem?.quantity ?? 0,
  );
  const [dialogQuantity, setDialogQuantity] = useState("");

  const handleUpdateCartItemQuantity = () => {
    const newQuantity = _.toNumber(dialogQuantity);
    if (newQuantity > 999999) {
      Toast.show({
        type: "error",
        text1: "Update quantity Failed",
        text2: "Please enter valid quantity",
      });
      return;
    }
    setCurrentQuantity(newQuantity);
    setDialogVisible(false);
  };

  const handleUpdateCartItem = () => {
    if (!cartItem || !dish) return;

    dispatch(
      updateCartSingleDish({
        id: cartItemId,
        dish,
        quantity: currentItemQuantity,
        note,
      }),
    );
    setVisible(false);
  };

  if (!cartItem || !dish) {
    return;
  }

  return (
    <>
      <Portal>
        <Dialog
          visible={dialogVisible}
          style={{ width: "80%", maxWidth: 500, alignSelf: "center" }}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Title>{t("update_dish_quantity")}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Quantity"
              mode="outlined"
              keyboardType="numeric"
              value={dialogQuantity}
              onChangeText={(text) => {
                const enteredQuantity = text.replace(/[^0-9.]/g, "");
                setDialogQuantity(enteredQuantity);
              }} // Restrict input to numbers & decimal
              style={{ flex: 1, minWidth: 40 }} // Prevents shrinking
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button mode="contained" onPress={handleUpdateCartItemQuantity}>
              {t("confirm")}
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Toast />
      </Portal>
      <Surface style={{ flex: 1 }}>
        <ScrollView>
          {/* Top image with close icon */}
          <View style={{ position: "relative" }}>
            <Image
              source={dish.imageUrls[0] || require("@assets/images/savora.png")}
              style={{ width: "100%", height: Math.min(500, height * 0.5) }}
              placeholder={{ blurhash: BLURHASH }}
              contentFit="fill"
            />
            <IconButton
              icon="close"
              onPress={() => setVisible(false)}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: theme.colors.background,
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
                    setDialogQuantity(currentItemQuantity.toString());
                    setDialogVisible(true);
                  }}
                >
                  <Text
                    style={{
                      maxWidth: "auto",
                      paddingHorizontal: 5,
                      fontSize: 18,
                    }}
                  >
                    {currentItemQuantity}
                  </Text>
                </Pressable>
                <TouchableRipple
                  style={{
                    backgroundColor: theme.colors.onBackground,
                    borderRadius: 20,
                  }}
                  onPress={() => setCurrentQuantity((prev) => prev + 1)}
                >
                  <Icon
                    source="plus"
                    size={24}
                    color={theme.colors.background}
                  />
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
    </>
  );
}
