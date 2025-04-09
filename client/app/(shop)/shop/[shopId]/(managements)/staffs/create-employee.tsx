import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Surface,
  TextInput,
} from "react-native-paper";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { RootState } from "../../../../../../stores/store";
import {
  Department,
  EmployeePosition,
  Shop,
} from "../../../../../../stores/state.interface";
import {
  useCreateEmployeeMutation,
  useGetAllPermissionTypesQuery,
  useGetDepartmentsQuery,
  useGetEmployeePositionsQuery,
} from "../../../../../../stores/apiSlices/staffApi.slice";
import { LoaderBasic } from "../../../../../../components/ui/Loader";
import { goToEmployeeList } from "../../../../../../apis/navigate.service";
import { AppBar } from "../../../../../../components/AppBar";
import { DropdownMenu } from "../../../../../../components/DropdownMenu";
import { Collapsible } from "../../../../../../components/Collapsible";

export default function CreateEmployeePage() {
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop
  ) as Shop;
  const { data: permissionTypes = [], isLoading: permissionTypeLoading } =
    useGetAllPermissionTypesQuery(shop.id);
  const { data: employeePositions = [], isLoading: employeePositionLoading } =
    useGetEmployeePositionsQuery(shop.id);
  const { data: departments = [], isLoading: departmentLoading } =
    useGetDepartmentsQuery(shop.id);
  const [createEmployee, { isLoading: createEmployeeLoading }] =
    useCreateEmployeeMutation();

  const [name, setName] = useState("employee");
  const [position, setPosition] = useState<EmployeePosition>();
  const [department, setDepartment] = useState<Department>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleCreateTable = async () => {
    if (
      !name.trim() ||
      _.isEmpty(position) ||
      _.isEmpty(department) ||
      !email.trim() ||
      !password.trim()
    ) {
      Toast.show({
        type: "error",
        text1: t("create_failed"),
        text2: `${t("required")} ${_.join(
          _.compact([
            !name.trim() && t("employee_name"),
            _.isEmpty(position) && t("employee_position"),
            _.isEmpty(department) && t("department"),
            !email.trim() && t("email"),
            !password.trim() && t("password"),
          ]),
          ","
        )}`,
      });
      return;
    }

    try {
      await createEmployee({
        shopId: shop.id,
        name,
        positionId: position.id,
        departmentId: department.id,
        email,
        password,
        permissions: selectedPermissions,
      }).unwrap();
      goToEmployeeList({ router, shopId: shop.id });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: t("create_failed"),
        text2: t("error_any"),
      });
      console.error(err);
    }
  };

  if (permissionTypeLoading || employeePositionLoading || departmentLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar
        title={t("create_employee")}
        goBack={() => goToEmployeeList({ router, shopId: shop.id })}
      />

      <Surface
        style={{
          flex: 1,
        }}
      >
        <Surface
          style={{
            flex: 1,
            padding: 16,
            boxShadow: "none",
          }}
        >
          <ScrollView>
            {/* Table Name Input */}
            <TextInput
              label={t("employee_name")}
              mode="outlined"
              value={name}
              onChangeText={setName}
              style={{ marginBottom: 20 }}
            />

            <TextInput
              label={t("email")}
              mode="outlined"
              value={name}
              onChangeText={setEmail}
              style={{ marginBottom: 20 }}
            />

            <TextInput
              label={t("password")}
              mode="outlined"
              value={name}
              onChangeText={setPassword}
              style={{ marginBottom: 20 }}
            />

            <DropdownMenu
              item={position}
              items={employeePositions}
              label={t("employee_position")}
              setItem={setPosition}
              getItemValue={(item: EmployeePosition) => item?.name}
            />

            <DropdownMenu
              item={department}
              items={departments}
              label={t("department")}
              setItem={setDepartment}
              getItemValue={(item: Department) => item?.name}
            />

            <Collapsible title={t("permissions")}>
              <View style={{ marginBottom: 32 }}>
                {permissionTypes.map((perm) => (
                  <Checkbox.Item
                    key={perm}
                    label={t(perm)}
                    status={
                      selectedPermissions.includes(perm)
                        ? "checked"
                        : "unchecked"
                    }
                    onPress={() => togglePermission(perm)}
                  />
                ))}
              </View>
            </Collapsible>
          </ScrollView>
        </Surface>

        {/* Loading or Action Buttons */}
        <View style={{ marginVertical: 20 }}>
          {createEmployeeLoading ? (
            <ActivityIndicator size={40} />
          ) : (
            <Button
              mode="contained"
              onPress={handleCreateTable}
              style={{ alignSelf: "center", width: 200 }}
            >
              {t("create_employee")}
            </Button>
          )}
        </View>
      </Surface>
    </>
  );
}
