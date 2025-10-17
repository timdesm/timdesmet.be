"use client";

import { useEffect, useRef } from "react";

const CLICKABLE_SELECTOR =
  "a, button, input[type='button'], input[type='submit'], [role='button'], [data-cursor='clickable']";

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursorEl = cursorRef.current;
    if (!cursorEl) {
      return;
    }

    const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!finePointerQuery.matches) {
      cursorEl.style.display = "none";
      return;
    }

    const body = document.body;
    body.classList.add("custom-cursor-enabled");

    const setPosition = (x: number, y: number) => {
      cursorEl.style.transform = `translate3d(${x}px, ${y}px, 0) translate3d(-50%, -50%, 0)`;
    };
    setPosition(window.innerWidth / 2, window.innerHeight / 2);

    const spawnParticles = (x: number, y: number) => {
      const particleCount = 12;
      for (let i = 0; i < particleCount; i += 1) {
        const particle = document.createElement("span");
        particle.className = "custom-cursor__particle";
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        const angle = Math.random() * Math.PI * 2;
        const distance = 18 + Math.random() * 26;
        const duration = 0.45 + Math.random() * 0.3;
        const delay = Math.random() * 0.05;

        particle.style.setProperty("--particle-x", `${Math.cos(angle) * distance}px`);
        particle.style.setProperty("--particle-y", `${Math.sin(angle) * distance}px`);
        particle.style.setProperty("--particle-duration", `${duration}s`);
        particle.style.setProperty("--particle-delay", `${delay}s`);

        document.body.appendChild(particle);
        particle.addEventListener(
          "animationend",
          () => {
            particle.remove();
          },
          { once: true },
        );
      }
    };

    const updateInteractiveState = (event: PointerEvent) => {
      const targetElement = (event.target as HTMLElement | null)?.closest(CLICKABLE_SELECTOR);
      if (targetElement) {
        cursorEl.classList.add("custom-cursor--cta");
      } else {
        cursorEl.classList.remove("custom-cursor--cta");
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        return;
      }
      cursorEl.classList.remove("custom-cursor--hidden");
      setPosition(event.clientX, event.clientY);
      updateInteractiveState(event);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch" || event.button !== 0) {
        return;
      }
      cursorEl.classList.remove("custom-cursor--hidden");
      setPosition(event.clientX, event.clientY);
      cursorEl.classList.add("custom-cursor--pressed");
      spawnParticles(event.clientX, event.clientY);
    };
    const handlePointerUp = () => cursorEl.classList.remove("custom-cursor--pressed");

    const handlePointerLeaveDocument = (event: PointerEvent) => {
      if (!event.relatedTarget) {
        cursorEl.classList.add("custom-cursor--hidden");
      }
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointerleave", handlePointerLeaveDocument);
    document.addEventListener("pointerover", updateInteractiveState);
    document.addEventListener("pointerout", updateInteractiveState);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        cursorEl.classList.add("custom-cursor--hidden");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleResize = () => {
      setPosition(window.innerWidth / 2, window.innerHeight / 2);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointerleave", handlePointerLeaveDocument);
      document.removeEventListener("pointerover", updateInteractiveState);
      document.removeEventListener("pointerout", updateInteractiveState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);

      body.classList.remove("custom-cursor-enabled");
    };
  }, []);

  return <div ref={cursorRef} className="custom-cursor custom-cursor--hidden" aria-hidden="true" />;
};

export default CustomCursor;
