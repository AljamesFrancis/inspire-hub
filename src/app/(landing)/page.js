import Image from "next/image";
import Hero from "./components/Hero";
import PartnerCompanies from "./components/PartnerCompanies";
import About from "./components/About";

export default function Home() {
  return (
    
    <div>
      <Hero />
      <PartnerCompanies />
      <About />
    </div>
  );
}
