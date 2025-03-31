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
    router.replace({
      pathname: path,
      params,
    });
    return;
  }

  router.replace(path);
};

const goBackShopList = ({ router }: { router: Router }) => router.replace("/");

const goBackShopHome = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) =>
  router.replace({
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
  router.replace({
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
  router.replace({
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
}) => {
  router.replace({
    pathname: "/shop/[shopId]/menus/update-dish/[dishId]",
    params: { shopId, dishId },
  });
};

const goToTableList = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) => {
  router.replace({
    pathname: "/shop/[shopId]/settings/tables",
    params: { shopId },
  });
};

const goToTablePositionList = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) => {
  router.replace({
    pathname: "/shop/[shopId]/settings/tables/table-position",
    params: { shopId },
  });
};

const goToUpdateDishCategory = ({
  router,
  shopId,
  dishCategoryId,
}: {
  router: Router;
  shopId: string;
  dishCategoryId: string;
}) => {
  router.replace({
    pathname: "/shop/[shopId]/menus/update-dish-category/[dishCategoryId]",
    params: { shopId, dishCategoryId },
  });
};

const goToDishCategoryList = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) => {
  router.replace({
    pathname: "/shop/[shopId]/menus/categories",
    params: { shopId },
  });
};

export {
  goBackShopList,
  goBackShopHome,
  goBackShopDishList,
  goBackShopSetting,
  goToDishUpdatePage,
  goToTableList,
  goToTablePositionList,
  goToUpdateDishCategory,
  goToDishCategoryList,
};
