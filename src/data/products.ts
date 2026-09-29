export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  gender: "Men" | "Women" | "Unisex";
  price: number;
  mrp: number;
  colors: { name: string; hex: string }[];
  sizes: string[];
  images: string[];
  tags: ("new" | "bestseller")[];
  rating: number;
  reviews: number;
  description: string;
  fabric: string;
};

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const ALPHA = ["S", "M", "L", "XL", "XXL"];
const NUM = ["28", "30", "32", "34", "36"];

export const PRODUCTS: Product[] = [
  {
    id: "r01", slug: "oversized-heavyweight-tee", name: "Oversized Heavyweight Tee", category: "T-Shirts", gender: "Unisex",
    price: 799, mrp: 1299, colors: [{ name: "Off White", hex: "#efece4" }, { name: "Black", hex: "#111111" }, { name: "Sage", hex: "#9caf88" }],
    sizes: ALPHA, images: [img("1521572163474-6864f9cf17ab"), img("1503342217505-b0a15ec3261c")], tags: ["bestseller", "new"], rating: 4.6, reviews: 428,
    description: "A boxy, drop-shoulder tee cut from dense 240 GSM cotton. Holds its shape, drapes cleanly and pairs with everything.",
    fabric: "100% combed cotton, 240 GSM. Machine wash cold, dry in shade.",
  },
  {
    id: "r02", slug: "linen-resort-shirt", name: "Linen Resort Shirt", category: "Shirts", gender: "Men",
    price: 1499, mrp: 2299, colors: [{ name: "Sand", hex: "#d9c9a8" }, { name: "Sky", hex: "#a9c6de" }],
    sizes: ALPHA, images: [img("1596755094514-f87e34085b2c"), img("1489987707025-afc232f7ea0f")], tags: ["new"], rating: 4.5, reviews: 212,
    description: "Breathable linen-blend shirt with a relaxed camp collar. Made for humid weather and long evenings.",
    fabric: "55% linen, 45% cotton. Wash separately, iron on medium.",
  },
  {
    id: "r03", slug: "relaxed-cargo-trousers", name: "Relaxed Fit Cargo Trousers", category: "Trousers", gender: "Men",
    price: 1899, mrp: 2799, colors: [{ name: "Olive", hex: "#5b6244" }, { name: "Stone", hex: "#b9b09a" }, { name: "Black", hex: "#141414" }],
    sizes: NUM, images: [img("1542272604-787c3835535d"), img("1624378439575-d8705ad7ae80")], tags: ["bestseller"], rating: 4.4, reviews: 301,
    description: "Utility pockets, tapered ankle, soft twill. Structured enough for the street, comfortable enough for the day.",
    fabric: "98% cotton twill, 2% elastane. Machine wash cold.",
  },
  {
    id: "r04", slug: "washed-denim-jacket", name: "Washed Denim Jacket", category: "Jackets", gender: "Men",
    price: 2799, mrp: 4299, colors: [{ name: "Indigo", hex: "#2e4067" }, { name: "Light Wash", hex: "#8fa8c4" }],
    sizes: ALPHA, images: [img("1591047139829-d91aecb6caea"), img("1551028719-00167b16eac5")], tags: ["new"], rating: 4.7, reviews: 156,
    description: "Classic trucker silhouette in stone-washed denim with reinforced seams and brushed-metal buttons.",
    fabric: "100% cotton denim, 12 oz. Wash inside out.",
  },
  {
    id: "r05", slug: "ribbed-knit-polo", name: "Ribbed Knit Polo", category: "Knitwear", gender: "Men",
    price: 1699, mrp: 2499, colors: [{ name: "Cream", hex: "#eee5d0" }, { name: "Navy", hex: "#1c2a4a" }],
    sizes: ALPHA, images: [img("1583743814966-8936f5b7be1a"), img("1576566588028-4147f3842f27")], tags: [], rating: 4.3, reviews: 98,
    description: "A fine-gauge ribbed polo with a soft hand-feel and slim fit. Smart without trying too hard.",
    fabric: "60% cotton, 40% viscose. Hand wash recommended.",
  },
  {
    id: "r06", slug: "zip-front-hoodie", name: "Zip Front Hoodie", category: "Hoodies", gender: "Unisex",
    price: 1999, mrp: 2999, colors: [{ name: "Charcoal", hex: "#3a3a3d" }, { name: "Bone", hex: "#e6e0d2" }],
    sizes: ALPHA, images: [img("1556821840-3a63f95609a7"), img("1620799140408-edc6dcb6d633")], tags: ["bestseller"], rating: 4.6, reviews: 377,
    description: "Heavy brushed-fleece hoodie with a full zip, kangaroo pockets and a clean, minimal finish.",
    fabric: "80% cotton, 20% polyester fleece, 380 GSM.",
  },
  {
    id: "r07", slug: "satin-slip-dress", name: "Satin Slip Dress", category: "Dresses", gender: "Women",
    price: 2299, mrp: 3499, colors: [{ name: "Champagne", hex: "#dcc7a1" }, { name: "Wine", hex: "#6d1f2f" }],
    sizes: ALPHA.slice(0, 4), images: [img("1515886657613-9f3515b0c78f"), img("1539109136881-3be0616acf4b")], tags: ["new"], rating: 4.5, reviews: 134,
    description: "Bias-cut satin midi with adjustable straps. Falls beautifully and moves with you.",
    fabric: "100% polyester satin. Dry clean or gentle hand wash.",
  },
  {
    id: "r08", slug: "floral-wrap-midi-dress", name: "Floral Wrap Midi Dress", category: "Dresses", gender: "Women",
    price: 1899, mrp: 2999, colors: [{ name: "Botanical", hex: "#7c9a6c" }],
    sizes: ALPHA.slice(0, 4), images: [img("1509631179647-0177331693ae"), img("1529139574466-a303027c1d8b")], tags: ["bestseller"], rating: 4.4, reviews: 189,
    description: "A flattering wrap silhouette in a soft floral print, finished with a self-tie waist.",
    fabric: "100% viscose. Cold wash, line dry.",
  },
  {
    id: "r09", slug: "cropped-trench-jacket", name: "Cropped Trench Jacket", category: "Jackets", gender: "Women",
    price: 3299, mrp: 4999, colors: [{ name: "Camel", hex: "#b48a5a" }, { name: "Black", hex: "#111111" }],
    sizes: ALPHA.slice(0, 4), images: [img("1434389677669-e08b4cac3105"), img("1483985988355-763728e1935b")], tags: ["new"], rating: 4.8, reviews: 76,
    description: "A modern take on the trench: cropped length, structured shoulder, water-resistant finish.",
    fabric: "Cotton-poly gabardine, lined. Dry clean only.",
  },
  {
    id: "r10", slug: "high-rise-wide-leg-jeans", name: "High-Rise Wide Leg Jeans", category: "Trousers", gender: "Women",
    price: 2199, mrp: 3199, colors: [{ name: "Mid Blue", hex: "#5f7fa6" }, { name: "Black", hex: "#141414" }],
    sizes: NUM, images: [img("1541099649105-f69ad21f3246"), img("1542272604-787c3835535d")], tags: ["bestseller"], rating: 4.5, reviews: 264,
    description: "Rigid denim with a flattering high rise and a full, floor-skimming leg.",
    fabric: "100% cotton denim. Machine wash cold, inside out.",
  },
  {
    id: "r11", slug: "linen-co-ord-set", name: "Linen Co-ord Set", category: "Co-ords", gender: "Women",
    price: 2599, mrp: 3899, colors: [{ name: "Ivory", hex: "#f0eadb" }, { name: "Terracotta", hex: "#b8664a" }],
    sizes: ALPHA.slice(0, 4), images: [img("1445205170230-053b83016050"), img("1490481651871-ab68de25d43d")], tags: ["new"], rating: 4.6, reviews: 92,
    description: "A breezy matching top and trouser in washed linen. Wear together or mix into your wardrobe.",
    fabric: "70% linen, 30% cotton. Gentle wash.",
  },
  {
    id: "r12", slug: "kasavu-border-saree", name: "Kasavu Border Saree", category: "Ethnic", gender: "Women",
    price: 3499, mrp: 4999, colors: [{ name: "Ivory & Gold", hex: "#f2e9d0" }],
    sizes: ["Free Size"], images: [img("1610030469983-98e550d6193c"), img("1583391733956-6c78276477e2")], tags: ["bestseller"], rating: 4.9, reviews: 318,
    description: "Handloom cotton saree with a traditional gold kasavu border. Timeless, lightweight and made for celebrations.",
    fabric: "Handloom cotton with zari border. Dry clean recommended.",
  },
  {
    id: "r13", slug: "handloom-cotton-kurta", name: "Handloom Cotton Kurta", category: "Ethnic", gender: "Men",
    price: 1299, mrp: 1999, colors: [{ name: "White", hex: "#f5f3ee" }, { name: "Indigo", hex: "#2b3a67" }],
    sizes: ALPHA, images: [img("1602810318383-e386cc2a3ccf"), img("1621072156002-e2fccdc0b176")], tags: ["new"], rating: 4.5, reviews: 141,
    description: "A soft, breathable kurta with a mandarin collar and side slits. Festive-ready, everyday-comfortable.",
    fabric: "100% handloom cotton. Wash with like colours.",
  },
  {
    id: "r14", slug: "everyday-chino-shorts", name: "Everyday Chino Shorts", category: "Shorts", gender: "Men",
    price: 999, mrp: 1599, colors: [{ name: "Khaki", hex: "#b5a583" }, { name: "Navy", hex: "#1c2a4a" }],
    sizes: NUM, images: [img("1591195853828-11db59a44f6b"), img("1473966968600-fa801b869a1a")], tags: [], rating: 4.2, reviews: 87,
    description: "Clean, tailored chino shorts with a stretch waistband for all-day wear.",
    fabric: "97% cotton, 3% elastane.",
  },
  {
    id: "r15", slug: "leather-crossbody-bag", name: "Leather Crossbody Bag", category: "Accessories", gender: "Unisex",
    price: 2499, mrp: 3999, colors: [{ name: "Tan", hex: "#a56b3d" }, { name: "Black", hex: "#111111" }],
    sizes: ["One Size"], images: [img("1548036328-c9fa89d128fa"), img("1553062407-98eeb64c6a62")], tags: ["new"], rating: 4.6, reviews: 63,
    description: "Compact crossbody in full-grain leather with an adjustable strap and zip closure.",
    fabric: "Full-grain leather, cotton lining. Wipe clean.",
  },
  {
    id: "r16", slug: "minimal-chronograph-watch", name: "Minimal Chronograph Watch", category: "Accessories", gender: "Unisex",
    price: 3999, mrp: 6499, colors: [{ name: "Steel", hex: "#a8adb3" }],
    sizes: ["One Size"], images: [img("1523275335684-37898b6baf30"), img("1524592094714-0f0654e20314")], tags: ["bestseller"], rating: 4.7, reviews: 205,
    description: "Slim stainless-steel chronograph with a sapphire-coated glass and a genuine leather strap.",
    fabric: "Stainless steel case, leather strap. 3 ATM water resistance.",
  },
  {
    id: "r17", slug: "canvas-court-sneakers", name: "Canvas Court Sneakers", category: "Footwear", gender: "Unisex",
    price: 2199, mrp: 3299, colors: [{ name: "White", hex: "#f4f4f2" }, { name: "Black", hex: "#111111" }],
    sizes: ["6", "7", "8", "9", "10", "11"], images: [img("1542291026-7eec264c27ff"), img("1525966222134-fcfa99b8ae77")], tags: ["bestseller", "new"], rating: 4.4, reviews: 342,
    description: "Low-top court sneakers with a vulcanised sole and cushioned insole. Easy, clean, everyday.",
    fabric: "Cotton canvas upper, rubber sole.",
  },
];

export const CATEGORIES = ["T-Shirts", "Shirts", "Trousers", "Jackets", "Knitwear", "Hoodies", "Dresses", "Co-ords", "Ethnic", "Shorts", "Accessories", "Footwear"];

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const money = (n: number) => "₹" + n.toLocaleString("en-IN");
export const discountPct = (p: Product) => Math.round((1 - p.price / p.mrp) * 100);
export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const getProductById = (id: string) => PRODUCTS.find((p) => p.id === id);

export type Collection = { slug: string; title: string; blurb: string; hero: string; filter: (p: Product) => boolean };

const base: Collection[] = [
  { slug: "all", title: "All Products", blurb: "The complete RAAR catalogue.", hero: img("1441984904996-e0b6ba687e04", 1600), filter: () => true },
  { slug: "new-arrivals", title: "New Arrivals", blurb: "Fresh drops, just landed.", hero: img("1523381210434-271e8be1f52b", 1600), filter: (p) => p.tags.includes("new") },
  { slug: "bestsellers", title: "Bestsellers", blurb: "What everyone is wearing right now.", hero: img("1483985988355-763728e1935b", 1600), filter: (p) => p.tags.includes("bestseller") },
  { slug: "men", title: "Men", blurb: "Everyday essentials to statement pieces.", hero: img("1507003211169-0a1dd7228f2d", 1600), filter: (p) => p.gender !== "Women" },
  { slug: "women", title: "Women", blurb: "Modern silhouettes, considered fabrics.", hero: img("1512436991641-6745cdb1723f", 1600), filter: (p) => p.gender !== "Men" },
  { slug: "sale", title: "Sale", blurb: "Up to 40% off select styles.", hero: img("1556905055-8f358a7a47b2", 1600), filter: (p) => discountPct(p) >= 32 },
];

export const COLLECTIONS: Collection[] = [
  ...base,
  ...CATEGORIES.map((c) => ({
    slug: slugify(c), title: c, blurb: `Shop ${c.toLowerCase()} from RAAR.`,
    hero: PRODUCTS.find((p) => p.category === c)?.images[0] ?? img("1441984904996-e0b6ba687e04", 1600),
    filter: (p: Product) => p.category === c,
  })),
];

export const getCollection = (slug: string) => COLLECTIONS.find((c) => c.slug === slug);
