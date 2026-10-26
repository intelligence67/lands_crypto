const zone = 'America/Argentina/Buenos_Aires';
const roman = ['I', 'II', 'III', 'IV'];
const number = value => value != null && value !== '' && Number.isFinite(Number(value)) ? Number(value) : null;
const date = value => value && Number.isFinite(new Date(value).getTime()) ? new Date(value) : null;
const formatDate = (value, options = { day: 'numeric', month: 'short' }) => date(value)
  ? new Intl.DateTimeFormat('es-AR', { timeZone: zone, ...options }).format(date(value)).replace(/\./g, '') : '—';
const formatTime = value => formatDate(value, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
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
  const history = Array.isArray(data.deposits) ? data.deposits : Array.isArray(p.deposits) ? p.deposits : null;
  const rows = history ?? (number(p.lastDepositAmount) != null ? [{
    amount: p.lastDepositAmount, currency: p.lastDepositCurrency, createdAt: p.lastDepositAt,
  }] : []);
  return rows.filter(row => row && number(row.amount) != null).map((row, index) => {
    const at = row.createdAt ?? row.depositedAt ?? row.date;
    return {
      id: String(row.id ?? row.transactionId ?? `deposit-${index}`),
      amount: number(row.amount), currency: row.currency || p.currency || 'ARS',
      status: ['confirmed', 'pending', 'expired', 'canceled'].includes(row.status) ? row.status : 'unknown',
      date: formatDate(at, { day: 'numeric', month: 'short', year: 'numeric' }), time: formatTime(at),
      timestamp: date(at)?.getTime() || 0, method: row.method, transaction: row.transactionId,
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
    row.className = 'vip-deposit';
    row.dataset.depositId = deposit.id;
    row.innerHTML = '<button class="vip-deposit__button" type="button"><span class="vip-deposit__icon"><svg width="18" height="18" aria-hidden="true"><use href="./img/vip-popup-icons.svg#history"></use></svg></span><span class="vip-deposit__info"><span class="vip-deposit__status"></span><span class="vip-deposit__amount"></span></span><span class="vip-deposit__date"><span></span><span></span></span></button>';
    row.querySelector('.vip-deposit__status').textContent = labels[deposit.status];
    row.querySelector('.vip-deposit__amount').textContent = money(deposit.amount, deposit.currency || currency);
    const dates = row.querySelectorAll('.vip-deposit__date span');
    dates[0].textContent = deposit.time; dates[1].textContent = deposit.date;
    list.append(row);
  });
  document.querySelectorAll('.vip-deposits__empty, .vip-deposits__first').forEach(node => { node.hidden = unavailable || deposits.length > 0; });
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

export function showVipDataError() {
  window.setVipStatus?.('unavallable');
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
  const days = number(p.daysRemaining) ?? (remainingMs == null ? null : Math.ceil(remainingMs / 86400000));
  const expiry = days == null ? 'Vencimiento no disponible' : days <= 0 ? 'Período finalizado' : `Vence en ${days} ${days === 1 ? 'día' : 'días'}`;
  window.setVipStatus?.(level ? `vip-${level}` : 'no-vip');
  setSecondary(level === 4);
  renderLevelRequirements(nextTier, confirmed, target, currency);
  text('.vip-progress__amount', money(confirmed, currency, true));
  text('.vip-progress__target span', money(target, currency, true));
  text('.vip-progress__period span', period);
  text('.vip-progress__head > p', updated);
  text('.vip-account__expiry span, .vip-next-card.is-current .vip-next-card__period', expiry);
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
