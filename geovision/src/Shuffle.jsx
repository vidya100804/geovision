import React, { useRef, useEffect, useState, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import "./Shuffle.css";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

const Shuffle = ({
  text,
  className = "",
  style = {},
  shuffleDirection = "right",
  duration = 0.35,
  maxDelay = 0,
  ease = "power3.out",
  threshold = 0.1,
  rootMargin = "-100px",
  tag = "p",
  textAlign = "center",
  onShuffleComplete,
  shuffleTimes = 1,
  animationMode = "evenodd",
  loop = false,
  loopDelay = 0,
  stagger = 0.03,
  scrambleCharset = "",
  colorFrom,
  colorTo,
  triggerOnce = true,
  respectReducedMotion = true,
  triggerOnHover = true,
}) => {
  const ref = useRef(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [ready, setReady] = useState(false);

  const splitRef = useRef(null);
  const wrappersRef = useRef([]);
  const tlRef = useRef(null);
  const playingRef = useRef(false);
  const hoverHandlerRef = useRef(null);

  useEffect(() => {
    if ("fonts" in document) {
      if (document.fonts.status === "loaded") setFontsLoaded(true);
      else document.fonts.ready.then(() => setFontsLoaded(true));
    } else setFontsLoaded(true);
  }, []);

  const scrollTriggerStart = useMemo(() => {
    const startPct = (1 - threshold) * 100;
    return `top ${startPct}%`;
  }, [threshold]);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return;

      const el = ref.current;

      const teardown = () => {
        if (tlRef.current) {
          tlRef.current.kill();
          tlRef.current = null;
        }
        try {
          splitRef.current?.revert();
        } catch {}
        wrappersRef.current = [];
      };

      const build = () => {
        teardown();

        splitRef.current = new GSAPSplitText(el, {
          type: "chars",
          charsClass: "shuffle-char",
        });

        const chars = splitRef.current.chars || [];
        const rolls = Math.max(1, Math.floor(shuffleTimes));

        chars.forEach((ch) => {
          const w = ch.getBoundingClientRect().width;
          if (!w) return;

          const wrap = document.createElement("span");
          wrap.className = "shuffle-char-wrapper";
          wrap.style.width = `${w}px`;

          const inner = document.createElement("span");

          wrap.appendChild(inner);
          ch.parentNode.insertBefore(wrap, ch);
          inner.appendChild(ch);

          for (let i = 0; i < rolls; i++) {
            const clone = ch.cloneNode(true);
            if (scrambleCharset)
              clone.textContent =
                scrambleCharset[
                  Math.floor(Math.random() * scrambleCharset.length)
                ];
            inner.appendChild(clone);
          }

          const startX = shuffleDirection === "right" ? -w * rolls : 0;
          const endX = shuffleDirection === "right" ? 0 : -w * rolls;

          gsap.set(inner, { x: startX });
          inner.dataset.endX = endX;

          wrappersRef.current.push(inner);
        });
      };

      const play = () => {
        const tl = gsap.timeline({
          onComplete: () => {
            setReady(true);
            onShuffleComplete?.();
          },
        });

        tl.to(wrappersRef.current, {
          x: (i, el) => Number(el.dataset.endX),
          duration,
          ease,
          stagger,
        });

        tlRef.current = tl;
      };

      const create = () => {
        build();
        play();
      };

      ScrollTrigger.create({
        trigger: el,
        start: scrollTriggerStart,
        once: triggerOnce,
        onEnter: create,
      });

      return () => teardown();
    },
    { scope: ref }
  );

  const classes = useMemo(
    () => `shuffle-parent ${ready ? "is-ready" : ""} ${className}`,
    [ready, className]
  );

  const Tag = tag;
  return (
    <Tag ref={ref} className={classes} style={{ textAlign, ...style }}>
      {text}
    </Tag>
  );
};

export default Shuffle;
