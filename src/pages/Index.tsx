import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import TrustSection from "@/components/home/TrustSection";
import ForSellersSection from "@/components/home/ForSellersSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturedProductsSection />
        <CategoriesSection />
        <TrustSection />
        <ForSellersSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;