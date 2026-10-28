export function initVipPerks() {
  const block = document.querySelector(".vip-perks");
  if (block && !block.dataset.initialized) {
    block.dataset.initialized = "true";

    block.querySelectorAll(".vip-calendar__filter").forEach((button) => {
      button.addEventListener("click", () =>
        filterVipCalendar(button.dataset.category),
      );
    });

    block.addEventListener("click", (event) => {
      const button = event.target.closest(
        ".perk-card__action, .perk-event__action",
      );
      if (!button || button.disabled || button.matches("a")) return;
      const card = button.closest("[data-benefit], [data-event]");
      block.dispatchEvent(
        new CustomEvent("vip:action", {
          bubbles: true,
          detail: {
            action: button.dataset.action,
            benefit: card.dataset.benefit || null,
            eventId: card.dataset.event || null,
          },
        }),
      );
    });

    filterVipCalendar("all");
  }

  document
    .querySelectorAll(".vip-perks, .vip-benefit-levels")
    .forEach((section) => {
      if (section.dataset.detailsInitialized) return;
      section.dataset.detailsInitialized = "true";
      section.addEventListener("click", (event) => {
        const button = event.target.closest(".perk-info, .perk-card__details");
        if (!button) return;
        const card = button.closest("article");
        const dialog = document.querySelector(".perk-dialog");
        if (!dialog) return;
        dialog.querySelector("h3").textContent =
          card.querySelector("h3, h4").textContent;
        dialog.querySelector("p").textContent =
          card.querySelector("p").textContent;
        dialog.showModal();
      });
    });
}

function filterVipCalendar(category) {
  const block = document.querySelector(".vip-calendar");
  if (!block) return;
  const slides = [...block.querySelectorAll(".swiper-slide")];

  block.querySelectorAll(".vip-calendar__filter").forEach((button) => {
    const active = button.dataset.category === category;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
    const count = slides.filter(
      (slide) =>
        button.dataset.category === "all" ||
        slide.dataset.category === button.dataset.category,
    ).length;
    button.querySelector("sup").textContent = count || "";
  });

  slides.forEach((slide) => {
    slide.hidden = category !== "all" && slide.dataset.category !== category;
  });
  block.querySelector(".vip-calendar__empty").hidden = slides.some(
    (slide) => !slide.hidden,
  );
  const swiper = block.querySelector(".swiper").swiper;
  if (swiper) {
    swiper.update();
    swiper.slideTo(0, 0);
  }
}

export function renderVipPerks(status) {
  const level = /^vip-[1-4]$/.test(status) ? Number(status.slice(-1)) : 0;
  const unavailable = status === "unavallable";
  const names = ["I", "II", "III", "IV"];
  const currentName = names[Math.max(level, 1) - 1];
  const block = document.querySelector(".vip-perks");

  if (block) {
    const errorIcon = `
      <svg class="vip-account__icon perk-error-icon" width="18" height="18" aria-hidden="true">
        <use href="./img/vip-icon-info.svg#icon"></use>
      </svg>
    `;

    block.querySelector(".vip-calendar__error").innerHTML =
      `${errorIcon}<span>No se pudieron cargar los datos</span>`;

    block.querySelectorAll(".perk-ribbon").forEach((ribbon) => {
      if (!ribbon.querySelector(".perk-error-icon")) {
        ribbon.insertAdjacentHTML("afterbegin", errorIcon);
      }
      ribbon.querySelector(".perk-error-icon").style.display =
        unavailable ? "block" : "none";
    });

    const imageLevel = Math.max(level, 1);
    const benefitImages = {
      cashback: [1, 13, 14, 15][imageLevel - 1],
      tournaments: 2,
      support: 3,
      bets: 4,
      chips: 5,
      limits: 6,
      processing: 7,
      settings: 8,
      methods: 9,
      odds: 10,
      tickets: 11,
    };

    block
      .querySelectorAll(
        ".vip-perks__cards .perk-card, .vip-perks__extras .perk-row"
      )
      .forEach((card) => {
        const image = card.querySelector(".perk-card__image, .perk-row__image");
        const imageNumber = benefitImages[card.dataset.benefit];

        if (image && imageNumber !== undefined) {
          image.src =
            `./img/vip-icons-table/vip-icon-${imageLevel}_${imageNumber}.webp`;
        }
      });

    const calendar = block.querySelector(".vip-calendar");
    calendar.querySelector(".vip-calendar__image").src =
      `./img/vip-icons-table/vip-icon-${imageLevel}_12.webp`;

    const eventImages = {
      1: 4,
      2: 17,
      3: 19,
      4: level === 4 ? 16 : 18,
      5: 2,
      6: 16,
    };

    calendar.querySelectorAll(".perk-event").forEach((card) => {
      const imageNumber = eventImages[card.dataset.event];
      const image = card.querySelector(".perk-event__image");

      if (image && imageNumber !== undefined) {
        image.src =
          `./img/vip-icons-table/vip-icon-${imageLevel}_${imageNumber}.webp`;
      }
    });

    calendar.classList.toggle("is-locked", !level);
    calendar.querySelector(".vip-calendar__error").hidden = !unavailable;
    calendar.querySelector(".vip-calendar__filters").hidden = unavailable;
    calendar.querySelector(".vip-calendar__slider").hidden = unavailable;
    calendar.querySelector(".vip-calendar__empty").hidden = true;
    updatePerkBadge(
      calendar,
      level > 0,
      unavailable ? "Bloqueado" : `VIP ${currentName}`,
    );

    calendar.querySelectorAll(".perk-event").forEach((card) => {
      const locked = unavailable || level < Number(card.dataset.level);
      const button = card.querySelector(".perk-event__action");
      const isClaim = card.dataset.event === "1" && !locked;
      card.classList.toggle("is-locked", locked);
      card.querySelector(".perk-event__requirement").hidden = !locked;
      button.disabled = !locked && !isClaim;
      button.dataset.action = locked
        ? "deposit"
        : isClaim
          ? "claim"
          : "scheduled";
      button.textContent = locked
        ? "Depositar"
        : isClaim
          ? "Reclamar"
          : card.querySelector("time").textContent;
    });

    const raffle = calendar.querySelector('[data-event="4"]');
    raffle.querySelector("h4").textContent =
      level === 4 ? "iPhone Duo" : "Diamante de 100 quilates";
    raffle.querySelector("p").textContent =
      level === 4
        ? "Sorteo privado de tecnología y gadgets"
        : "Sorteo exclusivo";

    block.querySelectorAll(".perk-card").forEach((card) => {
      const key = card.dataset.benefit;
      const locked = !level;
      const ribbon = card.querySelector(".perk-ribbon");
      const button = card.querySelector(".perk-card__action");
      const progress = card.querySelector(".perk-card__progress");
      card.classList.toggle("is-locked", locked);
      ribbon.hidden = !!level;
      ribbon.querySelector("img").hidden = unavailable;
      ribbon.querySelector("span").textContent = unavailable
        ? "No se pudieron cargar los datos"
        : "Depositá $500 para desbloquear el nivel";
      updatePerkBadge(
        card,
        !locked,
        unavailable
          ? "Bloqueado"
          : `VIP ${key === "tournaments" ? "I" : currentName}`,
      );
      button.hidden = unavailable;
      if (button.matches("button")) {
        button.disabled = !locked && key === "cashback";
      }
      const actions = {
        cashback: "scheduled",
        support: "support",
        tournaments: "tournaments",
        bets: "sports",
        chips: "casino",
      };
      const labels = {
        cashback: "9 de septiembre",
        support: "Contactar",
        tournaments: "Ver torneos",
        bets: "Apostar",
        chips: "Jugar",
      };
      button.dataset.action = locked ? "deposit" : actions[key];
      button.textContent = locked ? "Depositar" : labels[key];
      if (progress) progress.hidden = locked;

      if (key === "cashback") {
        const percent = [10, 15, 20, 25][Math.max(level, 1) - 1];
        card.querySelector("h3").textContent = `Cashback ${percent}%`;
        setPerkProgress(card, "$99.999.999", "$99.999.999", 100);
      }
      if (key === "support") {
        card.querySelector(".perk-card__inner > p").textContent = [
          "Soporte VIP general",
          "Asesor personal",
          "Atención personalizada del propietario del casino",
          "Contacto directo con el propietario del casino",
        ][Math.max(level, 1) - 1];
      }
      if (key === "bets") {
        const total = level ? [1, 2, 3, 5][level - 1] : 2;
        card.querySelector(".perk-card__inner > p").textContent =
          total === 1 ? "1 apuesta al mes" : `${total} apuestas al mes`;
        setPerkProgress(
          card,
          "1 apuesta",
          total === 1 ? "1 apuesta" : `${total} apuestas`,
          100 / total,
        );
      }
      if (key === "chips") {
        const games = level ? [1, 2, 4, 6][level - 1] : 2;
        card.querySelector(".perk-card__inner > p").textContent =
          games === 1
            ? "1 juego VIP disponible"
            : `${games} juegos VIP disponibles`;
        setPerkProgress(card, "0 Chips", "250 Chips", 0);
      }
    });

    block.querySelectorAll(".vip-perks__extras .perk-row").forEach((card) => {
      const locked = unavailable || level < Number(card.dataset.level);
      const ribbon = card.querySelector(".perk-ribbon");
      card.classList.toggle("is-locked", locked);
      ribbon.hidden = !locked;
      ribbon.querySelector("img").hidden = unavailable;
      ribbon.querySelector("span").textContent = unavailable
        ? "No se pudieron cargar los datos"
        : `Depositá ${card.dataset.level === "2" ? "$4.500" : "$500"} para desbloquear este beneficio`;
      if (card.dataset.benefit === "tickets") {
        card.querySelector("p").textContent =
          level === 4
            ? "Palcos VIP y los mejores estadios del mundo"
            : level === 3
              ? "En tu región, experiencias y viajes"
              : "En tu región";
      }
    });

    const activeFilter = calendar.querySelector(
      ".vip-calendar__filter.is-active",
    );
    if (!unavailable)
      filterVipCalendar(activeFilter?.dataset.category || "all");
  }

  document.querySelectorAll(".benefit-level").forEach((group) => {
    const groupLevel = Number(group.dataset.level);
    const locked = unavailable || groupLevel > level;
    const current = !unavailable && groupLevel === level;

    const imageLevel = Math.max(level, 1);
    const benefitImages = {
      cashback: [1, 13, 14, 15][groupLevel - 1],
      tournaments: 2,
      support: 3,
      bets: 4,
      chips: 5,
      limits: 6,
      processing: 7,
      settings: 8,
      methods: 9,
      odds: 10,
      tickets: 11,
      calendar: 12,
      draws: 16,
      gifts: 17,
      luxury: 18,
    };

    group.querySelectorAll(".perk-row").forEach((card) => {
      const image = card.querySelector(".perk-row__image");
      const imageNumber = benefitImages[card.dataset.benefit];

      if (image && imageNumber !== undefined) {
        image.src =
          `./img/vip-icons-table/vip-icon-${imageLevel}_${imageNumber}.webp`;
      }
    });

    group.classList.toggle("is-locked", locked);
    group.classList.toggle("is-current", current);
    group.classList.toggle("is-available", !unavailable && groupLevel < level);
    group.classList.toggle("is-unavailable", unavailable);

    const icon = unavailable
      ? "vip-account-clock.svg"
      : locked
        ? "vip-next-lock.svg"
        : current
          ? "vip-account-star.svg"
          : "vip-account-check.svg";

    const text = unavailable
      ? "No se pudieron cargar los datos"
      : locked
        ? "Bloqueado"
        : current
          ? "Tu nivel"
          : "Disponible";

    const iconUrl = new URL(`./img/${icon}`, document.baseURI).href;

    group.querySelector(".benefit-level__status").innerHTML = `
      ${unavailable
        ? '<svg width="16" height="16" aria-hidden="true" style="flex-shrink: 0"><use href="./img/vip-unavailable-clock.svg#icon"></use></svg>'
        : `<span class="benefit-level__icon" style="--icon: url('${iconUrl}')"></span>`}
      <span>${text}</span>
    `;

    group.querySelector(".benefit-level__requirement").hidden =
      unavailable || !locked;

    if (group.dataset.status !== status) {
      group.open = !unavailable || groupLevel === 1;
    }

    group.dataset.status = status;
  });
}

function updatePerkBadge(card, available, label) {
  const badge = card.querySelector(".perk-badge");
  const use = badge.querySelector("use");

  badge.querySelector(".perk-badge__text").textContent = label;

  if (use) {
    use.setAttribute(
      "href",
      available
        ? "./img/vip-account-check.svg#icon"
        : "./img/vip-next-lock.svg#icon"
    );
  } else {
    const icon = badge.querySelector('span[aria-hidden="true"]');

    if (icon) {
      icon.textContent = available ? "✓" : "";
    }
  }
}

function setPerkProgress(card, valueLabel, totalLabel, percent) {
  const block = card.querySelector(".perk-card__progress");
  block.querySelector("strong").textContent = valueLabel;
  block.querySelector("small").textContent = totalLabel;
  block.querySelector("progress").value = Math.min(100, Math.max(0, percent));
}
