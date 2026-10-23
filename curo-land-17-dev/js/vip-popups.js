// Демонстрационные данные. Для API передайте реальные значения через setVipPopupData().
const popupParams = new URLSearchParams(location.search);
const popupLevel = Number((popupParams.get("vip") || "").replace("vip-", "")) || 0;
const popupThresholds = [1520, 7600000, 15200000, 76250000];
const popupTarget = popupThresholds[Math.min(popupLevel, 3)];
const popupErrorMode = popupParams.get("error") || "all";
const popupUnavailable = popupParams.get("vip") === "unavallable";
const popupEmpty = popupParams.get("deposits") === "empty" || (!popupLevel && !popupUnavailable);
const popupConfirmed = popupEmpty ? 0 : popupTarget / 2;
const popupDemoDeposits = [
  { id: "demo-pending", status: "pending", amount: 123000, date: "7 sep 2026", time: "11:23:24" },
  { id: "demo-confirmed", status: "confirmed", amount: popupConfirmed, date: "2 sep 2026", time: "10:21:05" },
  { id: "demo-expired", status: "expired", amount: 10000, date: "23 ago 2026", time: "15:26:53" },
  { id: "demo-canceled", status: "canceled", amount: 500, date: "12 ago 2026", time: "13:45:12" },
  { id: "demo-expired-2", status: "expired", amount: 5000, date: "5 ago 2026", time: "11:12:34" },
  { id: "demo-expired-3", status: "expired", amount: 2500, date: "1 ago 2026", time: "09:05:12" },
].map((deposit, index) => ({
  ...deposit,
  ars: deposit.amount * 100,
  rate: 100,
  method: "Mercado Pago •••• 4417",
  transaction: `TX-9F42-118${index}-AC`,
}));

let vipPopupData = {
  confirmed: popupConfirmed,
  pending: popupEmpty ? 0 : 123000,
  target: popupTarget,
  targetLevel: Math.min(popupLevel + 1, 4),
  period: "1 sep – 7 sep",
  updated: "Actualizado hoy 7 sep · 02:34 (ART)",
  unavailable: popupUnavailable,
  totalsUnavailable: popupUnavailable && popupErrorMode !== "deposits",
  depositsUnavailable: popupUnavailable && popupErrorMode !== "sum",
  deposits: popupEmpty ? [] : popupDemoDeposits.slice(0, popupParams.get("deposits") === "short" ? 3 : 6),
};
const popupStatuses = {
  pending: { label: "En proceso", mark: "hourglass", color: "is-pending", icon: "history" },
  confirmed: { label: "Confirmado", mark: "check", color: "is-success", icon: "history" },
  expired: { label: "Confirmado, vencido", mark: "check", color: "is-muted", icon: "expired" },
  canceled: { label: "Cancelado", mark: "cancel", color: "is-muted", icon: "expired" },
};
let popupOpener = null;
let popupActive = null;
let popupDepositId = null;
let popupScroll = 0;
let popupBodyStyle = "";
let popupListScroll = 0;

function popupMoney(value) {
  return "$" + new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(value);
}
function popupEscape(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
function popupIcon(name, className = "", size = 18) {
  return `<svg class="vip-modal__icon ${className}" width="${size}" height="${size}" aria-hidden="true"><use href="./img/vip-popup-icons.svg#${name}"></use></svg>`;
}
function renderVipPopupProgress() {
  const modal = document.querySelector(".vip-progress-popup");
  const data = vipPopupData;
  const error = modal.querySelector(".vip-modal__error");
  modal.querySelector(".vip-progress-popup__summary").prepend(error);
  renderVipPopupError(error);
  modal.querySelectorAll(".vip-progress-popup__totals, .vip-progress-popup__bar, .vip-progress-popup__periods").forEach((node) => { node.hidden = !!data.unavailable; });
  modal.querySelector('[data-popup-action="deposit"]').hidden = !!data.unavailable;
  modal.querySelector('[data-popup-action="support"]').hidden = !data.unavailable;
  const set = (selector, text) => { modal.querySelector(selector).textContent = text; };
  set(".vip-progress-popup__confirmed", data.unavailable ? "—" : popupMoney(data.confirmed));
  set(".vip-progress-popup__remaining", data.unavailable ? "—" : popupMoney(Math.max(0, data.target - data.confirmed)));
  set(".vip-progress-popup__pending", data.unavailable ? "—" : popupMoney(data.pending));
  set(".vip-progress-popup__target-label", `Falta para VIP ${["I", "II", "III", "IV"][data.targetLevel - 1]}`);
  set(".vip-progress-popup__period", data.period);
  set(".vip-modal__updated", data.updated);
  modal.querySelector(".vip-modal__error").hidden = !data.unavailable;
  modal.querySelector("progress").value = data.unavailable || !data.target ? 0 : Math.min(100, data.confirmed / data.target * 100);
}
function renderVipPopupError(node) {
  node.innerHTML = `${popupIcon("info", "", 18)}<div><p>No se pudieron cargar los datos</p><small>Actualizaremos automáticamente en aproximadamente 15 minutos</small></div>`;
}
function renderVipPopupDeposits() {
  const modal = document.querySelector(".vip-deposits-popup");
  const data = vipPopupData;
  const totalsUnavailable = data.totalsUnavailable ?? data.unavailable;
  const depositsUnavailable = data.depositsUnavailable ?? data.unavailable;
  const failed = data.unavailable || totalsUnavailable || depositsUnavailable;
  const error = modal.querySelector(".vip-modal__error");
  renderVipPopupError(error);
  if (depositsUnavailable) modal.querySelector(".vip-deposits-popup__list").after(error);
  else modal.querySelector(".vip-deposits-popup__summary").append(error);
  modal.querySelector('.vip-deposits-popup__list-view [data-popup-action="deposit"]').hidden = !!failed;
  modal.querySelector(".vip-deposits-popup__period").hidden = !!totalsUnavailable;
  const mark = modal.querySelector(".vip-deposits-popup__credited svg");
  mark.classList.toggle("is-success", !totalsUnavailable);
  mark.classList.toggle("is-muted", !!totalsUnavailable);
  mark.querySelector("use").setAttribute("href", `./img/vip-popup-icons.svg#${totalsUnavailable ? "hourglass" : "check"}`);
  modal.querySelector(".vip-deposits-popup__pending svg").classList.toggle("is-muted", !!totalsUnavailable);
  modal.querySelector(".vip-deposits-popup__list-view").hidden = false;
  modal.querySelector(".vip-deposits-popup__detail-view").hidden = true;
  modal.querySelector(".vip-modal__updated").textContent = data.updated;
  modal.querySelector(".vip-deposits-popup__credited strong").textContent = totalsUnavailable ? "$" : popupMoney(data.confirmed);
  modal.querySelector(".vip-deposits-popup__pending b").textContent = totalsUnavailable ? "$" : popupMoney(data.pending);
  modal.querySelector(".vip-deposits-popup__period").textContent = `Acreditado · ${data.period}`;
  modal.querySelector(".vip-modal__error").hidden = !failed;
  modal.querySelector(".vip-deposits-popup__empty").hidden = depositsUnavailable || data.deposits.length > 0;
  modal.querySelector(".vip-deposits-popup__note").hidden = depositsUnavailable || !data.deposits.length;
  modal.querySelector(".vip-deposits-popup__list").innerHTML = depositsUnavailable ? Array.from({ length: 5 }, () => `<div class="vip-popup-deposit is-muted is-unavailable"><span class="vip-popup-deposit__icon">${popupIcon("refresh", "", 22)}</span><span><span class="vip-popup-deposit__status">No disponible ${popupIcon("hourglass", "", 12)}</span><span class="vip-popup-deposit__amount">$</span></span></div>`).join("") : data.deposits.map((deposit) => {
    const state = popupStatuses[deposit.status];
    return `<button class="vip-popup-deposit ${state.color === "is-muted" ? "is-muted" : ""}" type="button" data-popup-deposit="${popupEscape(deposit.id)}">
      <span class="vip-popup-deposit__icon">${popupIcon(state.icon, "", 22)}</span>
      <span><span class="vip-popup-deposit__status"><span>${state.label}</span>${popupIcon(state.mark, state.color, 12)}</span><span class="vip-popup-deposit__amount">${popupMoney(deposit.amount)}</span></span>
      <span class="vip-popup-deposit__date"><small>${popupEscape(deposit.time)}</small><span>${popupEscape(deposit.date)}</span></span>
      ${popupIcon("next", "", 16)}
    </button>`;
  }).join("");
  modal.querySelector(".vip-deposits-popup__list").classList.toggle("is-scrollable", !depositsUnavailable && data.deposits.length > 3);
  modal.querySelector(".vip-deposits-popup__list").scrollTop = popupListScroll;
  modal.setAttribute("aria-label", "Todos los depósitos");
}
function renderVipPopupDetail(id) {
  const deposit = vipPopupData.deposits.find((item) => item.id === id);
  if (!deposit || (vipPopupData.depositsUnavailable ?? vipPopupData.unavailable)) return false;
  const modal = document.querySelector(".vip-deposits-popup");
  const state = popupStatuses[deposit.status];
  popupDepositId = id;
  modal.querySelector(".vip-deposits-popup__list-view").hidden = true;
  modal.querySelector(".vip-deposits-popup__detail-view").hidden = false;
  modal.querySelector(".vip-deposit-detail__icon").innerHTML = popupIcon(state.icon, state.color === "is-muted" ? "is-muted" : "", 22);
  modal.querySelector(".vip-deposit-detail__status").innerHTML = state.label + popupIcon(state.mark, state.color, 12);
  modal.querySelector(".vip-deposit-detail__amount").textContent = popupMoney(deposit.amount);
  modal.querySelector(".vip-deposit-detail__date").textContent = `${deposit.date} · ${deposit.time} (ART)`;
  const credited = deposit.status === "confirmed" || deposit.status === "expired";
  const fields = {
    ars: new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2 }).format(deposit.ars) + " ARS",
    rate: credited ? `1 USD = ${new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2 }).format(deposit.rate)} ARS` : "—",
    usd: credited ? popupMoney(deposit.amount) : "—",
    method: deposit.method,
    transaction: deposit.transaction,
    impact: deposit.status === "confirmed" ? "Cuenta para el progreso" : deposit.status === "pending" ? "Pendiente de confirmación" : "No cuenta para el progreso",
  };
  Object.entries(fields).forEach(([key, value]) => { modal.querySelector(`[data-field="${key}"]`).textContent = value; });
  modal.setAttribute("aria-label", "Detalle del depósito");
  return true;
}
function openVipPopup(view, id, opener = document.activeElement) {
  if (!["progress", "deposits", "detail", "new-level", "limits", "methods", "processing", "odds", "support"].includes(view)) return;
  const modal = document.querySelector(view === "support" ? ".vip-support-popup" : view === "odds" ? ".vip-odds-popup" : view === "processing" ? ".vip-processing-popup" : view === "methods" ? ".vip-methods-popup" : view === "limits" ? ".vip-limits-popup" : view === "new-level" ? ".vip-new-level" : view === "progress" ? ".vip-progress-popup" : ".vip-deposits-popup");
  if (!modal) return;
  if (view === "limits") renderVipLimits();
  if (view === "methods") renderVipMethods();
  if (view === "processing") renderVipProcessing();
  if (view === "odds") renderVipOdds();
  if (view === "support") renderVipSupport();
  if (view === "new-level" && !renderVipNewLevel()) return;
  if (view === "detail" && !renderVipPopupDetail(id)) return;
  if (view === "progress") renderVipPopupProgress();
  if (view === "deposits") renderVipPopupDeposits();
  if (!popupActive) {
    popupOpener = opener;
    popupScroll = window.scrollY;
    popupBodyStyle = document.body.style.cssText;
    Object.assign(document.body.style, { position: "fixed", top: `-${popupScroll}px`, left: "0", right: "0", width: "100%", overflow: "hidden" });
  }
  const previous = popupActive;
  popupActive = modal;
  if (previous && previous !== modal) previous.close();
  if (!modal.open) modal.showModal();

  modal.scrollTop = 0;
  const backTo = view === "deposits" && popupDepositId
    ? [...modal.querySelectorAll("[data-popup-deposit]")].find((item) => item.dataset.popupDeposit === popupDepositId)
    : null;
  (backTo || [...modal.querySelectorAll("[data-popup-close]")].find((item) => !item.closest("[hidden]")))?.focus({ preventScroll: true });
  if (view === "deposits") popupDepositId = null;
}
function closeVipPopup() {
  if (!popupActive) return;
  const modal = popupActive;
  if (modal.matches(".vip-new-level")) {
    document.cookie = `vip_new_level_dismissed_${popupLevel}=1; Max-Age=31536000; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  }
  popupActive = null;
  modal.close();
  document.body.style.cssText = popupBodyStyle;
  window.scrollTo(0, popupScroll);
  if (popupOpener?.isConnected) popupOpener.focus({ preventScroll: true });
  popupDepositId = null;
}
function emitVipPopupAction(action) {
  const deposit = vipPopupData.deposits.find((item) => item.id === popupDepositId);
  document.dispatchEvent(new CustomEvent("vip:action", { bubbles: true, detail: {
    action: action === "report" ? "support" : action,
    source: "vip-popup",
    reason: action === "report" ? "deposit-problem" : null,
    depositId: deposit?.id || null,
    transactionId: deposit?.transaction || null,
  } }));
  closeVipPopup();
}
function initVipPopupFaq() {
  document.querySelectorAll(".vip-progress-popup__faq details").forEach((item) => {
    let animation = null;
    let expanded = item.open;
    const summary = item.querySelector("summary");
    item.dataset.expanded = String(expanded);

    item.addEventListener("click", (event) => {
      // Ссылки и другие элементы управления внутри ответа сохраняют своё действие.
      if (event.target.closest("a, button, input, select, textarea")) return;
      event.preventDefault();
      const startHeight = item.getBoundingClientRect().height;
      if (animation) animation.cancel();
      expanded = !expanded;
      item.dataset.expanded = String(expanded);
      summary.focus({ preventScroll: true });
      item.style.height = "";
      item.open = true;
      const style = getComputedStyle(item);
      const collapsedHeight = summary.getBoundingClientRect().height
        + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
        + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
      const endHeight = expanded ? item.getBoundingClientRect().height : collapsedHeight;
      const finish = () => {
        item.open = expanded;
        item.style.height = "";
        animation = null;
      };
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finish();
        return;
      }
      animation = item.animate(
        { height: [`${startHeight}px`, `${endHeight}px`] },
        { duration: 260, easing: "cubic-bezier(.2, 0, .2, 1)" },
      );
      animation.onfinish = finish;
    });
  });
}

function initVipPopups() {
  // Навигация верхнего блока; обращения к поддержке остаются кнопками.
  const secondary = document.querySelector(".vip-account__secondary");
  if (secondary && (popupLevel === 4 || popupUnavailable)) {
    const support = document.createElement("button");
    support.type = "button";
    support.className = secondary.className;
    support.innerHTML = secondary.innerHTML;
    support.dataset.popupView = "support";
    secondary.replaceWith(support);
  }
  initVipPopupFaq();
  // Открываем отдельные попапы до общего обработчика perk-dialog.
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest('[data-benefit="limits"] .perk-info, [data-benefit="limits"] .perk-card__details, [data-popup-view="limits"], [data-benefit="methods"] .perk-info, [data-benefit="methods"] .perk-card__details, [data-popup-view="methods"], [data-benefit="processing"] .perk-info, [data-benefit="processing"] .perk-card__details, [data-popup-view="processing"], [data-benefit="odds"] .perk-info, [data-benefit="odds"] .perk-card__details, [data-popup-view="odds"], [data-benefit="support"] .perk-info, [data-benefit="support"] .perk-card__details, [data-popup-view="support"]');
    if (!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    openVipPopup(trigger.dataset.popupView || trigger.closest("[data-benefit]").dataset.benefit, null, trigger);
  }, true);
  document.querySelectorAll(".vip-modal").forEach((modal) => {
    modal.addEventListener("cancel", (event) => { event.preventDefault(); closeVipPopup(); });
    modal.addEventListener("close", () => { if (popupActive === modal && !modal.open) closeVipPopup(); });
    let outside = false;
    modal.addEventListener("pointerdown", (event) => { outside = event.target === modal && popupOutside(modal, event); });
    modal.addEventListener("click", (event) => {
      if (outside && event.target === modal && popupOutside(modal, event)) closeVipPopup();
      outside = false;
    });
  });
  document.querySelectorAll(".vip-account__expiry").forEach((timer) => {
    timer.tabIndex = 0;
    timer.setAttribute("role", "button");
    timer.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openVipPopup("progress", null, timer); }
    });
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-new-level-benefits]")) {
      closeVipPopup();
      const benefits = document.querySelector(".vip-perks:not([hidden])");
      if (benefits) benefits.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
      return;
    }
    const close = event.target.closest("[data-popup-close]");
    if (close) return closeVipPopup();
    const view = event.target.closest("[data-popup-view]");
    if (view) return openVipPopup(view.dataset.popupView);
    const action = event.target.closest("[data-popup-action]");
    if (action && !action.matches("a")) return emitVipPopupAction(action.dataset.popupAction);
    const row = event.target.closest("[data-popup-deposit]");
    if (row) {
      popupListScroll = document.querySelector(".vip-deposits-popup__list").scrollTop;
      return openVipPopup("detail", row.dataset.popupDeposit);
    }
    const detail = event.target.closest(".vip-deposit[data-deposit-id] .vip-deposit__button");
    if (detail) return openVipPopup("detail", detail.closest("[data-deposit-id]").dataset.depositId, detail);
    const all = event.target.closest(".vip-deposits__all");
    if (all) { popupListScroll = 0; return openVipPopup("deposits", null, all); }
    const progress = event.target.closest(".vip-progress__help, .vip-account__expiry");
    if (progress) {
      return openVipPopup("progress", null, progress);
    }
  });
}
function popupOutside(modal, event) {
  const rect = modal.getBoundingClientRect();
  return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
}
window.openVipPopup = openVipPopup;
window.setVipPopupData = (data) => {
  // Все поля заменяются одним объектом, без смешивания реальных данных с демо.
  vipPopupData = data;
  if (popupActive?.matches(".vip-progress-popup")) renderVipPopupProgress();
  if (popupActive?.matches(".vip-deposits-popup")) {
    if (!popupDepositId || !renderVipPopupDetail(popupDepositId)) renderVipPopupDeposits();
  }
};
document.addEventListener("DOMContentLoaded", initVipPopups);


function renderVipNewLevel() {
  if (![1, 2, 3, 4].includes(popupLevel)) return false;
  const modal = document.querySelector(".vip-new-level");
  if (!modal) return false;
  const benefits = {
    1: [[1, "Cashback 10%", "cada lunes"], [12, "Calendario semanal", "de recargas VIP"], [3, "Prioridad en soporte", "en vivo"], [5, "Golden Chips", "para mesas VIP"]],
    2: [[13, "Cashback 15%", "requisitos de apuesta reducidos"], [19, "Cuotas mejoradas", "tragamonedas y casino en vivo"], [16, "Sorteos cerrados", "Apple y gadgets"], [4, "Apuestas sin riesgo", "en deportes"]],
    3: [[14, "Cashback 20%", "protección total"], [17, "Packs de bonos", "personalizados"], [17, "Regalos", "por cumpleaños y fiestas"], [11, "Entradas", "a ligas top de fútbol"]],
    4: [[15, "Cashback 25%", "el más alto"], [5, "Bonos", "sin depósito y sin wager"], [18, "Lujo", "relojes y joyas exclusivas"], [2, "Palcos VIP", "F1, UCL y derbis y tu asesor VIP"]],
  };
  modal.dataset.level = popupLevel;
  modal.querySelector(".vip-new-level__title").textContent = `¡Alcanzaste VIP ${["I", "II", "III", "IV"][popupLevel - 1]}!`;
  modal.querySelector(".vip-new-level__description").textContent = popupLevel === 1
    ? "Nivel activo hasta el 10 de septiembre de 2026, 23:59 (ART)"
    : popupLevel === 4 ? "Máximo nivel de por vida" : "Nivel de por vida";
  modal.querySelector(".vip-new-level__benefits").innerHTML = benefits[popupLevel].map(([icon, title, subtitle]) =>
    `<li><img src="./img/vip-icons-table/vip-icon-${popupLevel}_${icon}.webp" width="40" height="40" alt=""><div><strong>${title}</strong><span>${subtitle}</span></div></li>`
  ).join("");
  return true;
}
document.addEventListener("DOMContentLoaded", () => {
  if (![1, 2, 3, 4].includes(popupLevel)) return;
  const seen = document.cookie.split(";").some((cookie) => cookie.trim() === `vip_new_level_dismissed_${popupLevel}=1`);
  if (!seen && !popupActive) openVipPopup("new-level");
});

// Подключение повторного запроса к API: обработчик должен вызвать setVipPopupData().
setInterval(() => {
  if (vipPopupData.unavailable || vipPopupData.totalsUnavailable || vipPopupData.depositsUnavailable) {
    document.dispatchEvent(new CustomEvent("vip:refresh", { detail: { source: "vip-popup" } }));
  }
}, 15 * 60 * 1000);


function renderVipLimits() {
  const modal = document.querySelector(".vip-limits-popup");
  if (!modal) return;
  const unavailable = popupUnavailable;
  const level = popupLevel;
  const unlimited = level >= 2;
  const band = modal.querySelector(".vip-limits-popup__band");
  band.hidden = unavailable || level === 0;
  modal.classList.toggle("has-band", !band.hidden);
  band.querySelector("span").textContent = unlimited ? "Sin límites, sujeto al método de pago" : "Límites de retiro más altos";
  band.querySelector("img").src = `./img/vip-icons-table/vip-icon-${Math.max(1, level)}_6.webp`;
  modal.querySelector(".vip-limits-popup__amount").textContent = unlimited ? "Sin límite por operación" : "$500.000.000 por operación";
  modal.querySelector(".vip-limits-popup__previous").textContent = unlimited ? "en lugar de $500.000.000" : "en lugar de $200.000.000";
  modal.querySelector(".vip-limits-popup__reset").hidden = unlimited;
  const note = modal.querySelector(".vip-limits-popup__note");
  note.hidden = level >= 3 && !unavailable;
  const upgrade = modal.querySelector(".vip-limits-popup__upgrade");
  upgrade.hidden = unavailable || unlimited;
  upgrade.classList.toggle("is-gold", level === 1);
  upgrade.querySelector("p").textContent = level === 1 ? "Sin límites, sujeto al método de pago" : "Límites más altos";
  upgrade.querySelector("small").textContent = level === 1 ? "Disponible en VIP II · Depositá $4.500,00 más" : "Disponible en VIP I · Depositá $500,00 más";
  upgrade.querySelector("img").src = `./img/vip-icon-cup-${level === 1 ? 2 : 1}.webp`;
  // El bloque de mejora cambia de posición entre no-vip y VIP I, como en el diseño.
  if (level === 1) note.before(upgrade);
  else note.after(upgrade);
  modal.querySelector(".vip-limits-popup__error").hidden = !unavailable;
  modal.querySelector('[data-limits-link="deposit"]').hidden = unavailable || unlimited;
  modal.querySelector('[data-limits-link="support"]').hidden = !unavailable;
}


function renderVipMethods() {
  const modal = document.querySelector(".vip-methods-popup");
  if (!modal) return;
  const active = popupLevel >= 1 && !popupUnavailable;
  const band = modal.querySelector(".vip-methods-popup__band");
  band.hidden = !active;
  modal.classList.toggle("has-band", active);
  band.querySelector("span").textContent = "Métodos de retiro adicionales";
  band.querySelector("img").src = `./img/vip-icons-table/vip-icon-${Math.max(1, popupLevel)}_9.webp`;
  const upgrade = modal.querySelector(".vip-methods-popup__upgrade");
  upgrade.hidden = active || popupUnavailable;
  upgrade.querySelector("p").textContent = "Métodos de retiro adicionales";
  upgrade.querySelector("small").textContent = "Disponible en VIP I · Depositá $500,00 más";
  upgrade.querySelector("img").src = "./img/vip-icon-cup-1.webp";
  modal.querySelector(".vip-methods-popup__error").hidden = !popupUnavailable;
  modal.querySelector('[data-methods-link="deposit"]').hidden = active || popupUnavailable;
  modal.querySelector('[data-methods-link="withdraw"]').hidden = !active;
  modal.querySelector('[data-methods-link="support"]').hidden = !popupUnavailable;
}


function renderVipProcessing() {
  const modal = document.querySelector(".vip-processing-popup");
  if (!modal) return;
  const active = popupLevel >= 1 && !popupUnavailable;
  const band = modal.querySelector(".vip-processing-popup__band");
  band.hidden = !active;
  modal.classList.toggle("has-band", active);
  modal.classList.toggle("is-locked", !active && !popupUnavailable);
  band.querySelector("span").textContent = "Procesamiento prioritario de retiros";
  band.querySelector("img").src = `./img/vip-icons-table/vip-icon-${Math.max(1, popupLevel)}_7.webp`;
  const upgrade = modal.querySelector(".vip-processing-popup__upgrade");
  upgrade.hidden = active || popupUnavailable;
  upgrade.querySelector("p").textContent = "Procesamiento prioritario de retiros";
  upgrade.querySelector("small").textContent = "Disponible en VIP I · Depositá $500,00 más";
  upgrade.querySelector("img").src = "./img/vip-icon-cup-1.webp";
  modal.querySelector(".vip-processing-popup__error").hidden = !popupUnavailable;
  modal.querySelector('[data-processing-link="deposit"]').hidden = active || popupUnavailable;
  modal.querySelector('[data-processing-link="withdraw"]').hidden = !active;
  modal.querySelector('[data-processing-link="support"]').hidden = !popupUnavailable;
  modal.querySelector('[data-processing-link="details"]').hidden = !active && !popupUnavailable;
}


function renderVipOdds() {
  const modal = document.querySelector(".vip-odds-popup");
  if (!modal) return;
  const active = popupLevel >= 2 && !popupUnavailable;
  const band = modal.querySelector(".vip-odds-popup__band");
  band.hidden = !active;
  modal.classList.toggle("has-band", active);
  modal.classList.toggle("is-locked", !active && !popupUnavailable);
  band.querySelector("span").textContent = "Mejores condiciones";
  band.querySelector("img").src = `./img/vip-icons-table/vip-icon-${Math.max(1, popupLevel)}_10.webp`;
  const upgrade = modal.querySelector(".vip-odds-popup__upgrade");
  upgrade.hidden = active || popupUnavailable;
  upgrade.querySelector("p").textContent = "Mejores condiciones para tragamonedas y casino en vivo";
  upgrade.querySelector("small").textContent = "Disponible en VIP I · Depositá $500,00 más";
  upgrade.querySelector("img").src = "./img/vip-icon-cup-1.webp";
  modal.querySelector(".vip-odds-popup__error").hidden = !popupUnavailable;
  modal.querySelector('[data-odds-link="deposit"]').hidden = active || popupUnavailable;
  modal.querySelector('[data-odds-link="support"]').hidden = !popupUnavailable;
  modal.querySelector(".vip-odds-popup__note").hidden = popupUnavailable || popupLevel >= 3;
  modal.querySelector(".vip-modal__actions").hidden = active;
}

let vipSupportData = {
  unavailable: popupUnavailable,
  manager: popupParams.get("manager") === "pending" ? null : { name: "Santiago", avatar: "" }
};
window.setVipSupportData = (data) => {
  vipSupportData = { ...vipSupportData, ...data };
  if (popupActive?.matches(".vip-support-popup")) renderVipSupport();
};
function renderVipSupport() {
  const modal = document.querySelector(".vip-support-popup");
  if (!modal) return;
  const level = popupLevel;
  const error = vipSupportData.unavailable;
  const active = level > 0 && !error;
  const roman = ["", "I", "II", "III", "IV"][level];
  const labels = ["Soporte VIP general", "Soporte VIP general", "Asesor personal", "Atención personal del dueño", "Atención personal del dueño"];
  modal.querySelector("h2").textContent = "Soporte VIP" + (active ? " " + roman : "");
  const band = modal.querySelector(".vip-support-popup__band");
  band.hidden = !active;
  band.querySelector("span").textContent = labels[level];
  band.querySelector("img").src = `./img/vip-icons-table/vip-icon-${Math.max(1, level)}_3.webp`;
  const intro = modal.querySelector(".vip-modal__intro");
  intro.hidden = error;
  intro.textContent = level < 2 ? "En VIP I, tus consultas se atienden fuera de la cola general." : level === 2 ? "En VIP II, tenés un asesor personal asignado." : level === 3 ? "En VIP III, el dueño del casino supervisa personalmente tus consultas." : "En VIP IV, podés contactar personalmente al dueño del casino.";
  const manager = modal.querySelector(".vip-support-popup__manager");
  manager.hidden = !active || level < 2;
  manager.querySelector(".vip-support-popup__ribbon").hidden = level < 3;
  manager.querySelector("[data-manager-name]").textContent = vipSupportData.manager?.name || "En proceso…";
  manager.querySelector("[data-manager-description]").textContent = vipSupportData.manager ? "Tu asesor personal" : "Todavía no se asignó un asesor personal";
  const avatar = manager.querySelector(".vip-support-popup__avatar");
  avatar.textContent = vipSupportData.manager ? (vipSupportData.manager.name || "S").slice(0,1) : "♙";
  if (vipSupportData.manager?.avatar) {
    const img = document.createElement("img"); img.src = vipSupportData.manager.avatar; img.alt = ""; avatar.replaceChildren(img);
  }
  modal.querySelector(".vip-support-popup__owner").hidden = !active || level !== 4;
  const channels = modal.querySelector(".vip-support-popup__channels");
  channels.hidden = !active;
  const names = level >= 2 ? ["Chat con tu asesor", "WhatsApp del asesor", "Telegram del asesor", "Email del asesor"] : ["Chat en el sitio", "WhatsApp", "Telegram", "Email"];
  const icons = ["chat", "whatsapp", "telegram", "email"];
  channels.innerHTML = names.map((name, i) => `<a href="#" data-support-link="${icons[i]}"><span class="vip-support-popup__icon">${popupIcon(icons[i], "", 22)}</span><div><p>${name}</p><small>${i === 0 ? "Espera ~3 min · las 24 horas" : i === 3 ? "Respuesta en 24 h" : "Espera ~15 min · 09:00–02:00 (ART)"}</small></div>${popupIcon("next", "", 18)}</a>`).join("");
  const upgrade = modal.querySelector(".vip-support-popup__upgrade");
  upgrade.hidden = error || level === 4;
  upgrade.dataset.next = Math.min(4, level + 1);
  upgrade.querySelector("p").textContent = ["Soporte VIP general", "Asesor personal", "Atención personal del dueño", "Contacto directo con el dueño del casino"][Math.min(level, 3)];
  upgrade.querySelector("small").textContent = `Disponible en VIP ${["I","II","III","IV"][Math.min(level,3)]} · Depositá ${["$500,00","$4.500,00","$9.500,00","$49.500,00"][Math.min(level,3)]} más`;
  upgrade.querySelector("img").src = `./img/vip-icon-cup-${Math.min(4,level+1)}.webp`;
  modal.querySelector(".vip-support-popup__error").hidden = !error;
  modal.querySelector(".vip-modal__actions").hidden = active;
  modal.querySelector('[data-support-link="deposit"]').hidden = error || active;
  modal.querySelector('[data-support-link="support"]').hidden = !error;
  modal.querySelector("[data-support-refresh]").hidden = !error;
}
document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-support-refresh]")) return;
  document.dispatchEvent(new CustomEvent("vip:refresh", { detail: { source: "vip-support", manual: true } }));
});
setInterval(() => {
  if (vipSupportData.unavailable && popupActive?.matches(".vip-support-popup")) {
    document.dispatchEvent(new CustomEvent("vip:refresh", { detail: { source: "vip-support", manual: false } }));
  }
}, 15 * 60 * 1000);

// Та же длительность и кривая, что у FAQ; native details сохраняет клавиатурное управление.
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

// Плавность применяется только к двум якорям, не к восстановлению прокрутки попапов.
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
