import { useTranslation } from "react-i18next";
import { AppBar } from "../../../../../../components/AppBar";
import { goBackShopHome } from "../../../../../../apis/navigate.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import ShopDashboard from "../../../../../../components/ShopDashboard";

const AnalyticManagement = () => {
  const { shopId } = useLocalSearchParams() as { shopId: string };
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <>
      <AppBar
        title={t("analytics")}
        goBack={() => goBackShopHome({ router, shopId })}
      />
      <ShopDashboard />
    </>
  );
};

export default AnalyticManagement;
