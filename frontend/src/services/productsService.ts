import type {
  PagedProductsResponse,
  Product,
  ProductsQuery,
  ProductUpsertRequest
} from "../types/api";
import { apiRequest } from "./http";

const PRODUCTS_PATH = "/api/products";

export function getProducts(query: ProductsQuery): Promise<PagedProductsResponse> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize)
  });

  if (query.search) {
    params.set("search", query.search);
  }

  if (query.categoryId) {
    params.set("categoryId", query.categoryId);
  }

  return apiRequest<PagedProductsResponse>(`${PRODUCTS_PATH}?${params.toString()}`);
}

export function getProductById(id: string): Promise<Product> {
  return apiRequest<Product>(`${PRODUCTS_PATH}/${id}`);
}

export function createProduct(payload: ProductUpsertRequest): Promise<Product> {
  return apiRequest<Product>(PRODUCTS_PATH, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateProduct(id: string, payload: ProductUpsertRequest): Promise<void> {
  return apiRequest<void>(`${PRODUCTS_PATH}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteProduct(id: string): Promise<void> {
  return apiRequest<void>(`${PRODUCTS_PATH}/${id}`, {
    method: "DELETE"
  });
}
