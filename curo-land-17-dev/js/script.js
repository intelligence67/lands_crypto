import { initHeader } from "./header.js";
import { initVipVisibility } from "./vip-status.js";
import { initVipPerks } from "./vip-perks.js";
import { refreshVipData, showVipDataError } from "./vip-integration.js";
import "./vip-popups.js";

window.setVipStatus = initVipVisibility;

document.addEventListener("DOMContentLoaded", () => {
  initFaq();
  initSliders();
  initHeader();
  initVipVisibility();
  initVipPerks();

  if (document.body.hasAttribute("data-vip-integration")) {
    showVipDataError();
    refreshVipData();
  }
});

document.addEventListener("vip:refresh", () => {
  if (document.body.hasAttribute("data-vip-integration")) refreshVipData();
});

function initFaq() {
  document.querySelectorAll(".faq__item").forEach((item) => {
    item.querySelector(".faq__question")?.addEventListener("click", () => {
      item.classList.toggle("is-active");
    });
  });
}

function initSliders() {
  document.querySelectorAll(".js-slider").forEach((slider) => {
    new Swiper(slider.querySelector(".swiper"), {
      slidesPerView: "auto",
      spaceBetween: 10,
      speed: 600,
      grabCursor: true,
      navigation: {
        nextEl: slider.querySelector(".slider__next"),
        prevEl: slider.querySelector(".slider__prev"),
      },
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll("details.benefit-level").forEach((item) => {
    const summary = item.querySelector(":scope > summary");
    if (!summary) return;
    let expanded = item.open;
    let animation = null;
    const sync = () => { item.dataset.expanded = String(expanded); };
    const finish = () => {
      if (animation) { animation.onfinish = null; animation.cancel(); animation = null; }
      item.open = expanded;
      item.classList.remove("is-animating");
      sync();
    };
    sync();
    summary.addEventListener("click", (event) => {
      if (event.target.closest("a, button, input, select, textarea")) return;
      event.preventDefault();
      const start = item.getBoundingClientRect().height;
      if (animation) { animation.onfinish = null; animation.cancel(); animation = null; }
      expanded = !expanded;
      sync();
      item.open = true;
      const styles = getComputedStyle(item);
      const closed = summary.getBoundingClientRect().height
        + parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom)
        + parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);
      const end = expanded ? item.getBoundingClientRect().height : closed;
      if (reducedMotion.matches) { finish(); return; }
      item.classList.add("is-animating");
      animation = item.animate({ height: [start + "px", end + "px"] },
        { duration: 260, easing: "cubic-bezier(.2, 0, .2, 1)" });
      animation.onfinish = finish;
    });
    item.addEventListener("toggle", () => {
      if (!animation) { expanded = item.open; sync(); }
    });
    window.addEventListener("resize", () => { if (animation) finish(); });
    reducedMotion.addEventListener("change", () => { if (animation && reducedMotion.matches) finish(); });
  });
});

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href="#vip-perks"], a[href="#vip-next"]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const target = document.getElementById(link.hash.slice(1));
  if (!target || target.hidden) return;
  event.preventDefault();
  if (location.hash !== link.hash) history.pushState(null, "", link.hash);
  target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
});
