/**
 * ============================================================================== 
 * MONITORAGGIO RISPARMIO NETTO, TARGET ROGITO & STATISTICHE FINANZIARIE
 * ============================================================================== 
 */

function formatTargetDateFull(dateStr) {
  if (!dateStr) return "Rogito";
  const parts = dateStr.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parts[2] ? parseInt(parts[2], 10) : 1;
  const d = new Date(year, month, day);
  if (isNaN(d.getTime())) return dateStr;
  const monthName = d.toLocaleDateString("it-IT", { month: "long" });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  return `${day} ${capitalizedMonth} ${year}`;
}

/**
 * Formatta una stringa data (YYYY-MM o YYYY-MM-DD) in Mese Anno (es. "Aprile 2027").
 * @param {string} dateStr 
 * @returns {string}
 */
function formatTargetMonthYear(dateStr) {
  return formatTargetDateFull(dateStr);
}

/**
 * Calcola in modo esatto i mesi e i giorni rimanenti tra la data odierna e la data target.
 * @param {string} targetDateStr - Data target (YYYY-MM-DD o YYYY-MM)
 * @param {Date} [fromDate=new Date()]
 * @returns {{ mesi: number, giorni: number, totaleGiorni: number, label: string, fullLabel: string }}
 */
function getExactRemainingTime(targetDateStr, fromDate = new Date()) {
  if (!targetDateStr) {
    return { mesi: 0, giorni: 0, totaleGiorni: 0, label: "Non definita", fullLabel: "Data non definita" };
  }

  const tParts = targetDateStr.split("-").map(p => parseInt(p, 10));
  const target = new Date(tParts[0], tParts[1] - 1, tParts[2] || 1);

  const from = new Date(fromDate);
  const fromZero = new Date(from.getFullYear(), from.getMonth(), from.getDate());

  const diffMs = target.getTime() - fromZero.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { mesi: 0, giorni: 0, totaleGiorni: diffDays, label: "Data già trascorsa", fullLabel: "Data già trascorsa" };
  }
  if (diffDays === 0) {
    return { mesi: 0, giorni: 0, totaleGiorni: 0, label: "Oggi", fullLabel: "Oggi (data del rogito)" };
  }

  let cur = new Date(fromZero);
  let months = 0;
  while (true) {
    const nextMonth = new Date(cur.getFullYear(), cur.getMonth() + 1, cur.getDate());
    if (nextMonth <= target) {
      months++;
      cur = nextMonth;
    } else {
      break;
    }
  }

  const remainingDays = Math.round((target.getTime() - cur.getTime()) / (1000 * 60 * 60 * 24));

  let parts = [];
  if (months > 0) {
    parts.push(`${months} ${months === 1 ? 'mese' : 'mesi'}`);
  }
  if (remainingDays > 0) {
    parts.push(`${remainingDays} ${remainingDays === 1 ? 'giorno' : 'giorni'}`);
  }

  const label = parts.length > 0 ? parts.join(" e ") : `${diffDays} giorni`;
  const fullLabel = `Tra ${label}`;

  return {
    mesi: months,
    giorni: remainingDays,
    totaleGiorni: diffDays,
    label,
    fullLabel,
  };
}

/**
 * Calcola la differenza in mesi fra due date (frazionaria/progressiva).
 * @param {string|Date} dataDa 
 * @param {string|Date} dataA 
 * @returns {number}
 */
function getMonthsDifference(dataDa, dataA) {
  const d1 = new Date(dataDa);
  const d2 = new Date(dataA);
  const diffAnni = d2.getFullYear() - d1.getFullYear();
  const diffMesi = d2.getMonth() - d1.getMonth();
  const diffGiorni = (d2.getDate() - d1.getDate()) / 30;
  const totaleMesi = diffAnni * 12 + diffMesi + diffGiorni;
  return Math.max(0.5, parseFloat(totaleMesi.toFixed(1)));
}

/**
 * Calcola le metriche finanziarie di risparmio netto per un utente specifico.
 * @param {string} userId 
 * @param {Object} [overrideParams] - Parametri opzionali temporanei (es. da modale)
 * @returns {Object}
 */
function calculateSavingsMetrics(userId, overrideParams = null) {
  if (!appData.savingsMonitor) sanitizeData();
  const monitor = appData.savingsMonitor;
  const uConfig = monitor.userConfig[userId] || {
    capitaleIniziale: null,
    ultimoSaldoConto: null,
    trasferimentiAttivi: [],
    debitiAttivi: [],
  };

  const isConfigured = (uConfig.capitaleIniziale !== null && uConfig.capitaleIniziale !== undefined) ||
    (overrideParams && overrideParams.capitaleIniziale !== undefined && overrideParams.capitaleIniziale !== null);

  const capitaleIniziale = overrideParams && overrideParams.capitaleIniziale !== undefined
    ? overrideParams.capitaleIniziale
    : (uConfig.capitaleIniziale || 0);

  const saldoConto = overrideParams && overrideParams.saldoConto !== undefined
    ? overrideParams.saldoConto
    : (uConfig.ultimoSaldoConto || 0);

  // Spese sostenute da questo utente (calcolate dai costi casa se non forzate)
  let speseSostenute = 0;
  if (overrideParams && overrideParams.speseSostenute !== undefined) {
    speseSostenute = overrideParams.speseSostenute;
  } else {
    speseSostenute = appData.costi.reduce((acc, curr) => acc + (parseFloat(curr[userId]) || 0), 0);
  }

  const trasferimenti = overrideParams && overrideParams.trasferimenti
    ? overrideParams.trasferimenti
    : (uConfig.trasferimentiAttivi || []);

  const debiti = overrideParams && overrideParams.debiti
    ? overrideParams.debiti
    : (uConfig.debitiAttivi || []);

  const dataRogitoTarget = overrideParams && overrideParams.dataRogito
    ? overrideParams.dataRogito
    : (monitor.dataRogito || "2027-04-30");

  const totaleTrasferimenti = trasferimenti.reduce((acc, t) => acc + (parseFloat(t.importo) || 0), 0);
  const totalePassivita = debiti.reduce((acc, d) => acc + (parseFloat(d.importo) || 0), 0);

  // 1. Fabbisogno Totale Coperto (Impieghi)
  const impieghiTotali = saldoConto + speseSostenute;

  // 2. Patrimonio Preesistente Già a Disposizione
  const fondiPreesistenti = capitaleIniziale + totaleTrasferimenti;

  // 3. Risparmio Lordo da Reddito
  const risparmioLordo = impieghiTotali - fondiPreesistenti;

  // 4. Risparmio Netto Effettivo (al netto delle passività/debiti)
  const risparmioNetto = risparmioLordo - totalePassivita;

  // 5. Liquidità Reale Disponibile (Giacenza Netta)
  const liquiditaNetta = saldoConto - totalePassivita;

  // 6. Proiezioni temporali verso la data rogito configurata
  const oggi = new Date();
  const dataAvvioUtente = (overrideParams && overrideParams.dataAvvio) || uConfig.dataAvvio || monitor.dataAvvio || "2024-01-01";
  const mesiTrascorsi = getMonthsDifference(dataAvvioUtente, oggi);
  const tempoRimanente = getExactRemainingTime(dataRogitoTarget, oggi);
  const mesiAlRogito = Math.max(0, parseFloat((tempoRimanente.totaleGiorni / 30.4375).toFixed(1)));

  const tassoMedioMensile = mesiTrascorsi > 0 ? (risparmioNetto / mesiTrascorsi) : 0;
  const risparmioFuturoStimato = tassoMedioMensile * mesiAlRogito;
  const proiezioneLiquiditaRogito = liquiditaNetta + risparmioFuturoStimato;

  // Percentuali per breakdown bar e legenda (copre risparmio positivo, disavanzo negativo, debiti e assenza di asset)
  const baseTotale = Math.max(impieghiTotali, fondiPreesistenti, 1);
  const pctIniziale = (capitaleIniziale / baseTotale) * 100;
  const pctTrasferimenti = (totaleTrasferimenti / baseTotale) * 100;
  const pctRisparmio = risparmioNetto > 0 ? (risparmioNetto / baseTotale) * 100 : 0;
  const pctDeficit = risparmioNetto < 0 ? (Math.abs(risparmioNetto) / baseTotale) * 100 : 0;
  const pctPassivita = totalePassivita > 0 ? (totalePassivita / baseTotale) * 100 : 0;

  return {
    isConfigured,
    capitaleIniziale,
    saldoConto,
    speseSostenute,
    totaleTrasferimenti,
    totalePassivita,
    impieghiTotali,
    fondiPreesistenti,
    risparmioLordo,
    risparmioNetto,
    liquiditaNetta,
    dataAvvio: dataAvvioUtente,
    mesiTrascorsi,
    mesiAlRogito,
    tempoRimanente,
    dataRogitoTarget,
    tassoMedioMensile,
    risparmioFuturoStimato,
    proiezioneLiquiditaRogito,
    pctIniziale,
    pctTrasferimenti,
    pctRisparmio,
    pctDeficit,
    pctPassivita,
    trasferimenti,
    debiti,
  };
}

// ------------------------------------------------------------------------------
// CUSTOM DROPDOWNS: SELETTORE UTENTE & SELETTORE DATA MESE/ANNO
// ------------------------------------------------------------------------------

let savingsPickerYear = 2027;

function toggleSavingsUserDropdown(e) {
  if (e) e.stopPropagation();
  closeSavingsDateDropdown();
  closeBudgetSavingsUserDropdown();
  const menu = document.getElementById("savings-user-dropdown-menu");
  const trigger = document.getElementById("savings-user-dropdown-btn");
  if (!menu) return;
  const isShown = menu.classList.contains("show");
  if (isShown) {
    closeSavingsUserDropdown();
  } else {
    renderSavingsUserDropdown();
    menu.classList.add("show");
    if (trigger) trigger.classList.add("active");
  }
}

function closeSavingsUserDropdown() {
  const menu = document.getElementById("savings-user-dropdown-menu");
  const trigger = document.getElementById("savings-user-dropdown-btn");
  if (menu) menu.classList.remove("show");
  if (trigger) trigger.classList.remove("active");
}

function renderSavingsUserDropdown() {
  const menu = document.getElementById("savings-user-dropdown-menu");
  if (!menu) return;
  const users = appData.settings.users || [];
  const currentUserId = appData.savingsMonitor?.selectedUser || (users[0] ? users[0].id : "");

  menu.innerHTML = users.map(u => {
    const isSelected = u.id === currentUserId;
    return `
      <div class="savings-dropdown-item ${isSelected ? 'selected' : ''}" onclick="selectSavingsUser('${u.id}', event)">
        <div class="savings-dropdown-item-info">
          <span class="material-symbols-outlined" style="font-size: 18px; color: ${isSelected ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'};">person</span>
          <span>${u.name}</span>
        </div>
        ${isSelected ? '<span class="material-symbols-outlined" style="font-size: 18px;">check</span>' : ''}
      </div>
    `;
  }).join("");
}

function selectSavingsUser(userId, e) {
  if (e) e.stopPropagation();
  closeSavingsUserDropdown();
  onSavingsSelectedUserChange(userId);
}

function toggleBudgetSavingsUserDropdown(e) {
  if (e) e.stopPropagation();
  closeSavingsUserDropdown();
  closeSavingsDateDropdown();
  closeSavingsInitialBudgetPickerMenu();
  const menu = document.getElementById("budget-savings-user-dropdown-menu");
  const trigger = document.getElementById("budget-savings-user-dropdown-btn");
  if (!menu) return;
  const isShown = menu.classList.contains("show");
  if (isShown) {
    closeBudgetSavingsUserDropdown();
  } else {
    renderBudgetSavingsUserDropdown();
    menu.classList.add("show");
    if (trigger) trigger.classList.add("active");
  }
}

function closeBudgetSavingsUserDropdown() {
  const menu = document.getElementById("budget-savings-user-dropdown-menu");
  const trigger = document.getElementById("budget-savings-user-dropdown-btn");
  if (menu) menu.classList.remove("show");
  if (trigger) trigger.classList.remove("active");
}

function renderBudgetSavingsUserDropdown() {
  const menu = document.getElementById("budget-savings-user-dropdown-menu");
  if (!menu) return;
  const users = appData.settings.users || [];
  const currentUserId = appData.savingsMonitor?.selectedUser || (users[0] ? users[0].id : "");

  menu.innerHTML = users.map(u => {
    const isSelected = u.id === currentUserId;
    return `
      <div class="savings-dropdown-item ${isSelected ? 'selected' : ''}" onclick="selectBudgetSavingsUser('${u.id}', event)">
        <div class="savings-dropdown-item-info">
          <span class="material-symbols-outlined" style="font-size: 18px; color: ${isSelected ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'};">person</span>
          <span>${escapeHTML(u.name)}</span>
        </div>
        ${isSelected ? '<span class="material-symbols-outlined" style="font-size: 18px;">check</span>' : ''}
      </div>
    `;
  }).join("");
}

function selectBudgetSavingsUser(userId, e) {
  if (e) e.stopPropagation();
  closeBudgetSavingsUserDropdown();
  onSavingsSelectedUserChange(userId);
}

function onSavingsSelectedUserChange(userId) {
  if (!appData.savingsMonitor) sanitizeData();
  appData.savingsMonitor.selectedUser = userId;
  renderSavingsSection();
}

let savingsPickerMonth = 4;
let savingsPickerDay = 30;

function toggleSavingsDateDropdown(e) {
  if (e) e.stopPropagation();
  closeSavingsUserDropdown();
  closeBudgetSavingsUserDropdown();
  closeSavingsInitialBudgetPickerMenu();
  const menu = document.getElementById("savings-date-dropdown-menu");
  const trigger = document.getElementById("savings-date-dropdown-btn");
  if (!menu) return;
  const isShown = menu.classList.contains("show");
  if (isShown) {
    closeSavingsDateDropdown();
  } else {
    const currentDateStr = appData.savingsMonitor?.dataRogito || "2027-04-30";
    const parts = currentDateStr.split("-");
    savingsPickerYear = parseInt(parts[0], 10) || 2027;
    savingsPickerMonth = parseInt(parts[1], 10) || 4;
    savingsPickerDay = parseInt(parts[2], 10) || 30;
    renderSavingsDatePicker();
    menu.classList.add("show");
    if (trigger) trigger.classList.add("active");
  }
}

function closeSavingsDateDropdown() {
  const menu = document.getElementById("savings-date-dropdown-menu");
  const trigger = document.getElementById("savings-date-dropdown-btn");
  if (menu) menu.classList.remove("show");
  if (trigger) trigger.classList.remove("active");
}

function stepSavingsPickerMonth(delta, e) {
  if (e) e.stopPropagation();
  savingsPickerMonth += delta;
  if (savingsPickerMonth > 12) {
    savingsPickerMonth = 1;
    savingsPickerYear++;
  } else if (savingsPickerMonth < 1) {
    savingsPickerMonth = 12;
    savingsPickerYear--;
  }
  renderSavingsDatePicker();
}

function stepSavingsPickerYear(delta, e) {
  if (e) e.stopPropagation();
  savingsPickerYear += delta;
  renderSavingsDatePicker();
}

function renderSavingsDatePicker() {
  const monthNames = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];

  const monthNameEl = document.getElementById("savings-picker-month-name");
  const yearEl = document.getElementById("savings-picker-year-display");
  const daysContainer = document.getElementById("savings-calendar-days-grid");
  const countdownEl = document.getElementById("savings-date-picker-countdown");

  if (monthNameEl) monthNameEl.innerText = monthNames[savingsPickerMonth - 1];
  if (yearEl) yearEl.innerText = savingsPickerYear;

  const daysInMonth = new Date(savingsPickerYear, savingsPickerMonth, 0).getDate();
  const firstDayIndex = (new Date(savingsPickerYear, savingsPickerMonth - 1, 1).getDay() + 6) % 7;

  const currentDateStr = appData.savingsMonitor?.dataRogito || "2027-04-30";
  const parts = currentDateStr.split("-");
  const selectedYear = parseInt(parts[0], 10);
  const selectedMonth = parseInt(parts[1], 10);
  const selectedDay = parseInt(parts[2], 10) || 1;

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === savingsPickerYear && (today.getMonth() + 1) === savingsPickerMonth;
  const todayDay = today.getDate();

  let daysHtml = "";
  for (let i = 0; i < firstDayIndex; i++) {
    daysHtml += `<div class="savings-calendar-day-empty"></div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isSelected = (savingsPickerYear === selectedYear && savingsPickerMonth === selectedMonth && d === selectedDay);
    const isToday = isCurrentMonth && d === todayDay;

    daysHtml += `
      <button type="button" class="savings-calendar-day-btn ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}" 
        onclick="selectSavingsPickerDay(${d}, event)" title="${d} ${monthNames[savingsPickerMonth - 1]} ${savingsPickerYear}">
        ${d}
      </button>
    `;
  }

  if (daysContainer) daysContainer.innerHTML = daysHtml;

  if (countdownEl) {
    const previewDateStr = `${savingsPickerYear}-${String(savingsPickerMonth).padStart(2, '0')}-${String(savingsPickerDay).padStart(2, '0')}`;
    const rem = getExactRemainingTime(previewDateStr);
    countdownEl.innerHTML = `
      <span class="material-symbols-outlined" style="font-size: 16px;">timer</span>
      <span>Mancano: <b>${rem.label}</b> (${rem.totaleGiorni} gg)</span>
    `;
  }
}

function selectSavingsPickerDay(dayNum, e) {
  if (e) e.stopPropagation();
  savingsPickerDay = dayNum;
  const formattedMonth = String(savingsPickerMonth).padStart(2, "0");
  const formattedDay = String(dayNum).padStart(2, "0");
  const newDateValue = `${savingsPickerYear}-${formattedMonth}-${formattedDay}`;
  closeSavingsDateDropdown();
  onSavingsTargetDateChange(newDateValue);
}

function setSavingsTargetFullDate(year, month, day, e) {
  if (e) e.stopPropagation();
  savingsPickerYear = year;
  savingsPickerMonth = month;
  savingsPickerDay = day;
  const formattedMonth = String(month).padStart(2, "0");
  const formattedDay = String(day).padStart(2, "0");
  const newDateValue = `${year}-${formattedMonth}-${formattedDay}`;
  closeSavingsDateDropdown();
  onSavingsTargetDateChange(newDateValue);
}

function onSavingsTargetDateChange(value) {
  if (!value) return;
  if (!appData.savingsMonitor) sanitizeData();
  appData.savingsMonitor.dataRogito = value;
  saveDataLocally();
  renderSavingsSection();
  const rem = getExactRemainingTime(value);
  showNotification(`Data obiettivo rogito aggiornata: ${formatTargetDateFull(value)} (tra ${rem.label})`);
}

function openSavingsInitialSetup(userId) {
  if (!appData.savingsMonitor) sanitizeData();
  appData.savingsMonitor.selectedUser = userId;
  openSavingsInitialModal(userId);
}

// Global click listener per chiusura popup custom
document.addEventListener("click", (e) => {
  const userContainer = document.getElementById("savings-user-dropdown-container");
  const budgetUserContainer = document.getElementById("budget-savings-user-dropdown-container");
  const dateContainer = document.getElementById("savings-date-dropdown-container");
  const initialBudgetContainer = document.getElementById("savings-initial-budget-picker-container");
  if (userContainer && !userContainer.contains(e.target)) {
    closeSavingsUserDropdown();
  }
  if (budgetUserContainer && !budgetUserContainer.contains(e.target)) {
    closeBudgetSavingsUserDropdown();
  }
  if (dateContainer && !dateContainer.contains(e.target)) {
    closeSavingsDateDropdown();
  }
  if (initialBudgetContainer && !initialBudgetContainer.contains(e.target)) {
    closeSavingsInitialBudgetPickerMenu();
  }
});

/**
 * Renderizza l'intera sezione Monitoraggio Risparmio e aggiorna la card nel Budget.
 */
function renderSavingsSection() {
  if (!appData.savingsMonitor) sanitizeData();
  const monitor = appData.savingsMonitor;
  const users = appData.settings.users || [];
  if (users.length === 0) return;

  const currentUserId = monitor.selectedUser && users.some(u => u.id === monitor.selectedUser)
    ? monitor.selectedUser
    : users[0].id;
  monitor.selectedUser = currentUserId;

  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const targetDateLabel = formatTargetMonthYear(monitor.dataRogito || "2027-04-30");

  // 1. Aggiorna etichette dei selettori custom disegnati M3
  const userNameEl = document.getElementById("savings-selected-user-name");
  if (userNameEl) userNameEl.innerText = currentUser.name;

  const dateDisplayEl = document.getElementById("savings-target-date-display");
  if (dateDisplayEl) dateDisplayEl.innerText = targetDateLabel;

  // 2. Calcola metriche correnti
  const metrics = calculateSavingsMetrics(currentUserId);

  // Se il capitale iniziale non è impostato, la rilevazione non può essere eseguita: nascondi il bottone
  const btnRegister = document.getElementById("btn-savings-register-rilevazione");
  if (btnRegister) {
    btnRegister.style.display = metrics.isConfigured ? "inline-flex" : "none";
  }

  // 3. Se il capitale iniziale non è ancora stato impostato, mostra onboarding / setup
  const onboardingContainer = document.getElementById("savings-onboarding-container");
  if (onboardingContainer) {
    if (!metrics.isConfigured) {
      onboardingContainer.innerHTML = `
        <div class="card" style="margin-bottom: 24px; padding: 22px 24px; border: 2px dashed var(--md-sys-color-primary); background: rgba(99, 102, 241, 0.05); border-radius: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: var(--md-sys-color-primary-container); color: var(--md-sys-color-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span class="material-symbols-outlined" style="font-size: 28px;">account_balance</span>
              </div>
              <div>
                <h3 style="margin: 0 0 4px 0; font-size: 16px; color: var(--md-sys-color-on-surface);">Inizia il monitoraggio per ${currentUser.name}</h3>
                <p style="margin: 0; font-size: 13px; color: var(--md-sys-color-outline); max-width: 620px; line-height: 1.4;">
                  Nessun capitale iniziale impostato. Seleziona una sola volta la voce di partenza dai tuoi Budget per bloccarla e inserisci i campi man mano per calcolare il risparmio reale generato nel tempo.
                </p>
              </div>
            </div>
            <button class="btn btn-filled" onclick="openSavingsInitialSetup('${currentUserId}')" style="height: 42px; border-radius: var(--md-sys-shape-corner-full); padding: 0 18px; font-weight: 600;">
              <span class="material-symbols-outlined">add_circle</span> Imposta Capitale Iniziale
            </button>
          </div>
        </div>
      `;
    } else {
      onboardingContainer.innerHTML = "";
    }
  }

  // 4. Renderizza Stat-Cards Superiori
  const topCardsContainer = document.getElementById("savings-top-cards");
  if (topCardsContainer) {
    if (!metrics.isConfigured) {
      topCardsContainer.innerHTML = `
        <div class="stat-card" style="background-color: var(--md-sys-color-primary-container);">
          <span class="stat-card-label">Risparmio Netto da Reddito</span>
          <div class="stat-value sensitive-value" style="margin-top: 4px;">— €</div>
          <div style="font-size: 11px; opacity: 0.85; margin-top: 4px;">In attesa di configurazione</div>
        </div>
        <div class="stat-card secondary">
          <span class="stat-card-label">Liquidità Reale Netta</span>
          <div class="stat-value sensitive-value" style="margin-top: 4px;">— €</div>
          <div style="font-size: 11px; opacity: 0.85; margin-top: 4px;">In attesa di configurazione</div>
        </div>
        <div class="stat-card tertiary">
          <span class="stat-card-label">Risparmio Medio Mensile</span>
          <div class="stat-value sensitive-value" style="margin-top: 4px;">— €/mese</div>
          <div style="font-size: 11px; opacity: 0.85; margin-top: 4px;">In attesa di configurazione</div>
        </div>
        <div class="stat-card" style="background-color: var(--md-sys-color-surface-container-high); border: 1px solid var(--md-sys-color-primary);">
          <span class="stat-card-label" style="color: var(--md-sys-color-primary);">Stima Cassa al Rogito (${targetDateLabel})</span>
          <div class="stat-value sensitive-value" style="color: var(--md-sys-color-primary); margin-top: 4px;">— €</div>
          <div style="font-size: 11px; color: var(--md-sys-color-outline); margin-top: 4px;">Tra ${metrics.tempoRimanente.label} (${metrics.tempoRimanente.totaleGiorni} gg)</div>
        </div>
      `;
    } else {
      const isRisparmioPositivo = metrics.risparmioNetto >= 0;
      const badgeColorClass = isRisparmioPositivo ? "positive" : "negative";
      const deltaIcon = isRisparmioPositivo ? "trending_up" : "trending_down";

      topCardsContainer.innerHTML = `
        <div class="stat-card" style="background-color: var(--md-sys-color-primary-container);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <span class="stat-card-label">${isRisparmioPositivo ? 'Risparmio Netto da Reddito' : 'Disavanzo Netto di Cassa'}</span>
            <span class="savings-badge-pill ${badgeColorClass}">
              <span class="material-symbols-outlined" style="font-size: 14px;">${deltaIcon}</span>
              ${formatCurrency(metrics.risparmioNetto)}
            </span>
          </div>
          <div class="stat-value sensitive-value" style="margin-top: 4px; ${isRisparmioPositivo ? '' : 'color: var(--md-sys-color-error);'}">${formatCurrency(metrics.risparmioNetto)}</div>
          <div style="font-size: 11px; opacity: 0.85; margin-top: 4px;">
            ${isRisparmioPositivo ? 'Capitale fresco generato' : 'Erosione capitale / spese superiori ai ricavi'} (Lordo: ${formatCurrency(metrics.risparmioLordo)})
          </div>
        </div>

        <div class="stat-card secondary">
          <span class="stat-card-label">Liquidità Reale Netta</span>
          <div class="stat-value sensitive-value" style="margin-top: 4px;">${formatCurrency(metrics.liquiditaNetta)}</div>
          <div style="font-size: 11px; opacity: 0.85; margin-top: 4px;">
            ${metrics.totalePassivita > 0 
              ? `Giacenza conto (${formatCurrency(metrics.saldoConto)}) - debiti (${formatCurrency(metrics.totalePassivita)})`
              : `Giacenza conto effettiva (nessun debito attivo)`}
          </div>
        </div>

        <div class="stat-card tertiary">
          <span class="stat-card-label">Risparmio Medio Mensile</span>
          <div class="stat-value sensitive-value" style="margin-top: 4px; ${isRisparmioPositivo ? '' : 'color: var(--md-sys-color-error);'}">${formatCurrency(metrics.tassoMedioMensile)}/mese</div>
          <div style="font-size: 11px; opacity: 0.85; margin-top: 4px;">
            ${isRisparmioPositivo ? 'Ritmo di accumulo' : 'Ritmo di disavanzo'} su ${metrics.mesiTrascorsi} mesi dall'avvio (${metrics.dataAvvio ? new Date(metrics.dataAvvio).toLocaleDateString('it-IT') : 'inizio'})
          </div>
        </div>

        <div class="stat-card" style="background-color: var(--md-sys-color-surface-container-high); border: 1px solid var(--md-sys-color-primary);">
          <span class="stat-card-label" style="color: var(--md-sys-color-primary);">Stima Cassa al Rogito (${targetDateLabel})</span>
          <div class="stat-value sensitive-value" style="color: var(--md-sys-color-primary); margin-top: 4px;">${formatCurrency(metrics.proiezioneLiquiditaRogito)}</div>
          <div style="font-size: 11px; color: var(--md-sys-color-outline); margin-top: 4px;">Tra ${metrics.tempoRimanente.label} (${metrics.risparmioFuturoStimato >= 0 ? '+' : ''}${formatCurrency(metrics.risparmioFuturoStimato)} attesi)</div>
        </div>
      `;
    }
  }

  // 5. Renderizza Breakdown Bar Grafica Pulita
  const breakdownBar = document.getElementById("savings-breakdown-bar");
  const breakdownLegend = document.getElementById("savings-breakdown-legend");
  if (breakdownBar && breakdownLegend) {
    if (!metrics.isConfigured || metrics.impieghiTotali === 0) {
      breakdownBar.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--md-sys-color-outline); font-style: italic;">
          Nessun dato registrato. Registra la situazione iniziale per visualizzare la ripartizione dei fondi.
        </div>
      `;
    } else if (metrics.risparmioNetto >= 0) {
      const pctInizialeText = metrics.pctIniziale >= 8 ? `${metrics.pctIniziale.toFixed(0)}%` : "";
      const pctTrasferimentiText = (metrics.pctTrasferimenti >= 8 && metrics.totaleTrasferimenti > 0) ? `${metrics.pctTrasferimenti.toFixed(0)}%` : "";
      const pctPassivitaText = (metrics.pctPassivita >= 8 && metrics.totalePassivita > 0) ? `${metrics.pctPassivita.toFixed(0)}%` : "";
      const pctRisparmioText = metrics.pctRisparmio >= 8 ? `${metrics.pctRisparmio.toFixed(0)}%` : "";

      breakdownBar.innerHTML = `
        <div class="savings-bar-segment initial" style="width: ${metrics.pctIniziale.toFixed(1)}%;" title="Capitale Iniziale: ${formatter.format(metrics.capitaleIniziale)} (${metrics.pctIniziale.toFixed(1)}%)">
          ${pctInizialeText}
        </div>
        ${metrics.totaleTrasferimenti > 0 ? `
        <div class="savings-bar-segment assets" style="width: ${metrics.pctTrasferimenti.toFixed(1)}%;" title="Disinvestimenti / Asset: ${formatter.format(metrics.totaleTrasferimenti)} (${metrics.pctTrasferimenti.toFixed(1)}%)">
          ${pctTrasferimentiText}
        </div>` : ''}
        ${metrics.totalePassivita > 0 ? `
        <div class="savings-bar-segment debt" style="width: ${metrics.pctPassivita.toFixed(1)}%;" title="Debiti & Passività: ${formatter.format(metrics.totalePassivita)} (${metrics.pctPassivita.toFixed(1)}%)">
          ${pctPassivitaText}
        </div>` : ''}
        <div class="savings-bar-segment savings" style="width: ${metrics.pctRisparmio.toFixed(1)}%;" title="Risparmio Reale: ${formatter.format(metrics.risparmioNetto)} (${metrics.pctRisparmio.toFixed(1)}%)">
          ${pctRisparmioText}
        </div>
      `;
    } else {
      // Risparmio netto negativo (disavanzo / erosione capitale)
      const pctInizialeText = metrics.pctIniziale >= 8 ? `${metrics.pctIniziale.toFixed(0)}%` : "";
      const pctTrasferimentiText = (metrics.pctTrasferimenti >= 8 && metrics.totaleTrasferimenti > 0) ? `${metrics.pctTrasferimenti.toFixed(0)}%` : "";
      const pctPassivitaText = (metrics.pctPassivita >= 8 && metrics.totalePassivita > 0) ? `${metrics.pctPassivita.toFixed(0)}%` : "";
      const pctDeficitText = metrics.pctDeficit >= 8 ? `-${metrics.pctDeficit.toFixed(0)}%` : "";

      breakdownBar.innerHTML = `
        <div class="savings-bar-segment initial" style="width: ${metrics.pctIniziale.toFixed(1)}%;" title="Capitale Iniziale: ${formatter.format(metrics.capitaleIniziale)} (${metrics.pctIniziale.toFixed(1)}%)">
          ${pctInizialeText}
        </div>
        ${metrics.totaleTrasferimenti > 0 ? `
        <div class="savings-bar-segment assets" style="width: ${metrics.pctTrasferimenti.toFixed(1)}%;" title="Disinvestimenti / Asset: ${formatter.format(metrics.totaleTrasferimenti)} (${metrics.pctTrasferimenti.toFixed(1)}%)">
          ${pctTrasferimentiText}
        </div>` : ''}
        ${metrics.totalePassivita > 0 ? `
        <div class="savings-bar-segment debt" style="width: ${metrics.pctPassivita.toFixed(1)}%;" title="Debiti & Passività: ${formatter.format(metrics.totalePassivita)} (${metrics.pctPassivita.toFixed(1)}%)">
          ${pctPassivitaText}
        </div>` : ''}
        <div class="savings-bar-segment deficit" style="width: ${metrics.pctDeficit.toFixed(1)}%;" title="Disavanzo / Erosione Risparmio: ${formatter.format(metrics.risparmioNetto)} (-${metrics.pctDeficit.toFixed(1)}%)">
          ${pctDeficitText}
        </div>
      `;
    }

    // Griglia a card M3 per la legenda (Capitale Iniziale -> Asset -> Debiti -> Risparmio alla fine)
    breakdownLegend.className = "savings-breakdown-legend-grid";
    breakdownLegend.innerHTML = `
      <div class="savings-legend-card">
        <div class="savings-legend-card-top">
          <div class="savings-legend-card-label">
            <div class="savings-legend-card-dot" style="background-color: #6366f1;"></div>
            <span>Capitale Iniziale</span>
          </div>
          <span class="savings-badge-pill" style="background: rgba(99, 102, 241, 0.15); color: #6366f1;">
            ${metrics.isConfigured ? metrics.pctIniziale.toFixed(1) + '%' : '0.0%'}
          </span>
        </div>
        <div class="savings-legend-card-val sensitive-value">${metrics.isConfigured ? formatCurrency(metrics.capitaleIniziale) : '— €'}</div>
        <div class="savings-legend-card-desc">Fondi disponibili all'avvio del piano</div>
      </div>

      <div class="savings-legend-card">
        <div class="savings-legend-card-top">
          <div class="savings-legend-card-label">
            <div class="savings-legend-card-dot" style="background-color: #f59e0b;"></div>
            <span>Asset & Disinvestimenti</span>
          </div>
          <span class="savings-badge-pill" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">
            ${metrics.isConfigured ? metrics.pctTrasferimenti.toFixed(1) + '%' : '0.0%'}
          </span>
        </div>
        <div class="savings-legend-card-val sensitive-value">${metrics.isConfigured ? formatCurrency(metrics.totaleTrasferimenti) : '— €'}</div>
        <div class="savings-legend-card-desc">${metrics.totaleTrasferimenti > 0 ? 'Vendita beni o disinvestimento titoli' : 'Nessun asset o disinvestimento'}</div>
      </div>

      <div class="savings-legend-card">
        <div class="savings-legend-card-top">
          <div class="savings-legend-card-label">
            <div class="savings-legend-card-dot" style="background-color: #f43f5e;"></div>
            <span>Debiti & Passività</span>
          </div>
          <span class="savings-badge-pill ${metrics.totalePassivita > 0 ? 'negative' : ''}" style="${metrics.totalePassivita > 0 ? '' : 'background: rgba(148, 163, 184, 0.15); color: var(--md-sys-color-outline);'}">
            ${metrics.isConfigured ? metrics.pctPassivita.toFixed(1) + '%' : '0.0%'}
          </span>
        </div>
        <div class="savings-legend-card-val sensitive-value" style="color: ${metrics.totalePassivita > 0 ? 'var(--md-sys-color-error)' : 'inherit'};">
          ${metrics.isConfigured ? formatCurrency(metrics.totalePassivita) : '— €'}
        </div>
        <div class="savings-legend-card-desc">
          ${metrics.totalePassivita > 0 ? 'Anticipi o prestiti aperti da saldare' : 'Nessun debito aperto da rimborsare'}
        </div>
      </div>

      <div class="savings-legend-card">
        <div class="savings-legend-card-top">
          <div class="savings-legend-card-label">
            <div class="savings-legend-card-dot" style="background-color: ${metrics.risparmioNetto >= 0 ? 'var(--md-sys-color-success)' : '#ef4444'};"></div>
            <span>${metrics.risparmioNetto >= 0 ? 'Risparmio Reale Generato' : 'Disavanzo / Erosione'}</span>
          </div>
          <span class="savings-badge-pill ${metrics.risparmioNetto >= 0 ? 'positive' : 'negative'}">
            ${metrics.isConfigured ? (metrics.risparmioNetto >= 0 ? metrics.pctRisparmio.toFixed(1) + '%' : '-' + metrics.pctDeficit.toFixed(1) + '%') : '0.0%'}
          </span>
        </div>
        <div class="savings-legend-card-val sensitive-value" style="color: ${metrics.risparmioNetto >= 0 ? 'var(--md-sys-color-success)' : 'var(--md-sys-color-error)'};">
          ${metrics.isConfigured ? formatCurrency(metrics.risparmioNetto) : '— €'}
        </div>
        <div class="savings-legend-card-desc">
          ${metrics.risparmioNetto >= 0 ? 'Capitale fresco accumulato dal reddito' : 'Spese e debiti superiori ai fondi coperti'}
        </div>
      </div>
    `;
  }

  // 6. Box Proiezione Dettagliata Rogito
  const projectionBox = document.getElementById("savings-projection-box");
  if (projectionBox) {
    if (!metrics.isConfigured) {
      projectionBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="background: var(--md-sys-color-primary-container); color: var(--md-sys-color-primary); border-radius: 12px; padding: 10px; display: flex; align-items: center; justify-content: center;">
            <span class="material-symbols-outlined" style="font-size: 26px;">event_available</span>
          </div>
          <div style="font-size: 13px; color: var(--md-sys-color-outline);">
            Imposta il capitale iniziale e registra una rilevazione per stimare la liquidità attesa entro <b>${targetDateLabel}</b>.
          </div>
        </div>
      `;
    } else {
      const isPositiveTrend = metrics.risparmioNetto >= 0;
      projectionBox.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 14px;">
          <div style="background: ${isPositiveTrend ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-error-container)'}; color: ${isPositiveTrend ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-error-container)'}; border-radius: 12px; padding: 10px; display: flex; align-items: center; justify-content: center;">
            <span class="material-symbols-outlined" style="font-size: 26px;">${isPositiveTrend ? 'event_available' : 'warning'}</span>
          </div>
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
              <strong style="font-size: 15px; color: var(--md-sys-color-primary);">Traguardo Stipula Mutuo & Rogito (${targetDateLabel})</strong>
              <span class="savings-badge-pill" style="background: var(--md-sys-color-surface-container-high); border: 1px solid var(--md-sys-color-outline-variant);">
                Mancano ${metrics.tempoRimanente.label} (${metrics.tempoRimanente.totaleGiorni} gg)
              </span>
            </div>
            <p style="margin: 6px 0 10px 0; font-size: 13px; line-height: 1.5; color: var(--md-sys-color-on-surface);">
              ${isPositiveTrend 
                ? `Al ritmo medio di risparmio pari a <b>${formatCurrency(metrics.tassoMedioMensile)} al mese</b>, entro <b>${targetDateLabel}</b> genererai ulteriori <b>+${formatCurrency(metrics.risparmioFuturoStimato)}</b>, raggiungendo una liquidità netta personale disponibile di <b>${formatCurrency(metrics.proiezioneLiquiditaRogito)}</b>.`
                : `Attenzione: l'andamento corrente registra un disavanzo medio di <b>${formatCurrency(Math.abs(metrics.tassoMedioMensile))} al mese</b>. Senza nuove entrate o riduzioni di uscite, entro <b>${targetDateLabel}</b> la liquidità netta personale disponibile potrebbe ridursi a <b>${formatCurrency(metrics.proiezioneLiquiditaRogito)}</b>.`
              }
            </p>
            <div style="display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; color: var(--md-sys-color-outline);">
              <span>Fondi di Partenza (Iniziale + Asset): <b>${formatCurrency(metrics.fondiPreesistenti)}</b></span>
              <span>·</span>
              <span>Debiti/Prestiti da Saldare: <b>${formatCurrency(metrics.totalePassivita)}</b></span>
            </div>
          </div>
        </div>
      `;
    }
  }

  // 7. Renderizza Tabella Storico Rilevazioni
  renderSavingsHistoryTable(currentUserId);

  // 8. Aggiorna la Card nel Budget
  renderBudgetSavingsCard(currentUserId, currentUser, metrics, targetDateLabel);
}

/**
 * Renderizza la tabella cronologica dello storico dei punti di controllo.
 * @param {string} userId 
 */
function renderSavingsHistoryTable(userId) {
  const tbody = document.getElementById("tbody-savings-history");
  if (!tbody) return;
  tbody.innerHTML = "";

  const monitor = appData.savingsMonitor;
  const history = (monitor.storico || [])
    .filter(s => s.userId === userId)
    .sort((a, b) => new Date(b.dataRilevazione) - new Date(a.dataRilevazione));

  if (history.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" style="text-align: center; color: var(--md-sys-color-outline); padding: 24px;">
          Nessuna rilevazione salvata nello storico per questo utente.<br>
          Clicca <b>"Registra Rilevazione"</b> per salvare il primo punto di controllo del risparmio.
        </td>
      </tr>
    `;
    return;
  }

  history.forEach((snap, idx) => {
    // Calcolo variazione delta rispetto alla rilevazione precedente (più vecchia)
    const prevSnap = history[idx + 1];
    let deltaHtml = `<span style="color: var(--md-sys-color-outline);">—</span>`;
    if (prevSnap) {
      const diff = snap.risultati.risparmioNetto - prevSnap.risultati.risparmioNetto;
      const isUp = diff >= 0;
      deltaHtml = `
        <span class="savings-badge-pill ${isUp ? 'positive' : 'negative'}">
          <span class="material-symbols-outlined" style="font-size: 13px;">${isUp ? 'arrow_upward' : 'arrow_downward'}</span>
          ${formatCurrency(diff)}
        </span>
      `;
    }

    const isNettoPos = snap.risultati.risparmioNetto >= 0;

    const hasNoteS = snap.note && String(snap.note).trim().length > 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="col-savings-date" data-label="Data"><b>${new Date(snap.dataRilevazione).toLocaleDateString("it-IT")}</b></td>
      <td class="col-metric" data-label="Saldo Conto">${formatCurrency(snap.saldoContoCorrente)}</td>
      <td class="col-metric" data-label="Spese Sostenute">${formatCurrency(snap.speseSostenute)}</td>
      <td class="col-metric" data-label="Fondi Preesistenti">${formatCurrency(snap.risultati.fondiPreesistenti)}</td>
      <td class="col-metric" data-label="Risparmio Lordo">${formatCurrency(snap.risultati.risparmioLordo)}</td>
      <td class="col-metric" data-label="Passività" style="color: var(--md-sys-color-error);">${formatCurrency(snap.risultati.totalePassivita)}</td>
      <td class="col-metric" data-label="Risparmio Netto" style="font-weight: 600; color: ${isNettoPos ? 'var(--md-sys-color-success)' : 'var(--md-sys-color-error)'};">${formatCurrency(snap.risultati.risparmioNetto)}</td>
      <td class="col-metric" data-label="Variazione (Δ)">${deltaHtml}</td>
      <td class="col-metric" data-label="Liquidità Netta" style="font-weight: 600;">${formatCurrency(snap.risultati.liquiditaNetta)}</td>
      <td class="col-note ${hasNoteS ? "" : "col-note-empty"}" data-label="Note" style="font-size: 12px; color: var(--md-sys-color-outline); white-space: pre-wrap;">${renderRichContent(snap.note, "savings", snap.id, "note")}</td>
      <td class="col-actions" data-label="Azioni" style="white-space: nowrap;">
        <button class="btn-icon" title="Modifica punto di storico" onclick="openEditSavingsSnapshot('${snap.id}')" style="margin-right: 4px;">
          <span class="material-symbols-outlined" style="font-size: 18px; color: var(--md-sys-color-primary);">edit</span>
        </button>
        <button class="btn-icon" title="Elimina punto di storico" onclick="deleteSavingsSnapshot('${snap.id}')">
          <span class="material-symbols-outlined" style="font-size: 18px; color: var(--md-sys-color-error);">delete</span>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Renderizza la card di monitoraggio risparmio integrata nella schermata Budget.
 */
function renderBudgetSavingsCard(userId, user, metrics, targetDateLabel = null) {
  const grid = document.getElementById("budget-savings-grid");
  const callout = document.getElementById("budget-savings-callout");
  const budgetUserNameEl = document.getElementById("budget-savings-selected-user-name");
  if (budgetUserNameEl && user) {
    budgetUserNameEl.textContent = user.name;
  }
  if (!grid || !callout) return;

  const dateLabel = targetDateLabel || formatTargetMonthYear(appData.savingsMonitor?.dataRogito || "2027-04-30");

  const titleEl = document.getElementById("budget-savings-card-title");
  if (titleEl) {
    titleEl.innerHTML = `
      <span class="material-symbols-outlined" style="color: var(--md-sys-color-primary)">trending_up</span>
      Capacità di Risparmio & Copertura Rogito (${dateLabel})
    `;
  }

  if (!metrics.isConfigured) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 16px; text-align: center; color: var(--md-sys-color-outline); font-size: 13px;">
        Capitale iniziale non ancora impostato per <b>${user.name}</b>.
        <br><a href="javascript:void(0)" onclick="openSavingsInitialSetup('${userId}')" style="color: var(--md-sys-color-primary); font-weight: 600; text-decoration: underline; margin-top: 6px; display: inline-block;">Imposta situazione di partenza</a>
      </div>
    `;
    callout.style.display = "none";
    return;
  }
  callout.style.display = "flex";

  // 1. Quota di TUTTI i costi della casa a carico di questo utente (scapitato di tutti i costi)
  const costoTotaleComplessivo = (appData.costi || []).reduce((acc, curr) => acc + (parseFloat(curr.prezzo) || 0), 0);
  const sharePercent = typeof user.share === "number" ? user.share : (100 / (appData.settings.users || []).length);
  const quotaCostiTotaleUtente = (costoTotaleComplessivo || 0) * (sharePercent / 100);

  // Dettaglio costi: solo immobile vs altri costi (notaio, tasse, agenzia, ristrutturazione, arredo...)
  const costoCasaImmobile = (appData.costi || [])
    .filter((c) => {
      const catObj = appData.settings.categories?.[c.cat];
      return typeof catObj === "object" ? !!catObj.isImmobile : c.cat === "Immobili";
    })
    .reduce((acc, curr) => acc + (parseFloat(curr.prezzo) || 0), 0);
  const quotaImmobileUtente = (costoCasaImmobile || 0) * (sharePercent / 100);
  const quotaAltriCostiUtente = Math.max(0, quotaCostiTotaleUtente - quotaImmobileUtente);

  // 2. Budget dell'utente (pianificato + risparmi netti accumulati ad oggi)
  const mutuoRow = (appData.budget || []).find((b) => b.isMutuo);
  const mutuoUtente = mutuoRow ? (parseFloat(mutuoRow[userId]) || 0) : 0;

  const budgetPianificatoUtente = (appData.budget || []).reduce(
    (acc, curr) => acc + (parseFloat(curr[userId]) || 0),
    0
  );
  const altreRisorseBudget = budgetPianificatoUtente - mutuoUtente;

  // Risparmio netto generato ad oggi
  const risparmioNettoAttuale = metrics.risparmioNetto || 0;

  // Budget totale attuale (esattamente coincidente con la Dashboard)
  const budgetTotaleAttualeUtente = budgetPianificatoUtente + risparmioNettoAttuale;

  // 3. Liquidità Residua Reale (budget al netto di TUTTI i costi della casa, identico alla Panoramica)
  const liquiditaResiduaRealeUtente = budgetTotaleAttualeUtente - quotaCostiTotaleUtente;

  // 4. Margine di risparmio futuro atteso da oggi al rogito
  const risparmioFuturoStimato = metrics.risparmioFuturoStimato || 0;

  // 5. Risultato finale effettivo: scapitato di tutti i costi con l'aggiunta del margine di risparmio futuro
  const margineFinaleRogito = liquiditaResiduaRealeUtente + risparmioFuturoStimato;
  const isCoperto = margineFinaleRogito >= 0;

  grid.innerHTML = `
    <div style="padding: 12px; border-radius: 8px; background: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-surface-container-high);">
      <div style="font-size: 12px; color: var(--md-sys-color-outline);">${risparmioNettoAttuale >= 0 ? `Risparmio Netto ${user.name}` : `Disavanzo Netto ${user.name}`}</div>
      <div style="font-size: 18px; font-weight: 700; color: ${risparmioNettoAttuale >= 0 ? 'var(--md-sys-color-success)' : 'var(--md-sys-color-error)'}; margin-top: 4px;">${formatCurrency(risparmioNettoAttuale)}</div>
      <div style="font-size: 11px; color: var(--md-sys-color-outline); margin-top: 2px;">${metrics.tassoMedioMensile >= 0 ? '+' : ''}${formatCurrency(metrics.tassoMedioMensile)} / mese</div>
    </div>

    <div style="padding: 12px; border-radius: 8px; background: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-surface-container-high);">
      <div style="font-size: 12px; color: var(--md-sys-color-outline);">Liquidità Residua Reale</div>
      <div style="font-size: 18px; font-weight: 700; color: ${liquiditaResiduaRealeUtente >= 0 ? 'var(--md-sys-color-success)' : 'var(--md-sys-color-error)'}; margin-top: 4px;">
        ${liquiditaResiduaRealeUtente >= 0 ? '+' : ''}${formatCurrency(liquiditaResiduaRealeUtente)}
      </div>
      <div style="font-size: 11px; color: var(--md-sys-color-outline); margin-top: 2px;">Netto di tutti i costi casa ad oggi</div>
    </div>

    <div style="padding: 12px; border-radius: 8px; background: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-surface-container-high);">
      <div style="font-size: 12px; color: var(--md-sys-color-outline);">Risparmio Futuro al Rogito</div>
      <div style="font-size: 18px; font-weight: 700; color: var(--md-sys-color-primary); margin-top: 4px;">
        ${risparmioFuturoStimato >= 0 ? '+' : ''}${formatCurrency(risparmioFuturoStimato)}
      </div>
      <div style="font-size: 11px; color: var(--md-sys-color-outline); margin-top: 2px;">${dateLabel} (tra ${metrics.tempoRimanente.label})</div>
    </div>

    <div style="padding: 12px; border-radius: 8px; background: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-surface-container-high);">
      <div style="font-size: 12px; color: var(--md-sys-color-outline);">Margine Finale al Rogito</div>
      <div style="font-size: 18px; font-weight: 700; color: ${isCoperto ? 'var(--md-sys-color-success)' : 'var(--md-sys-color-error)'}; margin-top: 4px;">
        ${isCoperto ? '+' : ''}${formatCurrency(margineFinaleRogito)}
      </div>
      <div style="font-size: 11px; color: var(--md-sys-color-outline); margin-top: 2px;">
        Residuo costi (${formatCurrency(liquiditaResiduaRealeUtente)}) + Risparmi attesi (${formatCurrency(risparmioFuturoStimato)})
      </div>
    </div>
  `;

  callout.innerHTML = `
    <span class="material-symbols-outlined" style="color: ${isCoperto ? 'var(--md-sys-color-success)' : 'var(--md-sys-color-error)'}; font-size: 26px; flex-shrink: 0; margin-top: 2px;">
      ${isCoperto ? 'verified' : 'warning'}
    </span>
    <div style="flex: 1; line-height: 1.6; font-size: 13.5px;">
      <div style="font-weight: 700; font-size: 14px; color: ${isCoperto ? 'var(--md-sys-color-success)' : 'var(--md-sys-color-error)'}; margin-bottom: 6px;">
        ${isCoperto ? 'Copertura Totale Garantita con Margine Finale Positivo' : 'Attenzione: Fabbisogno Finale Scoperto al Rogito'}
      </div>

      <div style="display: flex; flex-direction: column; gap: 5px; color: var(--md-sys-color-on-surface);">
        <div>
          • <b>Quota totale costi previsti (100% spese casa):</b> ${formatCurrency(quotaCostiTotaleUtente)}
          ${quotaImmobileUtente > 0 && quotaAltriCostiUtente > 0
            ? `<span style="color: var(--md-sys-color-outline); font-size: 12px;">(${formatCurrency(quotaImmobileUtente)} immobile + ${formatCurrency(quotaAltriCostiUtente)} notaio, tasse, agenzia, arredi, ecc.)</span>`
            : ''}
        </div>
        <div>
          • <b>Budget totale disponibile ad oggi:</b> ${formatCurrency(budgetTotaleAttualeUtente)}
          <span style="color: var(--md-sys-color-outline); font-size: 12px;">(${formatCurrency(mutuoUtente)} mutuo + ${formatCurrency(altreRisorseBudget)} altre risorse ${risparmioNettoAttuale !== 0 ? `+ ${formatCurrency(risparmioNettoAttuale)} risparmi netti ad oggi` : ''})</span>
        </div>
        <div>
          • <b>Liquidità Residua Reale (scapitata di TUTTI i costi):</b> <b style="color: ${liquiditaResiduaRealeUtente >= 0 ? 'var(--md-sys-color-success)' : 'var(--md-sys-color-error)'};">${liquiditaResiduaRealeUtente >= 0 ? '+' : ''}${formatCurrency(liquiditaResiduaRealeUtente)}</b>
          <div style="font-size: 12px; color: var(--md-sys-color-outline); margin-left: 14px; margin-top: 1px;">↳ Coincide esattamente con la voce "Liquidità Residua Reale" della Panoramica.</div>
        </div>
        <div>
          • <b>Margine di risparmio futuro stimato (${dateLabel}):</b> <b style="color: var(--md-sys-color-primary);">${risparmioFuturoStimato >= 0 ? '+' : ''}${formatCurrency(risparmioFuturoStimato)}</b>
          <div style="font-size: 12px; color: var(--md-sys-color-outline); margin-left: 14px; margin-top: 1px;">↳ Al ritmo medio di ${formatCurrency(metrics.tassoMedioMensile)}/mese nei ${metrics.tempoRimanente.label} rimanenti.</div>
        </div>
      </div>

      <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--md-sys-color-surface-container-highest);">
        ${isCoperto
          ? `🛡️ <b>Margine Finale Effettivo al Rogito:</b> <b style="color: var(--md-sys-color-success); font-size: 15px;">+${formatCurrency(margineFinaleRogito)}</b>
             <div style="color: var(--md-sys-color-outline); font-size: 12px; margin-top: 2px;">
               Dato dalla <b>Liquidità Residua Reale (+${formatCurrency(liquiditaResiduaRealeUtente)})</b> scalati tutti i costi casa + <b>+${formatCurrency(risparmioFuturoStimato)}</b> di nuovi risparmi attesi.
               <br><small>Cassa totale stimata sul conto al rogito: <b>${formatCurrency(metrics.proiezioneLiquiditaRogito)}</b>.</small>
             </div>`
          : `⚠️ <b>Disavanzo Finale Stimato:</b> <b style="color: var(--md-sys-color-error); font-size: 15px;">${formatCurrency(margineFinaleRogito)}</b>
             <div style="color: var(--md-sys-color-outline); font-size: 12px; margin-top: 2px;">
               Anche sommando i risparmi futuri stimati di ${formatCurrency(risparmioFuturoStimato)}, mancheranno <b>${formatCurrency(Math.abs(margineFinaleRogito))}</b> per coprire tutti i costi della casa.
             </div>`
        }
      </div>
    </div>
  `;
}

// ------------------------------------------------------------------------------
// MODALE INSERIMENTO & REGISTRAZIONE SNAPSHOT RISPARMIO
// ------------------------------------------------------------------------------

let tempSavingsAssets = [];
let tempSavingsDebts = [];

/**
 * Aggiorna lo stato del campo Capitale Iniziale nel modale:
 * se è già stato registrato per l'utente, lo blocca e nasconde il selettore budget;
 * altrimenti, mostra il selettore delle voci da Budget per impostarlo.
 * @param {string} userId 
 */
// ------------------------------------------------------------------------------
// MODALE 1: IMPOSTA CAPITALE INIZIALE (Setup di partenza)
// ------------------------------------------------------------------------------

let selectedSavingsInitialBudgetId = null;

function openSavingsInitialModal(userId = null) {
  if (!appData.savingsMonitor) sanitizeData();
  const monitor = appData.savingsMonitor;
  const currentUserId = userId || monitor.selectedUser || (appData.settings.users[0] ? appData.settings.users[0].id : "u1");
  const uConfig = monitor.userConfig[currentUserId] || {};

  const userSelect = document.getElementById("savings-initial-user");
  if (userSelect) {
    userSelect.innerHTML = appData.settings.users
      .map(u => `<option value="${u.id}" ${u.id === currentUserId ? "selected" : ""}>${u.name}</option>`)
      .join("");
  }

  selectedSavingsInitialBudgetId = null;
  const capValueInput = document.getElementById("savings-initial-capitale-value");
  if (capValueInput) capValueInput.value = "";

  const todayStr = new Date().toISOString().split("T")[0];
  const dataAvvioInput = document.getElementById("savings-initial-data-avvio");
  if (dataAvvioInput) {
    dataAvvioInput.value = (uConfig.dataAvvio && uConfig.dataAvvio !== "2024-01-01") ? uConfig.dataAvvio : todayStr;
  }

  updateSavingsInitialBudgetTriggerDisplay(null, currentUserId);
  renderSavingsInitialBudgetMenu(currentUserId);

  openModalOverlay("savingsInitialModal");
}

function closeSavingsInitialModal() {
  closeSavingsInitialBudgetPickerMenu();
  closeModalOverlay("savingsInitialModal");
}

function onSavingsInitialUserChange() {
  const userId = document.getElementById("savings-initial-user").value;
  const uConfig = appData.savingsMonitor?.userConfig[userId] || {};
  selectedSavingsInitialBudgetId = null;
  const todayStr = new Date().toISOString().split("T")[0];
  const dataAvvioInput = document.getElementById("savings-initial-data-avvio");
  if (dataAvvioInput) {
    dataAvvioInput.value = (uConfig.dataAvvio && uConfig.dataAvvio !== "2024-01-01") ? uConfig.dataAvvio : todayStr;
  }
  updateSavingsInitialBudgetTriggerDisplay(null, userId);
  renderSavingsInitialBudgetMenu(userId);
}

function toggleSavingsInitialBudgetPicker(e) {
  if (e) e.stopPropagation();
  closeSavingsUserDropdown();
  closeSavingsDateDropdown();
  const menu = document.getElementById("savings-initial-budget-picker-menu");
  const trigger = document.getElementById("savings-initial-budget-picker-trigger");
  if (!menu) return;
  const isShown = menu.classList.contains("show");
  if (isShown) {
    closeSavingsInitialBudgetPickerMenu();
  } else {
    const userId = document.getElementById("savings-initial-user")?.value || appData.savingsMonitor.selectedUser;
    renderSavingsInitialBudgetMenu(userId);
    menu.classList.add("show");
    if (trigger) trigger.classList.add("active");
  }
}

function closeSavingsInitialBudgetPickerMenu() {
  const menu = document.getElementById("savings-initial-budget-picker-menu");
  const trigger = document.getElementById("savings-initial-budget-picker-trigger");
  if (menu) menu.classList.remove("show");
  if (trigger) trigger.classList.remove("active");
}

function closeSavingsBudgetPickerMenu() {
  closeSavingsInitialBudgetPickerMenu();
}

function renderSavingsInitialBudgetMenu(userId) {
  const menu = document.getElementById("savings-initial-budget-picker-menu");
  if (!menu) return;
  const nonMutuoBudget = (appData.budget || []).filter(b => !b.isMutuo);

  if (nonMutuoBudget.length === 0) {
    menu.innerHTML = `
      <div style="padding: 16px; text-align: center; color: var(--md-sys-color-outline); font-size: 13px;">
        <span class="material-symbols-outlined" style="font-size: 26px; opacity: 0.5; margin-bottom: 4px; display: block;">savings</span>
        Nessuna voce di risorsa trovata nei Budget per questo utente.
      </div>
    `;
    return;
  }

  let html = "";
  nonMutuoBudget.forEach(b => {
    const quotaU = parseFloat(b[userId]) || 0;
    const isSelected = selectedSavingsInitialBudgetId == b.id;
    html += `
      <div class="savings-budget-option-row ${isSelected ? 'selected' : ''}" onclick="selectSavingsInitialBudgetItem('${b.id}')">
        <div class="savings-budget-option-left">
          <div class="savings-budget-option-icon">
            <span class="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <div class="savings-budget-option-details">
            <div class="savings-budget-option-title">${escapeHtml(b.desc)}</div>
            ${b.note ? `<div class="savings-budget-option-sub">${escapeHtml(b.note)}</div>` : ''}
          </div>
        </div>
        <div class="savings-budget-option-right">
          <span class="savings-budget-amount-tag ${isSelected ? 'active' : ''}">${formatter.format(quotaU)}</span>
          ${isSelected ? `<span class="material-symbols-outlined" style="font-size: 18px; color: var(--md-sys-color-primary);">check_circle</span>` : ''}
        </div>
      </div>
    `;
  });
  menu.innerHTML = html;
}

function selectSavingsInitialBudgetItem(budgetId) {
  const userId = document.getElementById("savings-initial-user")?.value || appData.savingsMonitor.selectedUser;
  selectedSavingsInitialBudgetId = budgetId;
  const item = (appData.budget || []).find(b => b.id == budgetId);
  updateSavingsInitialBudgetTriggerDisplay(item, userId);
  closeSavingsInitialBudgetPickerMenu();
}

function updateSavingsInitialBudgetTriggerDisplay(item, userId) {
  const triggerText = document.getElementById("savings-initial-budget-trigger-text");
  const triggerPill = document.getElementById("savings-initial-budget-trigger-pill");
  const valInput = document.getElementById("savings-initial-capitale-value");

  if (!item) {
    if (triggerText) {
      triggerText.innerText = "Seleziona dai Budget...";
      triggerText.style.color = "var(--md-sys-color-outline)";
      triggerText.style.fontWeight = "normal";
    }
    if (triggerPill) triggerPill.style.display = "none";
    if (valInput) valInput.value = "";
  } else {
    const quotaU = parseFloat(item[userId]) || 0;
    if (triggerText) {
      triggerText.innerText = item.desc || "Voce selezionata";
      triggerText.style.color = "var(--md-sys-color-on-surface)";
      triggerText.style.fontWeight = "600";
    }
    if (triggerPill) {
      triggerPill.style.display = "inline-flex";
      triggerPill.innerHTML = formatCurrency(quotaU);
    }
    if (valInput) valInput.value = quotaU;
  }
}

function saveSavingsInitialSetup() {
  const userId = document.getElementById("savings-initial-user")?.value || appData.savingsMonitor.selectedUser;
  const capVal = document.getElementById("savings-initial-capitale-value")?.value;
  const dataAvvioVal = document.getElementById("savings-initial-data-avvio")?.value;

  if (capVal === "" || isNaN(parseFloat(capVal))) {
    showNotification("Seleziona una voce di risorsa dai tuoi Budget.", "warning");
    return;
  }

  const capitaleIniziale = parseFloat(capVal);
  const dataAvvio = dataAvvioVal || new Date().toISOString().split("T")[0];

  if (!appData.savingsMonitor.userConfig[userId]) {
    appData.savingsMonitor.userConfig[userId] = {};
  }

  appData.savingsMonitor.userConfig[userId].capitaleIniziale = capitaleIniziale;
  appData.savingsMonitor.userConfig[userId].dataAvvio = dataAvvio;
  if (selectedSavingsInitialBudgetId) {
    appData.savingsMonitor.userConfig[userId].budgetId = selectedSavingsInitialBudgetId;
  }
  if (!appData.savingsMonitor.dataAvvio) {
    appData.savingsMonitor.dataAvvio = dataAvvio;
  }

  appData.savingsMonitor.selectedUser = userId;
  saveDataLocally();
  closeSavingsInitialModal();
  renderSavingsSection();
  const userObj = (appData.settings.users || []).find(u => u.id === userId);
  showNotification(`Capitale iniziale di ${userObj ? userObj.name : 'utente'} fissato a ${formatCurrency(capitaleIniziale)}!`);
}

// ------------------------------------------------------------------------------
// MODALE 2: REGISTRA RILEVAZIONE RISPARMIO (Solo dati attuali / correnti)
// ------------------------------------------------------------------------------

/**
 * Aggiorna la card riassuntiva del capitale iniziale fissato nel modale rilevazione.
 * @param {string} userId 
 */
function updateSavingsModalBaselineSummary(userId) {
  const uConfig = appData.savingsMonitor?.userConfig[userId] || {};
  const summaryEl = document.getElementById("savings-modal-fixed-summary");
  const capInput = document.getElementById("savings-modal-capitale-iniziale");
  const dataAvvioInput = document.getElementById("savings-modal-data-avvio");

  const cap = uConfig.capitaleIniziale || 0;
  const match = (appData.budget || []).find(b => !b.isMutuo && parseFloat(b[userId]) === parseFloat(cap));
  const desc = match ? match.desc : "Fondo di partenza da Budget";
  const avvioStr = uConfig.dataAvvio ? ` · Avviato il ${new Date(uConfig.dataAvvio).toLocaleDateString("it-IT")}` : "";

  if (summaryEl) {
    summaryEl.innerHTML = `${formatCurrency(cap)} (${escapeHTML(desc)})${avvioStr}`;
  }
  if (capInput) capInput.value = cap;
  if (dataAvvioInput) dataAvvioInput.value = uConfig.dataAvvio || "2024-01-01";
}

/**
 * Apre il modale per registrare una nuova rilevazione con i dati attuali.
 */
function openSavingsModal() {
  if (!appData.savingsMonitor) sanitizeData();
  const monitor = appData.savingsMonitor;
  const currentUserId = monitor.selectedUser || (appData.settings.users[0] ? appData.settings.users[0].id : "u1");
  const uConfig = monitor.userConfig[currentUserId] || {};

  // Se il capitale iniziale non è ancora configurato, apri il setup iniziale dedicato
  if (uConfig.capitaleIniziale === null || uConfig.capitaleIniziale === undefined) {
    openSavingsInitialModal(currentUserId);
    return;
  }

  // Popola selettore utente modale
  const userSelect = document.getElementById("savings-modal-user");
  if (userSelect) {
    userSelect.innerHTML = appData.settings.users
      .map(u => `<option value="${u.id}" ${u.id === currentUserId ? "selected" : ""}>${u.name}</option>`)
      .join("");
  }

  document.getElementById("savings-edit-id").value = "";
  document.getElementById("savings-modal-date").value = new Date().toISOString().split("T")[0];
  
  const targetDateInput = document.getElementById("savings-modal-target-date");
  if (targetDateInput) {
    targetDateInput.value = monitor.dataRogito || "2027-04-30";
  }

  // Aggiorna card riassunto baseline capitale iniziale e data avvio fissata
  updateSavingsModalBaselineSummary(currentUserId);

  document.getElementById("savings-modal-saldo-conto").value = (uConfig.ultimoSaldoConto !== null && uConfig.ultimoSaldoConto !== undefined) ? uConfig.ultimoSaldoConto : "";
  setRichEditorHTML("savings-modal-note", "");

  // Calcola spese sostenute attuali da Costi Casa
  recalcSavingsExpensesFromCosti();

  // Clona array temporanei per modale
  tempSavingsAssets = JSON.parse(JSON.stringify(uConfig.trasferimentiAttivi || []));
  tempSavingsDebts = JSON.parse(JSON.stringify(uConfig.debitiAttivi || []));

  renderSavingsAssetRows();
  renderSavingsDebtRows();
  refreshSavingsModalPreview();

  const titleEl = document.querySelector("#savingsModal h2");
  if (titleEl) {
    titleEl.innerHTML = `<span class="material-symbols-outlined">trending_up</span> Registra Rilevazione Risparmio`;
  }
  const submitBtn = document.querySelector("#savingsModal .modal-actions .btn-filled");
  if (submitBtn) {
    submitBtn.innerHTML = `<span class="material-symbols-outlined">check_circle</span> Salva e Archivia`;
  }

  openModalOverlay("savingsModal");
}

/**
 * Apre il modale per modificare uno snapshot di rilevazione esistente.
 * @param {string} snapId 
 */
function openEditSavingsSnapshot(snapId) {
  if (!appData.savingsMonitor) sanitizeData();
  const monitor = appData.savingsMonitor;
  const snapshot = (monitor.storico || []).find(s => s.id === snapId);
  if (!snapshot) return;

  const currentUserId = snapshot.userId || monitor.selectedUser;
  monitor.selectedUser = currentUserId;

  const userSelect = document.getElementById("savings-modal-user");
  if (userSelect) {
    userSelect.innerHTML = appData.settings.users
      .map(u => `<option value="${u.id}" ${u.id === currentUserId ? "selected" : ""}>${u.name}</option>`)
      .join("");
    userSelect.value = currentUserId;
  }

  document.getElementById("savings-edit-id").value = snapshot.id;
  document.getElementById("savings-modal-date").value = snapshot.dataRilevazione || new Date().toISOString().split("T")[0];
  
  const targetDateInput = document.getElementById("savings-modal-target-date");
  if (targetDateInput) {
    targetDateInput.value = monitor.dataRogito || "2027-04-30";
  }

  updateSavingsModalBaselineSummary(currentUserId);

  document.getElementById("savings-modal-saldo-conto").value = (snapshot.saldoContoCorrente !== null && snapshot.saldoContoCorrente !== undefined) ? snapshot.saldoContoCorrente : "";
  setRichEditorHTML("savings-modal-note", snapshot.note || "");

  recalcSavingsExpensesFromCosti();

  tempSavingsAssets = JSON.parse(JSON.stringify(snapshot.trasferimentiAsset || []));
  tempSavingsDebts = JSON.parse(JSON.stringify(snapshot.passivitaDebiti || []));

  renderSavingsAssetRows();
  renderSavingsDebtRows();
  refreshSavingsModalPreview();

  const titleEl = document.querySelector("#savingsModal h2");
  if (titleEl) {
    titleEl.innerHTML = `<span class="material-symbols-outlined">edit_calendar</span> Modifica Rilevazione Risparmio`;
  }
  const submitBtnEdit = document.querySelector("#savingsModal .modal-actions .btn-filled");
  if (submitBtnEdit) {
    submitBtnEdit.innerHTML = `<span class="material-symbols-outlined">save</span> Aggiorna Rilevazione`;
  }

  openModalOverlay("savingsModal");
}

function closeSavingsModal() {
  closeModalOverlay("savingsModal");
}

function onSavingsUserChange() {
  const userId = document.getElementById("savings-modal-user").value;
  const uConfig = appData.savingsMonitor.userConfig[userId] || {};

  if (uConfig.capitaleIniziale === null || uConfig.capitaleIniziale === undefined) {
    closeSavingsModal();
    openSavingsInitialModal(userId);
    return;
  }

  updateSavingsModalBaselineSummary(userId);
  document.getElementById("savings-modal-saldo-conto").value = (uConfig.ultimoSaldoConto !== null && uConfig.ultimoSaldoConto !== undefined) ? uConfig.ultimoSaldoConto : "";
  recalcSavingsExpensesFromCosti();

  tempSavingsAssets = JSON.parse(JSON.stringify(uConfig.trasferimentiAttivi || []));
  tempSavingsDebts = JSON.parse(JSON.stringify(uConfig.debitiAttivi || []));

  renderSavingsAssetRows();
  renderSavingsDebtRows();
  refreshSavingsModalPreview();
}

function recalcSavingsExpensesFromCosti() {
  const userId = document.getElementById("savings-modal-user")?.value || appData.savingsMonitor.selectedUser;
  const speseCosti = appData.costi.reduce((acc, curr) => acc + (parseFloat(curr[userId]) || 0), 0);
  const inp = document.getElementById("savings-modal-spese");
  if (inp) {
    inp.value = speseCosti.toFixed(2);
    inp.readOnly = true;
    inp.style.backgroundColor = "var(--md-sys-color-surface-container-high)";
    inp.style.cursor = "not-allowed";
  }
  refreshSavingsModalPreview();
}

function addSavingsAssetRow() {
  tempSavingsAssets.push({
    id: "asset-" + Date.now(),
    descrizione: "",
    importo: 0,
    data: new Date().toISOString().split("T")[0],
  });
  renderSavingsAssetRows();
  refreshSavingsModalPreview();
}

function removeSavingsAssetRow(index) {
  tempSavingsAssets.splice(index, 1);
  renderSavingsAssetRows();
  refreshSavingsModalPreview();
}

function renderSavingsAssetRows() {
  const container = document.getElementById("savings-assets-container");
  if (!container) return;
  container.innerHTML = "";

  if (tempSavingsAssets.length === 0) {
    container.innerHTML = `
      <div class="savings-empty-row-hint">
        Nessun disinvestimento o vendita beni registrata. Clicca "+ Voce" per aggiungerne uno se necessario.
      </div>
    `;
    return;
  }

  tempSavingsAssets.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "savings-movement-row";
    row.innerHTML = `
      <input type="text" style="flex: 2; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface);" 
        value="${item.descrizione || ''}" placeholder="Es. Vendita oro, titoli o asset..." oninput="tempSavingsAssets[${index}].descrizione = this.value;" />
      <input type="number" step="0.01" style="flex: 1.2; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface);" 
        value="${item.importo || ''}" placeholder="Importo €" oninput="tempSavingsAssets[${index}].importo = parseFloat(this.value) || 0; refreshSavingsModalPreview();" />
      <button type="button" class="btn-icon" onclick="removeSavingsAssetRow(${index})" title="Rimuovi">
        <span class="material-symbols-outlined" style="font-size: 18px; color: var(--md-sys-color-error);">delete</span>
      </button>
    `;
    container.appendChild(row);
  });
}

function addSavingsDebtRow() {
  tempSavingsDebts.push({
    id: "debt-" + Date.now(),
    descrizione: "",
    importo: 0,
    data: new Date().toISOString().split("T")[0],
  });
  renderSavingsDebtRows();
  refreshSavingsModalPreview();
}

function removeSavingsDebtRow(index) {
  tempSavingsDebts.splice(index, 1);
  renderSavingsDebtRows();
  refreshSavingsModalPreview();
}

function renderSavingsDebtRows() {
  const container = document.getElementById("savings-debts-container");
  if (!container) return;
  container.innerHTML = "";

  if (tempSavingsDebts.length === 0) {
    container.innerHTML = `
      <div class="savings-empty-row-hint">
        Nessun debito o anticipo aperto. Clicca "+ Debito" per aggiungerne uno se necessario.
      </div>
    `;
    return;
  }

  tempSavingsDebts.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "savings-movement-row";
    row.innerHTML = `
      <input type="text" style="flex: 2; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface);" 
        value="${item.descrizione || ''}" placeholder="Es. Debito/anticipo partner..." oninput="tempSavingsDebts[${index}].descrizione = this.value;" />
      <input type="number" step="0.01" style="flex: 1.2; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface);" 
        value="${item.importo || ''}" placeholder="Importo €" oninput="tempSavingsDebts[${index}].importo = parseFloat(this.value) || 0; refreshSavingsModalPreview();" />
      <button type="button" class="btn-icon" onclick="removeSavingsDebtRow(${index})" title="Rimuovi">
        <span class="material-symbols-outlined" style="font-size: 18px; color: var(--md-sys-color-error);">delete</span>
      </button>
    `;
    container.appendChild(row);
  });
}

function refreshSavingsModalPreview() {
  const userId = document.getElementById("savings-modal-user")?.value || appData.savingsMonitor.selectedUser;
  const capInizVal = document.getElementById("savings-modal-capitale-iniziale")?.value;
  const saldoVal = document.getElementById("savings-modal-saldo-conto")?.value;

  const capitaleIniziale = capInizVal !== "" ? parseFloat(capInizVal) : 0;
  const saldoConto = saldoVal !== "" ? parseFloat(saldoVal) : 0;
  const speseSostenute = parseFloat(document.getElementById("savings-modal-spese")?.value) || 0;
  const targetDateInput = document.getElementById("savings-modal-target-date")?.value;
  const dataRogito = targetDateInput || appData.savingsMonitor.dataRogito;

  const countdownSmall = document.getElementById("savings-modal-target-date-countdown");
  if (countdownSmall && dataRogito) {
    const rem = getExactRemainingTime(dataRogito);
    countdownSmall.innerText = `⏱️ Tra ${rem.label} (${rem.totaleGiorni} giorni rimanenti)`;
  }

  const dataAvvioModal = document.getElementById("savings-modal-data-avvio")?.value;

  const metrics = calculateSavingsMetrics(userId, {
    capitaleIniziale,
    saldoConto,
    speseSostenute,
    dataRogito,
    dataAvvio: dataAvvioModal,
    trasferimenti: tempSavingsAssets,
    debiti: tempSavingsDebts,
  });

  const lordoEl = document.getElementById("savings-preview-lordo");
  const nettoEl = document.getElementById("savings-preview-netto");
  const liqEl = document.getElementById("savings-preview-liquidita");

  if (lordoEl) lordoEl.innerHTML = formatCurrency(metrics.risparmioLordo);
  if (nettoEl) {
    nettoEl.innerHTML = formatCurrency(metrics.risparmioNetto);
    nettoEl.style.color = metrics.risparmioNetto >= 0 ? 'var(--md-sys-color-success)' : 'var(--md-sys-color-error)';
  }
  if (liqEl) liqEl.innerHTML = formatCurrency(metrics.liquiditaNetta);
}

/**
 * Salva i parametri attuali e archivia uno snapshot nello storico.
 */
function saveSavingsSnapshot() {
  const userId = document.getElementById("savings-modal-user").value;
  const dataRilevazione = document.getElementById("savings-modal-date").value || new Date().toISOString().split("T")[0];
  const capInizVal = document.getElementById("savings-modal-capitale-iniziale").value;
  const saldoVal = document.getElementById("savings-modal-saldo-conto").value;

  const existingCapitale = appData.savingsMonitor.userConfig[userId]?.capitaleIniziale;
  let capitaleIniziale = 0;
  if (existingCapitale !== null && existingCapitale !== undefined) {
    capitaleIniziale = existingCapitale;
  } else if (capInizVal !== "") {
    capitaleIniziale = parseFloat(capInizVal) || 0;
  }

  const existingDataAvvio = appData.savingsMonitor.userConfig[userId]?.dataAvvio;
  const dataAvvioInput = document.getElementById("savings-modal-data-avvio");
  const dataAvvio = existingDataAvvio || (dataAvvioInput ? dataAvvioInput.value : null) || appData.savingsMonitor.dataAvvio || "2024-01-01";

  const saldoConto = saldoVal !== "" ? parseFloat(saldoVal) : 0;
  // Spese sostenute sempre calcolate direttamente dai costi effettivi registrati per l'utente
  const speseSostenute = appData.costi.reduce((acc, curr) => acc + (parseFloat(curr[userId]) || 0), 0);
  const note = getRichEditorHTML("savings-modal-note");
  const modalTargetDate = document.getElementById("savings-modal-target-date")?.value;

  if (modalTargetDate) {
    appData.savingsMonitor.dataRogito = modalTargetDate;
  }

  const activeAssets = tempSavingsAssets.filter(t => (t.importo && t.importo > 0) || (t.descrizione && t.descrizione.trim()));
  const activeDebts = tempSavingsDebts.filter(d => (d.importo && d.importo > 0) || (d.descrizione && d.descrizione.trim()));

  // Calcola risultati completi per lo snapshot
  const metrics = calculateSavingsMetrics(userId, {
    capitaleIniziale,
    saldoConto,
    speseSostenute,
    dataAvvio,
    trasferimenti: activeAssets,
    debiti: activeDebts,
  });

  // Aggiorna configurazione corrente per l'utente
  if (!appData.savingsMonitor.userConfig[userId]) {
    appData.savingsMonitor.userConfig[userId] = {};
  }
  appData.savingsMonitor.userConfig[userId] = {
    capitaleIniziale: (existingCapitale !== null && existingCapitale !== undefined) ? existingCapitale : (capInizVal !== "" ? capitaleIniziale : null),
    dataAvvio: dataAvvio,
    ultimoSaldoConto: saldoVal !== "" ? saldoConto : null,
    trasferimentiAttivi: JSON.parse(JSON.stringify(activeAssets)),
    debitiAttivi: JSON.parse(JSON.stringify(activeDebts)),
  };
  if (!appData.savingsMonitor.dataAvvio) {
    appData.savingsMonitor.dataAvvio = dataAvvio;
  }

  // Crea e inserisce snapshot nello storico
  const snapshot = {
    id: "snap-" + Date.now(),
    timestamp: Date.now(),
    dataRilevazione,
    dataAvvio,
    userId,
    note,
    capitaleIniziale,
    saldoContoCorrente: saldoConto,
    speseSostenute,
    trasferimentiAsset: JSON.parse(JSON.stringify(activeAssets)),
    passivitaDebiti: JSON.parse(JSON.stringify(activeDebts)),
    risultati: {
      totaleTrasferimenti: metrics.totaleTrasferimenti,
      totalePassivita: metrics.totalePassivita,
      impieghiTotali: metrics.impieghiTotali,
      fondiPreesistenti: metrics.fondiPreesistenti,
      risparmioLordo: metrics.risparmioLordo,
      risparmioNetto: metrics.risparmioNetto,
      liquiditaNetta: metrics.liquiditaNetta,
      mesiTrascorsi: metrics.mesiTrascorsi,
      mesiAlRogito: metrics.mesiAlRogito,
      tassoMedioMensile: metrics.tassoMedioMensile,
      risparmioFuturoStimato: metrics.risparmioFuturoStimato,
      proiezioneLiquiditaRogito: metrics.proiezioneLiquiditaRogito,
    },
  };

  const editId = document.getElementById("savings-edit-id")?.value;
  if (!appData.savingsMonitor.storico) appData.savingsMonitor.storico = [];

  if (editId) {
    const existingIndex = appData.savingsMonitor.storico.findIndex(s => s.id === editId);
    if (existingIndex !== -1) {
      snapshot.id = editId;
      snapshot.timestamp = appData.savingsMonitor.storico[existingIndex].timestamp || Date.now();
      appData.savingsMonitor.storico[existingIndex] = snapshot;
    } else {
      appData.savingsMonitor.storico.unshift(snapshot);
    }
  } else {
    appData.savingsMonitor.storico.unshift(snapshot);
  }

  appData.savingsMonitor.selectedUser = userId;

  closeSavingsModal();
  saveDataLocally();
  renderSavingsSection();
  updateChartsAndStats();
  renderTables();
  showNotification(editId ? "Rilevazione aggiornata con successo!" : "Punto di controllo risparmio salvato!");
}


/**
 * Elimina una rilevazione dallo storico.
 * @param {string} snapshotId 
 */
async function deleteSavingsSnapshot(snapshotId) {
  const result = await showConfirm(
    "Eliminare questa rilevazione?",
    "Il punto di controllo verrà rimosso dallo storico cronologico.",
  );
  if (result.isConfirmed) {
    appData.savingsMonitor.storico = (appData.savingsMonitor.storico || []).filter(s => s.id !== snapshotId);
    saveDataLocally();
    renderSavingsSection();
    updateChartsAndStats();
    renderTables();
    showNotification("Rilevazione rimossa dallo storico");
  }
}

// Avvio dell'applicazione: controllo configurazione, selezione tab predefinita e rendering iniziale

// ==============================================================================
// SEZIONE DEBITI & FINANZIAMENTI (PRESTITI, RATE E SINCRONIZZAZIONE BUDGET)
// ==============================================================================

let currentDebitiUserFilter = "all";

/**
 * Calcola la data e i giorni mancanti alla prossima scadenza mensile della rata.
 * @param {number} giornoPagamento - Giorno del mese (1-31)
 * @param {number} mesiRimanenti - Numero di rate/mesi rimanenti
 * @returns {Object} Dettaglio della prossima scadenza
 */
