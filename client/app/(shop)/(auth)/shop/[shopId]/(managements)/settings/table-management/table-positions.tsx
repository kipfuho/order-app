import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@stores/store";
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
import { Shop, TablePosition } from "@stores/state.interface";
import { AppBar } from "@components/AppBar";
import {
  useDeleteTablePositionMutation,
  useGetTablePositionsQuery,
} from "@stores/apiSlices/tableApi.slice";
import { LoaderBasic } from "@components/ui/Loader";
import {
  goToShopSetting,
  goToCreateTablePosition,
  goToUpdateTablePosition,
} from "@apis/navigate.service";
import { useTranslation } from "react-i18next";
import { styles } from "@/constants/styles";
import { PermissionType } from "@/constants/common";
import { ConfirmCancelDialog } from "@/components/ui/CancelDialog";
import Toast from "react-native-toast-message";
import toastConfig from "@/components/CustomToast";

export default function TablePositionsManagementPage() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  const { currentShop, userPermission } = useSelector(
    (state: RootState) => state.shop,
  );
  const shop = currentShop as Shop;

  const { data: tablePositions = [], isLoading: tablePositionLoading } =
    useGetTablePositionsQuery(shop.id);
  const [deleteTablePosition, { isLoading: deleteTableLoading }] =
    useDeleteTablePositionMutation();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedTablePosition, setSelectedTablePosition] =
    useState<TablePosition>();

  const confirmDelete = async () => {
    try {
      if (!selectedTablePosition) {
        Toast.show({
          type: "error",
          text1: t("delete_failed"),
          text2: t("table_position_not_found"),
        });
        return;
      }
      await deleteTablePosition({
        shopId: shop.id,
        tablePositionId: selectedTablePosition.id,
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

  if (tablePositionLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <Portal>
        <ConfirmCancelDialog
          title={t("delete_confirm")}
          isLoading={deleteTableLoading}
          dialogVisible={dialogVisible}
          setDialogVisible={setDialogVisible}
          onCancelClick={() => {
            setDialogVisible(false);
          }}
          onConfirmClick={confirmDelete}
        >
          <Dialog.Content>
            <Text>
              {t("delete_confirm_detail")} {selectedTablePosition?.name}?
            </Text>
          </Dialog.Content>
        </ConfirmCancelDialog>
        <Toast config={toastConfig} />
      </Portal>

      <AppBar
        title={t("table_position")}
        goBack={() => goToShopSetting({ router, shopId: shop.id })}
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
            {tablePositions.map((item) => (
              <List.Item
                key={item.id}
                title={item.name}
                style={{
                  height: 80,
                  borderRadius: 8,
                  marginBottom: 8,
                  justifyContent: "center",
                }}
                left={(props) => <List.Icon {...props} icon="layers" />}
                right={() => {
                  if (!userPermission.has(PermissionType.UPDATE_SHOP)) return;

                  return (
                    <IconButton
                      icon="delete"
                      iconColor={theme.colors.error}
                      onPress={() => {
                        setSelectedTablePosition(item); // Set selected item for deletion
                        setDialogVisible(true); // Show delete confirmation dialog
                      }}
                    />
                  );
                }}
                onPress={() =>
                  goToUpdateTablePosition({
                    router,
                    shopId: shop.id,
                    tablePositionId: item.id,
                  })
                }
              />
            ))}
          </List.Section>
          {userPermission.has(PermissionType.UPDATE_SHOP) && (
            <View style={{ height: 60 }} />
          )}
        </ScrollView>

        {userPermission.has(PermissionType.UPDATE_SHOP) && (
          <FAB
            icon="plus"
            label={t("create_table_position")}
            style={styles.baseFAB}
            onPress={() => goToCreateTablePosition({ router, shopId: shop.id })}
          />
        )}
      </Surface>
    </>
  );
}
