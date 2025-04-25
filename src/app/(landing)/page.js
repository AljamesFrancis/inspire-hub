import Image from "next/image";
import Hero from "./components/Hero";
import PartnerCompanies from "./components/PartnerCompanies";
import About from "./components/About";
import Complimentary from "./components/Complimentary";

export default function Home() {
  return (
    <div>
      <Hero />
      <PartnerCompanies />
      <About />
      <Complimentary />
    </div>
  );
}
