import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import {
  ActivityIndicator,
  Button,
  TextInput,
  Surface,
  Text,
} from "react-native-paper";
import Toast from "react-native-toast-message";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import {
  useGetEmployeePositionsQuery,
  useUpdateEmployeePositionMutation,
} from "@stores/apiSlices/staffApi.slice";
import { RootState } from "@stores/store";
import { Shop } from "@stores/state.interface";
import { goToEmployeePositionList } from "@apis/navigate.service";
import { LoaderBasic } from "@components/ui/Loader";
import { AppBar } from "@components/AppBar";
import { styles } from "@/constants/styles";

export default function UpdateEmployeePositionPage() {
  const { employeePositionId } = useLocalSearchParams() as {
    employeePositionId: string;
  };
  const router = useRouter();
  const { t } = useTranslation();

  const shop = useSelector(
    (state: RootState) => state.shop.currentShop,
  ) as Shop;
  const {
    data: employeePositions = [],
    isLoading: employeePositionLoading,
    isFetching: employeePositionFetching,
  } = useGetEmployeePositionsQuery(shop.id);
  const employeePosition = useMemo(
    () => _.find(employeePositions, (ep) => ep.id === employeePositionId),
    [employeePositions, employeePositionId],
  );

  const [updateEmployeePosition, { isLoading: updateEmployeePositionLoading }] =
    useUpdateEmployeePositionMutation();

  const [name, setName] = useState("");

  const handleUpdateEmployeePosition = async () => {
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: t("update_failed"),
        text2: `${t("required")} ${_.join(
          _.compact([!name.trim() && t("employee_position_name")]),
          ",",
        )}`,
      });
      return;
    }

    try {
      await updateEmployeePosition({
        employeePositionId,
        shopId: shop.id,
        name,
      }).unwrap();

      goToEmployeePositionList({ router, shopId: shop.id });
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
    if (!employeePosition) return;

    setName(employeePosition.name);
  }, [employeePositionId, employeePosition, employeePositionFetching]);

  if (employeePositionLoading) {
    return <LoaderBasic />;
  }

  if (!employeePosition) {
    return (
      <Surface style={styles.baseContainer}>
        <Text>{t("employee_position_not_found")}</Text>
        <Button
          onPress={() => goToEmployeePositionList({ router, shopId: shop.id })}
        >
          {t("go_back")}
        </Button>
      </Surface>
    );
  }

  return (
    <>
      <AppBar
        title={t("update_employee_position")}
        goBack={() => goToEmployeePositionList({ router, shopId: shop.id })}
      />

      <Surface
        style={{
          flex: 1,
        }}
      >
        <View style={styles.baseContainer}>
          <ScrollView>
            {/* Employee position Name Input */}
            <TextInput
              label={t("employee_position_name")}
              mode="outlined"
              value={name}
              onChangeText={setName}
              style={{ marginBottom: 20 }}
            />
          </ScrollView>
        </View>

        {/* Loading or Action Buttons */}
        <View style={{ marginVertical: 20 }}>
          {updateEmployeePositionLoading ? (
            <ActivityIndicator size={40} />
          ) : (
            <Button
              mode="contained-tonal"
              onPress={handleUpdateEmployeePosition}
              style={styles.baseButton}
            >
              {t("update_employee_position")}
            </Button>
          )}
        </View>
      </Surface>
    </>
  );
}
