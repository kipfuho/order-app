import { User } from "@stores/state.interface";

interface UploadImageRequest {
  formData: FormData;
}

interface CreateShopRequest {
  name: string;
  email: string;
  phone?: string;
  taxRate?: number;
  location?: string;
  imageUrls?: string[];
}

interface QueryShopsRequest {
  user?: User;
  searchName?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

interface UpdateShopRequest {
  shopId: string;
  name: string;
  email: string;
  phone?: string;
  taxRate?: number;
  location?: string;
  imageUrls?: string[];
}

interface DeleteShopRequest {
  shopId: string;
}

export {
  CreateShopRequest,
  QueryShopsRequest,
  UpdateShopRequest,
  DeleteShopRequest,
  UploadImageRequest,
};
