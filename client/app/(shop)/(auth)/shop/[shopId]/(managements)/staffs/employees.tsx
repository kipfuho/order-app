import _ from "lodash";
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
import {
  useDeleteEmployeeMutation,
  useGetDepartmentsQuery,
  useGetEmployeesQuery,
} from "@stores/apiSlices/staffApi.slice";
import { useRouter } from "expo-router";
import { LoaderBasic } from "@components/ui/Loader";
import {
  goToShopHome,
  goToCreateEmployee,
  goToUpdateEmployee,
} from "@apis/navigate.service";
import { RootState } from "@stores/store";
import { useSelector } from "react-redux";
import { Employee, Shop } from "@stores/state.interface";
import { useState } from "react";
import { ConfirmCancelDialog } from "@components/ui/CancelDialog";
import Toast from "react-native-toast-message";
import { styles } from "@/constants/styles";
import { PermissionType } from "@/constants/common";

export default function StaffEmployeePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();

  const { currentShop, userPermission } = useSelector(
    (state: RootState) => state.shop,
  );
  const shop = currentShop as Shop;
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
                        height: 80,
                        borderRadius: 8,
                        marginBottom: 8,
                        justifyContent: "center",
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
                      right={() => {
                        if (!userPermission.has(PermissionType.UPDATE_EMPLOYEE))
                          return;

                        return (
                          <IconButton
                            icon="delete"
                            iconColor={theme.colors.error}
                            onPress={() => {
                              setSelectedEmployee(item); // Set selected item for deletion
                              setDialogVisible(true); // Show delete confirmation dialog
                            }}
                          />
                        );
                      }}
                    />
                  ))}
                </View>
              );
            })}
          </List.Section>
          {userPermission.has(PermissionType.CREATE_EMPLOYEE) && (
            <View style={{ height: 60 }} />
          )}
        </ScrollView>

        {userPermission.has(PermissionType.CREATE_EMPLOYEE) && (
          <FAB
            icon="plus"
            label={t("create_employee")}
            style={styles.baseFAB}
            onPress={() => goToCreateEmployee({ router, shopId: shop.id })}
          />
        )}
      </Surface>
    </>
  );
}
