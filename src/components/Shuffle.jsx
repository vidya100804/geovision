import { useEffect, useRef } from "react";
import "./Shuffle.css";

export default function Shuffle({
  text,
  shuffleDirection = "right",
  duration = 1200,
  stagger = 80,
  triggerOnHover = false,
}) {
  const ref = useRef(null);

  const getTransform = (hidden = true) => {
    const distance = hidden ? 40 : 0;

    switch (shuffleDirection) {
      case "left":
        return `translateX(${hidden ? -distance : 0}px)`;
      case "right":
        return `translateX(${hidden ? distance : 0}px)`;
      case "up":
        return `translateY(${hidden ? -distance : 0}px)`;
      default:
        return `translateY(${hidden ? distance : 0}px)`;
    }
  };

  const animateIn = () => {
    const letters = ref.current?.querySelectorAll("span");
    if (!letters) return;

    letters.forEach((span, i) => {
      span.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;
      span.style.transitionDelay = `${i * stagger}ms`;
      span.style.transform = getTransform(false);
      span.style.opacity = "1";
    });
  };

  const animateOut = () => {
    const letters = ref.current?.querySelectorAll("span");
    if (!letters) return;

    letters.forEach((span, i) => {
      span.style.transitionDelay = `${i * stagger}ms`;
      span.style.transform = getTransform(true);
      span.style.opacity = "0";
    });
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const letters = el.querySelectorAll("span");

    // Initial hidden state
    letters.forEach((span, i) => {
      span.style.transition = "none";
      span.style.transitionDelay = `${i * stagger}ms`;
      span.style.transform = getTransform(true);
      span.style.opacity = "0";
    });

    requestAnimationFrame(() => {
      animateIn();
    });

    if (triggerOnHover) {
      el.addEventListener("mouseenter", () => {
        animateOut();
        setTimeout(animateIn, 80);
      });
    }
  }, [text, shuffleDirection, duration, stagger, triggerOnHover]);

  return (
    <p ref={ref} className="shuffle-parent">
      {text.split("").map((char, i) => (
        <span key={i} className="shuffle-char">
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </p>
  );
}
