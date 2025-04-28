import Image from "next/image";
import Hero from "./components/Hero";

import Register from "./components/Register";

import PartnerCompanies from "./components/PartnerCompanies";
import About from "./components/About";
import Complimentary from "./components/Complimentary";


export default function Home() {
  return (
    <div>
      <Hero />

      <Register/>

      <PartnerCompanies />
      <About />
      <Complimentary />
    </div>
  );
}
