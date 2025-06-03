import { SwipeablePage } from "@/components/SwipeablePage";
import KitchenCookByDish from "@/components/ui/kitchen/KitchenCookByDish";
import KitchenCookByOrder from "@/components/ui/kitchen/KitchenCookByOrder";
import KitchenServing from "@/components/ui/kitchen/KitchenServing";

export default function CookByDishPage() {
  return (
    <SwipeablePage
      index={1}
      previewContent={{
        previous: <KitchenCookByOrder />,
        next: <KitchenServing />,
      }}
    >
      <KitchenCookByDish />
    </SwipeablePage>
  );
}
