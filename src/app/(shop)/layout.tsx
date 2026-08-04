import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import ScrollingPromotionBar from "@/components/layout/ScrollingPromotionBar";
import { Toaster } from "react-hot-toast";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollingPromotionBar />
      <Navbar />
      <CartDrawer />
      <main className="flex-grow">{children}</main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "#333",
            color: "#fff",
            fontSize: "14px",
          },
          success: {
            iconTheme: { primary: "#FFB6C1", secondary: "#fff" },
          },
        }}
      />
    </div>
  );
}
