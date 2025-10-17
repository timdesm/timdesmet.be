"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Prism from "prismjs";
import "prismjs/components/prism-markup-templating";
import "prismjs/components/prism-php";

gsap.registerPlugin(ScrollTrigger);

const CODE_SAMPLE = `<?php
/**
 * The class that runs on curiosity, code, and a questionable amount of garlic.
 */
class TimDeSmet
{
  private string $name = 'Tim De Smet';
  private array $roles = ['Software Engineer', 'Entrepreneur', 'Digital Alchemist'];
  private array $loves = ['Laravel', 'Marketing', 'Automation', 'Italian food', 'Motorcycles'];
  private array $hates = ['Bad UX', 'Unoptimized loops', 'Feta cheese'];

  public function philosophy(): string
  {
    return "Ship fast. Iterate faster. Refactor... eventually.";
  }

  public function weekendMood(): string
  {
    $options = [
      "Riding on two wheels 🏍️",
      "Debugging marketing funnels 🍷",
      "Building something nobody asked for ⚙️",
      "Designing in Figma pretending it's code 🎨"
    ];
    return $options[array_rand($options)];
  }

  public function currentStatus(): string
  {
    return "👋 Hi, I’m {$this->name}, founder of Wizzou — the studio behind Ominity and Onetagger!";
  }
};`;

const AnimatedCode = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLOListElement>(null);
  const segmentsRef = useRef<
    Array<{
      text: string;
      className: string;
    }>
  >([]);

  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    const codeElement = codeRef.current;
    const editor = editorRef.current;

    if (!container || !inner || !codeElement || !editor) return;
    const language = Prism.languages.php;
    if (!language) return;

    const preElement = codeElement.parentElement as HTMLElement | null;

    const buildSegments = () => {
      const container = document.createElement("div");
      container.innerHTML = Prism.highlight(CODE_SAMPLE, language, "php");
      const nextSegments: Array<{ text: string; className: string }> = [];

      const walk = (node: ChildNode, className: string) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent ?? "";
          if (text) {
            nextSegments.push({ text, className });
          }
          return;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          const nextClassName = [className, element.className].filter(Boolean).join(" ").trim();
          element.childNodes.forEach((child) => walk(child, nextClassName));
        }
      };

      container.childNodes.forEach((child) => walk(child, ""));
      segmentsRef.current = nextSegments;
    };

    const renderFromSegments = (length: number) => {
      if (!segmentsRef.current.length) {
        codeElement.textContent = CODE_SAMPLE.slice(0, length);
        return;
      }

      let remaining = length;
      const fragment = document.createDocumentFragment();

      for (const segment of segmentsRef.current) {
        if (remaining <= 0) {
          break;
        }

        const take = Math.min(segment.text.length, remaining);
        if (take <= 0) {
          continue;
        }

        const textContent = segment.text.slice(0, take);
        const target =
          segment.className.length > 0
            ? Object.assign(document.createElement("span"), {
                className: segment.className,
              })
            : document.createTextNode("");

        if (target instanceof HTMLElement) {
          target.textContent = textContent;
          fragment.appendChild(target);
        } else {
          target.textContent = textContent;
          fragment.appendChild(target);
        }

        remaining -= take;

        if (take < segment.text.length) {
          break;
        }
      }

      codeElement.replaceChildren(fragment);
    };

    const renderFullHighlight = (value: string) => {
      codeElement.innerHTML = Prism.highlight(value, language, "php");
    };

    const measureHeight = () => {
      const measure = document.createElement("pre");
      measure.className = "animated-code__pre animated-code__pre--measure language-php";
      measure.innerHTML = Prism.highlight(CODE_SAMPLE, language, "php");
      inner.appendChild(measure);
      const height = Math.ceil(measure.getBoundingClientRect().height);
      container.style.setProperty("--animated-code-height", `${height}px`);
      inner.removeChild(measure);
    };

    const renderLineNumbers = (value: string) => {
      const gutter = gutterRef.current;
      if (!gutter) return;
      const lineCount = Math.max(1, value.split("\n").length);
      const fragment = document.createDocumentFragment();
      for (let line = 1; line <= lineCount; line += 1) {
        const li = document.createElement("li");
        li.textContent = String(line);
        fragment.appendChild(li);
      }
      gutter.replaceChildren(fragment);
    };

    buildSegments();
    measureHeight();
    renderFromSegments(0);
    renderLineNumbers("");
    editor.value = "";
    editor.readOnly = true;
    editor.setAttribute("spellcheck", "false");

    const typingState = { index: 0 };

    const timeline = gsap.timeline({
      paused: true,
      defaults: { ease: "none" },
      onStart: () => {
        typingState.index = 0;
        container.dataset.state = "typing";
        codeElement.classList.add("is-typing");
        editor.readOnly = true;
        editor.value = "";
        renderFromSegments(0);
        renderLineNumbers("");
        if (gutterRef.current) {
          gutterRef.current.style.transform = "translateY(0)";
        }
      },
      onComplete: () => {
        container.dataset.state = "done";
        codeElement.classList.remove("is-typing");
        editor.readOnly = false;
        segmentsRef.current = [];
        renderFullHighlight(editor.value);
        renderLineNumbers(editor.value);
        editor.focus({ preventScroll: true });
        const end = editor.value.length;
        editor.setSelectionRange(end, end);
      },
    });

    timeline.fromTo(
      typingState,
      { index: 0 },
      {
        index: CODE_SAMPLE.length,
        duration: Math.max(CODE_SAMPLE.length * 0.015, 2.2),
        onUpdate: () => {
          const nextIndex = Math.round(typingState.index);
          const snippet = CODE_SAMPLE.slice(0, nextIndex);
          editor.value = snippet;
          renderFromSegments(nextIndex);
          renderLineNumbers(snippet);
          if (preElement) {
            preElement.scrollTop = editor.scrollTop;
          }
        },
      }
    );

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top 78%",
      once: true,
      onEnter: () => timeline.restart(),
    });

    const syncScroll = () => {
      const gutter = gutterRef.current;
      if (preElement) {
        preElement.scrollTop = editor.scrollTop;
        preElement.scrollLeft = editor.scrollLeft;
      }
      if (gutter) {
        gutter.style.transform = `translateY(${-editor.scrollTop}px)`;
      }
    };

    const handleInput = () => {
      renderFullHighlight(editor.value);
      renderLineNumbers(editor.value);
      syncScroll();
    };

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      event.preventDefault();
      const start = editor.selectionStart ?? 0;
      const end = editor.selectionEnd ?? 0;
      const value = editor.value;
      const insert = "  ";
      editor.value = `${value.slice(0, start)}${insert}${value.slice(end)}`;
      const caret = start + insert.length;
      editor.setSelectionRange(caret, caret);
      renderFullHighlight(editor.value);
      renderLineNumbers(editor.value);
      syncScroll();
    };

    editor.addEventListener("input", handleInput);
    editor.addEventListener("scroll", syncScroll);
    editor.addEventListener("keydown", handleTabKey);

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      timeline.kill();
      editor.removeEventListener("input", handleInput);
      editor.removeEventListener("scroll", syncScroll);
      editor.removeEventListener("keydown", handleTabKey);
    };
  }, []);

  return (
    <div ref={containerRef} className="animated-code" data-state="idle">
      <div ref={innerRef} className="animated-code__inner">
        <pre className="animated-code__pre language-php">
          <code ref={codeRef} className="animated-code__code language-php" />
        </pre>
        <div className="animated-code__gutter" aria-hidden="true">
          <ol ref={gutterRef} className="animated-code__line-numbers" />
        </div>
        <textarea ref={editorRef} className="animated-code__textarea" aria-label="Editable code sample" data-gramm="false" data-gramm_editor="false" data-enable-grammarly="false" />
      </div>
    </div>
  );
};

export default AnimatedCode;
