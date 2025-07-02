import "react-native-get-random-values";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
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
import { convertPaymentAmount } from "@constants/utils";
import { RootState } from "@stores/store";
import { BLURHASH } from "@constants/common";
import Toast from "react-native-toast-message";
import toastConfig from "@/components/CustomToast";
import { updateCartSingleDish } from "../../../stores/customerSlice";

export default function DishDetailForCustomer({
  dish,
  setVisible,
}: {
  dish: Dish;
  setVisible: Dispatch<SetStateAction<boolean>>;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const dispatch = useDispatch();

  const currentCartItems = useSelector(
    (state: RootState) => state.customer.currentCartItem,
  );
  const [dialogVisible, setDialogVisible] = useState(false);
  const [note, setNote] = useState("");
  const [currentItemQuantity, setCurrentQuantity] = useState(0);
  const [dialogQuantity, setDialogQuantity] = useState("");

  const handleUpdateCartItemQuantity = () => {
    const newQuantity = _.toNumber(dialogQuantity);
    if (newQuantity > 999999) {
      Toast.show({
        type: "error",
        text1: t("update_failed"),
        text2: t("error_update_quantity"),
      });
      return;
    }
    setCurrentQuantity(newQuantity);
    setDialogVisible(false);
  };

  const handleChangeQuantity = () => {
    if (!dish || currentItemQuantity === 0) return;

    const cartItemWithSameNote = _.find(
      currentCartItems,
      (cartItem) => cartItem.note === note,
    );
    dispatch(
      updateCartSingleDish({
        id: cartItemWithSameNote?.id || uuidv4(),
        dish,
        quantity: (cartItemWithSameNote?.quantity || 0) + currentItemQuantity,
        note,
      }),
    );

    setVisible(false);
  };

  return (
    <>
      <Portal>
        <Dialog
          visible={dialogVisible}
          style={{ width: "80%", maxWidth: 500, alignSelf: "center" }}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Title>{t("update_quantity")}</Dialog.Title>
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
        <Toast config={toastConfig} />
      </Portal>
      <Surface style={{ flex: 1 }}>
        <ScrollView>
          {/* Top image with close icon */}
          <View style={{ position: "relative" }}>
            <Image
              // eslint-disable-next-line @typescript-eslint/no-require-imports
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

            {/* Description */}
            <Text style={{ marginTop: 4 }}>{dish.description}</Text>

            {/* Price */}
            <Text
              variant="titleMedium"
              style={{ fontWeight: "bold", marginTop: 4 }}
            >
              {convertPaymentAmount(dish.price)}
            </Text>

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
            onPress={handleChangeQuantity}
            style={{ flex: 1, borderRadius: 8 }}
          >
            {t("add_product")}
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
