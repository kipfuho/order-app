import _ from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { RootState } from "@stores/store";
import { Shop } from "@stores/state.interface";
import {
  useGetAllPermissionTypesQuery,
  useGetDepartmentsQuery,
  useUpdateDepartmentMutation,
} from "@stores/apiSlices/staffApi.slice";
import { goToDepartmentList } from "@apis/navigate.service";
import { LoaderBasic } from "@components/ui/Loader";
import { AppBar } from "@components/AppBar";
import { Collapsible } from "@components/Collapsible";
import { styles } from "@/constants/styles";

export default function UpdateDepartmentPage() {
  const { departmentId } = useLocalSearchParams() as { departmentId: string };
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop,
  ) as Shop;
  const {
    data: departments = [],
    isLoading: departmentLoading,
    isFetching: departmentFetching,
  } = useGetDepartmentsQuery(shop.id);
  const department = useMemo(
    () => _.find(departments, (d) => d.id === departmentId),
    [departments, departmentId],
  );

  const { data: permissionTypes = [], isLoading: permissionTypeLoading } =
    useGetAllPermissionTypesQuery(shop.id);
  const [updateDepartment, { isLoading: updateDepartmentLoading }] =
    useUpdateDepartmentMutation();

  const [name, setName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  };

  const handleUpdateDepartment = async () => {
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: t("update_failed"),
        text2: `${t("required")} ${_.join([t("department_name")], ",")}`,
      });
      return;
    }

    try {
      await updateDepartment({
        departmentId,
        shopId: shop.id,
        name,
        permissions: selectedPermissions,
      }).unwrap();
      goToDepartmentList({ router, shopId: shop.id });
    } catch {
      Toast.show({
        type: "error",
        text1: t("update_failed"),
        text2: t("error_any"),
      });
    }
  };

  // when select different category
  useEffect(() => {
    if (!department) return;

    setName(department.name);
    setSelectedPermissions(department.permissions);
  }, [departmentId, department, departmentFetching]);

  if (permissionTypeLoading || departmentLoading) {
    return <LoaderBasic />;
  }

  if (!department) {
    return (
      <Surface style={styles.baseContainer}>
        <Text>{t("department_not_found")}</Text>
        <Button onPress={() => goToDepartmentList({ router, shopId: shop.id })}>
          {t("go_back")}
        </Button>
      </Surface>
    );
  }

  return (
    <>
      <AppBar
        title={t("update_department")}
        goBack={() => goToDepartmentList({ router, shopId: shop.id })}
      />
      <Surface
        style={{
          flex: 1,
        }}
      >
        <View style={styles.baseContainer}>
          <ScrollView>
            {/* department Name Input */}
            <TextInput
              label={t("department_name")}
              mode="outlined"
              value={name}
              onChangeText={setName}
              style={{ marginBottom: 20 }}
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
        </View>

        {/* Loading or Action Buttons */}
        <View style={{ marginVertical: 20 }}>
          {updateDepartmentLoading ? (
            <ActivityIndicator size={40} />
          ) : (
            <Button
              mode="contained"
              onPress={handleUpdateDepartment}
              style={styles.baseButton}
            >
              {t("update_department")}
            </Button>
          )}
        </View>
      </Surface>
    </>
  );
}
