import { SwipeablePage } from "@/components/SwipeablePage";
import KitchenCookHistory from "@/components/ui/kitchen/KitchenCookHistory";
import KitchenServing from "@/components/ui/kitchen/KitchenServing";
import KitchenServingHistory from "@/components/ui/kitchen/KitchenServingHistory";

export default function CookHistoryPage() {
  return (
    <SwipeablePage
      index={3}
      previewContent={{
        previous: <KitchenServing />,
        next: <KitchenServingHistory />,
      }}
    >
      <KitchenCookHistory />
    </SwipeablePage>
  );
}
