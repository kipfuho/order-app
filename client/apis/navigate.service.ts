import { Router } from "expo-router";

const goToShopList = ({ router }: { router: Router }) => router.navigate("/");

const goToShopHome = ({ router, shopId }: { router: Router; shopId: string }) =>
  router.navigate({
    pathname: "/shop/[shopId]/home",
    params: { shopId },
  });

const goToCreateShop = ({ router }: { router: Router }) =>
  router.navigate({
    pathname: "/create-shop",
  });

const goToUpdateShop = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) =>
  router.navigate({
    pathname: "/shop/[shopId]/update-shop",
    params: { shopId },
  });

const goToShopDishList = ({
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

const goToShopSetting = ({
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
}) => {
  router.navigate({
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
  router.navigate({
    pathname: "/shop/[shopId]/settings/table-management/tables",
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
  router.navigate({
    pathname: "/shop/[shopId]/settings/table-management/table-positions",
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
  router.navigate({
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
  router.navigate({
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
  router.navigate({
    pathname: "/shop/[shopId]/settings/table-management/create-table-position",
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
  router.navigate({
    pathname:
      "/shop/[shopId]/settings/table-management/update-table-position/[tablePositionId]",
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
  router.navigate({
    pathname: "/shop/[shopId]/settings/table-management/create-table",
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
  router.navigate({
    pathname: "/shop/[shopId]/settings/table-management/update-table/[tableId]",
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
  router.navigate({
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
  router.navigate({
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
  router.navigate({
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
  router.navigate({
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
  router.navigate({
    pathname: "/shop/[shopId]/orders/table/[tableId]/payment/[orderSessionId]",
    params: { shopId, tableId, orderSessionId },
  });
};

const goToOrderSessionDetail = ({
  router,
  shopId,
  orderSessionId,
}: {
  router: Router;
  shopId: string;
  orderSessionId: string;
}) => {
  router.navigate({
    pathname: "/shop/[shopId]/orders/bill/[orderSessionId]",
    params: { shopId, orderSessionId },
  });
};

const goToEmployeeList = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) => {
  router.navigate({
    pathname: "/shop/[shopId]/staffs/employees",
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
  router.navigate({
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
  router.navigate({
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
  router.navigate({
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
  router.navigate({
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
  router.navigate({
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
  router.navigate({
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
  router.navigate({
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
  router.navigate({
    pathname: "/shop/[shopId]/staffs/update-department/[departmentId]",
    params: { shopId, departmentId },
  });
};

const goToKitchenList = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) => {
  router.navigate({
    pathname: "/shop/[shopId]/settings/kitchen-management",
    params: { shopId },
  });
};

const goToCreateKitchen = ({
  router,
  shopId,
}: {
  router: Router;
  shopId: string;
}) => {
  router.navigate({
    pathname: "/shop/[shopId]/settings/kitchen-management/create-kitchen",
    params: { shopId },
  });
};

const goToUpdateKitchen = ({
  router,
  shopId,
  kitchenId,
}: {
  router: Router;
  shopId: string;
  kitchenId: string;
}) => {
  router.navigate({
    pathname:
      "/shop/[shopId]/settings/kitchen-management/update-kitchen/[kitchenId]",
    params: { shopId, kitchenId },
  });
};

export {
  goToShopList,
  goToShopHome,
  goToCreateShop,
  goToUpdateShop,
  goToShopDishList,
  goToShopSetting,
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
  goToOrderSessionDetail,
  goToEmployeeList,
  goToEmployeePositionList,
  goToDepartmentList,
  goToCreateEmployee,
  goToCreateEmployeePosition,
  goToCreateDepartment,
  goToUpdateEmployee,
  goToUpdateEmployeePosition,
  goToUpdateDepartment,
  goToKitchenList,
  goToCreateKitchen,
  goToUpdateKitchen,
};
