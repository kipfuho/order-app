import { Dish, DishOrder } from "../../../stores/state.interface";
import {
  Button,
  Card,
  Dialog,
  IconButton,
  Portal,
  Surface,
  Text,
  TextInput,
  Tooltip,
} from "react-native-paper";
import { Pressable, useWindowDimensions, View } from "react-native";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../stores/store";
import { updateCurrentOrder } from "../../../stores/shop.slice";
import { Dispatch } from "redux";
import _ from "lodash";
import Toast from "react-native-toast-message";

function QuantityControl({
  dish,
  currentOrder,
  dispatch,
}: {
  dish: Dish;
  currentOrder: Partial<DishOrder>;
  dispatch: Dispatch;
}) {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dishQuantity, setDishQuantity] = useState(
    (currentOrder.quantity || 0).toString()
  );

  const handleDecrease = () => {
    if (currentOrder.quantity! > 0) {
      dispatch(
        updateCurrentOrder({ dish, quantity: currentOrder.quantity! - 1 })
      );
    }
  };

  const handleIncrease = () => {
    dispatch(
      updateCurrentOrder({ dish, quantity: currentOrder.quantity! + 1 })
    );
  };

  const handleUpdateDishQuantity = () => {
    const newQuantity = _.toNumber(dishQuantity);
    if (newQuantity > 999999) {
      console.log("Invalid quantity");
      Toast.show({
        type: "error",
        text1: "Update quantity Failed",
        text2: "Please enter valid quantity",
      });
      return;
    }
    dispatch(
      updateCurrentOrder({
        dish,
        quantity: newQuantity,
      })
    );
    setDialogVisible(false);
  };

  if (currentOrder.quantity === 0) {
    return;
  }

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <Portal>
        <Toast />
        <Dialog
          visible={dialogVisible}
          style={{ width: "60%", alignSelf: "center" }}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Title>Update dish quantity</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Quantity"
              mode="outlined"
              keyboardType="numeric"
              value={dishQuantity}
              onChangeText={(text) => {
                const enteredQuantity = text.replace(/[^0-9.]/g, "");
                setDishQuantity(enteredQuantity);
              }} // Restrict input to numbers & decimal
              style={{ flex: 1, minWidth: 40 }} // Prevents shrinking
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button mode="contained" onPress={handleUpdateDishQuantity}>
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Surface
        style={{
          position: "absolute",
          bottom: 5,
          padding: 5,
          borderRadius: 10,
          alignSelf: "center",
          alignItems: "center",
          width: "95%",
          flexDirection: "row", // Align children in a row (horizontal)
          justifyContent: "space-between", // Space between the buttons and quantity text
          minWidth: 120, // Optional: Ensure there's a minimum width
        }}
      >
        <IconButton
          mode="contained"
          icon={"minus"}
          onPress={handleDecrease}
          style={{ padding: 0, margin: 0 }}
          size={15}
        />
        <Pressable
          style={{ flex: 1, alignItems: "center" }}
          onPress={() => setDialogVisible(true)}
        >
          <Text style={{ fontWeight: "bold", maxWidth: "auto" }}>
            {currentOrder.quantity}
          </Text>
        </Pressable>
        <IconButton
          mode="contained"
          icon={"plus"}
          onPress={handleIncrease}
          style={{ padding: 0, margin: 0 }}
          size={15}
        />
      </Surface>
    </>
  );
}

export const DishCardForOrder = ({ dish }: { dish: Dish }) => {
  const { width } = useWindowDimensions();
  const dispatch = useDispatch();

  const [cardWidth, setCardWidth] = useState(300);
  const currentOrder = useSelector(
    (state: RootState) => state.shop.currentOrder[dish.id]
  );

  const increaseDishQuantity = () => {
    dispatch(updateCurrentOrder({ dish }));
  };

  useEffect(() => {
    setCardWidth(width > 600 ? 200 : width * 0.2);
  }, [width]);

  return (
    <Card
      style={{ margin: 3, width: cardWidth }}
      onPress={increaseDishQuantity}
    >
      <Surface
        style={{
          position: "absolute",
          top: 5,
          right: 5,
          padding: 5,
          borderRadius: 5,
          zIndex: 5,
        }}
      >
        <Text>{(dish.price || 0).toLocaleString()}</Text>
      </Surface>
      <View>
        <Card.Cover
          source={{ uri: dish.imageUrls[0] || "https://picsum.photos/700" }}
          style={{ width: cardWidth, height: cardWidth }}
        />
        {currentOrder && (
          <QuantityControl
            dish={dish}
            currentOrder={currentOrder}
            dispatch={dispatch}
          />
        )}
      </View>
      <Card.Title
        title={
          <Tooltip title={dish.name}>
            <Text numberOfLines={2}>{dish.name}</Text>
          </Tooltip>
        }
        titleNumberOfLines={5}
      />
    </Card>
  );
};
