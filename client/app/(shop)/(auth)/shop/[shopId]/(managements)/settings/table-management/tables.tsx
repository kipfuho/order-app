import React from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@stores/store";
import { List, Surface, Text, FAB } from "react-native-paper";
import _ from "lodash";
import { Shop } from "@stores/state.interface";
import { AppBar } from "@components/AppBar";
import {
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

export default function TablesManagementPage() {
  const router = useRouter();
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

  if (tableLoading || tablePositionLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
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
                      left={(props) => (
                        <List.Icon {...props} icon="table-furniture" />
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
