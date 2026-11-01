export type ProductStatus = "Coming Soon" | "Open Pre-Order" | "Sold Out";

export type Product = {
  id: string;
  name: string;
  category: string;
  status: ProductStatus;
  description: string;
  image: string;
  imageAlt: string;
};

export const products: Product[] = [
  {
    id: "team-tee",
    name: "Blueprint Tee",
    category: "Apparel",
    status: "Open Pre-Order",
    description: "A team tee featuring the engineering behind Anargya's Formula EV.",
    image: "/images/blueprint-tee.webp",
    imageAlt: "Anargya Blueprint Tee shown in light and dark colorways",
  },
  {
    id: "team-tumbler",
    name: "Anargya Tumbler",
    category: "Drinkware",
    status: "Coming Soon",
    description: "A reusable tumbler featuring the team mark and race-day details.",
    image: "/images/team-tumbler.webp",
    imageAlt: "Anargya team tumbler with race flags and a Formula EV illustration",
  },
  {
    id: "sticker-pack",
    name: "Anargya Sticker Pack",
    category: "Accessories",
    status: "Sold Out",
    description: "A collection of Anargya-themed stickers for workshop and race-day kit.",
    image: "/images/sticker-pack.webp",
    imageAlt: "Anargya sticker pack with Formula EV and team-themed designs",
  },
];
