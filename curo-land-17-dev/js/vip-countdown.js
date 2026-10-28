let vipCountdownInterval = null;
export function stopVipCountdown() {
  clearInterval(vipCountdownInterval);
  vipCountdownInterval = null;
}
export function startVipCountdown(title, endsAt) {
  if (!endsAt) return;
  const end = new Date(endsAt).getTime();
  if (!Number.isFinite(end)) return;
  title.classList.add("vip-timer-popup__countdown");
  title.replaceChildren();
  let previous = "";
  const tick = () => {
    const minutes = Math.max(0, Math.ceil((end - Date.now()) / 60000));
    const days = String(Math.floor(minutes / 1440)).padStart(2, "0");
    const hours = String(Math.floor(minutes / 60) % 24).padStart(2, "0");
    const mins = String(minutes % 60).padStart(2, "0");
    const value = `${days}D:${hours}H:${mins}M`;
    if (value === previous) return;
    title.setAttribute("aria-label", `${Number(days)} días, ${Number(hours)} horas, ${Number(mins)} minutos`);
    const rebuild = value.length !== previous.length;
    if (rebuild) title.replaceChildren();
    [...value].forEach((char, index) => {
      let slot = title.children[index];
      if (!slot) {
        slot = document.createElement("span");
        slot.className = /\d/.test(char) ? "vip-timer-popup__digit" : "vip-timer-popup__separator";
        slot.classList.toggle("vip-timer-popup__separator--colon", char === ":");
        slot.setAttribute("aria-hidden", "true");
        title.append(slot);
      }
      if (!rebuild && char === previous[index]) return;
      const old = slot.firstElementChild;
      const next = document.createElement("span");
      next.textContent = char;
      slot.replaceChildren(next);
      if (old && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        slot.append(old);
        const options = { duration: 420, easing: "cubic-bezier(.22, 1, .36, 1)" };
        next.animate([{ transform: "translateY(100%)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], options);
        const animation = old.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-100%)", opacity: 0 }], options);
        animation.onfinish = () => old.remove();
      }
    });
    previous = value;
    if (!minutes) stopVipCountdown();
  };
  vipCountdownInterval = setInterval(tick, 1000);
  tick();
}
