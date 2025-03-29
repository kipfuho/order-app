import { Button, Surface, Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Amplify } from "aws-amplify";
import { events } from "aws-amplify/data";
import { useEffect } from "react";

export default function OrderManagementOrderPage() {
  const { shopId } = useLocalSearchParams() as { shopId: string };
  const router = useRouter();

  const test = () => {
    console.log("Amplify Config:", Amplify.getConfig());
  };

  useEffect(() => {
    const pr = events.connect("/default/test");
    pr.then((channel) => {
      channel.subscribe({
        next: (data) => {
          console.log("received", data);
        },
        error: (err) => console.error("error", err),
      });
    });
  }, []);

  return (
    <Surface style={{ flex: 1, padding: 16 }}>
      <Text>Order</Text>
      <Button onPress={test}>Click me</Button>
    </Surface>
  );
}
