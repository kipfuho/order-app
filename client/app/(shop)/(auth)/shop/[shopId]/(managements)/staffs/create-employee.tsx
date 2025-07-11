import { useMemo, useState } from "react";
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
import _, { debounce } from "lodash";
import { RootState } from "@stores/store";
import { Department, EmployeePosition, Shop } from "@stores/state.interface";
import {
  useCreateEmployeeMutation,
  useGetAllPermissionTypesQuery,
  useGetDepartmentsQuery,
  useGetEmployeePositionsQuery,
} from "@stores/apiSlices/staffApi.slice";
import { LoaderBasic } from "@components/ui/Loader";
import { goToEmployeeList } from "@apis/navigate.service";
import { AppBar } from "@components/AppBar";
import { DropdownMenu } from "@components/DropdownMenu";
import { Collapsible } from "@components/Collapsible";
import { checkUserByEmailRequest } from "@apis/auth.api.service";
import PasswordInput from "@components/ui/PasswordInput";
import { styles } from "@/constants/styles";

export default function CreateEmployeePage() {
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop,
  ) as Shop;
  const { data: permissionTypes = [], isLoading: permissionTypeLoading } =
    useGetAllPermissionTypesQuery(shop.id);
  const { data: employeePositions = [], isLoading: employeePositionLoading } =
    useGetEmployeePositionsQuery(shop.id);
  const { data: departments = [], isLoading: departmentLoading } =
    useGetDepartmentsQuery(shop.id);
  const [createEmployee, { isLoading: createEmployeeLoading }] =
    useCreateEmployeeMutation();

  const [name, setName] = useState("");
  const [position, setPosition] = useState<EmployeePosition>();
  const [department, setDepartment] = useState<Department>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  };

  const debouncedCheckEmail = useMemo(
    () =>
      debounce(async (emailToCheck: string) => {
        if (!emailToCheck.trim()) return;

        setCheckingEmail(true);
        try {
          // Replace this with your actual API call
          const exists = await checkUserByEmailRequest(emailToCheck);
          setEmailExists(exists);

          if (exists) {
            Toast.show({
              type: "info",
              text1: t("email_exists"),
              text2: t("email_exist_cannot_enter_password"),
            });
          }
        } catch {
          Toast.show({
            type: "error",
            text1: t("create_failed"),
            text2: t("error_any"),
          });
        } finally {
          setCheckingEmail(false);
        }
      }, 800),
    [t],
  );

  const handleCreateEmployee = async () => {
    if (
      !name.trim() ||
      // _.isEmpty(position) ||
      _.isEmpty(department) ||
      !email.trim() ||
      (!password.trim() && !emailExists)
    ) {
      Toast.show({
        type: "error",
        text1: t("create_failed"),
        text2: `${t("required")} ${_.join(
          _.compact([
            !name.trim() && t("employee_name"),
            _.isEmpty(department) && t("department"),
            !email.trim() && t("email"),
            !password.trim() && !emailExists && t("password"),
            // _.isEmpty(position) && t("employee_position"),
          ]),
          ",",
        )}`,
      });
      return;
    }

    try {
      await createEmployee({
        shopId: shop.id,
        name,
        positionId: position?.id,
        departmentId: department.id,
        email,
        password,
        permissions: selectedPermissions,
      }).unwrap();
      goToEmployeeList({ router, shopId: shop.id });
    } catch {
      Toast.show({
        type: "error",
        text1: t("create_failed"),
        text2: t("error_any"),
      });
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
        <View style={styles.baseContainer}>
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
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailExists(false); // reset state on change
                debouncedCheckEmail(text); // debounce call
              }}
              style={{ marginBottom: 20 }}
              right={
                checkingEmail ? (
                  <TextInput.Icon icon="loading" />
                ) : emailExists ? (
                  <TextInput.Icon
                    icon="alert-circle"
                    onPress={() =>
                      Toast.show({
                        type: "info",
                        text1: t("email_exists"),
                        text2: t("email_exist_cannot_enter_password"),
                      })
                    }
                  />
                ) : null
              }
            />

            <PasswordInput
              text={password}
              setText={setPassword}
              style={{ marginBottom: 20 }}
              mode="outlined"
              disabled={emailExists}
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
                    disabled={department?.permissions.includes(perm)}
                    status={
                      selectedPermissions.includes(perm) ||
                      department?.permissions.includes(perm)
                        ? "checked"
                        : "unchecked"
                    }
                    onPress={() => togglePermission(perm)}
                  />
                ))}
              </View>
            </Collapsible>
          </ScrollView>
        </View>

        {/* Loading or Action Buttons */}
        <View style={{ marginVertical: 20 }}>
          {createEmployeeLoading ? (
            <ActivityIndicator size={40} />
          ) : (
            <Button
              mode="contained"
              onPress={handleCreateEmployee}
              style={styles.baseButton}
            >
              {t("create_employee")}
            </Button>
          )}
        </View>
      </Surface>
    </>
  );
}
