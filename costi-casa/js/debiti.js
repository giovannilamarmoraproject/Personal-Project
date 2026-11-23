/**
 * ============================================================================== 
 * GESTIONE DEBITI, FINANZIAMENTI & RATE MENSILE
 * ============================================================================== 
 */

let currentDebitoDetailId = null;
let debitoDoughnutChart = null;
let debitoProjectionChart = null;

function getProssimaScadenzaDebito(giornoPagamento, mesiRimanenti) {
  const mesi = parseInt(mesiRimanenti, 10) || 0;
  if (mesi <= 0) {
    return {
      label: "Saldato",
      isToday: false,
      isSoon: false,
      diffDays: null,
      dateStr: "Saldato"
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
      dateStr: `${validDayThisMonth} ${now.toLocaleDateString("it-IT", { month: "short" })}`
    };
  }

  if (currentDay < validDayThisMonth) {
    const targetDate = new Date(targetYear, targetMonth, validDayThisMonth);
    const diffDays = Math.round((targetDate - new Date(currentYear, currentMonth, currentDay)) / (1000 * 60 * 60 * 24));
    return {
      label: `${validDayThisMonth} ${targetDate.toLocaleDateString("it-IT", { month: "long" })} (tra ${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'})`,
      isToday: false,
      isSoon: diffDays <= 5,
      diffDays,
      targetDate,
      dateStr: `${validDayThisMonth} ${targetDate.toLocaleDateString("it-IT", { month: "short" })}`
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
  const diffDays = Math.round((targetDate - new Date(currentYear, currentMonth, currentDay)) / (1000 * 60 * 60 * 24));
  return {
    label: `${validDayNextMonth} ${targetDate.toLocaleDateString("it-IT", { month: "long" })} (tra ${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'})`,
    isToday: false,
    isSoon: diffDays <= 5,
    diffDays,
    targetDate,
    dateStr: `${validDayNextMonth} ${targetDate.toLocaleDateString("it-IT", { month: "short" })}`
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
    (b) => !b.isDebito || (b.debitoId && activeDebtIds.has(b.debitoId))
  );

  appData.debiti.forEach((d) => {
    const rateLeft = Math.max(0, parseInt(d.mesiRimanenti, 10) || 0);
    const rataVal = parseFloat(d.rata) || 0;
    const debitoResiduo = rateLeft * rataVal;

    let b = appData.budget.find(
      (item) => item.isDebito && item.debitoId === d.id
    );
    if (!b) {
      b = {
        id: d.id + 88800000,
        debitoId: d.id,
        isDebito: true,
        isMutuo: false,
        desc: d.desc ? `Debito: ${d.desc}` : "Debito Rateale"
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
        b[u.id] = debitoResiduo > 0 ? -(debitoResiduo * ((u.share || 0) / 100)) : 0;
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
      <div class="stat-card tone-due">
        <div class="stat-card-header">
          <span class="stat-card-label">Debito Totale Residuo</span>
          <span class="stat-card-icon"><span class="material-symbols-outlined">account_balance</span></span>
        </div>
        <div class="stat-value sensitive-value" style="color: var(--md-sys-color-error);">
          ${totResiduo > 0 ? "- " + formatCurrency(totResiduo) : "0,00 €"}
        </div>
        <div class="stat-card-footer">
          <span>${totResiduo > 0 ? "Detratto dal budget disponibile" : "Nessun debito pendente"}</span>
        </div>
      </div>

      <div class="stat-card tone-cost">
        <div class="stat-card-header">
          <span class="stat-card-label">Rata Mensile Totale</span>
          <span class="stat-card-icon"><span class="material-symbols-outlined">payments</span></span>
        </div>
        <div class="stat-value sensitive-value" style="color: var(--md-sys-color-primary);">
          ${formatCurrency(totRateMensili)} <span style="font-size: 13px; font-weight: 500 !important; color: var(--md-sys-color-outline);">/ mese</span>
        </div>
        <div class="stat-card-footer">
          <span>Uscita fissa mensile complessiva</span>
        </div>
      </div>

      <div class="stat-card tone-warn">
        <div class="stat-card-header">
          <span class="stat-card-label">Prossima Scadenza</span>
          <span class="stat-card-icon"><span class="material-symbols-outlined">event</span></span>
        </div>
        <div class="stat-value" style="font-size: clamp(16px, 1.3vw, 20px);">
          ${nextScadenzaLabel}
        </div>
        <div class="stat-card-footer">
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${nextScadenzaDebitoNome ? nextScadenzaDebitoNome : "Tutte le rate saldate"}</span>
        </div>
      </div>

      <div class="stat-card tone-budget">
        <div class="stat-card-header">
          <span class="stat-card-label">Stato Finanziamenti</span>
          <span class="stat-card-icon"><span class="material-symbols-outlined">checklist</span></span>
        </div>
        <div class="stat-value">
          ${attiviCount} <span style="font-size: 14px; font-weight: 500 !important; color: var(--md-sys-color-outline);">attivi</span>
        </div>
        <div class="stat-card-footer">
          <span>Saldati</span>
          <span class="stat-footer-pill pos">${saldatiCount} ${saldatiCount === 1 ? "saldato" : "saldati"}</span>
        </div>
      </div>
    `;
  }

  // 3. Render Filtro Partecipante
  const chipsContainer = document.getElementById("debiti-user-filter-chips");
  if (chipsContainer) {
    let chipsHtml = `
      <button type="button" class="debito-filter-chip ${currentDebitiUserFilter === 'all' ? 'active' : ''}" onclick="setDebitiUserFilter('all')">
        Tutti i Partecipanti (${appData.debiti.length})
      </button>
    `;
    users.forEach((u) => {
      const uCount = appData.debiti.filter((d) => d.userId === u.id).length;
      chipsHtml += `
        <button type="button" class="debito-filter-chip ${currentDebitiUserFilter === u.id ? 'active' : ''}" onclick="setDebitiUserFilter('${u.id}')">
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
  cardsContainer.style.gridTemplateColumns = "repeat(auto-fill, minmax(320px, 1fr))";
  cardsContainer.style.gap = "16px";

  let cardsHtml = "";
  filteredDebiti.forEach((d) => {
    const rateLeft = Math.max(0, parseInt(d.mesiRimanenti, 10) || 0);
    const rataVal = parseFloat(d.rata) || 0;
    const debitoResiduo = rateLeft * rataVal;
    const isSaldato = rateLeft <= 0;

    let userObj = users.find((u) => u.id === d.userId);
    let userName = userObj ? userObj.name : d.userId === "all" ? "Tutti (Condiviso)" : "Partecipante";

    const scad = getProssimaScadenzaDebito(d.giornoPagamento, rateLeft);

    const totIniziale = Math.max(rateLeft, parseInt(d.totaleInizialeMesi, 10) || rateLeft);
    const ratePagate = Math.max(0, totIniziale - rateLeft);
    const percProgresso = totIniziale > 0 ? Math.min(100, Math.round((ratePagate / totIniziale) * 100)) : 100;

    let iconName = "credit_card";
    const lowerDesc = (d.desc || "").toLowerCase();
    if (lowerDesc.includes("auto") || lowerDesc.includes("macchina") || lowerDesc.includes("moto") || lowerDesc.includes("veicolo")) {
      iconName = "directions_car";
    } else if (lowerDesc.includes("casa") || lowerDesc.includes("ristruttur") || lowerDesc.includes("arredo")) {
      iconName = "home";
    } else if (lowerDesc.includes("elettro") || lowerDesc.includes("telefono") || lowerDesc.includes("pc")) {
      iconName = "devices";
    }

    cardsHtml += `
      <div class="debito-card ${isSaldato ? 'saldato' : ''}" onclick="handleDebitoCardClick(event, ${d.id})" title="Clicca per dettagli, storico rate e grafici">
        <!-- Header con Icona, Titolo e Badge Stato -->
        <div class="debito-header">
          <div class="debito-title-group">
            <div class="debito-icon-avatar">
              <span class="material-symbols-outlined">${isSaldato ? 'check_circle' : iconName}</span>
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
            <div class="debito-metric-value sensitive-value ${isSaldato ? '' : 'highlight-red'}">
              ${isSaldato ? '0,00 €' : '- ' + formatCurrency(debitoResiduo)}
            </div>
          </div>
        </div>

        <!-- Prossimo Addebito -->
        <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: ${scad.isSoon ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-outline)'}; background: var(--md-sys-color-surface-container); padding: 8px 12px; border-radius: 8px;">
          <span class="material-symbols-outlined" style="font-size: 16px;">schedule</span>
          <span>Prossimo addebito: <b>${scad.label}</b></span>
        </div>

        ${
          (() => {
            const nowD = new Date();
            const curMKey = `${nowD.getFullYear()}-${String(nowD.getMonth() + 1).padStart(2, "0")}`;
            const isMesePagato = d.ultimoPagamentoMese === curMKey;
            const curMName = nowD.toLocaleDateString("it-IT", { month: "long" });
            const capMName = curMName.charAt(0).toUpperCase() + curMName.slice(1);
            if (isMesePagato && !isSaldato) {
              return `<div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--md-sys-color-success); font-weight: 600; background: rgba(34, 197, 94, 0.12); padding: 6px 12px; border-radius: 8px; margin-top: -6px;">
                <span class="material-symbols-outlined" style="font-size: 15px;">check_circle</span>
                <span>Rata di ${capMName} già segnata (${d.ultimoPagamentoData || 'questo mese'})</span>
              </div>`;
            }
            return "";
          })()
        }

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

        <!-- Note compatte se presenti -->
        ${
          d.note && d.note.replace(/<[^>]*>/g, "").trim()
            ? `<div class="debito-note-preview">${renderRichContent(d.note, "debiti", d.id, "note")}</div>`
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
                    return `<button class="btn btn-tonal" style="font-size: 12px; padding: 6px 12px; gap: 6px; white-space: nowrap;" onclick="decrementaRataDebito(${d.id})" title="${isMesePagato ? 'Rata già registrata questo mese. Clicca per registrare una rata extra' : 'Registra il pagamento di una rata mensile'}">
                        <span class="material-symbols-outlined" style="font-size: 16px; color: ${isMesePagato ? 'var(--md-sys-color-outline)' : 'var(--md-sys-color-success)'};">${isMesePagato ? 'history_toggle_off' : 'check_circle'}</span>
                        ${isMesePagato ? 'Segna Altra Rata' : 'Segna Rata Pagata'}
                      </button>`;
                  })()
                : `<span style="font-size: 12px; color: var(--md-sys-color-success); font-weight: 600; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">
                    <span class="material-symbols-outlined" style="font-size: 16px;">verified</span> Completato
                  </span>`
            }
            ${
              (d.ultimoPagamentoMese || (d.totaleInizialeMesi && d.totaleInizialeMesi > d.mesiRimanenti))
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
  document.getElementById("debito-mesi").value = debito.mesiRimanenti !== undefined ? debito.mesiRimanenti : "";
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
    calcEl.innerHTML = `${formatCurrency(rata)} &times; ${mesi} ${mesi === 1 ? 'rata' : 'rate'}`;
  }

  const totEl = document.getElementById("debito-preview-totale");
  if (totEl) {
    totEl.innerHTML = totale > 0 ? `- ${formatCurrency(totale)}` : formatCurrency(0);
    totEl.style.color = totale > 0 ? "var(--md-sys-color-error)" : "var(--md-sys-color-outline)";
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
    showNotification("Attenzione", "Inserisci la descrizione o nome del debito.", "warning");
    return;
  }
  if (isNaN(rata) || rata < 0) {
    showNotification("Attenzione", "Inserisci un importo valido per la rata mensile.", "warning");
    return;
  }
  if (isNaN(mesi) || mesi < 0) {
    showNotification("Attenzione", "Inserisci il numero di rate/mesi rimanenti (0 o più).", "warning");
    return;
  }
  if (isNaN(giorno) || giorno < 1 || giorno > 31) {
    showNotification("Attenzione", "Il giorno di addebito deve essere compreso tra 1 e 31.", "warning");
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
      dataCreazione: new Date().toISOString()
    };
    appData.debiti.push(newDebito);
  }

  closeDebitoModal();
  saveDataLocally();
  showNotification(editIdStr ? "Finanziamento aggiornato!" : "Finanziamento salvato!");
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
    "Verrà rimossa definitivamente la riga corrispondente anche dalla tabella Budget."
  );

  if (result.isConfirmed) {
    appData.debiti = appData.debiti.filter((d) => d.id !== id);
    appData.budget = (appData.budget || []).filter((b) => !b.isDebito || b.debitoId !== id);
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
  const capMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  const isExtra = debito.ultimoPagamentoMese === currentMonthKey;

  // Controllo Soluzione A: Rata del mese corrente già registrata
  if (isExtra) {
    const confirmResult = await M3Swal.fire({
      title: "Rata già registrata",
      html: `Hai già segnato la rata di <b>${capMonth}</b> per "<b>${debito.desc}</b>"${
        debito.ultimoPagamentoData ? ` in data <b>${debito.ultimoPagamentoData}</b>` : ""
      }.<br><br>Vuoi scalare comunque un'ulteriore rata anticipata?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sì, registra rata extra",
      cancelButtonText: "Annulla"
    });
    if (!confirmResult.isConfirmed) return;
  }

  debito.mesiRimanenti = Math.max(0, debito.mesiRimanenti - 1);
  if (!debito.totaleInizialeMesi || debito.totaleInizialeMesi <= debito.mesiRimanenti) {
    debito.totaleInizialeMesi = debito.mesiRimanenti + 1;
  }

  debito.ultimoPagamentoMese = currentMonthKey;
  debito.ultimoPagamentoData = now.toLocaleDateString("it-IT", { day: "numeric", month: "short" });

  // Registra nello storico pagamenti del debito
  if (!Array.isArray(debito.pagamenti)) debito.pagamenti = [];
  debito.pagamenti.push({
    id: Date.now(),
    data: now.toISOString().split("T")[0],
    importo: parseFloat(debito.rata) || 0,
    meseRiferimento: currentMonthKey,
    nota: isExtra ? "Rata extra / anticipata" : `Rata di ${capMonth} ${now.getFullYear()}`
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
    "Ripristina Rata"
  );

  if (result.isConfirmed) {
    debito.mesiRimanenti = (parseInt(debito.mesiRimanenti, 10) || 0) + 1;
    if (debito.totaleInizialeMesi && debito.totaleInizialeMesi < debito.mesiRimanenti) {
      debito.totaleInizialeMesi = debito.mesiRimanenti;
    }

    if (Array.isArray(debito.pagamenti) && debito.pagamenti.length > 0) {
      debito.pagamenti.pop();
      const prev = debito.pagamenti[debito.pagamenti.length - 1];
      if (prev) {
        debito.ultimoPagamentoMese = prev.meseRiferimento || null;
        debito.ultimoPagamentoData = prev.data
          ? new Date(prev.data).toLocaleDateString("it-IT", { day: "numeric", month: "short" })
          : null;
      } else {
        debito.ultimoPagamentoMese = null;
        debito.ultimoPagamentoData = null;
      }
    } else {
      debito.ultimoPagamentoMese = null;
      debito.ultimoPagamentoData = null;
    }

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

// ==============================================================================
// VISTA DETTAGLIO DEBITO / FINANZIAMENTO (STORICO RATE & GRAFICI)
// ==============================================================================

/**
 * Gestisce il click su una card debito ignorando i click sui pulsanti d'azione interni.
 */
function handleDebitoCardClick(event, id) {
  if (
    event &&
    event.target &&
    event.target.closest("button, a, input, .debito-footer-actions")
  ) {
    return;
  }
  openDebitoDetailView(id);
}

/**
 * Apre la pagina dedicata di dettaglio di un debito/finanziamento.
 */
function openDebitoDetailView(id) {
  const debito = (appData.debiti || []).find((d) => d.id === id);
  if (!debito) return;
  if (!Array.isArray(debito.pagamenti)) debito.pagamenti = [];

  currentDebitoDetailId = id;
  renderDebitoDetailView(debito);

  document
    .querySelectorAll(".view-section")
    .forEach((el) => el.classList.remove("active"));
  const detailSection = document.getElementById("view-debito-detail");
  if (detailSection) detailSection.classList.add("active");

  document.title = `${debito.desc} | Debiti & Finanziamenti`;
  const titleEl = document.getElementById("page-main-title");
  if (titleEl) titleEl.innerText = debito.desc || "Dettaglio Finanziamento";

  const mainContainer = document.getElementById("main-scroll-container");
  if (mainContainer) mainContainer.scrollTop = 0;
}

/**
 * Chiude la pagina dettaglio debito e torna alla panoramica Debiti & Finanziamenti.
 */
function closeDebitoDetailView() {
  currentDebitoDetailId = null;
  if (debitoDoughnutChart) {
    debitoDoughnutChart.destroy();
    debitoDoughnutChart = null;
  }
  if (debitoProjectionChart) {
    debitoProjectionChart.destroy();
    debitoProjectionChart = null;
  }

  const detailSection = document.getElementById("view-debito-detail");
  if (detailSection) detailSection.classList.remove("active");
  document
    .querySelectorAll(".view-section")
    .forEach((el) => el.classList.remove("active"));
  const debitiView = document.getElementById("view-debiti");
  if (debitiView) debitiView.classList.add("active");

  document.title = "Debiti & Finanziamenti | Costi Casa";
  const titleEl = document.getElementById("page-main-title");
  if (titleEl) titleEl.innerText = "Debiti & Finanziamenti";

  const mainContainer = document.getElementById("main-scroll-container");
  if (mainContainer) mainContainer.scrollTop = 0;
}

/**
 * Calcola la data stimata di estinzione e il calendario delle prossime rate.
 */
function getDebitoSchedulePreview(debito, maxItems = Infinity) {
  const rateLeft = Math.max(0, parseInt(debito.mesiRimanenti, 10) || 0);
  const rataVal = parseFloat(debito.rata) || 0;
  if (rateLeft <= 0) {
    return { extinctionLabel: "Saldato", upcoming: [] };
  }

  const scad = getProssimaScadenzaDebito(debito.giornoPagamento, rateLeft);
  const start = scad.targetDate ? new Date(scad.targetDate) : new Date();
  const day = Math.min(31, Math.max(1, parseInt(debito.giornoPagamento, 10) || 1));

  const upcoming = [];
  let residuo = rateLeft * rataVal;
  let lastDate = start;

  for (let i = 0; i < rateLeft; i++) {
    const y = start.getFullYear();
    const m = start.getMonth() + i;
    const maxD = new Date(y, m + 1, 0).getDate();
    const dt = new Date(y, m, Math.min(day, maxD));
    lastDate = dt;
    residuo = Math.max(0, residuo - rataVal);

    if (i < maxItems) {
      const mName = dt.toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      upcoming.push({
        num: i + 1,
        dateLabel: mName,
        importo: rataVal,
        residuoDopo: residuo,
      });
    }
  }

  const extMonth = lastDate.toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
  });
  const extinctionLabel = extMonth.charAt(0).toUpperCase() + extMonth.slice(1);
  return { extinctionLabel, upcoming };
}

/**
 * Renderizza l'intera vista di dettaglio di un debito (KPI, grafici, note, storico pagamenti e scadenze).
 */
function renderDebitoDetailView(d) {
  const container = document.getElementById("debito-detail-content");
  if (!container || !d) return;

  if (!Array.isArray(d.pagamenti)) d.pagamenti = [];

  const users = appData.settings.users || [];
  const userObj = users.find((u) => u.id === d.userId);
  const userName = userObj
    ? userObj.name
    : d.userId === "all"
      ? "Tutti (Condiviso)"
      : "Partecipante";

  const rateLeft = Math.max(0, parseInt(d.mesiRimanenti, 10) || 0);
  const rataVal = parseFloat(d.rata) || 0;
  const totIniziale = Math.max(rateLeft, parseInt(d.totaleInizialeMesi, 10) || rateLeft);
  const ratePagate = Math.max(0, totIniziale - rateLeft);
  const isSaldato = rateLeft <= 0;

  const debitoResiduo = rateLeft * rataVal;
  const importoPagatoStimato = ratePagate * rataVal;
  const importoTotalePiano = totIniziale * rataVal;
  const percProgresso =
    totIniziale > 0 ? Math.min(100, Math.round((ratePagate / totIniziale) * 100)) : 100;

  const scad = getProssimaScadenzaDebito(d.giornoPagamento, rateLeft);
  const schedule = getDebitoSchedulePreview(d);

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

  // Ordina storico pagamenti dal più recente
  const sortedPayments = [...d.pagamenti].sort((a, b) => {
    const da = a.data || "";
    const db = b.data || "";
    if (db !== da) return db.localeCompare(da);
    return (b.id || 0) - (a.id || 0);
  });

  const untrackedPaidCount = Math.max(0, ratePagate - sortedPayments.length);
  const hasNote = d.note && d.note.replace(/<[^>]*>/g, "").trim().length > 0;

  container.innerHTML = `
    <!-- Barra Superiore Navigazione & Azioni -->
    <div class="debito-detail-topbar">
      <button class="btn btn-tonal" onclick="closeDebitoDetailView()">
        <span class="material-symbols-outlined">arrow_back</span> Torna ai Debiti
      </button>
      <div class="debito-detail-top-actions">
        ${
          !isSaldato
            ? `<button class="btn btn-filled" onclick="decrementaRataDebito(${d.id})">
                <span class="material-symbols-outlined">check_circle</span> Segna Rata Pagata
              </button>`
            : ""
        }
        <button class="btn btn-tonal" onclick="openEditDebitoModal(${d.id})">
          <span class="material-symbols-outlined">edit</span> Modifica
        </button>
        <button class="btn-icon" onclick="deleteDebito(${d.id})" title="Elimina finanziamento">
          <span class="material-symbols-outlined" style="color: var(--md-sys-color-error);">delete</span>
        </button>
      </div>
    </div>

    <!-- Header Principale Card -->
    <div class="card debito-detail-hero-card">
      <div class="debito-detail-hero-header">
        <div class="debito-title-group">
          <div class="debito-icon-avatar" style="width: 52px; height: 52px; border-radius: 16px;">
            <span class="material-symbols-outlined" style="font-size: 28px;">${isSaldato ? "check_circle" : iconName}</span>
          </div>
          <div style="min-width: 0;">
            <h2 style="margin: 0; font-size: 22px; color: var(--md-sys-color-on-surface); word-break: break-word;">${escapeHTML(d.desc)}</h2>
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 6px;">
              <span class="debito-user-tag" style="margin-top: 0; font-size: 12px;">
                <span class="material-symbols-outlined" style="font-size: 15px;">person</span>
                <span>Intestatario: <b>${escapeHTML(userName)}</b></span>
              </span>
              ${
                isSaldato
                  ? '<span class="debito-status-badge debito-status-saldato">Saldato</span>'
                  : '<span class="debito-status-badge debito-status-attivo">In Corso</span>'
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Barra Avanzamento Globale -->
      <div class="debito-progress-container" style="margin-top: 18px;">
        <div class="debito-progress-header" style="font-size: 13px;">
          <span>Avanzamento Rimborso Complessivo</span>
          <strong>${ratePagate} / ${totIniziale} rate (${percProgresso}%)</strong>
        </div>
        <div class="debito-progress-track" style="height: 10px;">
          <div class="debito-progress-fill" style="width: ${percProgresso}%;"></div>
        </div>
      </div>

      <!-- Pillole Parametri -->
      <div class="debito-detail-params-grid">
        <div class="debito-detail-param-pill">
          <span class="debito-metric-label">Rata Mensile</span>
          <strong class="sensitive-value">${formatCurrency(rataVal)} / mese</strong>
        </div>
        <div class="debito-detail-param-pill">
          <span class="debito-metric-label">Giorno Addebito</span>
          <strong>Giorno ${d.giornoPagamento || 1} del mese</strong>
        </div>
        <div class="debito-detail-param-pill">
          <span class="debito-metric-label">Prossimo Addebito</span>
          <strong style="color: ${scad.isSoon ? "var(--md-sys-color-error)" : "var(--md-sys-color-on-surface)"};">${scad.label}</strong>
        </div>
        <div class="debito-detail-param-pill">
          <span class="debito-metric-label">Estinzione Stimata</span>
          <strong style="color: var(--md-sys-color-primary);">${schedule.extinctionLabel}</strong>
        </div>
      </div>
    </div>

    <!-- KPI Economici -->
    <div class="dashboard-grid" style="margin-bottom: 24px;">
      <div class="stat-card" style="background: var(--md-sys-color-surface-container-high); color: var(--md-sys-color-on-surface);">
        <span style="font-size: 12px; font-weight: 600; color: var(--md-sys-color-outline); text-transform: uppercase;">Totale Piano (${totIniziale} rate)</span>
        <div class="stat-value sensitive-value" style="font-weight: 700;">${formatCurrency(importoTotalePiano)}</div>
      </div>
      <div class="stat-card" style="background: var(--md-sys-color-surface-container-high); color: var(--md-sys-color-on-surface);">
        <span style="font-size: 12px; font-weight: 600; color: var(--md-sys-color-outline); text-transform: uppercase;">Già Rimborsato (${ratePagate} rate)</span>
        <div class="stat-value sensitive-value" style="color: var(--md-sys-color-success); font-weight: 700;">${formatCurrency(importoPagatoStimato)}</div>
      </div>
      <div class="stat-card" style="background: var(--md-sys-color-surface-container-high); color: var(--md-sys-color-on-surface);">
        <span style="font-size: 12px; font-weight: 600; color: var(--md-sys-color-outline); text-transform: uppercase;">Debito Residuo (${rateLeft} rate)</span>
        <div class="stat-value sensitive-value" style="color: ${isSaldato ? "var(--md-sys-color-success)" : "var(--md-sys-color-error)"}; font-weight: 700;">
          ${isSaldato ? "0,00 €" : "- " + formatCurrency(debitoResiduo)}
        </div>
      </div>
    </div>

    <!-- Grafici Rimborso & Proiezione -->
    <div class="charts-container" style="margin-top: 0; margin-bottom: 24px;">
      <div class="card" style="margin-bottom: 0;">
        <h3 class="card-title" style="font-size: 16px; margin-bottom: 12px;">Ripartizione Pagato vs Residuo</h3>
        <div class="chart-box" style="height: 250px;">
          <canvas id="debitoDetailDoughnutChart"></canvas>
        </div>
      </div>
      <div class="card" style="margin-bottom: 0;">
        <h3 class="card-title" style="font-size: 16px; margin-bottom: 12px;">Proiezione Abbattimento Debito</h3>
        <div class="chart-box" style="height: 250px;">
          <canvas id="debitoDetailProjectionChart"></canvas>
        </div>
      </div>
    </div>

    ${
      hasNote
        ? `<div class="card">
            <h3 class="card-title" style="font-size: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span class="material-symbols-outlined">notes</span> Descrizione & Note Complete
            </h3>
            <div class="debito-detail-full-note">
              ${renderRichContent(d.note, "debiti", d.id, "note")}
            </div>
          </div>`
        : ""
    }

    <!-- Storico Pagamenti Effettuati -->
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
        <div>
          <h3 class="card-title" style="margin: 0; font-size: 17px; display: flex; align-items: center; gap: 8px;">
            <span class="material-symbols-outlined">receipt_long</span> Storico Pagamenti Effettuati
          </h3>
          <p style="margin: 4px 0 0 0; font-size: 12.5px; color: var(--md-sys-color-outline);">
            Elenco cronologico delle rate registrate per questo finanziamento.
          </p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-tonal" onclick="openAddDebitoPaymentModal(${d.id})">
            <span class="material-symbols-outlined">add_card</span> Registra Pagamento
          </button>
        </div>
      </div>

      ${
        untrackedPaidCount > 0
          ? `<div style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 10px; background: var(--md-sys-color-surface-container); font-size: 12.5px; color: var(--md-sys-color-outline); margin-bottom: 14px;">
              <span class="material-symbols-outlined" style="font-size: 18px; color: var(--md-sys-color-primary);">info</span>
              <span><b>${untrackedPaidCount}</b> ${untrackedPaidCount === 1 ? "rata precedente risulta" : "rate precedenti risultano"} già contabilizzate prima della registrazione dettagliata nello storico (puoi aggiungerle manualmente con "Registra Pagamento").</span>
            </div>`
          : ""
      }

      ${
        sortedPayments.length === 0
          ? `<div style="text-align: center; padding: 28px 16px; color: var(--md-sys-color-outline);">
              <span class="material-symbols-outlined" style="font-size: 40px; opacity: 0.45;">history</span>
              <p style="margin: 8px 0 0 0; font-size: 13px;">Nessun pagamento registrato nello storico. Clicca su <b>Segna Rata Pagata</b> o <b>Registra Pagamento</b> per iniziare.</p>
            </div>`
          : `<div class="debito-payments-list">
              ${sortedPayments
                .map((p) => {
                  const dateFormatted = p.data
                    ? new Date(p.data + "T00:00:00").toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Data n/d";
                  return `
                    <div class="debito-payment-row">
                      <div class="debito-payment-left">
                        <div class="debito-payment-icon">
                          <span class="material-symbols-outlined">check</span>
                        </div>
                        <div style="min-width: 0;">
                          <div style="font-weight: 600; font-size: 14px; color: var(--md-sys-color-on-surface);">${escapeHTML(p.nota || "Rata pagata")}</div>
                          <div style="font-size: 12px; color: var(--md-sys-color-outline);">${dateFormatted}</div>
                        </div>
                      </div>
                      <div class="debito-payment-right">
                        <span class="sensitive-value" style="font-weight: 700; font-size: 14.5px; color: var(--md-sys-color-success);">${formatCurrency(p.importo || rataVal)}</span>
                        <button class="btn-icon" onclick="deleteDebitoPaymentRecord(${d.id}, ${p.id})" title="Rimuovi dallo storico">
                          <span class="material-symbols-outlined" style="font-size: 18px; color: var(--md-sys-color-error);">delete</span>
                        </button>
                      </div>
                    </div>
                  `;
                })
                .join("")}
            </div>`
      }
    </div>

    <!-- Prossime Rate in Scadenza -->
    ${
      schedule.upcoming.length > 0
        ? `<div class="card">
            <h3 class="card-title" style="font-size: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span class="material-symbols-outlined">calendar_month</span> Prossime Rate in Scadenza (${schedule.upcoming.length}${rateLeft > schedule.upcoming.length ? ` di ${rateLeft}` : ""})
            </h3>
            <div class="debito-schedule-list">
              ${schedule.upcoming
                .map(
                  (u) => `
                <div class="debito-schedule-row">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="debito-schedule-num">#${ratePagate + u.num}</span>
                    <span style="font-size: 13.5px; font-weight: 500;">${u.dateLabel}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: flex-end;">
                    <span class="sensitive-value" style="font-size: 13.5px; font-weight: 600; color: var(--md-sys-color-primary);">${formatCurrency(u.importo)}</span>
                    ${
                      u.residuoDopo <= 0.01
                        ? `<span class="stat-footer-pill pos">Ultima rata · 0,00 €</span>`
                        : `<span class="sensitive-value" style="font-size: 12px; color: var(--md-sys-color-outline);">Residuo: ${formatCurrency(u.residuoDopo)}</span>`
                    }
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>`
        : ""
    }
  `;

  // Render grafici Chart.js nel frame successivo
  requestAnimationFrame(() => {
    renderDebitoDetailCharts(d, ratePagate, rateLeft, rataVal);
  });
}

/**
 * Renderizza i due grafici (Doughnut Pagato/Residuo e Line Chart Proiezione) nella pagina dettaglio debito.
 */
function renderDebitoDetailCharts(d, ratePagate, rateLeft, rataVal) {
  const m3 = typeof getM3ChartTheme === "function" ? getM3ChartTheme() : null;
  const isDark = m3 ? m3.isDark : document.body.classList.contains("dark-mode");
  const textColor = m3 ? m3.textColor : isDark ? "#E6E1E5" : "#1C1B1F";
  const gridColor = m3 ? m3.gridColor : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const isMobile = window.innerWidth <= 768;

  // 1. Doughnut Chart: Pagato vs Residuo
  const ctxDoughnut = document.getElementById("debitoDetailDoughnutChart");
  if (ctxDoughnut) {
    if (debitoDoughnutChart) debitoDoughnutChart.destroy();
    const paidVal = ratePagate * rataVal;
    const remVal = rateLeft * rataVal;
    debitoDoughnutChart = new Chart(ctxDoughnut.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: ["Già Rimborsato (€)", "Debito Residuo (€)"],
        datasets: [
          {
            data: [paidVal, remVal],
            backgroundColor: [isDark ? "#4ade80" : "#16a34a", isDark ? "#fb7185" : "#dc2626"],
            borderWidth: 0,
            borderRadius: 6,
            spacing: 3,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        animation: m3 ? m3.doughnutAnimation : undefined,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: textColor,
              usePointStyle: true,
              pointStyle: "circle",
              font: { family: "'Google Sans Flex', sans-serif", size: 12, weight: 600 },
              padding: 14,
            },
          },
          tooltip: {
            ...(m3 ? m3.tooltip : {}),
            callbacks: {
              label: (ctx) => `${ctx.label}: ${formatter.format(ctx.parsed || 0)}`,
            },
          },
        },
      },
    });
  }

  // 2. Line Chart: Proiezione Abbattimento Debito mese per mese
  const ctxProj = document.getElementById("debitoDetailProjectionChart");
  if (ctxProj) {
    if (debitoProjectionChart) debitoProjectionChart.destroy();

    const labels = [];
    const values = [];
    const now = new Date();
    const totalPoints = Math.max(1, rateLeft);

    labels.push("Oggi");
    values.push(rateLeft * rataVal);

    // Se ci sono molte rate, campioniamo in modo pulito mantenendo sempre il punto finale 0 €
    const step = totalPoints > 24 ? Math.ceil(totalPoints / 18) : 1;
    for (let i = step; i <= rateLeft; i += step) {
      const dt = new Date(now.getFullYear(), now.getMonth() + i, 1);
      labels.push(
        dt.toLocaleDateString("it-IT", { month: "short", year: "2-digit" }),
      );
      values.push(Math.max(0, (rateLeft - i) * rataVal));
    }
    if (rateLeft > 0 && values[values.length - 1] !== 0) {
      const dtEnd = new Date(now.getFullYear(), now.getMonth() + rateLeft, 1);
      labels.push(
        dtEnd.toLocaleDateString("it-IT", { month: "short", year: "2-digit" }),
      );
      values.push(0);
    }

    const lineCtx = ctxProj.getContext("2d");
    const lineColor = m3 ? m3.primary : "#6750A4";
    const fillGrad = lineCtx.createLinearGradient(0, 0, 0, 260);
    fillGrad.addColorStop(0, lineColor + (isDark ? "44" : "33"));
    fillGrad.addColorStop(1, lineColor + "00");

    debitoProjectionChart = new Chart(lineCtx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Debito Residuo (€)",
            data: values,
            borderColor: lineColor,
            borderWidth: 2.5,
            backgroundColor: fillGrad,
            fill: true,
            tension: 0.32,
            pointRadius: values.length > 15 ? 2.5 : 4,
            pointHoverRadius: 6,
            pointBackgroundColor: lineColor,
            pointBorderColor: isDark ? "#161720" : "#ffffff",
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: m3 ? m3.lineAnimation : undefined,
        plugins: {
          legend: { display: false },
          tooltip: {
            ...(m3 ? m3.tooltip : {}),
            callbacks: {
              label: (ctx) => `Residuo: ${formatter.format(ctx.parsed.y || 0)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: textColor,
              maxRotation: 0,
              autoSkip: true,
              font: {
                family: "'Google Sans Flex', sans-serif",
                size: isMobile ? 10 : 11,
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: {
                family: "'Google Sans Flex', sans-serif",
                size: isMobile ? 10 : 11,
              },
              callback: (val) => {
                if (val === 0) return "0 €";
                if (val >= 1000) return (val / 1000).toLocaleString("it-IT") + "k €";
                return val + " €";
              },
            },
          },
        },
      },
    });
  }
}

/**
 * Apre una finestra per registrare un pagamento personalizzato o storico nel debito.
 */
async function openAddDebitoPaymentModal(debitoId) {
  const debito = (appData.debiti || []).find((d) => d.id === debitoId);
  if (!debito) return;

  const todayISO = new Date().toISOString().split("T")[0];
  const defaultImporto = parseFloat(debito.rata) || 0;

  const result = await M3Swal.fire({
    title: "Registra Pagamento Rata",
    html: `
      <div style="display: flex; flex-direction: column; gap: 12px; text-align: left; margin-top: 8px;">
        <div class="input-field">
          <label>Data Pagamento</label>
          <input type="date" id="swal-deb-pay-date" value="${todayISO}" />
        </div>
        <div class="input-field">
          <label>Importo (€)</label>
          <input type="number" step="0.01" id="swal-deb-pay-amount" value="${defaultImporto}" />
        </div>
        <div class="input-field">
          <label>Nota / Descrizione</label>
          <input type="text" id="swal-deb-pay-note" placeholder="Es. Rata mensile, rata pregressa..." value="Rata mensile" />
        </div>
        <label class="checkbox-field" style="margin-top: 4px; font-size: 13px;">
          <input type="checkbox" id="swal-deb-pay-decrement" ${debito.mesiRimanenti > 0 ? "checked" : ""} />
          Scala anche 1 rata rimanente dal residuo
        </label>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Salva Pagamento",
    cancelButtonText: "Annulla",
    preConfirm: () => {
      const data = document.getElementById("swal-deb-pay-date").value;
      const importo = parseFloat(document.getElementById("swal-deb-pay-amount").value);
      const nota = document.getElementById("swal-deb-pay-note").value.trim();
      const decrement = document.getElementById("swal-deb-pay-decrement").checked;
      if (!data) {
        Swal.showValidationMessage("Inserisci una data valida");
        return false;
      }
      if (isNaN(importo) || importo <= 0) {
        Swal.showValidationMessage("Inserisci un importo maggiore di 0");
        return false;
      }
      return { data, importo, nota, decrement };
    },
  });

  if (result.isConfirmed && result.value) {
    const { data, importo, nota, decrement } = result.value;
    if (!Array.isArray(debito.pagamenti)) debito.pagamenti = [];

    const mKey = data.slice(0, 7);
    debito.pagamenti.push({
      id: Date.now(),
      data,
      importo,
      meseRiferimento: mKey,
      nota: nota || "Rata mensile",
    });

    if (decrement && debito.mesiRimanenti > 0) {
      debito.mesiRimanenti = Math.max(0, debito.mesiRimanenti - 1);
      if (!debito.totaleInizialeMesi || debito.totaleInizialeMesi <= debito.mesiRimanenti) {
        debito.totaleInizialeMesi = debito.mesiRimanenti + 1;
      }
      debito.ultimoPagamentoMese = mKey;
      debito.ultimoPagamentoData = new Date(data + "T00:00:00").toLocaleDateString(
        "it-IT",
        { day: "numeric", month: "short" },
      );
    }

    saveDataLocally();
    showNotification("Pagamento registrato nello storico!");
  }
}

/**
 * Elimina un singolo pagamento dallo storico del debito.
 */
async function deleteDebitoPaymentRecord(debitoId, paymentId) {
  const debito = (appData.debiti || []).find((d) => d.id === debitoId);
  if (!debito || !Array.isArray(debito.pagamenti)) return;

  const result = await M3Swal.fire({
    title: "Rimuovere questo pagamento?",
    html: `
      <p style="margin: 0 0 12px 0; font-size: 13.5px;">Il pagamento verrà eliminato dallo storico.</p>
      <label class="checkbox-field" style="justify-content: center; font-size: 13px;">
        <input type="checkbox" id="swal-deb-del-restore" />
        Ripristina anche +1 rata rimanente
      </label>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Elimina",
    cancelButtonText: "Annulla",
    preConfirm: () => ({
      restore: document.getElementById("swal-deb-del-restore").checked,
    }),
  });

  if (result.isConfirmed) {
    debito.pagamenti = debito.pagamenti.filter((p) => p.id !== paymentId);
    if (result.value && result.value.restore) {
      debito.mesiRimanenti = (parseInt(debito.mesiRimanenti, 10) || 0) + 1;
      if (debito.totaleInizialeMesi && debito.totaleInizialeMesi < debito.mesiRimanenti) {
        debito.totaleInizialeMesi = debito.mesiRimanenti;
      }
    }
    saveDataLocally();
    showNotification("Pagamento rimosso dallo storico");
  }
}
