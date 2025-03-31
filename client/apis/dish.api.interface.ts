import { DishCategory, Unit } from "../stores/state.interface";

interface UploadImageRequest {
  shopId: string;
  formData: FormData;
}

interface RemoveImageRequest {
  shopId: string;
  url: string;
}

interface CreateDishCategoryRequest {
  shopId: string;
  name: string;
  rtk?: boolean;
}

interface GetDishCategoriesRequest {
  shopId: string;
  rtk?: boolean;
}

interface UpdateDishCategoryRequest {
  dishCategoryId: string;
  shopId: string;
  name: string;
  rtk?: boolean;
}

interface DeleteDishCategoryRequest {
  shopId: string;
  dishCategoryId: string;
  rtk?: boolean;
}

interface CreateDishRequest {
  shopId: string;
  name: string;
  category: DishCategory;
  dishType: string;
  price: number;
  taxRate: number;
  unit: Unit;
  isTaxIncludedPrice: boolean;
  imageUrls: string[];
  rtk?: boolean;
}

interface GetDishesRequest {
  shopId: string;
  rtk?: boolean;
}

interface UpdateDishRequest {
  shopId: string;
  dishId: string;
  name: string;
  category: DishCategory;
  dishType: string;
  price: number;
  taxRate: number;
  unit: Unit;
  isTaxIncludedPrice: boolean;
  imageUrls: string[];
  rtk?: boolean;
}

interface DeleteDishRequest {
  shopId: string;
  dishId: string;
  rtk?: boolean;
}

interface GetDishTypesRequest {
  shopId: string;
  rtk?: boolean;
}

interface GetUnitsRequest {
  shopId: string;
  rtk?: boolean;
}

interface CreateDefaultUnitsRequest {
  shopId: string;
  rtk?: boolean;
}

export {
  UploadImageRequest,
  RemoveImageRequest,
  CreateDishCategoryRequest,
  GetDishCategoriesRequest,
  UpdateDishCategoryRequest,
  DeleteDishCategoryRequest,
  GetDishesRequest,
  CreateDishRequest,
  UpdateDishRequest,
  DeleteDishRequest,
  GetDishTypesRequest,
  GetUnitsRequest,
  CreateDefaultUnitsRequest,
};
