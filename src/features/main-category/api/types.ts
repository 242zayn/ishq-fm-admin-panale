export type MainCategory = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  bannerImage?: string;
  iconImage?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type MainCategoryApiModel = Omit<MainCategory, 'id'> & {
  _id: string;
};

export type MainCategoryFilters = {
  page?: number;
  limit?: number;
  search?: string;
};

export type MainCategoriesResponse = {
  message: string;
  data: MainCategory[];
  meta: {
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
};

export type MainCategoriesApiResponse = Omit<MainCategoriesResponse, 'data'> & {
  data: MainCategoryApiModel[];
};

export type MainCategoryMutationResponse = {
  message: string;
  mainCategory: MainCategory;
};

export type MainCategoryMutationApiResponse = Omit<MainCategoryMutationResponse, 'mainCategory'> & {
  mainCategory: MainCategoryApiModel;
};

export type DeleteMainCategoryResponse = {
  message: string;
  deleted: MainCategory;
};

export type DeleteMainCategoryApiResponse = Omit<DeleteMainCategoryResponse, 'deleted'> & {
  deleted: MainCategoryApiModel;
};

export type MainCategoryPayload = {
  title: string;
  slug: string;
  description?: string;
  bannerImage?: string;
  iconImage?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  tags?: string[];
};
