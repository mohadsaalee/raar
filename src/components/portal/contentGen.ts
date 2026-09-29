import { Product, money } from "@/data/products";

export type Lang = "English" | "Malayalam" | "Tamil";
export const CONTENT_TYPES = ["WhatsApp promo", "Instagram caption", "Product description", "Video script (Reels)", "Festival campaign", "Customer follow-up"] as const;
export const FESTIVALS = ["Onam", "Diwali", "Christmas", "Eid"] as const;
export const TONES = ["Friendly", "Premium", "Energetic"] as const;

const T = {
  English: { new: "New arrival!", only: "just", mrp: "MRP", sizes: "Sizes", order: "Order using my link", thanks: "Thank you for shopping!", fu: "Hi! Hope you're enjoying your order. Would you like to see our latest arrivals?", hook: "Hook", reveal: "Product reveal", cta: "Call to action", greet: { Onam: "Happy Onam!", Diwali: "Happy Diwali!", Christmas: "Merry Christmas!", Eid: "Eid Mubarak!" } },
  Malayalam: { new: "പുതിയ കളക്ഷൻ എത്തി!", only: "വെറും", mrp: "MRP", sizes: "സൈസുകൾ", order: "എന്റെ ലിങ്ക് വഴി ഓർഡർ ചെയ്യൂ", thanks: "ഷോപ്പ് ചെയ്തതിന് നന്ദി!", fu: "ഹലോ! നിങ്ങളുടെ ഓർഡർ ഇഷ്ടപ്പെട്ടെന്ന് കരുതുന്നു. പുതിയ കളക്ഷൻ കാണണോ?", hook: "തുടക്കം", reveal: "പ്രൊഡക്റ്റ് കാണിക്കുക", cta: "ഓർഡർ ചെയ്യാൻ ആവശ്യപ്പെടുക", greet: { Onam: "ഓണാശംസകൾ!", Diwali: "ദീപാവലി ആശംസകൾ!", Christmas: "ക്രിസ്മസ് ആശംസകൾ!", Eid: "ഈദ് മുബാറക്!" } },
  Tamil: { new: "புதிய கலெக்ஷன் வந்துவிட்டது!", only: "வெறும்", mrp: "MRP", sizes: "அளவுகள்", order: "என் லிங்க் மூலம் ஆர்டர் செய்யுங்கள்", thanks: "வாங்கியதற்கு நன்றி!", fu: "வணக்கம்! உங்கள் ஆர்டர் பிடித்திருக்கும் என நம்புகிறேன். புதிய கலெக்ஷன் பார்க்க வேண்டுமா?", hook: "தொடக்கம்", reveal: "தயாரிப்பை காட்டுங்கள்", cta: "ஆர்டருக்கு அழைப்பு", greet: { Onam: "ஓணம் வாழ்த்துகள்!", Diwali: "தீபாவளி வாழ்த்துகள்!", Christmas: "கிறிஸ்துமஸ் வாழ்த்துகள்!", Eid: "ஈத் முபாரக்!" } },
} as const;

export function generate(o: { p: Product; type: (typeof CONTENT_TYPES)[number]; lang: Lang; tone: (typeof TONES)[number]; festival: (typeof FESTIVALS)[number]; link: string; dealer: string; price: number; mrp: number }): string {
  const t = T[o.lang]; const { p } = o;
  const spark = o.tone === "Energetic" ? "🔥" : o.tone === "Premium" ? "✨" : "😊";
  const priceLine = `${p.name} — ${t.only} ${money(o.price)} (${t.mrp} ${money(o.mrp)})`;
  const sizes = `${t.sizes}: ${p.sizes.join(", ")}`;
  switch (o.type) {
    case "WhatsApp promo": return `${spark} ${t.new}\n${priceLine}\n${sizes}\n\n${t.order} 👇\n${o.link}\n\n— ${o.dealer}`;
    case "Instagram caption": return `${spark} ${p.name}\n${p.description}\n\n${money(o.price)} · ${t.order}: link in bio\n\n#RAAR #${p.category.replace(/[^A-Za-z]/g, "")} #NewIn #OOTD`;
    case "Product description": return `${p.name}\n\n${p.description}\n\n${p.fabric}\n${sizes}\n${money(o.price)}`;
    case "Video script (Reels)": return `[0–3s] ${t.hook}: "${p.name}" ${spark}\n[3–10s] ${t.reveal}: ${p.description.split(".")[0]}.\n[10–15s] ${priceLine}\n[15–20s] ${t.cta}: ${t.order}. Link in bio.`;
    case "Festival campaign": return `${t.greet[o.festival]} 🎉\n${priceLine}\n${sizes}\n\n${t.order} 👇\n${o.link}\n\n— ${o.dealer}`;
    case "Customer follow-up": return `${t.fu}\n\n${priceLine}\n${o.link}\n\n${t.thanks}\n— ${o.dealer}`;
  }
}

const RISKY = [/guarantee/i, /risk[- ]?free/i, /double (your )?money/i, /get rich/i, /passive income/i, /earn (lakhs|thousands|\d+ ?k)/i, /fixed (income|return)/i, /no investment/i];
export const riskyPhrase = (text: string) => RISKY.find((r) => r.test(text))?.source ?? null;
