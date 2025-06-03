import { SwipeablePage } from "@/components/SwipeablePage";
import KitchenCookByDish from "@/components/ui/kitchen/KitchenCookByDish";
import KitchenCookByOrder from "@/components/ui/kitchen/KitchenCookByOrder";

export default function CookByOrderPage() {
  return (
    <SwipeablePage
      index={0}
      previewContent={{
        next: <KitchenCookByDish />,
      }}
    >
      <KitchenCookByOrder />
    </SwipeablePage>
  );
}
