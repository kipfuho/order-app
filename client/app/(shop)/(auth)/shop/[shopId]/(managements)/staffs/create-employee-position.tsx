import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import {
  ActivityIndicator,
  Button,
  TextInput,
  Surface,
} from "react-native-paper";
import Toast from "react-native-toast-message";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useCreateEmployeePositionMutation } from "@stores/apiSlices/staffApi.slice";
import { RootState } from "@stores/store";
import { Shop } from "@stores/state.interface";
import { LoaderBasic } from "@components/ui/Loader";
import { AppBar } from "@components/AppBar";
import { goToEmployeePositionList } from "@apis/navigate.service";

export default function CreateEmployeePositionPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop,
  ) as Shop;
  const [createEmployeePosition, { isLoading: createEmployeePositionLoading }] =
    useCreateEmployeePositionMutation();

  const [name, setName] = useState("");

  const handleCreateEmployeePosition = async () => {
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: t("create_failed"),
        text2: `${t("required")} ${_.join(
          _.compact([!name.trim() && t("employee_position_name")]),
          ",",
        )}`,
      });
      return;
    }

    try {
      await createEmployeePosition({
        shopId: shop.id,
        name,
      }).unwrap();

      goToEmployeePositionList({ router, shopId: shop.id });
    } catch {
      Toast.show({
        type: "error",
        text1: t("create_failed"),
        text2: t("error_any"),
      });
    }
  };

  if (createEmployeePositionLoading) {
    return <LoaderBasic />;
  }

  return (
    <>
      <AppBar
        title={t("create_employee_position")}
        goBack={() => goToEmployeePositionList({ router, shopId: shop.id })}
      />

      <Surface
        style={{
          flex: 1,
        }}
      >
        <Surface
          mode="flat"
          style={{
            flex: 1,
            padding: 16,
          }}
        >
          <ScrollView>
            {/* Table Name Input */}
            <TextInput
              label={t("employee_position_name")}
              mode="outlined"
              value={name}
              onChangeText={setName}
              style={{ marginBottom: 20 }}
            />
          </ScrollView>
        </Surface>

        {/* Loading or Action Buttons */}
        <View style={{ marginVertical: 20 }}>
          {createEmployeePositionLoading ? (
            <ActivityIndicator size={40} />
          ) : (
            <Button
              mode="contained-tonal"
              onPress={handleCreateEmployeePosition}
              style={{ width: "auto", alignSelf: "center" }}
            >
              {t("create_employee_position")}
            </Button>
          )}
        </View>
      </Surface>
    </>
  );
}
