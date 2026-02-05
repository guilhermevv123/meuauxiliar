import { CompaniesHero } from "@/components/companies/CompaniesHero";
import { CompaniesFeatures } from "@/components/companies/CompaniesFeatures";
import { CompaniesBenefits } from "@/components/companies/CompaniesBenefits";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CompaniesPricing } from "@/components/companies/CompaniesPricing";
import { CompaniesFAQ } from "@/components/companies/CompaniesFAQ";
import { CompaniesCTA } from "@/components/companies/CompaniesCTA";

export default function Companies() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <CompaniesHero />
        <CompaniesFeatures />
        <CompaniesBenefits />
        <CompaniesPricing />
        <CompaniesFAQ />
        <CompaniesCTA />
      </main>
      <Footer />
    </div>
  );
}
