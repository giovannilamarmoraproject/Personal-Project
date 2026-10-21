/**
 * ==============================================================================
 * GESTIONE DEBITI, FINANZIAMENTI & RATE MENSILE
 * ==============================================================================
 */

function getProssimaScadenzaDebito(giornoPagamento, mesiRimanenti) {
  const mesi = parseInt(mesiRimanenti, 10) || 0;
  if (mesi <= 0) {
    return {
      label: "Saldato",
      isToday: false,
      isSoon: false,
      diffDays: null,
      dateStr: "Saldato",
    };
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  const day = Math.min(31, Math.max(1, parseInt(giornoPagamento, 10) || 1));

  let targetYear = currentYear;
  let targetMonth = currentMonth;
  const maxDaysThisMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const validDayThisMonth = Math.min(day, maxDaysThisMonth);

  if (currentDay === validDayThisMonth) {
    return {
      label: "Oggi in scadenza!",
      isToday: true,
      isSoon: true,
      diffDays: 0,
      targetDate: new Date(targetYear, targetMonth, validDayThisMonth),
      dateStr: `${validDayThisMonth} ${now.toLocaleDateString("it-IT", { month: "short" })}`,
    };
  }

  if (currentDay < validDayThisMonth) {
    const targetDate = new Date(targetYear, targetMonth, validDayThisMonth);
    const diffDays = Math.round(
      (targetDate - new Date(currentYear, currentMonth, currentDay)) /
        (1000 * 60 * 60 * 24),
    );
    return {
      label: `${validDayThisMonth} ${targetDate.toLocaleDateString("it-IT", { month: "long" })} (tra ${diffDays} ${diffDays === 1 ? "giorno" : "giorni"})`,
      isToday: false,
      isSoon: diffDays <= 5,
      diffDays,
      targetDate,
      dateStr: `${validDayThisMonth} ${targetDate.toLocaleDateString("it-IT", { month: "short" })}`,
    };
  }

  targetMonth += 1;
  if (targetMonth > 11) {
    targetMonth = 0;
    targetYear += 1;
  }
  const maxDaysNextMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const validDayNextMonth = Math.min(day, maxDaysNextMonth);
  const targetDate = new Date(targetYear, targetMonth, validDayNextMonth);
  const diffDays = Math.round(
    (targetDate - new Date(currentYear, currentMonth, currentDay)) /
      (1000 * 60 * 60 * 24),
  );
  return {
    label: `${validDayNextMonth} ${targetDate.toLocaleDateString("it-IT", { month: "long" })} (tra ${diffDays} ${diffDays === 1 ? "giorno" : "giorni"})`,
    isToday: false,
    isSoon: diffDays <= 5,
    diffDays,
    targetDate,
    dateStr: `${validDayNextMonth} ${targetDate.toLocaleDateString("it-IT", { month: "short" })}`,
  };
}

/**
 * Sincronizza i debiti presenti in appData.debiti con le corrispondenti righe
 * a valore negativo nella tabella Budget di appData.budget.
 * Quando un debito arriva a 0 mesi rimanenti, il valore a budget diventa 0 €.
 */
function syncDebitiToBudget() {
  if (!appData.debiti) appData.debiti = [];
  if (!appData.budget) appData.budget = [];

  const activeDebtIds = new Set(appData.debiti.map((d) => d.id));

  // Rimuove eventuali righe di budget di debiti che sono stati cancellati
  appData.budget = appData.budget.filter(
    (b) => !b.isDebito || (b.debitoId && activeDebtIds.has(b.debitoId)),
  );

  appData.debiti.forEach((d) => {
    const rateLeft = Math.max(0, parseInt(d.mesiRimanenti, 10) || 0);
    const rataVal = parseFloat(d.rata) || 0;
    const debitoResiduo = rateLeft * rataVal;

    let b = appData.budget.find(
      (item) => item.isDebito && item.debitoId === d.id,
    );
    if (!b) {
      b = {
        id: d.id + 88800000,
        debitoId: d.id,
        isDebito: true,
        isMutuo: false,
        desc: d.desc ? `Debito: ${d.desc}` : "Debito Rateale",
      };
      appData.budget.push(b);
    }

    b.desc = d.desc ? `Debito: ${d.desc}` : "Debito Rateale";
    b.note =
      rateLeft <= 0
        ? "Completamente saldato (0 rate rimaste)"
        : `Rata: ${formatCurrency(rataVal)}/m | ${rateLeft} ${
            rateLeft === 1 ? "rata rimasta" : "rate rimaste"
          } | Addebito il giorno ${d.giornoPagamento || 1}`;

    appData.settings.users.forEach((u) => {
      if (d.userId === u.id) {
        b[u.id] = debitoResiduo > 0 ? -debitoResiduo : 0;
      } else if (d.userId === "all") {
        b[u.id] =
          debitoResiduo > 0 ? -(debitoResiduo * ((u.share || 0) / 100)) : 0;
      } else {
        b[u.id] = 0;
      }
    });
  });
}

/**
 * Imposta il filtro partecipante per la vista Debiti.
 * @param {string} userId - ID dell'utente o 'all'
 */
function setDebitiUserFilter(userId) {
  currentDebitiUserFilter = userId;
  renderDebitiSection();
}

/**
 * Renderizza l'intera sezione Debiti & Finanziamenti:
 * KPI Cards, filtri partecipante e schede dei singoli prestiti.
 */
function renderDebitiSection() {
  const container = document.getElementById("view-debiti");
  if (!container) return;

  if (!appData.debiti) appData.debiti = [];
  const users = appData.settings.users || [];

  // Filtra debiti in base al filtro utente attivo
  const filteredDebiti = appData.debiti.filter((d) => {
    if (currentDebitiUserFilter === "all") return true;
    return d.userId === currentDebitiUserFilter || d.userId === "all";
  });

  // 1. Calcolo metriche KPI
  let totResiduo = 0;
  let totRateMensili = 0;
  let attiviCount = 0;
  let saldatiCount = 0;
  let nextScadenzaDays = Infinity;
  let nextScadenzaLabel = "Nessuna";
  let nextScadenzaDebitoNome = "";

  filteredDebiti.forEach((d) => {
    const rateLeft = Math.max(0, parseInt(d.mesiRimanenti, 10) || 0);
    const rataVal = parseFloat(d.rata) || 0;
    if (rateLeft > 0) {
      totResiduo += rateLeft * rataVal;
      totRateMensili += rataVal;
      attiviCount++;

      const scad = getProssimaScadenzaDebito(d.giornoPagamento, rateLeft);
      if (scad.diffDays !== null && scad.diffDays < nextScadenzaDays) {
        nextScadenzaDays = scad.diffDays;
        nextScadenzaLabel = scad.label;
        nextScadenzaDebitoNome = d.desc;
      }
    } else {
      saldatiCount++;
    }
  });

  // 2. Render KPI Grid
  const kpiGrid = document.getElementById("debiti-kpi-grid");
  if (kpiGrid) {
    kpiGrid.innerHTML = `
      <div class="stat-card" style="background: var(--md-sys-color-surface-container-high); color: var(--md-sys-color-on-surface);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <span style="font-size: 13px; font-weight: 600; color: var(--md-sys-color-outline); text-transform: uppercase; letter-spacing: 0.5px;">Debito Totale Residuo</span>
          <span class="material-symbols-outlined" style="color: var(--md-sys-color-error); font-size: 24px;">account_balance</span>
        </div>
        <div class="stat-value sensitive-value" style="color: var(--md-sys-color-error); font-weight: 700;">
          ${totResiduo > 0 ? "- " + formatCurrency(totResiduo) : "0,00 €"}
        </div>
        <div style="font-size: 12px; color: var(--md-sys-color-outline);">
          ${totResiduo > 0 ? "Detratto dal budget disponibile" : "Nessun debito pendente"}
        </div>
      </div>

      <div class="stat-card" style="background: var(--md-sys-color-surface-container-high); color: var(--md-sys-color-on-surface);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <span style="font-size: 13px; font-weight: 600; color: var(--md-sys-color-outline); text-transform: uppercase; letter-spacing: 0.5px;">Rata Mensile Totale</span>
          <span class="material-symbols-outlined" style="color: var(--md-sys-color-primary); font-size: 24px;">payments</span>
        </div>
        <div class="stat-value sensitive-value" style="color: var(--md-sys-color-primary); font-weight: 700;">
          ${formatCurrency(totRateMensili)} <span style="font-size: 14px; font-weight: 500; color: var(--md-sys-color-outline);">/ mese</span>
        </div>
        <div style="font-size: 12px; color: var(--md-sys-color-outline);">
          Uscita fissa mensile complessiva
        </div>
      </div>

      <div class="stat-card" style="background: var(--md-sys-color-surface-container-high); color: var(--md-sys-color-on-surface);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <span style="font-size: 13px; font-weight: 600; color: var(--md-sys-color-outline); text-transform: uppercase; letter-spacing: 0.5px;">Prossima Scadenza</span>
          <span class="material-symbols-outlined" style="color: #f59e0b; font-size: 24px;">event</span>
        </div>
        <div style="font-size: 16px; font-weight: 700; color: var(--md-sys-color-on-surface); line-height: 1.3;">
          ${nextScadenzaLabel}
        </div>
        <div style="font-size: 12px; color: var(--md-sys-color-outline); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${nextScadenzaDebitoNome ? nextScadenzaDebitoNome : "Tutte le rate saldate"}
        </div>
      </div>

      <div class="stat-card" style="background: var(--md-sys-color-surface-container-high); color: var(--md-sys-color-on-surface);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <span style="font-size: 13px; font-weight: 600; color: var(--md-sys-color-outline); text-transform: uppercase; letter-spacing: 0.5px;">Stato Finanziamenti</span>
          <span class="material-symbols-outlined" style="color: var(--md-sys-color-success); font-size: 24px;">checklist</span>
        </div>
        <div class="stat-value" style="font-weight: 700;">
          ${attiviCount} <span style="font-size: 15px; font-weight: 500; color: var(--md-sys-color-outline);">attivi</span>
        </div>
        <div style="font-size: 12px; color: var(--md-sys-color-success); font-weight: 600;">
          ${saldatiCount} ${saldatiCount === 1 ? "finanziamento saldato" : "finanziamenti saldati"}
        </div>
      </div>
    `;
  }

  // 3. Render Filtro Partecipante
  const chipsContainer = document.getElementById("debiti-user-filter-chips");
  if (chipsContainer) {
    let chipsHtml = `
      <button type="button" class="debito-filter-chip ${currentDebitiUserFilter === "all" ? "active" : ""}" onclick="setDebitiUserFilter('all')">
        Tutti i Partecipanti (${appData.debiti.length})
      </button>
    `;
    users.forEach((u) => {
      const uCount = appData.debiti.filter((d) => d.userId === u.id).length;
      chipsHtml += `
        <button type="button" class="debito-filter-chip ${currentDebitiUserFilter === u.id ? "active" : ""}" onclick="setDebitiUserFilter('${u.id}')">
          ${u.name} (${uCount})
        </button>
      `;
    });
    chipsContainer.innerHTML = chipsHtml;
  }

  const countIndicator = document.getElementById("debiti-count-indicator");
  if (countIndicator) {
    countIndicator.innerHTML = `Visualizzati: <b>${filteredDebiti.length}</b> di <b>${appData.debiti.length}</b>`;
  }

  // 4. Render Schede Debiti
  const cardsContainer = document.getElementById("debiti-cards-container");
  if (!cardsContainer) return;

  if (filteredDebiti.length === 0) {
    cardsContainer.style.display = "block";
    cardsContainer.innerHTML = `
      <div class="card" style="text-align: center; padding: 48px 24px;">
        <span class="material-symbols-outlined" style="font-size: 64px; color: var(--md-sys-color-outline); margin-bottom: 12px;">credit_score</span>
        <h3 style="margin: 0 0 8px 0; color: var(--md-sys-color-on-surface);">Nessun Finanziamento o Debito Attivo</h3>
        <p style="margin: 0 auto 20px auto; max-width: 460px; font-size: 13px; color: var(--md-sys-color-outline);">
          ${
            currentDebitiUserFilter === "all"
              ? "Non ci sono rate o prestiti registrati. Quando aggiungi un debito, il valore residuo scalerà automaticamente dal budget."
              : "Nessun debito registrato per questo partecipante."
          }
        </p>
        <button class="btn btn-filled" onclick="openAddDebitoModal()" style="display: inline-flex; margin: 0 auto;">
          <span class="material-symbols-outlined">add</span> Aggiungi Finanziamento
        </button>
      </div>
    `;
    return;
  }

  cardsContainer.style.display = "grid";
  cardsContainer.style.gridTemplateColumns =
    "repeat(auto-fill, minmax(320px, 1fr))";
  cardsContainer.style.gap = "16px";

  let cardsHtml = "";
  filteredDebiti.forEach((d) => {
    const rateLeft = Math.max(0, parseInt(d.mesiRimanenti, 10) || 0);
    const rataVal = parseFloat(d.rata) || 0;
    const debitoResiduo = rateLeft * rataVal;
    const isSaldato = rateLeft <= 0;

    let userObj = users.find((u) => u.id === d.userId);
    let userName = userObj
      ? userObj.name
      : d.userId === "all"
        ? "Tutti (Condiviso)"
        : "Partecipante";

    const scad = getProssimaScadenzaDebito(d.giornoPagamento, rateLeft);

    const totIniziale = Math.max(
      rateLeft,
      parseInt(d.totaleInizialeMesi, 10) || rateLeft,
    );
    const ratePagate = Math.max(0, totIniziale - rateLeft);
    const percProgresso =
      totIniziale > 0
        ? Math.min(100, Math.round((ratePagate / totIniziale) * 100))
        : 100;

    let iconName = "credit_card";
    const lowerDesc = (d.desc || "").toLowerCase();
    if (
      lowerDesc.includes("auto") ||
      lowerDesc.includes("macchina") ||
      lowerDesc.includes("moto") ||
      lowerDesc.includes("veicolo")
    ) {
      iconName = "directions_car";
    } else if (
      lowerDesc.includes("casa") ||
      lowerDesc.includes("ristruttur") ||
      lowerDesc.includes("arredo")
    ) {
      iconName = "home";
    } else if (
      lowerDesc.includes("elettro") ||
      lowerDesc.includes("telefono") ||
      lowerDesc.includes("pc")
    ) {
      iconName = "devices";
    }

    cardsHtml += `
      <div class="debito-card ${isSaldato ? "saldato" : ""}">
        <!-- Header con Icona, Titolo e Badge Stato -->
        <div class="debito-header">
          <div class="debito-title-group">
            <div class="debito-icon-avatar">
              <span class="material-symbols-outlined">${isSaldato ? "check_circle" : iconName}</span>
            </div>
            <div style="min-width: 0;">
              <div class="debito-name">${d.desc}</div>
              <div class="debito-user-tag">
                <span class="material-symbols-outlined" style="font-size: 13px;">person</span>
                <span>${userName}</span>
              </div>
            </div>
          </div>
          <div>
            ${
              isSaldato
                ? '<span class="debito-status-badge debito-status-saldato">Saldato</span>'
                : '<span class="debito-status-badge debito-status-attivo">In Corso</span>'
            }
          </div>
        </div>

        <!-- Griglia Parametri & Metriche -->
        <div class="debito-grid-metrics">
          <div class="debito-metric-item">
            <div class="debito-metric-label">Rata Mensile</div>
            <div class="debito-metric-value sensitive-value">${formatCurrency(rataVal)} <small style="font-size: 11px; font-weight: normal; color: var(--md-sys-color-outline);">/m</small></div>
          </div>
          <div class="debito-metric-item">
            <div class="debito-metric-label">Rate Rimanenti</div>
            <div class="debito-metric-value" style="display: flex; align-items: center; gap: 4px;">
              <span>${rateLeft}</span>
              <small style="font-size: 11px; font-weight: normal; color: var(--md-sys-color-outline);">su ${totIniziale}</small>
            </div>
          </div>
          <div class="debito-metric-item">
            <div class="debito-metric-label">Giorno Addebito</div>
            <div class="debito-metric-value" style="font-size: 13px; font-weight: 600;">Giorno ${d.giornoPagamento || 1}</div>
          </div>
          <div class="debito-metric-item">
            <div class="debito-metric-label">Debito Residuo</div>
            <div class="debito-metric-value sensitive-value ${isSaldato ? "" : "highlight-red"}">
              ${isSaldato ? "0,00 €" : "- " + formatCurrency(debitoResiduo)}
            </div>
          </div>
        </div>

        <!-- Prossimo Addebito -->
        <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: ${scad.isSoon ? "var(--md-sys-color-error)" : "var(--md-sys-color-outline)"}; background: var(--md-sys-color-surface-container); padding: 8px 12px; border-radius: 8px;">
          <span class="material-symbols-outlined" style="font-size: 16px;">schedule</span>
          <span>Prossimo addebito: <b>${scad.label}</b></span>
        </div>

        ${(() => {
          const nowD = new Date();
          const curMKey = `${nowD.getFullYear()}-${String(nowD.getMonth() + 1).padStart(2, "0")}`;
          const isMesePagato = d.ultimoPagamentoMese === curMKey;
          const curMName = nowD.toLocaleDateString("it-IT", { month: "long" });
          const capMName = curMName.charAt(0).toUpperCase() + curMName.slice(1);
          if (isMesePagato && !isSaldato) {
            return `<div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--md-sys-color-success); font-weight: 600; background: rgba(34, 197, 94, 0.12); padding: 6px 12px; border-radius: 8px; margin-top: -6px;">
                <span class="material-symbols-outlined" style="font-size: 15px;">check_circle</span>
                <span>Rata di ${capMName} già segnata (${d.ultimoPagamentoData || "questo mese"})</span>
              </div>`;
          }
          return "";
        })()}

        <!-- Barra Avanzamento Pagamento Rate -->
        <div class="debito-progress-container">
          <div class="debito-progress-header">
            <span>Avanzamento rimborso</span>
            <strong>${ratePagate} / ${totIniziale} rate (${percProgresso}%)</strong>
          </div>
          <div class="debito-progress-track">
            <div class="debito-progress-fill" style="width: ${percProgresso}%;"></div>
          </div>
        </div>

        <!-- Note se presenti -->
        ${
          d.note
            ? `<div style="font-size: 12px; color: var(--md-sys-color-outline); background: var(--md-sys-color-surface-container-lowest); padding: 8px 10px; border-radius: 6px; border-left: 3px solid var(--md-sys-color-primary); white-space: pre-wrap;">
                ${renderRichContent(d.note, "debiti", d.id, "note")}
              </div>`
            : ""
        }

        <!-- Footer Azioni -->
        <div class="debito-footer-actions">
          <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            ${
              !isSaldato
                ? (() => {
                    const nowD = new Date();
                    const curMKey = `${nowD.getFullYear()}-${String(nowD.getMonth() + 1).padStart(2, "0")}`;
                    const isMesePagato = d.ultimoPagamentoMese === curMKey;
                    return `<button class="btn btn-tonal" style="font-size: 12px; padding: 6px 12px; gap: 6px; white-space: nowrap;" onclick="decrementaRataDebito(${d.id})" title="${isMesePagato ? "Rata già registrata questo mese. Clicca per registrare una rata extra" : "Registra il pagamento di una rata mensile"}">
                        <span class="material-symbols-outlined" style="font-size: 16px; color: ${isMesePagato ? "var(--md-sys-color-outline)" : "var(--md-sys-color-success)"};">${isMesePagato ? "history_toggle_off" : "check_circle"}</span>
                        ${isMesePagato ? "Segna Altra Rata" : "Segna Rata Pagata"}
                      </button>`;
                  })()
                : `<span style="font-size: 12px; color: var(--md-sys-color-success); font-weight: 600; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">
                    <span class="material-symbols-outlined" style="font-size: 16px;">verified</span> Completato
                  </span>`
            }
            ${
              d.ultimoPagamentoMese ||
              (d.totaleInizialeMesi && d.totaleInizialeMesi > d.mesiRimanenti)
                ? `<button class="btn-icon" style="height: 32px; width: 32px; flex-shrink: 0;" onclick="ripristinaRataDebito(${d.id})" title="Annulla ultimo pagamento registrato (+1 rata)">
                    <span class="material-symbols-outlined" style="font-size: 18px; color: var(--md-sys-color-outline);">undo</span>
                  </button>`
                : ""
            }
          </div>
          <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
            <button class="btn-icon" onclick="openEditDebitoModal(${d.id})" title="Modifica parametri debito">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button class="btn-icon" onclick="deleteDebito(${d.id})" title="Elimina debito">
              <span class="material-symbols-outlined" style="color: var(--md-sys-color-error);">delete</span>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  cardsContainer.innerHTML = cardsHtml;
}

/**
 * Apre la modale per aggiungere un nuovo debito o finanziamento.
 */
function openAddDebitoModal() {
  document.getElementById("debito-modal-title").innerHTML =
    '<span class="material-symbols-outlined">credit_card_off</span> Nuovo Finanziamento / Debito';
  document.getElementById("debito-edit-id").value = "";
  document.getElementById("debito-desc").value = "";
  document.getElementById("debito-rata").value = "";
  document.getElementById("debito-mesi").value = "";
  document.getElementById("debito-giorno").value = "15";
  setRichEditorHTML("debito-note", "");

  populateDebitoUserSelect();
  updateDebitoModalPreview();
  const delBtnAdd = document.getElementById("debito-btn-delete");
  if (delBtnAdd) delBtnAdd.style.display = "none";

  openModalOverlay("debitoModal");
}

/**
 * Apre la modale per modificare un debito esistente.
 * @param {number} id - ID del debito
 */
function openEditDebitoModal(id) {
  if (!appData.debiti) appData.debiti = [];
  const debito = appData.debiti.find((d) => d.id === id);
  if (!debito) return;

  document.getElementById("debito-modal-title").innerHTML =
    '<span class="material-symbols-outlined">edit</span> Modifica Finanziamento / Debito';
  document.getElementById("debito-edit-id").value = debito.id;
  document.getElementById("debito-desc").value = debito.desc || "";
  document.getElementById("debito-rata").value = debito.rata || "";
  document.getElementById("debito-mesi").value =
    debito.mesiRimanenti !== undefined ? debito.mesiRimanenti : "";
  document.getElementById("debito-giorno").value = debito.giornoPagamento || 15;
  setRichEditorHTML("debito-note", debito.note || "");

  populateDebitoUserSelect(debito.userId);
  updateDebitoModalPreview();
  const delBtnEdit = document.getElementById("debito-btn-delete");
  if (delBtnEdit) delBtnEdit.style.display = "inline-flex";

  openModalOverlay("debitoModal");
}

/**
 * Chiude la modale del debito.
 */
function closeDebitoModal() {
  closeModalOverlay("debitoModal");
}

/**
 * Popola il menu a tendina dell'intestatario del debito.
 * @param {string} [selectedUserId] - ID utente attualmente selezionato
 */
function populateDebitoUserSelect(selectedUserId = null) {
  const select = document.getElementById("debito-user");
  if (!select) return;

  select.innerHTML = "";
  const users = appData.settings.users || [];
  users.forEach((u) => {
    const opt = document.createElement("option");
    opt.value = u.id;
    opt.textContent = u.name;
    if (selectedUserId && selectedUserId === u.id) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });

  if (users.length > 1) {
    const optAll = document.createElement("option");
    optAll.value = "all";
    optAll.textContent = "Entrambi / Condiviso";
    if (selectedUserId === "all") optAll.selected = true;
    select.appendChild(optAll);
  }
}

/**
 * Aggiorna il box di anteprima live dell'impatto sul budget nella modale.
 */
function updateDebitoModalPreview() {
  const rata = parseFloat(document.getElementById("debito-rata").value) || 0;
  const mesi = parseInt(document.getElementById("debito-mesi").value, 10) || 0;
  const totale = Math.max(0, rata * mesi);

  const calcEl = document.getElementById("debito-preview-calc");
  if (calcEl) {
    calcEl.innerHTML = `${formatCurrency(rata)} &times; ${mesi} ${mesi === 1 ? "rata" : "rate"}`;
  }

  const totEl = document.getElementById("debito-preview-totale");
  if (totEl) {
    totEl.innerHTML =
      totale > 0 ? `- ${formatCurrency(totale)}` : formatCurrency(0);
    totEl.style.color =
      totale > 0 ? "var(--md-sys-color-error)" : "var(--md-sys-color-outline)";
  }
}

/**
 * Salva i dati inseriti nella modale del debito (creazione o modifica).
 */
function saveDebitoModal() {
  const editIdStr = document.getElementById("debito-edit-id").value;
  const desc = document.getElementById("debito-desc").value.trim();
  const userId = document.getElementById("debito-user").value;
  const rata = parseFloat(document.getElementById("debito-rata").value);
  const mesi = parseInt(document.getElementById("debito-mesi").value, 10);
  const giorno = parseInt(document.getElementById("debito-giorno").value, 10);
  const note = getRichEditorHTML("debito-note");

  if (!desc) {
    showNotification(
      "Attenzione",
      "Inserisci la descrizione o nome del debito.",
      "warning",
    );
    return;
  }
  if (isNaN(rata) || rata < 0) {
    showNotification(
      "Attenzione",
      "Inserisci un importo valido per la rata mensile.",
      "warning",
    );
    return;
  }
  if (isNaN(mesi) || mesi < 0) {
    showNotification(
      "Attenzione",
      "Inserisci il numero di rate/mesi rimanenti (0 o più).",
      "warning",
    );
    return;
  }
  if (isNaN(giorno) || giorno < 1 || giorno > 31) {
    showNotification(
      "Attenzione",
      "Il giorno di addebito deve essere compreso tra 1 e 31.",
      "warning",
    );
    return;
  }

  if (!appData.debiti) appData.debiti = [];

  if (editIdStr) {
    // Modifica
    const editId = parseInt(editIdStr, 10);
    const debito = appData.debiti.find((d) => d.id === editId);
    if (debito) {
      debito.desc = desc;
      debito.userId = userId;
      debito.rata = rata;
      debito.mesiRimanenti = mesi;
      if (!debito.totaleInizialeMesi || debito.totaleInizialeMesi < mesi) {
        debito.totaleInizialeMesi = mesi;
      }
      debito.giornoPagamento = giorno;
      debito.note = note;
    }
  } else {
    // Nuovo debito
    const newDebito = {
      id: Date.now(),
      desc: desc,
      userId: userId,
      rata: rata,
      mesiRimanenti: mesi,
      totaleInizialeMesi: mesi,
      giornoPagamento: giorno,
      note: note,
      dataCreazione: new Date().toISOString(),
    };
    appData.debiti.push(newDebito);
  }

  closeDebitoModal();
  saveDataLocally();
  showNotification(
    editIdStr ? "Finanziamento aggiornato!" : "Finanziamento salvato!",
  );
}

/**
 * Elimina un debito e la relativa voce dal budget previa conferma.
 * @param {number} id - ID del debito
 */
async function deleteDebito(id) {
  if (!appData.debiti) appData.debiti = [];
  const debito = appData.debiti.find((d) => d.id === id);
  const name = debito ? `"${debito.desc}"` : "questo debito";

  const result = await showConfirm(
    `Eliminare ${name}?`,
    "Verrà rimossa definitivamente la riga corrispondente anche dalla tabella Budget.",
  );

  if (result.isConfirmed) {
    appData.debiti = appData.debiti.filter((d) => d.id !== id);
    appData.budget = (appData.budget || []).filter(
      (b) => !b.isDebito || b.debitoId !== id,
    );
    saveDataLocally();
    showNotification("Finanziamento eliminato!");
  }
}

/**
 * Scala una rata mensile dal debito (decrementa di 1 i mesi rimanenti).
 * Se la rata di questo mese risulta già registrata, chiede conferma esplicita per prevenire doppi click accidentali (Soluzione A).
 * @param {number} id - ID del debito
 */
async function decrementaRataDebito(id) {
  if (!appData.debiti) appData.debiti = [];
  const debito = appData.debiti.find((d) => d.id === id);
  if (!debito) return;

  if (debito.mesiRimanenti <= 0) {
    showNotification("Debito già saldato!");
    return;
  }

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthName = now.toLocaleDateString("it-IT", { month: "long" });
  const capMonth =
    currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  // Controllo Soluzione A: Rata del mese corrente già registrata
  if (debito.ultimoPagamentoMese === currentMonthKey) {
    const confirmResult = await M3Swal.fire({
      title: "Rata già registrata",
      html: `Hai già segnato la rata di <b>${capMonth}</b> per "<b>${debito.desc}</b>"${
        debito.ultimoPagamentoData
          ? ` in data <b>${debito.ultimoPagamentoData}</b>`
          : ""
      }.<br><br>Vuoi scalare comunque un'ulteriore rata anticipata?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sì, registra rata extra",
      cancelButtonText: "Annulla",
    });
    if (!confirmResult.isConfirmed) return;
  }

  debito.mesiRimanenti = Math.max(0, debito.mesiRimanenti - 1);
  if (
    !debito.totaleInizialeMesi ||
    debito.totaleInizialeMesi <= debito.mesiRimanenti
  ) {
    debito.totaleInizialeMesi = debito.mesiRimanenti + 1;
  }

  debito.ultimoPagamentoMese = currentMonthKey;
  debito.ultimoPagamentoData = now.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });

  saveDataLocally();

  if (debito.mesiRimanenti === 0) {
    showNotification("Debito saldato con successo!");
  } else {
    showNotification(`Rata registrata (${debito.mesiRimanenti} rimaste)`);
  }
}

/**
 * Annulla l'ultimo pagamento registrato per un debito (+1 rata rimanente, Soluzione C).
 * @param {number} id - ID del debito
 */
async function ripristinaRataDebito(id) {
  if (!appData.debiti) appData.debiti = [];
  const debito = appData.debiti.find((d) => d.id === id);
  if (!debito) return;

  const result = await showConfirm(
    "Annullare pagamento rata?",
    `Verrà ripristinata 1 rata per "${debito.desc}". Il debito nel budget aumenterà di conseguenza.`,
    "Ripristina Rata",
  );

  if (result.isConfirmed) {
    debito.mesiRimanenti = (parseInt(debito.mesiRimanenti, 10) || 0) + 1;
    if (
      debito.totaleInizialeMesi &&
      debito.totaleInizialeMesi < debito.mesiRimanenti
    ) {
      debito.totaleInizialeMesi = debito.mesiRimanenti;
    }
    debito.ultimoPagamentoMese = null;
    debito.ultimoPagamentoData = null;

    saveDataLocally();
    showNotification(`Rata ripristinata (${debito.mesiRimanenti} rimaste)`);
  }
}

/**
 * Elimina un debito direttamente dalla modale di modifica.
 */
async function deleteDebitoFromModal() {
  const id = parseInt(document.getElementById("debito-edit-id").value);
  if (id) {
    await deleteDebito(id);
    closeDebitoModal();
  }
}
