"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Portfolio = {
  id: number | string;
  title?: string;
  style?: string;
  portrait?: string;
  landscape?: string;
};

type PortfolioContextValue = {
  selectedPortfolio: Portfolio | null;
  setSelectedPortfolio: (p: Portfolio | null) => void;
};

const PortfolioContext = createContext<PortfolioContextValue | undefined>(
  undefined
);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(
    null
  );
  useEffect(() => {
    if (selectedPortfolio) {
      document.documentElement.classList.add("popup-active");
    } else {
      document.documentElement.classList.remove("popup-active");
    }
  }, [selectedPortfolio]);

  return (
    <PortfolioContext.Provider
      value={{ selectedPortfolio, setSelectedPortfolio }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx)
    throw new Error("usePortfolio must be used inside <PortfolioProvider />");
  return ctx;
}
