import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../stores/store";
import { Button, Surface, Text } from "react-native-paper";

export default function UpdateDishLayout() {
  const { shopId, dishId } = useLocalSearchParams() as {
    shopId: string;
    dishId: string;
  };
  const dish = useSelector((state: RootState) =>
    state.shop.dishes.find((d) => d.id === dishId)
  );

  const router = useRouter();

  const goBack = () =>
    router.navigate({
      pathname: "/shop/[shopId]/settings/tables",
      params: {
        shopId,
      },
    });

  if (!dish) {
    return (
      <Surface style={{ flex: 1 }}>
        <Text>Dish not found</Text>
        <Button onPress={goBack}>
          <Text>Go Back</Text>
        </Button>
      </Surface>
    );
  }

  return <Stack screenOptions={{ headerShown: false }}></Stack>;
}
