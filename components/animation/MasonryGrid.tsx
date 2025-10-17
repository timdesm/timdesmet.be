"use client";

import { useEffect, useRef } from "react";

export default function MasonryGrid({ children, className = "", ...rest }: { children: React.ReactNode; className?: string }) {
  const isotopContainer = useRef<HTMLDivElement | null>(null);
  const initIsotop = async () => {
    const Isotope = (await import("isotope-layout")).default;
    const imagesloaded = (await import("imagesloaded")).default;

    if (!isotopContainer.current) return;
    const isotope = new Isotope(isotopContainer.current, {
      itemSelector: ".gallery__item",
      layoutMode: "masonry", // or 'fitRows'
    });
    imagesloaded(isotopContainer.current).on("progress", function () {
      isotope.layout();
    });
  };

  useEffect(() => {
    setTimeout(() => {
      initIsotop();
    }, 100);
  }, []);
  return (
    <div className={className} ref={isotopContainer} {...rest}>
      {children}
    </div>
  );
}
