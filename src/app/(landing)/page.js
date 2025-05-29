"use client";
import Hero from "./components/Hero";
import Register from "./components/Register";
import PartnerCompanies from "./components/PartnerCompanies";
import About from "./components/About";
import Complimentary from "./components/Complimentary";
import Desks from "./components/Desks";

export default function Home() {

  return (
    <div>
      <Hero />
      <PartnerCompanies />
      <About />
      <Complimentary />
      <Desks />
      <Register />
    </div>
  );
}
