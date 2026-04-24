import type { Category, CategoryCreateRequest } from "../types/api";
import { apiRequest } from "./http";

export function getCategories(): Promise<Category[]> {
  return apiRequest<Category[]>("/api/categories");
}

export function createCategory(payload: CategoryCreateRequest): Promise<Category> {
  return apiRequest<Category>("/api/categories", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
