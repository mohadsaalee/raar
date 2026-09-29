import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SearchOverlay from "@/components/SearchOverlay";
import RefBanner from "@/components/RefBanner";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <RefBanner />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
    </>
  );
}
