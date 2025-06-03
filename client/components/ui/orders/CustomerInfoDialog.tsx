import _, { debounce } from "lodash";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Button, Dialog, Text, TextInput } from "react-native-paper";
import { useDispatch } from "react-redux";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { updateCurrentCustomerInfo } from "@stores/shop.slice";

export function CustomerInfoDialog({
  customerDialogVisible,
  setCustomerDialogVisible,
  onCustomerInfoConfirmClick,
}: {
  customerDialogVisible: boolean;
  setCustomerDialogVisible: Dispatch<SetStateAction<boolean>>;
  onCustomerInfoConfirmClick: () => void;
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [numberOfCustomer, setNumberOfCustomer] = useState("1");

  const debouncedUpdateCustomerInfo = useMemo(
    () =>
      debounce(
        ({
          customerName,
          customerPhone,
          numberOfCustomer,
        }: {
          customerName: string;
          customerPhone: string;
          numberOfCustomer: string;
        }) => {
          dispatch(
            updateCurrentCustomerInfo({
              customerName,
              customerPhone,
              numberOfCustomer: _.toNumber(numberOfCustomer),
            }),
          );
        },
        300,
      ),
    [dispatch],
  );

  const setDefaultModalInfo = useCallback(() => {
    setCustomerName("");
    setCustomerPhone("");
    setNumberOfCustomer("1");
    dispatch(
      updateCurrentCustomerInfo({
        customerName: "",
        customerPhone: "",
        numberOfCustomer: 1,
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    setDefaultModalInfo();
  }, [customerDialogVisible, setDefaultModalInfo]);

  return (
    <Dialog
      visible={customerDialogVisible}
      onDismiss={() => setCustomerDialogVisible(false)}
    >
      <Dialog.Title>{t("enter_information")}</Dialog.Title>
      <Dialog.Content>
        <TextInput
          label={t("customer_name")}
          mode="outlined"
          value={customerName}
          onChangeText={(text) => {
            setCustomerName(text);
            debouncedUpdateCustomerInfo({
              customerName: text,
              customerPhone,
              numberOfCustomer,
            });
          }}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <TextInput
            label={t("customer_phone")}
            mode="outlined"
            value={customerPhone}
            onChangeText={(text) => {
              const enteredCustomerPhone = text.replace(/[^0-9.]/g, "");
              setCustomerPhone(enteredCustomerPhone);
              debouncedUpdateCustomerInfo({
                customerName,
                customerPhone: enteredCustomerPhone,
                numberOfCustomer,
              });
            }}
            style={{ flex: 1, minWidth: 150 }} // Ensures proper width
          />
          <Text>{t("customer_number")}</Text>
          <TextInput
            label="P"
            mode="outlined"
            keyboardType="numeric"
            value={numberOfCustomer}
            onChangeText={(text) => {
              const enteredNumberOfCustomer = text.replace(/[^0-9.]/g, "");
              setNumberOfCustomer(enteredNumberOfCustomer);
              debouncedUpdateCustomerInfo({
                customerName,
                customerPhone,
                numberOfCustomer: enteredNumberOfCustomer,
              });
            }} // Restrict input to numbers & decimal
            style={{ flex: 1, minWidth: 40 }} // Prevents shrinking
          />
        </View>
      </Dialog.Content>
      <Dialog.Actions style={{ justifyContent: "center" }}>
        <Button
          mode="contained"
          onPress={onCustomerInfoConfirmClick}
          style={{ width: 150 }}
        >
          {t("confirm")}
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}
