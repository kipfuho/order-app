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
import { AppBar } from "@components/AppBar";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import {
  useDeleteDepartmentMutation,
  useGetDepartmentsQuery,
} from "@stores/apiSlices/staffApi.slice";
import { LoaderBasic } from "@components/ui/Loader";
import {
  goToShopHome,
  goToCreateDepartment,
  goToUpdateDepartment,
} from "@apis/navigate.service";
import { useSelector } from "react-redux";
import { RootState } from "@stores/store";
import { Department, Shop } from "@stores/state.interface";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { ConfirmCancelDialog } from "@components/ui/CancelDialog";

export default function StaffDepartmentPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop,
  ) as Shop;
  const { data: departments = [], isLoading: departmentLoading } =
    useGetDepartmentsQuery(shop.id);
  const [deleteDepartment, { isLoading: deleteDepartmentLoading }] =
    useDeleteDepartmentMutation();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department>();

  const confirmDelete = async () => {
    try {
      if (!selectedDepartment) {
        Toast.show({
          type: "error",
          text1: "Delete Failed",
          text2: "Cannot find department",
        });
        return;
      }
      await deleteDepartment({
        shopId: shop.id,
        departmentId: selectedDepartment.id,
      }).unwrap();
    } catch {
      Toast.show({
        type: "error",
        text1: t("delete_failed"),
        text2: t("error_any"),
      });
    } finally {
      setDialogVisible(false);
    }
  };

  if (departmentLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <Portal>
        <ConfirmCancelDialog
          title={t("delete_confirm")}
          isLoading={deleteDepartmentLoading}
          dialogVisible={dialogVisible}
          setDialogVisible={setDialogVisible}
          onCancelClick={() => {
            setDialogVisible(false);
          }}
          onConfirmClick={confirmDelete}
        >
          <Dialog.Content>
            <Text>
              {t("delete_confirm_detail")} {selectedDepartment?.name}?
            </Text>
          </Dialog.Content>
        </ConfirmCancelDialog>
        <Toast />
      </Portal>
      <AppBar
        title={t("department")}
        goBack={() => goToShopHome({ router, shopId: shop.id })}
      />
      <Surface
        style={{
          flex: 1,
          padding: 16,
        }}
      >
        <ScrollView>
          {/* List of Table Positions */}
          <List.Section>
            {departments.map((item) => (
              <List.Item
                key={item.id}
                title={item.name}
                style={{
                  borderRadius: 8,
                  marginBottom: 8,
                }}
                left={(props) => <List.Icon {...props} icon="chair-rolling" />}
                onPress={() => {
                  goToUpdateDepartment({
                    router,
                    shopId: shop.id,
                    departmentId: item.id,
                  });
                }}
                right={() => (
                  <IconButton
                    icon="delete"
                    iconColor={theme.colors.error}
                    onPress={() => {
                      setSelectedDepartment(item); // Set selected item for deletion
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
          label={t("create_department")}
          style={{
            position: "absolute",
            right: 16,
            bottom: 16,
          }}
          onPress={() => goToCreateDepartment({ router, shopId: shop.id })}
        />
      </Surface>
    </>
  );
}
