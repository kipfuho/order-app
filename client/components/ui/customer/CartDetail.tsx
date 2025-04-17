import {
  Button,
  Divider,
  Icon,
  IconButton,
  Modal,
  Portal,
  Surface,
  Text,
} from "react-native-paper";
import { useGetCartQuery } from "../../../stores/apiSlices/cartApi.slice";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/store";
import { CartItem, Dish, Shop, Table } from "../../../stores/state.interface";
import { ScrollView, View } from "react-native";
import { LoaderBasic } from "../Loader";
import _ from "lodash";
import { convertPaymentAmount } from "../../../constants/utils";
import { useGetDishesQuery } from "../../../stores/apiSlices/dishApi.slice";
import { SetStateAction, useState } from "react";
import { useTranslation } from "react-i18next";
import VerticalDivider from "../VerticalDivider";
import UpdateCartItem from "./UpdateCartItem";

const CartItemCard = ({
  item,
  dish,
  handleEditItemClick,
}: {
  item: CartItem;
  dish: Dish;
  handleEditItemClick: (cartItem: CartItem) => void;
}) => {
  if (!dish) {
    return <Text>Dish not found</Text>;
  }

  return (
    <View style={{ marginBottom: 16 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ gap: 6 }}>
          <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
            {dish.name}
          </Text>
          <Text variant="titleMedium">{convertPaymentAmount(dish.price)}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontWeight: "bold", fontSize: 24 }}>
            x {item.quantity}
          </Text>
          <IconButton
            icon="pencil"
            size={16}
            onPress={() => handleEditItemClick(item)}
          />
        </View>
      </View>

      <Divider style={{ marginTop: 8 }} />
    </View>
  );
};

export default function CartDetail({
  setCartDetailVisible,
}: {
  setCartDetailVisible: SetStateAction<any>;
}) {
  const { t } = useTranslation();
  const { shop, table } = useSelector((state: RootState) => state.customer) as {
    shop: Shop;
    table: Table;
  };
  const { data: cart, isLoading: cartLoading } = useGetCartQuery(shop.id);
  const { data: dishes = [], isLoading: dishLoading } = useGetDishesQuery(
    shop.id
  );
  const dishById = _.keyBy(dishes, "id");

  const [updateItemVisible, setUpdateItemVisible] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState<CartItem>();

  const handleEditItemClick = (cartItem: CartItem) => {
    setSelectedCartItem(cartItem);
    setUpdateItemVisible(true);
  };

  const handleCheckoutCart = async () => {
    setCartDetailVisible(false);
  };

  if (cartLoading || dishLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <Portal>
        <Modal
          visible={updateItemVisible}
          onDismiss={() => setUpdateItemVisible(false)}
          contentContainerStyle={{ flex: 1 }}
        >
          <UpdateCartItem
            setVisible={setUpdateItemVisible}
            cartItemId={selectedCartItem?.id || ""}
            dish={dishById[selectedCartItem?.dish || ""]}
          />
        </Modal>
      </Portal>
      <Surface style={{ flex: 1, padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon source="cart" size={32} />
          <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
            {t("cart_items")}
          </Text>
        </View>
        <ScrollView
          style={{ marginTop: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {cart?.cartItems?.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              dish={dishById[item.dish]}
              handleEditItemClick={handleEditItemClick}
            />
          ))}
        </ScrollView>
        <View style={{ gap: 8, marginTop: 8 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
              {t("total")}
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 3,
                alignItems: "center",
                paddingVertical: 4,
              }}
            >
              <Text variant="titleMedium">
                {`${_.sumBy(cart?.cartItems, "quantity")} ${t("dish_item")}`}
              </Text>
              <VerticalDivider />
              <Text variant="titleMedium">
                {convertPaymentAmount(cart?.totalAmount || 0)}
              </Text>
            </View>
          </View>
          <Button
            mode="contained"
            style={{ borderRadius: 5 }}
            onPress={handleCheckoutCart}
          >
            {t("confirm")}
          </Button>
          <Button
            mode="contained-tonal"
            style={{ borderRadius: 5 }}
            onPress={() => setCartDetailVisible(false)}
          >
            {t("cancel")}
          </Button>
        </View>
      </Surface>
    </>
  );
}
