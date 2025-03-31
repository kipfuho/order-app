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

const goBackShopList = ({ router }: { router: Router }) => router.navigate("/");

const goBackShopHome = ({
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

const goBackShopDishList = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) =>
  router.navigate({
    pathname: "/shop/[shopId]/menus/dishes",
    params: { shopId },
  });

const goBackShopSetting = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) =>
  router.navigate({
    pathname: "/shop/[shopId]/settings",
    params: { shopId },
  });

const goToDishUpdatePage = ({
  router,
  shopId,
  dishId,
}: {
  router: Router;
  shopId: string;
  dishId: string;
}) =>
  router.navigate({
    pathname: "/shop/[shopId]/menus/update-dish/[dishId]",
    params: { shopId, dishId },
  });

export {
  goBackShopList,
  goBackShopHome,
  goBackShopDishList,
  goBackShopSetting,
  goToDishUpdatePage,
};
