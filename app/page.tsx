import React from "react";
import Header from "@/components/headers/Header";
import Logo from "@/components/headers/Logo";
import About from "@/components/home/About";
import Contact from "@/components/home/Contact";
import Hero from "@/components/home/Hero";
import Portfolios from "@/components/home/Portfolios";
import Services from "@/components/home/Services";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Tim De Smet - Full Stack Developer & Designer",
  description: "Welcome to the portfolio of Tim De Smet, a skilled Full Stack Developer and Designer located in Antwerp, Belgium. Explore my projects, services, and get in touch for collaborations.",
};
export default function page() {
  return (
    <>
      <Header />
      <Logo />
      <main id="page-content" className="page-content">
        <Hero />
        <Portfolios />
        <About />
        <Services />
        <Contact />
      </main>
    </>
  );
}
