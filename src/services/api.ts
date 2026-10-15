import { Product } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL as string | undefined;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_BASE_URL) throw new Error("SORTIFY is running in local demo mode. No backend API is connected.");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export const api = {
  configured: Boolean(API_BASE_URL),
  products: {
    list: (query = "") => request<Product[]>(`/products?${query}`),
    details: (id: number) => request<Product>(`/products/${id}`),
    create: (product: Omit<Product, "id">) => request<Product>("/admin/products", { method: "POST", body: JSON.stringify(product) }),
    update: (product: Product) => request<Product>(`/admin/products/${product.id}`, { method: "PUT", body: JSON.stringify(product) }),
    remove: (id: number) => request<void>(`/admin/products/${id}`, { method: "DELETE" }),
  },
  cart: {
    sync: (lines: { productId: number; quantity: number }[]) => request("/cart", { method: "PUT", body: JSON.stringify({ lines }) }),
  },
  auth: {
    login: (email: string, password: string) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    register: (email: string, password: string) => request("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  },
};
