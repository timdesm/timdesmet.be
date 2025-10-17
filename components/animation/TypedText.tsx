"use client";
import { useEffect, useRef } from "react";
import Typed from "typed.js";

interface TypedTextProps {
  loop?: boolean;
  children: React.ReactNode;
}

export default function TypedText({ loop = false, children }: TypedTextProps) {
  const el = useRef<HTMLSpanElement | null>(null);
  const stringsRef = useRef<HTMLDivElement | null>(null);
  const typedInstance = useRef<Typed | null>(null);

  useEffect(() => {
    if (el.current && stringsRef.current) {
      typedInstance.current = new Typed(el.current, {
        stringsElement: stringsRef.current,
        loop,
        typeSpeed: 60,
        backSpeed: 30,
        backDelay: 2500,
      });
    }

    return () => {
      typedInstance.current?.destroy();
    };
  }, [loop]); // reinitiate if loop prop changes

  return (
    <>
      <div ref={stringsRef} style={{ display: "none" }}>
        {children}
      </div>
      <span ref={el} />
    </>
  );
}
