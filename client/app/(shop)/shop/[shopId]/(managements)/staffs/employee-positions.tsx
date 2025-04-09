import { Button, List, Surface, useTheme } from "react-native-paper";
import { AppBar } from "../../../../../../components/AppBar";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { useGetEmployeePositionsQuery } from "../../../../../../stores/apiSlices/staffApi.slice";
import { useRouter } from "expo-router";
import { LoaderBasic } from "../../../../../../components/ui/Loader";
import {
  goBackShopHome,
  goToCreateEmployeePosition,
  goToUpdateEmployeePosition,
} from "../../../../../../apis/navigate.service";
import { RootState } from "../../../../../../stores/store";
import { useSelector } from "react-redux";
import { Shop } from "../../../../../../stores/state.interface";

export default function StaffEmployeePositionPage() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: employeePositions = [], isLoading: employeePositionLoading } =
    useGetEmployeePositionsQuery(shop.id);

  if (employeePositionLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar
        title={t("employee_position")}
        goBack={() => goBackShopHome({ router, shopId: shop.id })}
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
            {employeePositions.map((item) => (
              <List.Item
                title={item.name}
                titleStyle={{ color: theme.colors.onSecondaryContainer }}
                style={{
                  backgroundColor: theme.colors.secondaryContainer,
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
              />
            ))}
          </List.Section>
        </ScrollView>

        <Button
          mode="contained"
          onPress={() => {
            goToCreateEmployeePosition({ router, shopId: shop.id });
          }}
          style={{ marginTop: 16 }}
        >
          {t("create_employee_position")}
        </Button>
      </Surface>
    </>
  );
}
