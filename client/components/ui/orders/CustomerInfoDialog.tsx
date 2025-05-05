import _, { debounce } from "lodash";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { Button, Dialog, Text, TextInput } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentCustomerInfo } from "../../../stores/shop.slice";
import { View } from "react-native";
import { RootState } from "../../../stores/store";

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

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [numberOfCustomer, setNumberOfCustomer] = useState("1");

  const debouncedUpdateCustomerInfo = useCallback(
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
          })
        );
      },
      300
    ), // 300ms delay
    [dispatch]
  );

  const setDefaultModalInfo = () => {
    setCustomerName("");
    setCustomerPhone("");
    setNumberOfCustomer("1");
    dispatch(
      updateCurrentCustomerInfo({
        customerName: "",
        customerPhone: "",
        numberOfCustomer: 1,
      })
    );
  };

  useEffect(() => {
    setDefaultModalInfo();
  }, [customerDialogVisible]);

  return (
    <Dialog
      visible={customerDialogVisible}
      onDismiss={() => setCustomerDialogVisible(false)}
    >
      <Dialog.Title>Nhập thông tin</Dialog.Title>
      <Dialog.Content>
        <TextInput
          label="Customer Name"
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
            gap: 10, // Adds spacing between elements (Alternative: use marginRight)
          }}
        >
          <TextInput
            label="Customer Phone"
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
          <Text>Số người</Text>
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
          Confirm
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}
