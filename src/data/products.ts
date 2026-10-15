import { Category, Product } from "../types";

const imageIds: Record<Category, string[]> = {
  Electronics: [
    "photo-1630307186909-ba2785e4b5c8", "photo-1563237602-b68d2dfb3f3b", "photo-1698663371785-677d13f21570", "photo-1621570549610-79caf7636afa",
    "photo-1721036469059-ab07e6bb6508", "photo-1770292170233-5d9e235ec739", "photo-1702390747118-632a9de80cf3", "photo-1621570551241-f78662d22ad9",
  ],
  "Men's Fashion": [
    "photo-1617114919297-3c8ddb01f599", "photo-1611312449408-fcece27cdbb7", "photo-1756451182421-d2a1961638c9", "photo-1555583743-991174c11425",
    "photo-1551537482-f2075a1d41f2", "photo-1713943189183-c5a9dde63b45", "photo-1519758340474-40fa8cba6584", "photo-1634036219891-5ac9a6ac2f53",
  ],
  "Women's Fashion": [
    "photo-1761125056726-149672a320c5", "photo-1761125056706-fbef48fb74b8", "photo-1713425887916-111e58eba679", "photo-1761125135232-c96036f1b1dc",
    "photo-1713425887309-1cb224e28711", "photo-1761125135351-268e72e39158", "photo-1750008560852-be18dcf4b8be", "photo-1713425886938-81022cef3769",
  ],
  Footwear: [
    "photo-1565814636199-ae8133055c1c", "photo-1709258228137-19a8c193be39", "photo-1519415943484-9fa1873496d4", "photo-1746206673199-5b75dcec1018",
    "photo-1604671801908-6f0c6a092c05", "photo-1618677831708-0e7fda3148b4", "photo-1582588678413-dbf45f4823e9", "photo-1631087606988-a6be38fccaf6",
  ],
  Accessories: [
    "photo-1709639288121-efe2eb002517", "photo-1492707892479-7bc8d5a4ee93", "photo-1689903777412-8a5867a392a1", "photo-1556227151-799479f586bc",
    "photo-1709639288100-ce4dfd958124", "photo-1531939130334-23dcf689f429", "photo-1530961915006-1cbd0d169f28", "photo-1608376165988-c7e0a856cce9",
  ],
  "Home & Living": [
    "photo-1688647063090-36f36f692d95", "photo-1785546781348-bfa2cc1965e4", "photo-1765274966838-db0cf0a12ef1", "photo-1688302741294-4646bf1f5059",
    "photo-1665002164383-a87e02d46034", "photo-1778855646666-7b8b7ff1b3b6", "photo-1776848633222-79872cfd63c6", "photo-1749704647804-81338ade5546",
  ],
};

const catalog: Record<Category, { names: string[]; brands: string[]; prices: number[] }> = {
  Electronics: {
    names: ["Nova X1 Smartphone", "AeroBook Pro Laptop", "SonicWave Headphones", "PulseFit Smartwatch", "Orbit Bluetooth Speaker", "Flow Mechanical Keyboard", "AirTone Wireless Buds", "Volt 65W Charger"],
    brands: ["Nova", "Aero", "SonicWave", "Pulse", "Orbit", "Flow", "AirTone", "Volt"],
    prices: [32999, 74990, 8999, 12999, 6499, 7999, 4999, 2499],
  },
  "Men's Fashion": {
    names: ["Essential Cotton T-Shirt", "Oxford Slim Shirt", "Indigo Straight Jeans", "Urban Bomber Jacket", "Tailored Chino Trousers", "Heritage Linen Kurta", "Classic Denim Overshirt", "Everyday Polo"],
    brands: ["North & Co.", "Threadline", "Denim House", "Urban Foundry", "Form", "Aarav", "Bluecraft", "Common"],
    prices: [999, 1799, 2499, 3999, 2199, 2899, 3299, 1499],
  },
  "Women's Fashion": {
    names: ["Aura Midi Dress", "Satin Evening Top", "Meera Printed Kurti", "Vanya Silk Saree", "High-Rise Wide Jeans", "Luna Structured Handbag", "Floral Day Dress", "Embroidered Co-ord Set"],
    brands: ["Aura", "Lune", "Meera", "Vanya", "Bluecraft", "Luna", "Mysa", "Noor"],
    prices: [2799, 1599, 1899, 4999, 2599, 3499, 2399, 3299],
  },
  Footwear: {
    names: ["Velocity Street Sneakers", "CloudRun Performance Shoes", "Regal Leather Oxfords", "Celeste Block Heels", "Coast Comfort Sandals", "Ease Everyday Slippers", "Court Classic Trainers", "Trek All-Terrain Shoes"],
    brands: ["Velocity", "CloudRun", "Regal", "Celeste", "Coast", "Ease", "Court", "Trek"],
    prices: [3499, 5999, 4499, 2999, 1999, 899, 3999, 6499],
  },
  Accessories: {
    names: ["Arc Minimal Watch", "Shade Polarized Sunglasses", "Metro Commuter Backpack", "Craft Leather Wallet", "Mira Pearl Necklace", "Voyager Travel Bag", "Halo Silver Bracelet", "Frame Classic Sunglasses"],
    brands: ["Arc", "Shade", "Metro", "Craft", "Mira", "Voyager", "Halo", "Frame"],
    prices: [4999, 2299, 3199, 1599, 2999, 4299, 1899, 2499],
  },
  "Home & Living": {
    names: ["Halo Table Lamp", "Cloud Textured Cushion", "Modular Desk Organizer", "Terra Kitchen Set", "Sculpt Ceramic Vase", "Weave Storage Basket", "Calm Scented Candle Set", "Linea Wall Decor"],
    brands: ["Halo Home", "Cloud Living", "Modular", "Terra", "Sculpt", "Weave", "Calm", "Linea"],
    prices: [2499, 999, 1499, 3299, 1899, 1299, 1199, 2799],
  },
};

const image = (id: string, width = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=82`;

export const initialProducts: Product[] = Object.entries(catalog).flatMap(([category, data], categoryIndex) =>
  data.names.map((name, index) => {
    const price = data.prices[index];
    const id = categoryIndex * 8 + index + 1;
    const primary = image(imageIds[category as Category][index]);
    return {
      id,
      name,
      brand: data.brands[index],
      category: category as Category,
      description: `A thoughtfully designed ${name.toLowerCase()} combining dependable quality, refined details and everyday performance. Selected by SORTIFY for its strong value and verified customer response.`,
      price,
      originalPrice: Math.round(price * (1.12 + (index % 3) * 0.06) / 10) * 10,
      rating: Number((4.1 + ((index + categoryIndex) % 8) * 0.1).toFixed(1)),
      reviews: 84 + ((id * 137) % 1900),
      stock: index === 6 && categoryIndex % 2 === 0 ? 0 : 3 + ((id * 7) % 36),
      image: primary,
      images: [primary, image(imageIds[category as Category][(index + 1) % 8]), image(imageIds[category as Category][(index + 2) % 8])],
      featured: index < 3,
      createdAt: 1735689600000 + id * 86400000,
      specifications: {
        Brand: data.brands[index],
        Category: category,
        Material: category === "Electronics" ? "Premium composite" : "Responsibly selected materials",
        Warranty: category === "Electronics" ? "1 year manufacturer warranty" : "30-day quality assurance",
      },
    };
  }),
);

export const FALLBACK_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='900' viewBox='0 0 900 900'%3E%3Crect fill='%23ede9fe' width='900' height='900'/%3E%3Cpath d='M300 570l110-120 75 75 55-60 80 105H300z' fill='%23a78bfa'/%3E%3Ccircle cx='580' cy='330' r='55' fill='%23c4b5fd'/%3E%3Ctext x='450' y='690' text-anchor='middle' font-family='Arial' font-size='36' fill='%234c1d95'%3ESORTIFY%3C/text%3E%3C/svg%3E";
