export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface CategoryCreateRequest {
  name: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductUpsertRequest {
  name: string;
  sku?: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
}

export interface ProductsQuery {
  page: number;
  pageSize: number;
  search?: string;
  categoryId?: string;
}

export interface PagedProductsResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  items: Product[];
}
