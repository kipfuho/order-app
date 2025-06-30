import _ from "lodash";
import {
  ActivityIndicator,
  Button,
  Divider,
  Icon,
  IconButton,
  Modal,
  Portal,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import {
  useCheckoutCartMutation,
  useGetCartQuery,
  useUpdateCartMutation,
} from "@stores/apiSlices/cartApi.slice";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "@stores/store";
import { CartItem, Dish, Shop, Table } from "@stores/state.interface";
import { LoaderBasic } from "../Loader";
import { convertPaymentAmount, mergeCartItems } from "@constants/utils";
import { useGetDishesQuery } from "@stores/apiSlices/dishApi.slice";
import VerticalDivider from "../VerticalDivider";
import UpdateCartItem from "./UpdateCartItem";
import { styles } from "@/constants/styles";
import { ConfirmCancelDialog } from "../CancelDialog";
import { DishStatus } from "@/constants/common";
import Toast from "react-native-toast-message";

const CartItemCard = ({
  item,
  dish,
  handleEditItemClick,
  handleDeleteItemClick,
}: {
  item: CartItem;
  dish: Dish;
  handleEditItemClick: (cartItem: CartItem) => void;
  handleDeleteItemClick: (cartItem: CartItem) => void;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  if (!dish) {
    return <Text>{t("dish_not_found")}</Text>;
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
        <View style={{ flexWrap: "wrap", maxWidth: "70%" }}>
          <Text
            variant="titleMedium"
            style={{ fontWeight: "bold" }}
            numberOfLines={3}
          >
            {dish.name}
          </Text>
          <Text variant="titleMedium">{convertPaymentAmount(dish.price)}</Text>
          {item.note ? (
            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              <Icon source="note-edit-outline" size={16} />
              <Text>{`${t("note")}: ${item.note}`}</Text>
            </View>
          ) : null}
          {dish.status === DishStatus.deactivated ? (
            <Text style={{ color: theme.colors.error }}>
              {t("sold_out_dish_check_out")}
            </Text>
          ) : null}
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            maxWidth: "25%",
            justifyContent: "flex-end",
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 24,
            }}
            numberOfLines={2}
          >
            x{item.quantity}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <IconButton
              icon="pencil"
              size={16}
              onPress={() => handleEditItemClick(item)}
            />
            <IconButton
              icon="delete"
              size={16}
              iconColor={theme.colors.error}
              onPress={() => handleDeleteItemClick(item)}
            />
          </View>
        </View>
      </View>

      <Divider style={{ marginTop: 8 }} />
    </View>
  );
};

export default function CartDetail({
  isLoading,
  setCartDetailVisible,
}: {
  isLoading: boolean;
  setCartDetailVisible: Dispatch<SetStateAction<boolean>>;
}) {
  const { t } = useTranslation();

  const customerState = useSelector((state: RootState) => state.customer);
  const { shop, table } = customerState as {
    shop: Shop;
    table: Table;
  };
  const { data: cart, isLoading: cartLoading } = useGetCartQuery(shop.id);
  const { data: dishes = [], isLoading: dishLoading } = useGetDishesQuery({
    shopId: shop.id,
    isCustomerApp: true,
  });
  const dishById = useMemo(() => {
    return _.keyBy(dishes, "id");
  }, [dishes]);

  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [updateItemVisible, setUpdateItemVisible] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState<CartItem>();

  const [checkoutCart, { isLoading: checkoutCartLoading }] =
    useCheckoutCartMutation();
  const [updateCart, { isLoading: updateCartLoading }] =
    useUpdateCartMutation();

  const handleEditItemClick = (cartItem: CartItem) => {
    setSelectedCartItem(cartItem);
    setUpdateItemVisible(true);
  };

  const handleDeleteItemClick = (cartItem: CartItem) => {
    setSelectedCartItem(cartItem);
    setConfirmDeleteVisible(true);
  };

  const handleCheckoutCart = async () => {
    const { error } = await checkoutCart({
      shopId: shop.id,
      tableId: table.id,
    });
    if (error) {
      Toast.show({
        type: "error",
        text1: t("checkout_failed"),
        text2: _.get(error, "data.message"),
      });
    } else {
      setCartDetailVisible(false);
    }
  };

  const handleConfirmDeleteCartItem = async () => {
    if (!selectedCartItem) return;

    const newCartItems = {
      ...customerState.currentCartItem,
    };
    delete newCartItems[selectedCartItem.id];

    await updateCart({
      shopId: shop!.id,
      cartItems: mergeCartItems(newCartItems),
    }).unwrap();
    setConfirmDeleteVisible(false);
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
          contentContainerStyle={styles.flex}
        >
          <UpdateCartItem
            setVisible={setUpdateItemVisible}
            cartItemId={selectedCartItem?.id || ""}
            dish={dishById[selectedCartItem?.dishId || ""]}
          />
        </Modal>
        <ConfirmCancelDialog
          title={`${t("delete_confirm")} ${dishById[selectedCartItem?.dishId || ""]?.name}`}
          dialogVisible={confirmDeleteVisible}
          setDialogVisible={setConfirmDeleteVisible}
          isLoading={updateCartLoading}
          onCancelClick={() => setConfirmDeleteVisible(false)}
          onConfirmClick={handleConfirmDeleteCartItem}
        />
      </Portal>
      <Surface style={styles.baseContainer}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Icon source="cart" size={32} />
            <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
              {t("cart_items")}
            </Text>
          </View>
        </View>
        <ScrollView
          style={{ marginTop: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {cart?.cartItems?.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              dish={dishById[item.dishId]}
              handleEditItemClick={handleEditItemClick}
              handleDeleteItemClick={handleDeleteItemClick}
            />
          ))}
          {isLoading && <ActivityIndicator />}
        </ScrollView>
        <View style={{ gap: 8, marginTop: 8 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text
              variant="titleMedium"
              style={{ fontWeight: "bold", paddingVertical: 4 }}
            >
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
            disabled={checkoutCartLoading}
          >
            {checkoutCartLoading ? (
              <ActivityIndicator size={14} />
            ) : (
              t("confirm")
            )}
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
