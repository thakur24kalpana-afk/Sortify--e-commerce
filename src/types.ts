export const CATEGORIES = ["Electronics", "Men's Fashion", "Women's Fashion", "Footwear", "Accessories", "Home & Living"] as const;
export type Category = typeof CATEGORIES[number];

export type Product = {
  id: number;
  name: string;
  brand: string;
  category: Category;
  description: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  stock: number;
  image: string;
  images: string[];
  featured: boolean;
  createdAt: number;
  specifications: Record<string, string>;
};

export type CartLine = { productId: number; quantity: number };
export type Page = "home" | "shop" | "product" | "wishlist" | "cart" | "lab" | "benchmarks" | "admin" | "auth";
