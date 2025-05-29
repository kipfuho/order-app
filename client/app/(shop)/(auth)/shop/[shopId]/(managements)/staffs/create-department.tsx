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
import { RootState } from "@stores/store";
import { Shop } from "@stores/state.interface";
import {
  useCreateDepartmentMutation,
  useGetAllPermissionTypesQuery,
} from "@stores/apiSlices/staffApi.slice";
import { goToDepartmentList } from "@apis/navigate.service";
import { AppBar } from "@components/AppBar";
import { LoaderBasic } from "@components/ui/Loader";
import { Collapsible } from "@components/Collapsible";
import { styles } from "@/constants/styles";

export default function CreateDepartmentPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop,
  ) as Shop;

  const { data: permissionTypes = [], isLoading: permissionTypeLoading } =
    useGetAllPermissionTypesQuery(shop.id);
  const [createDepartment, { isLoading: createDepartmentLoading }] =
    useCreateDepartmentMutation();

  const [name, setName] = useState("department");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  };

  const handleCreateTable = async () => {
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: t("create_failed"),
        text2: `${t("required")} ${_.join([t("department_name")], ",")}`,
      });
      return;
    }

    try {
      await createDepartment({
        shopId: shop.id,
        name,
        permissions: selectedPermissions,
      }).unwrap();
      goToDepartmentList({ router, shopId: shop.id });
    } catch {
      Toast.show({
        type: "error",
        text1: t("create_failed"),
        text2: t("error_any"),
      });
    }
  };

  if (permissionTypeLoading) {
    return <LoaderBasic />;
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
        <Surface mode="flat" style={styles.baseContainer}>
          <ScrollView>
            {/* Table Name Input */}
            <TextInput
              label={t("department_name")}
              mode="outlined"
              value={name}
              onChangeText={setName}
              style={{ marginBottom: 20 }}
            />

            <Collapsible title={t("permissions")}>
              <View style={{ marginBottom: 32, padding: 16 }}>
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
          {createDepartmentLoading ? (
            <ActivityIndicator size={40} />
          ) : (
            <Button
              mode="contained"
              onPress={handleCreateTable}
              style={styles.baseButton}
            >
              {t("create_department")}
            </Button>
          )}
        </View>
      </Surface>
    </>
  );
}
