export type ProductStatus = "Available" | "Sold Out";

export type Product = {
  id: string;
  name: string;
  category: string;
  status: ProductStatus;
  description: string;
  image: string;
  imageAlt: string;
  priceIdr: number;
  stock: number | null;
  variantOptions: string[];
};

export const initialProducts: Product[] = [
  {
    id: "team-tee",
    name: "Blueprint Tee",
    category: "Apparel",
    status: "Available",
    description: "A team tee featuring the engineering behind Anargya's Formula EV.",
    image: "/images/blueprint-tee.webp",
    imageAlt: "Anargya Blueprint Tee shown in light and dark colorways",
    priceIdr: 90000,
    stock: null,
    variantOptions: ["S", "M", "L", "XL"],
  },
  {
    id: "team-tumbler",
    name: "Anargya Tumbler",
    category: "Drinkware",
    status: "Available",
    description: "A reusable tumbler featuring the team mark and race-day details.",
    image: "/images/team-tumbler.webp",
    imageAlt: "Anargya team tumbler with race flags and a Formula EV illustration",
    priceIdr: 100000,
    stock: null,
    variantOptions: [],
  },
  {
    id: "sticker-pack",
    name: "Anargya Sticker Pack",
    category: "Accessories",
    status: "Available",
    description: "A collection of Anargya-themed stickers for workshop and race-day kit.",
    image: "/images/sticker-pack.webp",
    imageAlt: "Anargya sticker pack with Formula EV and team-themed designs",
    priceIdr: 15000,
    stock: null,
    variantOptions: [],
  },
];

export function isProductAvailable(product: Product) {
  return product.status === "Available"
    && (product.stock === null || product.stock > 0);
}

export function formatPrice(priceIdr: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(priceIdr);
}
