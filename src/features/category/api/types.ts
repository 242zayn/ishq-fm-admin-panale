export type Category = {
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

export type CategoryApiModel = Omit<Category, 'id'> & {
  _id: string;
};

export type CategoryFilters = {
  page?: number;
  limit?: number;
  search?: string;
};

export type CategoriesResponse = {
  message: string;
  data: Category[];
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

export type CategoriesApiResponse = Omit<CategoriesResponse, 'data'> & {
  data: CategoryApiModel[];
};

export type CategoryMutationResponse = {
  message: string;
  category: Category;
};

export type CategoryMutationApiResponse = Omit<CategoryMutationResponse, 'category'> & {
  category: CategoryApiModel;
};

export type DeleteCategoryResponse = {
  message: string;
  deleted: Category;
};

export type DeleteCategoryApiResponse = Omit<DeleteCategoryResponse, 'deleted'> & {
  deleted: CategoryApiModel;
};

export type CategoryPayload = {
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
