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

const goToCreateTablePosition = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) => {
  router.replace({
    pathname: "/shop/[shopId]/settings/tables/create-table-position",
    params: { shopId },
  });
};

const goToUpdateTablePosition = ({
  router,
  shopId,
  tablePositionId,
}: {
  router: Router;
  shopId: string;
  tablePositionId: string;
}) => {
  router.replace({
    pathname:
      "/shop/[shopId]/settings/tables/update-table-position/[tablePositionId]",
    params: { shopId, tablePositionId },
  });
};

const goToCreateTable = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) => {
  router.replace({
    pathname: "/shop/[shopId]/settings/tables/create-table",
    params: { shopId },
  });
};

const goToUpdateTable = ({
  router,
  shopId,
  tableId,
}: {
  router: Router;
  shopId: string;
  tableId: string;
}) => {
  router.replace({
    pathname: "/shop/[shopId]/settings/tables/update-table/[tableId]",
    params: { shopId, tableId },
  });
};

const goToCreateDish = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) => {
  router.replace({
    pathname: "/shop/[shopId]/menus/create-dish",
    params: { shopId },
  });
};

const goToCreateDishCategory = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) => {
  router.replace({
    pathname: "/shop/[shopId]/menus/create-dish-category",
    params: { shopId },
  });
};

const goToTablesForOrderList = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) => {
  router.replace({
    pathname: "/shop/[shopId]/orders",
    params: { shopId },
  });
};

const goToTableCurrentOrderSessions = ({
  router,
  shopId,
  tableId,
}: {
  router: Router;
  shopId: string;
  tableId: string;
}) => {
  router.replace({
    pathname: "/shop/[shopId]/orders/table/[tableId]/current-orders",
    params: { shopId, tableId },
  });
};

const goToOrderSessionPayment = ({
  router,
  shopId,
  tableId,
  orderSessionId,
}: {
  router: Router;
  shopId: string;
  tableId: string;
  orderSessionId: string;
}) => {
  router.replace({
    pathname: "/shop/[shopId]/orders/table/[tableId]/payment/[orderSessionId]",
    params: { shopId, tableId, orderSessionId },
  });
};

const goToEmployeeList = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) => {
  router.replace({
    pathname: "/shop/[shopId]/staffs",
    params: { shopId },
  });
};

const goToEmployeePositionList = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) => {
  router.replace({
    pathname: "/shop/[shopId]/staffs/employee-positions",
    params: { shopId },
  });
};

const goToDepartmentList = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) => {
  router.replace({
    pathname: "/shop/[shopId]/staffs/departments",
    params: { shopId },
  });
};

const goToCreateEmployee = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) => {
  router.replace({
    pathname: "/shop/[shopId]/staffs/create-employee",
    params: { shopId },
  });
};

const goToCreateEmployeePosition = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) => {
  router.replace({
    pathname: "/shop/[shopId]/staffs/create-employee-position",
    params: { shopId },
  });
};

const goToCreateDepartment = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) => {
  router.replace({
    pathname: "/shop/[shopId]/staffs/create-department",
    params: { shopId },
  });
};

const goToUpdateEmployee = ({
  router,
  shopId,
  employeeId,
}: {
  router: Router;
  shopId: string;
  employeeId: string;
}) => {
  router.replace({
    pathname: "/shop/[shopId]/staffs/update-employee/[employeeId]",
    params: { shopId, employeeId },
  });
};

const goToUpdateEmployeePosition = ({
  router,
  shopId,
  employeePositionId,
}: {
  router: Router;
  shopId: string;
  employeePositionId: string;
}) => {
  router.replace({
    pathname:
      "/shop/[shopId]/staffs/update-employee-position/[employeePositionId]",
    params: { shopId, employeePositionId },
  });
};

const goToUpdateDepartment = ({
  router,
  shopId,
  departmentId,
}: {
  router: Router;
  shopId: string;
  departmentId: string;
}) => {
  router.replace({
    pathname: "/shop/[shopId]/staffs/update-department/[departmentId]",
    params: { shopId, departmentId },
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
  goToCreateTablePosition,
  goToUpdateTablePosition,
  goToCreateTable,
  goToUpdateTable,
  goToCreateDish,
  goToCreateDishCategory,
  goToTablesForOrderList,
  goToTableCurrentOrderSessions,
  goToOrderSessionPayment,
  goToEmployeeList,
  goToEmployeePositionList,
  goToDepartmentList,
  goToCreateEmployee,
  goToCreateEmployeePosition,
  goToCreateDepartment,
  goToUpdateEmployee,
  goToUpdateEmployeePosition,
  goToUpdateDepartment,
};
