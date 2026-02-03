import Navbar from "@/components/Navbar";
import PricingSection from "@/components/PricingSection";

const Plans = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      <div className="pt-20">
        <PricingSection />
      </div>
    </div>
  );
};

export default Plans;
