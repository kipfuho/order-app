import { Href, Router } from "expo-router";

enum ALL_PATHS {
  HOME = "/",
  SHOP = "/shop",
  DISHES = "/shop/[shopId]/menus/dishes",
}

export const goBack = (
  router: Router,
  path: ALL_PATHS,
  params?: {
    shopId: string;
  }
) => {
  if (params) {
    router.navigate({
      pathname: path,
      params,
    });
    return;
  }

  router.navigate(path);
};

export const goBackShopList = ({ router }: { router: Router }) =>
  router.navigate("/");

export const goBackShopMenu = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) =>
  router.navigate({
    pathname: "/shop/[shopId]/home",
    params: { shopId },
  });
