import {
  Dialog,
  FAB,
  IconButton,
  List,
  Portal,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { AppBar } from "../../../../../../../components/AppBar";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import {
  useDeleteEmployeePositionMutation,
  useGetEmployeePositionsQuery,
} from "../../../../../../../stores/apiSlices/staffApi.slice";
import { useRouter } from "expo-router";
import { LoaderBasic } from "../../../../../../../components/ui/Loader";
import {
  goToShopHome,
  goToCreateEmployeePosition,
  goToUpdateEmployeePosition,
} from "../../../../../../../apis/navigate.service";
import { RootState } from "../../../../../../../stores/store";
import { useSelector } from "react-redux";
import {
  EmployeePosition,
  Shop,
} from "../../../../../../../stores/state.interface";
import { useState } from "react";
import { ConfirmCancelDialog } from "../../../../../../../components/ui/CancelDialog";
import Toast from "react-native-toast-message";

export default function StaffEmployeePositionPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: employeePositions = [], isLoading: employeePositionLoading } =
    useGetEmployeePositionsQuery(shop.id);
  const [deleteEmployeePosition, { isLoading: deleteEmployeePositionLoading }] =
    useDeleteEmployeePositionMutation();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedEmployeePosition, setSelectedEmployeePosition] =
    useState<EmployeePosition>();

  const confirmDelete = async () => {
    try {
      if (!selectedEmployeePosition) {
        Toast.show({
          type: "error",
          text1: "Delete Failed",
          text2: "Cannot find employee position",
        });
        return;
      }
      await deleteEmployeePosition({
        shopId: shop.id,
        employeePositionId: selectedEmployeePosition.id,
      }).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setDialogVisible(false);
    }
  };

  if (employeePositionLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <Portal>
        <ConfirmCancelDialog
          title={t("delete_confirm")}
          isLoading={deleteEmployeePositionLoading}
          dialogVisible={dialogVisible}
          setDialogVisible={setDialogVisible}
          onCancelClick={() => {
            setDialogVisible(false);
          }}
          onConfirmClick={confirmDelete}
        >
          <Dialog.Content>
            <Text>
              {t("delete_confirm_detail")} {selectedEmployeePosition?.name}?
            </Text>
          </Dialog.Content>
        </ConfirmCancelDialog>
        <Toast />
      </Portal>
      <AppBar
        title={t("employee_position")}
        goBack={() => goToShopHome({ router, shopId: shop.id })}
      />
      <Surface
        style={{
          flex: 1,
          paddingHorizontal: 16,
        }}
      >
        <ScrollView>
          {/* List of Table Positions */}
          <List.Section>
            {employeePositions.map((item) => (
              <List.Item
                key={item.id}
                title={item.name}
                style={{
                  borderRadius: 8,
                  marginBottom: 8,
                }}
                left={(props) => <List.Icon {...props} icon="table" />}
                onPress={() => {
                  goToUpdateEmployeePosition({
                    router,
                    shopId: shop.id,
                    employeePositionId: item.id,
                  });
                }}
                right={() => (
                  <IconButton
                    icon="delete"
                    iconColor={theme.colors.error}
                    onPress={() => {
                      setSelectedEmployeePosition(item); // Set selected item for deletion
                      setDialogVisible(true); // Show delete confirmation dialog
                    }}
                  />
                )}
              />
            ))}
          </List.Section>
          <View style={{ height: 60 }} />
        </ScrollView>

        <FAB
          icon="plus"
          label={t("create_employee_position")}
          style={{
            position: "absolute",
            right: 16,
            bottom: 16,
          }}
          onPress={() =>
            goToCreateEmployeePosition({ router, shopId: shop.id })
          }
        />
      </Surface>
    </>
  );
}
