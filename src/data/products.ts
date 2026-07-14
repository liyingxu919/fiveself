export interface Product {
  id: string;
  name: string;
  nameCn: string;
  category: string;
  description: string;
  price: number;
  features: string[];
  image: string;
  href: string;
}

export const products: Product[] = [
  {
    id: "five-elements-blueprint",
    name: "Five Elements Visual Blueprint",
    nameCn: "五行视觉能量报告",
    category: "Personal Reading",
    description:
      "A 30-page personal publication that maps your birth chart to a visual system of colors, totems, and spatial guidance.",
    price: 38,
    features: [
      "30+ page personalized PDF",
      "Personal element totem artwork",
      "Color palette system",
      "Mobile & desktop wallpapers (×3)",
      "Spatial color guidance card",
    ],
    image: "/products/blueprint-main.webp",
    href: "/product/five-elements-blueprint",
  },
  {
    id: "annual-element-guide",
    name: "Annual Element Guide",
    nameCn: "年度主题指南",
    category: "Yearly Reading",
    description:
      "Your year in color and rhythm. A seasonal companion with monthly themes, color palettes, and action prompts.",
    price: 28,
    features: [
      "12-month themed calendar",
      "Seasonal color palettes",
      "Monthly action prompts",
      "Digital wallpaper set (×4)",
    ],
    image: "/products/annual-guide.webp",
    href: "/product/annual-element-guide",
  },
  {
    id: "gift-edition",
    name: "Gift Edition — For Two",
    nameCn: "礼物版 · 双人",
    category: "Gift",
    description:
      "A shared visual language. Two interwoven reports that map the elements of a couple, friends, or family members.",
    price: 88,
    features: [
      "Two full Blueprint reports",
      "Relationship element map",
      "Shared color palette",
      "Premium gift cover",
      "Bilingual edition (EN + 中文)",
      "Gift card with personal message",
      "Priority 2-day delivery",
    ],
    image: "/products/gift-edition.webp",
    href: "/product/gift-edition",
  },
];
