import { useTranslation } from "react-i18next";
import { Chip, useTheme } from "react-native-paper";
import { OrderSessionStatus } from "../../../constants/common";

export default function OrderSessionStatusChip({ status }: { status: string }) {
  const { t } = useTranslation();
  const theme = useTheme();

  if (status === OrderSessionStatus.paid) {
    return (
      <Chip
        style={{ marginTop: 4, backgroundColor: theme.colors.primaryContainer }}
        textStyle={{ color: theme.colors.onPrimaryContainer }}
      >
        {t(status)}
      </Chip>
    );
  }

  if (status === OrderSessionStatus.unpaid) {
    return (
      <Chip
        style={{
          marginTop: 4,
          backgroundColor: theme.colors.secondaryContainer,
        }}
        textStyle={{ color: theme.colors.onSecondaryContainer }}
      >
        {t(status)}
      </Chip>
    );
  }

  if (status === OrderSessionStatus.cancelled) {
    return (
      <Chip
        style={{ marginTop: 4, backgroundColor: theme.colors.errorContainer }}
        textStyle={{ color: theme.colors.onErrorContainer }}
      >
        {t(status)}
      </Chip>
    );
  }
}
