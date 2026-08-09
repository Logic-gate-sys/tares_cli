import { useMemo } from "react";


type ScatteredLetter = {
  id: number;
  char: string;
  top: string;
  left: string;
  rotate: string;
}

export function useAnimation() {
  const handleKeyDownAnimation = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length > 1 && e.key !== " ") return;

    const char = e.key;
    const inputElement = e.currentTarget;
    const rect = inputElement.getBoundingClientRect();

    // Spawn a ghost text element
    const ghost = document.createElement("div");
    ghost.className = "ghost-letter";
    ghost.textContent = char;

    // Apply exact custom styles dynamically
    ghost.style.position = "fixed";
    ghost.style.pointerEvents = "none";
    ghost.style.zIndex = "1000";
    ghost.style.fontFamily = '"Bricolage Grotesque", sans-serif';
    ghost.style.fontWeight = "800";
    ghost.style.color = "#121721";
    ghost.style.textShadow = "2px 2px 0px rgba(18, 23, 33, 0.2)";
    ghost.style.fontSize = "20px";
    ghost.style.transition =
      "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    ghost.style.textTransform = "uppercase";

    // Start coordinates: bottom viewport frame edge
    const startX = Math.random() * window.innerWidth;
    const startY = window.innerHeight + 50;

    ghost.style.left = `${startX}px`;
    ghost.style.top = `${startY}px`;
    ghost.style.transform = `rotate(${Math.random() * 360}deg) scale(2)`;

    document.body.appendChild(ghost);

    // Calculate alignment positioning matrices based on input length attributes
    const charWidth = 10;
    const paddingLeft = 16;
    const currentLength = inputElement.value.length;
    const targetX = rect.left + paddingLeft + currentLength * charWidth;
    const targetY = rect.top + rect.height / 2 - 10;

    // FIX 1: Safely capture the original text color only once
    if (!inputElement.dataset.originalColor) {
      const computedColor = window.getComputedStyle(inputElement).color;
      // Safeguard against capturing "transparent" if anything goes wrong
      inputElement.dataset.originalColor =
        computedColor !== "transparent" &&
          computedColor !== "rgba(0, 0, 0, 0)"
          ? computedColor
          : "#121721";
    }

    // FIX 2: Increment tracking counter for active character animations
    const activeAnims =
      parseInt(inputElement.dataset.activeAnims || "0", 10) + 1;
    inputElement.dataset.activeAnims = activeAnims.toString();

    requestAnimationFrame(() => {
      ghost.style.left = `${targetX}px`;
      ghost.style.top = `${targetY}px`;
      ghost.style.transform = "rotate(0deg) scale(1)";

      inputElement.style.color = "transparent";

      setTimeout(() => {
        ghost.style.opacity = "0";

        // Decrement active animation count
        const currentAnims =
          parseInt(inputElement.dataset.activeAnims || "0", 10) - 1;
        inputElement.dataset.activeAnims = currentAnims.toString();

        // Only restore the true color if no other letter streams are landing
        if (currentAnims <= 0) {
          inputElement.style.color =
            inputElement.dataset.originalColor || "";
          inputElement.removeAttribute("data-original-color");
          inputElement.removeAttribute("data-active-anims");
        }

        setTimeout(() => ghost.remove(), 100);
      }, 400);
    });
  };

  // 1. Memoize randomized decorative letter nodes to prevent layout shifts on recalculation
  const backgroundLetters = useMemo<ScatteredLetter[]>(() => {
    const pool = ["A", "E", "R", "S", "T", "L", "I", "O"];
    return pool.map((char, idx) => ({
      id: idx,
      char,
      top: `${5 + Math.random() * 85}%`,
      left: `${2 + Math.random() * 95}%`,
      rotate: `${Math.random() * 60 - 30}deg`,
    }));
  }, []);

  return { handleKeyDownAnimation, backgroundLetters }
}
