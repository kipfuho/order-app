import { Fragment, memo, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  Card,
  Text,
  useTheme,
  Icon,
  Surface,
  Divider,
  TouchableRipple,
} from "react-native-paper";
import { DishOrder, Order } from "@stores/state.interface";
import { convertPaymentAmount } from "@constants/utils";
import { DishOrderStatus } from "@constants/common";
import { useTranslation } from "react-i18next";

type Step = {
  icon: string;
  label: DishOrderStatus;
};

const steps: Step[] = [
  { icon: "clock-outline", label: DishOrderStatus.confirmed },
  { icon: "pot-mix", label: DishOrderStatus.cooked },
  { icon: "noodles", label: DishOrderStatus.served },
];

const DishOrderStepper = ({ status }: { status: DishOrderStatus | string }) => {
  const theme = useTheme();

  const currentStep = useMemo(() => {
    return steps.findIndex((step) => step.label === status);
  }, [status]);

  return (
    <View style={styles.stepper}>
      {steps.map((step, index) => (
        <Fragment key={step.label}>
          <Icon
            source={index <= currentStep ? "check-circle" : step.icon}
            size={24}
            color={index <= currentStep ? theme.colors.primary : "#ccc"}
          />
          {index < steps.length - 1 && (
            <View
              style={[
                styles.stepDivider,
                {
                  backgroundColor:
                    index < currentStep ? theme.colors.primary : "#ccc",
                },
              ]}
            />
          )}
        </Fragment>
      ))}
    </View>
  );
};

const MemoiezdDishOrderStepper = memo(DishOrderStepper);

export default function DishOrderCard({
  order,
  dishOrder,
  onQuantityClick,
  onDiscountClick,
}: {
  order: Order;
  dishOrder: DishOrder;
  onQuantityClick: ({
    dishOrder,
    order,
    newQuantity,
  }: {
    dishOrder: DishOrder;
    order: Order;
    newQuantity: number;
  }) => void;
  onDiscountClick: ({
    order,
    dishOrder,
  }: {
    order: Order;
    dishOrder: DishOrder;
  }) => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Card style={styles.card} mode="outlined">
      <View style={{ padding: 16 }}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={styles.leftSection}>
              {order.isCustomerOrder ? (
                <Icon source="account-outline" size={20} />
              ) : (
                <Icon source="store-outline" size={20} />
              )}

              <Text
                variant="titleMedium"
                style={styles.dishName}
                numberOfLines={10}
              >
                {dishOrder.name}
              </Text>
            </View>

            <Surface style={styles.quantityBadge}>
              <TouchableRipple
                onPress={() =>
                  onQuantityClick({
                    dishOrder: dishOrder,
                    order,
                    newQuantity: dishOrder.quantity - 1,
                  })
                }
                style={{ borderRadius: 10 }}
              >
                <Icon source="minus-circle-outline" size={14} />
              </TouchableRipple>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  color: theme.colors.primary,
                  paddingHorizontal: 5,
                }}
                onPress={() =>
                  onQuantityClick({
                    dishOrder: dishOrder,
                    order,
                    newQuantity: dishOrder.quantity,
                  })
                }
              >
                {dishOrder.quantity}
              </Text>
              <TouchableRipple
                onPress={() =>
                  onQuantityClick({
                    dishOrder: dishOrder,
                    order,
                    newQuantity: dishOrder.quantity + 1,
                  })
                }
                style={{ borderRadius: 10 }}
              >
                <Icon source="plus-circle-outline" size={14} />
              </TouchableRipple>
            </Surface>
          </View>

          <View style={styles.rightSection}>
            <Text variant="titleMedium" style={styles.price}>
              {convertPaymentAmount(dishOrder.price)}
            </Text>
            <Text style={styles.timestamp}>{order.createdAt}</Text>
          </View>
        </View>
        <>
          {dishOrder.note && (
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <Text style={{ color: theme.colors.error }}>{t("note")}:</Text>
              <Text>{dishOrder.note}</Text>
            </View>
          )}
        </>
        {/* <ChildDishList /> */}
        <MemoiezdDishOrderStepper status={dishOrder.status} />
        <Divider style={{ marginVertical: 8 }} />
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <TouchableOpacity
            onPress={() => onDiscountClick({ order, dishOrder })}
          >
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.error,
              }}
            >
              {t("discount")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    flex: 1, // Take available space
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  quantityBadge: {
    padding: 3,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    flexShrink: 1,
    gap: 2,
  },
  dishName: {
    fontWeight: "bold",
    flexShrink: 1, // So it doesn't push into price
    flexWrap: "wrap",
    flex: 1,
  },
  rightSection: {
    alignItems: "flex-end",
    justifyContent: "center",
    maxWidth: 100, // Prevent it from shrinking
  },
  price: {
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
  },
  itemList: {
    marginTop: 8,
    gap: 2,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 4,
  },
  stepDivider: {
    height: 2,
    flex: 1,
    backgroundColor: "#ccc",
  },
});
