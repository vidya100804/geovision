import { useEffect, useRef } from "react";
import "./Shuffle.css";

export default function Shuffle({
  text,
  shuffleDirection = "right",
  duration = 350,
  stagger = 30,
  triggerOnHover = true,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const letters = el.querySelectorAll("span");

    letters.forEach((span, i) => {
      span.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;
      span.style.transitionDelay = `${i * stagger}ms`;
      span.style.transform = "translateY(40px)";
      span.style.opacity = "0";
    });

    requestAnimationFrame(() => {
      letters.forEach((span) => {
        span.style.transform = "translateY(0)";
        span.style.opacity = "1";
      });
    });

    if (triggerOnHover) {
      el.addEventListener("mouseenter", () => {
        letters.forEach((span) => {
          span.style.transform = "translateY(40px)";
          span.style.opacity = "0";
        });
        setTimeout(() => {
          letters.forEach((span) => {
            span.style.transform = "translateY(0)";
            span.style.opacity = "1";
          });
        }, 50);
      });
    }
  }, []);

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
