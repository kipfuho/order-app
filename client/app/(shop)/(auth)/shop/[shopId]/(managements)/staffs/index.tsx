import { Button, List, Surface, Text, useTheme } from "react-native-paper";
import { AppBar } from "../../../../../../../components/AppBar";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import {
  useGetDepartmentsQuery,
  useGetEmployeesQuery,
} from "../../../../../../../stores/apiSlices/staffApi.slice";
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
import _ from "lodash";

export default function StaffEmployeePage() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: employees = [], isLoading: employeeLoading } =
    useGetEmployeesQuery(shop.id);
  const { data: departments = [], isLoading: departmentLoading } =
    useGetDepartmentsQuery(shop.id);
  const employeeByDepartment = _.groupBy(employees, "departmentId");

  if (employeeLoading || departmentLoading) {
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
            {departments.map((department) => {
              if (_.isEmpty(employeeByDepartment[department.id])) return;

              return (
                <View key={department.id}>
                  <Text
                    variant="titleLarge"
                    style={{
                      marginBottom: 8,
                      marginTop: 16,
                    }}
                  >
                    {department.name}
                  </Text>

                  {(employeeByDepartment[department.id] || []).map((item) => (
                    <List.Item
                      title={item.name}
                      style={{
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                      left={(props) => (
                        <List.Icon {...props} icon="face-agent" />
                      )}
                      onPress={() => {
                        goToUpdateEmployee({
                          router,
                          shopId: shop.id,
                          employeeId: item.id,
                        });
                      }}
                    />
                  ))}
                </View>
              );
            })}
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
