import Image from "next/image";
import Hero from "./components/Hero";

import Register from "./components/Register";

import PartnerCompanies from "./components/PartnerCompanies";
import About from "./components/About";
import Complimentary from "./components/Complimentary";
import Sidenav from "../(dashboard)/components/Sidenav";



export default function Home() {
  return (
    <div>
      <Sidenav />
      <Hero />
      <PartnerCompanies />
      <About />
      <Complimentary />
      <Register/>
    </div>
  );
}
