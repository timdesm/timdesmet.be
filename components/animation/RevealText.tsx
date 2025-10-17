"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

// ✅ Only allow HTML tags here, not SVG:
type HtmlTag = keyof HTMLElementTagNameMap; // 'div' | 'span' | 'h1' | 'a' | ...

type RevealTextProps<T extends HtmlTag = "span"> = {
  as?: T;
  className?: string;
  children: React.ReactNode;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  stagger?: number;
  opacityFrom?: number;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export default function RevealText<T extends HtmlTag = "span">({
  as,
  className,
  children,
  start = "top 80%",
  end = "top 20%",
  scrub = true,
  stagger = 0.1,
  opacityFrom = 0.2,
  ...rest
}: RevealTextProps<T>) {
  const Tag = (as || "span") as unknown as React.ElementType;
  const elRef = useRef<HTMLElement | null>(null);
  const animRef = useRef<gsap.core.Tween | null>(null);
  const splitRef = useRef<SplitType | null>(null);

  useEffect(() => {
    const createAnimation = () => {
      if (!elRef.current) return;

      // Revert previous split if exists
      splitRef.current?.revert();

      const split = new SplitType(elRef.current, { types: "words,chars" });
      splitRef.current = split;

      const anim = gsap.from(split.chars, {
        scrollTrigger: {
          trigger: elRef.current,
          start,
          end,
          scrub,
        },
        opacity: opacityFrom,
        stagger,
      });

      animRef.current = anim;
    };
    createAnimation();

    // Refresh listener: rebuild animation on ScrollTrigger refresh
    const handleRefresh = () => {
      createAnimation();
    };

    ScrollTrigger.addEventListener("refresh", handleRefresh);

    return () => {
      animRef.current?.kill();
      splitRef.current?.revert();
      ScrollTrigger.getAll()
        // eslint-disable-next-line react-hooks/exhaustive-deps
        .filter((t) => t.vars.trigger === elRef.current)
        .forEach((t) => t.kill());
      ScrollTrigger.removeEventListener("refresh", handleRefresh);
    };
  }, [start, end, scrub, stagger, opacityFrom]);

  return (
    <Tag
      ref={elRef}
      className={["reveal-type", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}
