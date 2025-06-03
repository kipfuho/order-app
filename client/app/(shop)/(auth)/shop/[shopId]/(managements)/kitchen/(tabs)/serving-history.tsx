import { SwipeablePage } from "@/components/SwipeablePage";
import KitchenCookHistory from "@/components/ui/kitchen/KitchenCookHistory";
import KitchenServingHistory from "@/components/ui/kitchen/KitchenServingHistory";

export default function ServingHistoryPage() {
  return (
    <SwipeablePage
      index={4}
      previewContent={{
        previous: <KitchenCookHistory />,
      }}
    >
      <KitchenServingHistory />
    </SwipeablePage>
  );
}
