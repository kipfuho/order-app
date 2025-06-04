import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@stores/store";
import {
  List,
  Surface,
  Text,
  FAB,
  IconButton,
  Portal,
  Dialog,
  useTheme,
  Modal,
} from "react-native-paper";
import _ from "lodash";
import { Shop, Table } from "@stores/state.interface";
import { AppBar } from "@components/AppBar";
import {
  useDeleteTableMutation,
  useGetTablePositionsQuery,
  useGetTablesQuery,
} from "@stores/apiSlices/tableApi.slice";
import {
  goToShopSetting,
  goToCreateTable,
  goToUpdateTable,
} from "@apis/navigate.service";
import { useTranslation } from "react-i18next";
import { LoaderBasic } from "@components/ui/Loader";
import { styles } from "@/constants/styles";
import { PermissionType } from "@/constants/common";
import Toast from "react-native-toast-message";
import { ConfirmCancelDialog } from "@/components/ui/CancelDialog";
import QRCode from "react-native-qrcode-svg";

export default function TablesManagementPage() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  const { currentShop, userPermission } = useSelector(
    (state: RootState) => state.shop,
  );
  const shop = currentShop as Shop;
  const { data: tables = [], isLoading: tableLoading } = useGetTablesQuery(
    shop.id,
  );
  const { data: tablePositions = [], isLoading: tablePositionLoading } =
    useGetTablePositionsQuery(shop.id);
  const tableByPostion = _.groupBy(tables, "position.id");
  const [deleteTable, { isLoading: deleteTableLoading }] =
    useDeleteTableMutation();

  const [tableQrVisible, setTableQrVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table>();

  const confirmDelete = async () => {
    try {
      if (!selectedTable) {
        Toast.show({
          type: "error",
          text1: "Delete Failed",
          text2: "Cannot find table",
        });
        return;
      }
      await deleteTable({
        shopId: shop.id,
        tableId: selectedTable.id,
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

  if (tableLoading || tablePositionLoading) {
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
              {t("delete_confirm_detail")} {selectedTable?.name}?
            </Text>
          </Dialog.Content>
        </ConfirmCancelDialog>

        <Modal
          visible={tableQrVisible}
          onDismiss={() => setTableQrVisible(false)}
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
          contentContainerStyle={{
            boxShadow: "none",
          }}
        >
          <Surface
            style={{
              padding: 24,
              borderRadius: 15,
              alignItems: "center",
              backgroundColor: "#fff",
              elevation: 4,
            }}
          >
            <QRCode
              value={`${process.env.EXPO_PUBLIC_WEB_URL}/order/shop/${shop.id}/table/${selectedTable?.id}`}
              size={200}
            />
          </Surface>
        </Modal>

        <Toast />
      </Portal>

      <AppBar
        title={t("table")}
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
            {tablePositions.map((position) => {
              if (_.isEmpty(tableByPostion[position.id])) return;

              return (
                <View key={position.id}>
                  <Text
                    variant="titleLarge"
                    style={{
                      marginBottom: 8,
                      marginTop: 16,
                    }}
                  >
                    {position.name}
                  </Text>

                  {(tableByPostion[position.id] || []).map((item) => (
                    <List.Item
                      key={item.id}
                      title={item.name}
                      style={{
                        height: 80,
                        borderRadius: 8,
                        marginBottom: 8,
                        justifyContent: "center",
                      }}
                      left={(props) => (
                        <List.Icon {...props} icon="table-furniture" />
                      )}
                      right={() => (
                        <>
                          <IconButton
                            icon="qrcode"
                            onPress={() => {
                              setSelectedTable(item);
                              setTableQrVisible(true);
                            }}
                          />
                          {userPermission.has(PermissionType.UPDATE_SHOP) && (
                            <IconButton
                              icon="delete"
                              iconColor={theme.colors.error}
                              onPress={() => {
                                setSelectedTable(item); // Set selected item for deletion
                                setDialogVisible(true); // Show delete confirmation dialog
                              }}
                            />
                          )}
                        </>
                      )}
                      onPress={() =>
                        goToUpdateTable({
                          router,
                          shopId: shop.id,
                          tableId: item.id,
                        })
                      }
                    />
                  ))}
                </View>
              );
            })}
          </List.Section>
          {userPermission.has(PermissionType.UPDATE_SHOP) && (
            <View style={{ height: 60 }} />
          )}
        </ScrollView>

        {userPermission.has(PermissionType.UPDATE_SHOP) && (
          <FAB
            icon="plus"
            label={t("create_table")}
            style={styles.baseFAB}
            onPress={() => goToCreateTable({ router, shopId: shop.id })}
          />
        )}
      </Surface>
    </>
  );
}
