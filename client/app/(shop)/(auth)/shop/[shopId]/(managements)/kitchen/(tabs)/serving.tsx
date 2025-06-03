import { SwipeablePage } from "@/components/SwipeablePage";
import KitchenCookByDish from "@/components/ui/kitchen/KitchenCookByDish";
import KitchenCookHistory from "@/components/ui/kitchen/KitchenCookHistory";
import KitchenServing from "@/components/ui/kitchen/KitchenServing";

export default function KitchenServingPage() {
  return (
    <SwipeablePage
      index={2}
      previewContent={{
        previous: <KitchenCookByDish />,
        next: <KitchenCookHistory />,
      }}
    >
      <KitchenServing />
    </SwipeablePage>
  );
}
