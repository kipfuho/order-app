import { Button, List, Surface, useTheme } from "react-native-paper";
import { AppBar } from "../../../../../../../components/AppBar";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { useGetEmployeesQuery } from "../../../../../../../stores/apiSlices/staffApi.slice";
import { useRouter } from "expo-router";
import { LoaderBasic } from "../../../../../../../components/ui/Loader";
import {
  goBackShopHome,
  goToCreateEmployee,
  goToUpdateEmployee,
} from "../../../../../../../apis/navigate.service";
import { RootState } from "../../../../../../../stores/store";
import { useSelector } from "react-redux";
import { Shop } from "../../../../../../../stores/state.interface";

export default function StaffEmployeePage() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: employees = [], isLoading: employeeLoading } =
    useGetEmployeesQuery(shop.id);

  if (employeeLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar
        title={t("employee")}
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
            {employees.map((item) => (
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
                  goToUpdateEmployee({
                    router,
                    shopId: shop.id,
                    employeeId: item.id,
                  });
                }}
              />
            ))}
          </List.Section>
        </ScrollView>

        <Button
          mode="contained"
          onPress={() => {
            goToCreateEmployee({ router, shopId: shop.id });
          }}
          style={{ marginTop: 16 }}
        >
          {t("create_employee")}
        </Button>
      </Surface>
    </>
  );
}
