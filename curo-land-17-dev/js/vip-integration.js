const API_TOKEN = "cba_qiOzuJ4_BXUNQh4v_jpp4JPSFBudVgIgruA51rJla-M";


async function loadVipStatus() {
  const playerId = new URLSearchParams(location.search).get("playerId");

  if (!playerId) {
    throw new Error("playerId not found");
  }

  if (!API_TOKEN) {
    throw new Error("VIP_API_TOKEN not found");
  }

  const response = await fetch(
    `https://cbaiendpnt.site/apg/players/${encodeURIComponent(playerId)}/vip-status`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

const zone = 'America/Argentina/Buenos_Aires';
const roman = ['I', 'II', 'III', 'IV'];
const number = value => value != null && value !== '' && Number.isFinite(Number(value)) ? Number(value) : null;
const date = value => value && Number.isFinite(new Date(value).getTime()) ? new Date(value) : null;
const formatDate = (value, options = { day: 'numeric', month: 'short' }) => date(value)
  ? new Intl.DateTimeFormat('es-AR', { timeZone: zone, ...options }).format(date(value)).replace(/\./g, '') : '—';
const formatTime = value => formatDate(value, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const formatDepositDate = value => {
  const parsed = date(value);
  if (!parsed) return '—';
  const parts = new Intl.DateTimeFormat('es-AR', {
    timeZone: zone, day: 'numeric', month: 'short', year: 'numeric',
  }).formatToParts(parsed);
  const part = type => parts.find(item => item.type === type)?.value.replace(/\./g, '') || '';
  return `${part('day')} ${part('month').slice(0, 3)} ${part('year')}`;
};
const formatDepositTime = value => formatDate(value, {
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});
const text = (selector, value) => document.querySelectorAll(selector).forEach(node => { node.textContent = value; });
const money = (value, currency, compact = false) => value == null ? '—' : '$' + new Intl.NumberFormat('es-AR', {
  maximumFractionDigits: 2,
}).format(compact && Math.abs(value) >= 1000000 ? value / 1000000 : value) +
  (compact && Math.abs(value) >= 1000000 ? ' M' : '') + ' ' + currency;

function updatedLabel(value) {
  if (!date(value)) return 'Actualización no disponible';
  const day = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const today = formatDate(value, day) === formatDate(new Date(), day);
  return `Actualizado ${today ? 'hoy ' : ''}${formatDate(value)} · ${formatTime(value)} (ART)`;
}

function depositsFrom(data, p) {
  const history = [data.deposits, p.deposits, p.recentDeposits, data.recentDeposits]
    .find(Array.isArray);
  const rows = history ?? (number(p.lastDepositAmount) != null ? [{
    amount: p.lastDepositAmount, currency: p.lastDepositCurrency, createdAt: p.lastDepositAt, status: 'confirmed',
  }] : []);
  return rows.filter(row => row && number(row.amount) != null).map((row, index) => {
    const at = row.createdAt ?? row.depositedAt ?? row.date;
    return {
      id: String(row.id ?? row.transactionId ?? `deposit-${index}`),
      amount: number(row.amount), currency: row.currency || p.currency || 'ARS',
      status: ['confirmed', 'pending', 'expired', 'canceled'].includes(row.status) ? row.status : 'unknown',
      date: formatDepositDate(at), time: formatDepositTime(at),
      timestamp: date(at)?.getTime() || 0, method: row.method, transaction: row.transactionId,
      ars: number(row.amountArs),
    };
  }).sort((a, b) => b.timestamp - a.timestamp);
}

function renderDeposits(deposits, currency, unavailable = false) {
  const list = document.querySelector('.vip-deposits__list[data-vip-visible*="vip-1"]');
  if (!list) return;
  list.replaceChildren();
  list.hidden = unavailable || !deposits.length;
  const labels = { confirmed: 'Confirmado', pending: 'En proceso', expired: 'Confirmado, vencido', canceled: 'Cancelado', unknown: 'Depósito' };
  deposits.slice(0, 3).forEach(deposit => {
    const row = document.createElement('li');
    row.className = `vip-deposit vip-deposit--${deposit.status}`;
    row.dataset.depositId = deposit.id;
    row.innerHTML = '<button class="vip-deposit__button" type="button"><span class="vip-deposit__icon"><svg width="18" height="18" aria-hidden="true"><use href="./img/vip-popup-icons.svg#history"></use></svg></span><span class="vip-deposit__info"><span class="vip-deposit__status"></span><span class="vip-deposit__amount"></span></span><span class="vip-deposit__date"><span></span><span></span></span></button>';
    row.querySelector('.vip-deposit__status').textContent = labels[deposit.status];
    const mark = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mark.setAttribute('class', 'vip-deposit__mark');
    mark.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    const marks = { confirmed: 'check', pending: 'hourglass', expired: 'check', canceled: 'cancel', unknown: 'info' };
    use.setAttribute('href', `./img/vip-popup-icons.svg#${marks[deposit.status] || 'info'}`);
    mark.append(use);
    row.querySelector('.vip-deposit__status').append(mark);
    if (deposit.status === 'expired' || deposit.status === 'canceled') {
      row.querySelector('.vip-deposit__icon use').setAttribute('href', './img/vip-popup-icons.svg#expired');
    }
    row.querySelector('.vip-deposit__amount').textContent = money(deposit.amount, deposit.currency || currency);
    const dates = row.querySelectorAll('.vip-deposit__date span');
    dates[0].textContent = deposit.time; dates[1].textContent = deposit.date;
    list.append(row);
  });
  document.querySelectorAll('.vip-deposits__empty, .vip-deposits__first').forEach(node => { node.hidden = unavailable || deposits.length > 0; });
}

function renderNextCards(level, nextTier, remaining, currency, days) {
  document.querySelectorAll('.vip-next-card').forEach((card, index) => {
    const period = card.querySelector('.vip-next-card__period');
    const amount = card.querySelector('.vip-next-card__amount');
    const current = level > 0 && index + 1 === level;
    const next = nextTier != null && index + 1 === nextTier && remaining != null;

    period.style.visibility = current && days != null || next ? 'visible' : 'hidden';
    amount.style.visibility = next ? 'visible' : 'hidden';

    if (current && days != null) {
      period.textContent = days <= 0 ? 'Período finalizado' : `Fin del período: ${days} ${days === 1 ? 'día' : 'días'}`;
    } else if (next) {
      period.textContent = 'Falta para subir';
      amount.textContent = money(remaining, currency, true);
    }
  });
}

function setSecondary(support) {
  const current = document.querySelector('.vip-account__secondary');
  if (!current) return;
  const node = document.createElement(support ? 'button' : 'a');
  node.className = current.className;
  node.innerHTML = current.innerHTML;
  if (support) { node.type = 'button'; node.dataset.popupView = 'support'; }
  else node.href = '#vip-next';
  current.replaceWith(node);
}

function renderLevelRequirements(nextTier, confirmed, target, currency) {
  document.querySelectorAll('.benefit-level[data-level]').forEach(block => {
    const requirement = block.querySelector('.benefit-level__requirement');
    if (!requirement) return;
    const available = Number(block.dataset.level) === nextTier && confirmed != null && target != null;
    requirement.hidden = !available;
    requirement.textContent = available
      ? `Depositá ${money(Math.max(0, target - confirmed), currency)} para desbloquear el nivel`
      : '';
  });
}

function renderPerkRequirements(nextTier, confirmed, target, currency) {
  document.querySelectorAll('.vip-perks .perk-card.is-locked, .vip-perks .perk-row.is-locked, .vip-perks .perk-event.is-locked').forEach(card => {
    const requiredLevel = Number(card.dataset.level || 1);
    const requirement = card.querySelector('.perk-ribbon, .perk-event__requirement');
    if (!requirement) return;
    const image = requirement.querySelector('img');
    const label = requirement.querySelector('span');
    const detail = requirement.querySelector('small');
    if (image) image.src = `./img/vip-account-lvl-${requiredLevel}.webp`;
    const hasAmount = requiredLevel === nextTier && confirmed != null && target != null;
    if (label) label.textContent = hasAmount
      ? `Depositá ${money(Math.max(0, target - confirmed), currency)}${detail ? '' : ' para desbloquear este beneficio'}`
      : `Disponible en VIP ${roman[requiredLevel - 1]}`;
    if (detail) detail.hidden = !hasAmount;
  });
}

export function showVipDataError() {
  window.setVipStatus?.('unavallable');
  renderNextCards(0, null, null, 'ARS', null);
  renderLevelRequirements(null, null, null, 'ARS');
  setSecondary(true);
  text('.vip-progress__head > p', 'Datos no disponibles');
  text('.vip-progress__period span', '—');
  document.querySelectorAll('.vip-progress__bar').forEach(node => { node.value = 0; });
  renderDeposits([], 'ARS', true);
  window.setVipPopupData?.({ integrated: true, level: 0, unavailable: true, deposits: [], updated: 'Datos no disponibles' });
  window.setVipTimerData?.({ integrated: true, unavailable: true, level: 0, updated: 'Datos no disponibles' });
}

export function applyVipData(data) {
  const p = data.progress;
  if (!p || typeof p !== 'object') { showVipDataError(); return; }
  const parsedLevel = number(p.observedTier) ?? number(data.level) ?? number((data.levelName || p.tierName || '').match(/\d+/)?.[0]);
  const noVip = p.programMembership === 'no-vip' || p.programMembership === 'none' || data.isVip === false || parsedLevel === 0;
  if (!noVip && ![1, 2, 3, 4].includes(parsedLevel)) { showVipDataError(); return; }
  if (['unavailable', 'error', 'inactive', 'expired'].includes(p.status)) { showVipDataError(); return; }
  const level = noVip ? 0 : parsedLevel;
  const currency = p.currency || 'ARS';
  const confirmed = number(p.qualifyingTotals?.[currency]) ?? number(p.qualifyingDeposits);
  const target = number(p.nextTierThresholds?.[currency]) ?? number(p.nextTierThreshold);
  const nextTier = [1, 2, 3, 4].includes(number(p.nextTier)) ? number(p.nextTier) : null;
  const percent = Math.max(0, Math.min(100, number(p.nextTierProgress) ?? (target > 0 && confirmed != null ? confirmed / target * 100 : 0)));
  const period = `${formatDate(p.cycleStartedAt)} → ${formatDate(p.cycleEndsAt)}`;
  const updated = updatedLabel(p.updatedAt);
  const remainingMs = date(p.cycleEndsAt) ? Math.max(0, date(p.cycleEndsAt).getTime() - Date.now()) : null;
  const days = remainingMs == null ? number(p.daysRemaining) : Math.ceil(remainingMs / 86400000);
  const expiry = days == null ? 'Período no disponible' : days <= 0 ? 'Período finalizado' : `Fin del período: ${days} ${days === 1 ? 'día' : 'días'}`;
  window.setVipStatus?.(level ? `vip-${level}` : 'no-vip');
  setSecondary(level === 4);
  renderLevelRequirements(nextTier, confirmed, target, currency);
  renderPerkRequirements(nextTier, confirmed, target, currency);
  renderNextCards(level, nextTier, confirmed != null && target != null ? Math.max(0, target - confirmed) : null, currency, days);
  text('.vip-progress__amount', money(confirmed, currency, true));
  text('.vip-progress__target span', money(target, currency, true));
  text('.vip-progress__period span', period);
  text('.vip-progress__head > p', updated);
  text('.vip-account__expiry span', expiry);
  text('.vip-progress__level span', nextTier ? `VIP ${roman[nextTier - 1]}` : 'Nivel máximo');
  const badge = document.querySelector('.vip-progress__level img');
  if (badge) { badge.hidden = !nextTier; if (nextTier) badge.src = `./img/vip-account-lvl-${nextTier}.webp`; }
  document.querySelectorAll('.vip-progress__bar').forEach(node => { node.value = percent; });
  const deposits = depositsFrom(data, p);
  renderDeposits(deposits, currency);
  window.setVipPopupData?.({
    integrated: true, level, currency, confirmed, target, percent,
    targetLevel: nextTier ?? 4, pending: number(p.pendingDeposits), period, updated,
    unavailable: false, totalsUnavailable: confirmed == null, depositsUnavailable: false, deposits,
  });
  window.setVipTimerData?.({
    integrated: true, unavailable: false, level, currency, nextTier,
    amount: confirmed, target, percent, empty: confirmed === 0, renewed: false, cashback: false,
    endsAt: p.cycleEndsAt, period,
    received: formatDate(p.cycleStartedAt), deadline: `${formatDate(p.cycleEndsAt)} · ${formatTime(p.cycleEndsAt)}`,
    remaining: remainingMs == null ? '—' : `${Math.floor(remainingMs / 86400000)}D:${Math.floor(remainingMs / 3600000) % 24}H:${Math.floor(remainingMs / 60000) % 60}M`, updated,
  });
}

function setupLink(link, url) {
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
}

function setupImage(image, { imageUrl, title }) {
  image.src = imageUrl;
  image.alt = title;
}

function renderVipLevel({ isVip, level }) {
  if (!isVip) return;

  const cardsByLevel = Object.fromEntries(
    [...document.querySelectorAll(".vip-card")]
      .map((card) => {
        const levelClass = [...card.classList].find((className) =>
          /^vip-card--\d+$/.test(className)
        );

        return levelClass ? [levelClass.replace("vip-card--", ""), card] : null;
      })
      .filter(Boolean)
  );

  Object.values(cardsByLevel).forEach((card) => {
    card.classList.remove("vip-card--active", "vip-card--completed");
  });

  for (let currentLevel = 1; currentLevel < level; currentLevel += 1) {
    cardsByLevel[currentLevel]?.classList.add("vip-card--completed");
  }

  cardsByLevel[level]?.classList.add("vip-card--active");
}

function renderBigWins(block) {
  if (!block) return;

  const cards = {
    1: document.querySelector(".vip-win-card--gold"),
    2: document.querySelector(".vip-win-card--metallic"),
    3: document.querySelector(".vip-win-card--peach"),
  };

  block.items.forEach((win) => {
    const card = cards[win.position];

    if (!card) return;

    const link = card.querySelector(".vip-win-card__image");
    const image = link?.querySelector("img");

    if (!link || !image) return;

    setupLink(link, win.link);
    setupImage(image, win);

    card.querySelector(".vip-win-card__id").innerHTML =
      `ID <span>${win.playerId.replace(/^ID\s*/, "")}</span>`;
    card.querySelector(".vip-win-card__amount").textContent = win.amountLabel;
  });
}

function renderMonthlyWins(block) {
  if (!block) return;

  const cards = document.querySelectorAll(".vip-win-item");

  block.items.forEach((win, index) => {
    const card = cards[index];

    if (!card) return;

    const link = card.querySelector(".vip-win-item__image");
    const image = link?.querySelector("img");

    if (!link || !image) return;

    setupLink(link, win.link);
    setupImage(image, win);

    card.querySelector(".vip-win-item__info h3").textContent = win.title;
    card.querySelector(".vip-win-item__info p").innerHTML =
      `ID <span>${win.playerId.replace(/^ID\s*/, "")}</span>`;
    card.querySelector(".vip-win-item__amount").textContent = win.amountLabel;
  });
}

function setWithdrawalAmount(element, amountLabel) {
  const amountTextNode = [...element.childNodes].find(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
  );

  if (amountTextNode) {
    amountTextNode.textContent = `${amountLabel} `;
  } else {
    element.prepend(document.createTextNode(`${amountLabel} `));
  }
}

function renderWithdrawals(block) {
  if (!block) return;

  const total = document.querySelector(".vip-withdrawals__amount span");

  if (total) {
    total.textContent = block.totalLabel.replace(/\s*ARS$/, "");
  }

  const cards = document.querySelectorAll(".withdraw-card");

  block.items.forEach((withdraw, index) => {
    const card = cards[index];

    if (!card) return;

    const badge = card.querySelector(".withdraw-card__badge");
    badge.textContent = withdraw.multiplierLabel;
    badge.style.setProperty("--badge-color", withdraw.color);
    badge.classList.remove(
      "withdraw-card__badge--rhomb",
      "withdraw-card__badge--star"
    );
    badge.classList.add(
      withdraw.multiplier < 5
        ? "withdraw-card__badge--rhomb"
        : "withdraw-card__badge--star"
    );

    card.querySelector(".withdraw-card__id").textContent = withdraw.playerId;
    setWithdrawalAmount(
      card.querySelector(".withdraw-card__amount"),
      withdraw.amountLabel
    );
    card.querySelector(".withdraw-card__deposit").textContent = withdraw.depositLabel;
  });
}


function renderVipContent(data) {
  const content = Object.fromEntries((data.content || []).map((item) => [item.type, item]));
  renderVipLevel(data);
  renderBigWins(content.bigWins);
  renderMonthlyWins(content.monthlyWins);
  renderWithdrawals(content.withdrawals);
}

export async function refreshVipData() {
  try {
    const data = await loadVipStatus();
    applyVipData(data);
    renderVipContent(data);
  } catch (error) {
    showVipDataError();
    console.error("VIP request failed:", error.message);
  }
}
