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
  useDeleteEmployeeMutation,
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
import { Employee, Shop } from "../../../../../../../stores/state.interface";
import _ from "lodash";
import { useState } from "react";
import { ConfirmCancelDialog } from "../../../../../../../components/ui/CancelDialog";
import Toast from "react-native-toast-message";

export default function StaffEmployeePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: employees = [], isLoading: employeeLoading } =
    useGetEmployeesQuery(shop.id);
  const { data: departments = [], isLoading: departmentLoading } =
    useGetDepartmentsQuery(shop.id);
  const employeeByDepartment = _.groupBy(employees, "departmentId");
  const [deleteEmployee, { isLoading: deleteEmployeeLoading }] =
    useDeleteEmployeeMutation();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee>();

  const confirmDelete = async () => {
    try {
      if (!selectedEmployee) {
        Toast.show({
          type: "error",
          text1: "Delete Failed",
          text2: "Cannot find employee",
        });
        return;
      }
      await deleteEmployee({
        shopId: shop.id,
        employeeId: selectedEmployee.id,
      }).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setDialogVisible(false);
    }
  };

  if (employeeLoading || departmentLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <Portal>
        <ConfirmCancelDialog
          title={t("delete_confirm")}
          isLoading={deleteEmployeeLoading}
          dialogVisible={dialogVisible}
          setDialogVisible={setDialogVisible}
          onCancelClick={() => {
            setDialogVisible(false);
          }}
          onConfirmClick={confirmDelete}
        >
          <Dialog.Content>
            <Text>
              {t("delete_confirm_detail")} {selectedEmployee?.name}?
            </Text>
          </Dialog.Content>
        </ConfirmCancelDialog>
        <Toast />
      </Portal>
      <AppBar
        title={t("employee")}
        goBack={() => goBackShopHome({ router, shopId: shop.id })}
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
            {departments.map((department) => {
              if (_.isEmpty(employeeByDepartment[department.id])) return;

              return (
                <View key={department.id}>
                  <Text
                    variant="titleLarge"
                    style={{
                      marginBottom: 8,
                    }}
                  >
                    {department.name}
                  </Text>

                  {(employeeByDepartment[department.id] || []).map((item) => (
                    <List.Item
                      key={item.id}
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
                      right={() => (
                        <IconButton
                          icon="delete"
                          iconColor={theme.colors.error}
                          onPress={() => {
                            setSelectedEmployee(item); // Set selected item for deletion
                            setDialogVisible(true); // Show delete confirmation dialog
                          }}
                        />
                      )}
                    />
                  ))}
                </View>
              );
            })}
          </List.Section>
          <View style={{ height: 60 }} />
        </ScrollView>

        <FAB
          icon="plus"
          label={t("create_employee")}
          style={{
            position: "absolute",
            right: 16,
            bottom: 16,
          }}
          onPress={() => goToCreateEmployee({ router, shopId: shop.id })}
        />
      </Surface>
    </>
  );
}
