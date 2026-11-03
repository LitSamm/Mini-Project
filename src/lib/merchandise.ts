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
    name: "Workshirt",
    category: "Apparel",
    status: "Available",
    description: "Workshirt resmi Anargya ITS EV Team dengan desain Mark 6.0.",
    image: "/images/workshirt.png",
    imageAlt: "Workshirt hitam Anargya ITS EV Team tampak depan dan belakang",
    priceIdr: 155000,
    stock: 40,
    variantOptions: [],
  },
  {
    id: "team-tumbler",
    name: "Blindpack keychain",
    category: "Accessories",
    status: "Available",
    description: "Gantungan kunci blindpack bertema mobil Formula EV Anargya.",
    image: "/images/keychain-mobill.png",
    imageAlt: "Koleksi blindpack keychain Anargya ITS dengan beberapa desain dan kemasan warna-warni",
    priceIdr: 15000,
    stock: 100,
    variantOptions: [],
  },
  {
    id: "carabiner-car",
    name: "Carabiner car",
    category: "Accessories",
    status: "Available",
    description: "Gantungan carabiner mobil Formula EV Anargya.",
    image: "/images/carabiner.png",
    imageAlt: "Carabiner hijau Anargya dengan gantungan mobil mini dan manik nama tim",
    priceIdr: 60000,
    stock: 10,
    variantOptions: [],
  },
  {
    id: "sticker-pack",
    name: "Sticker",
    category: "Accessories",
    status: "Available",
    description: "Koleksi stiker Anargya ITS EV Team bertema mobil dan balap.",
    image: "/images/sticker.png",
    imageAlt: "Lembar stiker Anargya ITS EV Team dengan desain mobil dan tim balap",
    priceIdr: 10000,
    stock: 110,
    variantOptions: [],
  },
  {
    id: "enamel-pin",
    name: "Enamel pin",
    category: "Accessories",
    status: "Available",
    description: "Pin enamel Anargya ITS EV Team dengan beberapa desain tim.",
    image: "/images/enamel-pin.png",
    imageAlt: "Tiga pin enamel Anargya ITS EV Team dengan kartu desain berwarna",
    priceIdr: 25000,
    stock: 55,
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
