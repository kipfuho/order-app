import { Button, List, Surface, useTheme } from "react-native-paper";
import { AppBar } from "../../../../../../components/AppBar";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useGetDepartmentsQuery } from "../../../../../../stores/apiSlices/staffApi.slice";
import { LoaderBasic } from "../../../../../../components/ui/Loader";
import {
  goBackShopHome,
  goToCreateDepartment,
  goToUpdateDepartment,
} from "../../../../../../apis/navigate.service";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../stores/store";
import { Shop } from "../../../../../../stores/state.interface";

export default function StaffDepartmentPage() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: departments = [], isLoading: departmentLoading } =
    useGetDepartmentsQuery(shop.id);

  if (departmentLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar
        title={t("department")}
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
            {departments.map((item) => (
              <List.Item
                title={item.name}
                titleStyle={{ color: theme.colors.onSecondaryContainer }}
                style={{
                  backgroundColor: theme.colors.secondaryContainer,
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
              />
            ))}
          </List.Section>
        </ScrollView>

        <Button
          mode="contained"
          onPress={() => {
            goToCreateDepartment({ router, shopId: shop.id });
          }}
          style={{ marginTop: 16 }}
        >
          {t("create_department")}
        </Button>
      </Surface>
    </>
  );
}
