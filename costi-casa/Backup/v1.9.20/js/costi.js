/**
 * ==============================================================================
 * GESTIONE SPESE CASA, DETTAGLIO, RATE, FATTURE, CATEGORIE & TABELLE
 * ==============================================================================
 */

function addEntry(type) {
  if (type === "costo") {
    const cat = document.getElementById("add-costo-cat").value;
    const desc = document.getElementById("add-costo-desc").value.trim();
    const prezzo =
      parseFloat(document.getElementById("add-costo-prezzo").value) || 0;
    const note = getRichEditorHTML("add-costo-note");

    if (!desc)
      return M3Swal.fire({
        title: "Attenzione",
        text: "Inserisci una descrizione valida",
        icon: "warning",
      });

    const confermatoEl = document.getElementById("add-costo-confermato");
    const confermato = confermatoEl ? confermatoEl.value === "true" : false;

    let item = { id: Date.now(), cat, desc, prezzo, note, confermato };
    appData.settings.users.forEach((u) => {
      let val =
        parseFloat(document.getElementById(`add-costo-${u.id}`)?.value) || 0;
      item[u.id] = val;
    });

    appData.costi.push(item);
    document.getElementById("add-costo-desc").value = "";
    document.getElementById("add-costo-prezzo").value = "";
    setRichEditorHTML("add-costo-note", "");
    if (confermatoEl) confermatoEl.value = "false";
    appData.settings.users.forEach((u) => {
      let inp = document.getElementById(`add-costo-${u.id}`);
      if (inp) inp.value = "";
    });
    showNotification("Costo aggiunto con successo!");
    toggleAddForm("costo", false);
  } else {
    const desc = document.getElementById("add-budget-desc").value.trim();
    const note = getRichEditorHTML("add-budget-note");
    const isMutuo = document.getElementById("add-budget-is-mutuo").checked;

    if (!desc)
      return M3Swal.fire({
        title: "Attenzione",
        text: "Inserisci una descrizione valida",
        icon: "warning",
      });

    let item = { id: Date.now(), desc, note, isMutuo };
    appData.settings.users.forEach((u) => {
      let val =
        parseFloat(document.getElementById(`add-budget-${u.id}`)?.value) || 0;
      item[u.id] = val;
    });

    appData.budget.push(item);
    document.getElementById("add-budget-desc").value = "";
    setRichEditorHTML("add-budget-note", "");
    document.getElementById("add-budget-is-mutuo").checked = false;
    appData.settings.users.forEach((u) => {
      let inp = document.getElementById(`add-budget-${u.id}`);
      if (inp) inp.value = "";
    });
    showNotification("Voce di budget aggiunta!");
    toggleAddForm("budget", false);
  }
  saveDataLocally();
}

/**
 * Mostra o nasconde il form di inserimento per Costi o Budget.
 * @param {'costo'|'budget'} type - Tipo di voce.
 * @param {boolean} show - True per mostrare, false per nascondere.
 */
function toggleAddForm(type, show) {
  const cardId = type === "costo" ? "card-add-costo" : "card-add-budget";
  const btnId =
    type === "costo" ? "costi-add-btn-container" : "budget-add-btn-container";
  const cardEl = document.getElementById(cardId);
  const btnEl = document.getElementById(btnId);

  if (show) {
    if (btnEl) btnEl.style.display = "none";
    if (cardEl) {
      cardEl.style.display = "block";
      cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      const firstInput = cardEl.querySelector(
        "input:not([type=hidden]), select",
      );
      if (firstInput) setTimeout(() => firstInput.focus(), 150);
    }
  } else {
    if (cardEl) cardEl.style.display = "none";
    if (btnEl) btnEl.style.display = "flex";
  }
}

/**
 * Annulla l'inserimento, pulisce i campi e nasconde il form.
 * @param {'costo'|'budget'} type - Tipo di voce.
 */
function cancelAddForm(type) {
  if (type === "costo") {
    document.getElementById("add-costo-desc").value = "";
    document.getElementById("add-costo-prezzo").value = "";
    setRichEditorHTML("add-costo-note", "");
    appData.settings.users.forEach((u) => {
      let inp = document.getElementById(`add-costo-${u.id}`);
      if (inp) inp.value = "";
    });
  } else {
    document.getElementById("add-budget-desc").value = "";
    setRichEditorHTML("add-budget-note", "");
    const isMutuoEl = document.getElementById("add-budget-is-mutuo");
    if (isMutuoEl) isMutuoEl.checked = false;
    appData.settings.users.forEach((u) => {
      let inp = document.getElementById(`add-budget-${u.id}`);
      if (inp) inp.value = "";
    });
  }
  toggleAddForm(type, false);
}

/**
 * Apre la finestra modale per modificare una voce esistente di costo o budget.
 * @param {'costo'|'budget'} type - Tipo della voce da modificare.
 * @param {number} id - ID univoco dell'elemento.
 */

function openEditModal(type, id) {
  const modal = document.getElementById("editModal");
  document.getElementById("modal-id").value = id;
  document.getElementById("modal-type").value = type;
  let item;
  if (type === "costo") {
    item = appData.costi.find((c) => c.id === id);
    document.getElementById("modal-title").innerText = "Modifica Costo";
    document.getElementById("modal-cat-group").style.display = "flex";
    document.getElementById("modal-prezzo-group").style.display = "flex";
    document.getElementById("modal-is-mutuo-group").style.display = "none";
    document.getElementById("modal-cat").value = item.cat || "";
    document.getElementById("modal-prezzo").value = (item.prezzo || 0).toFixed(
      2,
    );
    const confEl = document.getElementById("modal-confermato");
    if (confEl) {
      confEl.value = item.confermato === true ? "true" : "false";
    }
    const sumPaid = appData.settings.users.reduce(
      (acc, u) => acc + (item[u.id] || 0),
      0,
    );
    const isSaldato = (item.prezzo || 0) > 0 && item.prezzo - sumPaid <= 0.005;
    // Mostra bottone pagamento solo per i costi non ancora saldati al 100%
    document.getElementById("modal-add-payment-btn").style.display = isSaldato
      ? "none"
      : "inline-flex";
  } else {
    item = appData.budget.find((b) => b.id === id);
    if (item && item.isDebito && item.debitoId) {
      openEditDebitoModal(item.debitoId);
      return;
    }
    document.getElementById("modal-title").innerText = "Modifica Budget";
    document.getElementById("modal-cat-group").style.display = "none";
    document.getElementById("modal-prezzo-group").style.display = "none";
    document.getElementById("modal-is-mutuo-group").style.display = "block";
    document.getElementById("modal-is-mutuo").checked = !!item.isMutuo;
    // Nasconde bottone pagamento per il budget
    document.getElementById("modal-add-payment-btn").style.display = "none";
  }
  document.getElementById("modal-desc").value = item.desc || "";
  setRichEditorHTML("modal-note", item.note || "");

  // Se il costo ha pagamenti registrati, disabilita i campi quota utente
  // (i totali vengono calcolati automaticamente dalla somma dei pagamenti)
  const hasPagamenti =
    type === "costo" && item.pagamenti && item.pagamenti.length > 0;
  let modalUsersNote = document.getElementById("modal-users-note");
  if (!modalUsersNote) {
    modalUsersNote = document.createElement("p");
    modalUsersNote.id = "modal-users-note";
    modalUsersNote.style.cssText =
      "font-size: 12px; color: var(--md-sys-color-outline); margin: -8px 0 8px 0; display: flex; align-items: center; gap: 4px;";
    modalUsersNote.innerHTML =
      '<span class="material-symbols-outlined" style="font-size:14px">info</span> Calcolati automaticamente dai pagamenti registrati';
    const usersContainer = document.getElementById("modal-users-inputs");
    if (usersContainer) usersContainer.after(modalUsersNote);
  }
  modalUsersNote.style.display = hasPagamenti ? "flex" : "none";
  // Nasconde il bottone di divisione automatica se i campi sono disabilitati
  const splitBtn = document.getElementById("modal-split-btn");
  if (splitBtn) splitBtn.style.display = hasPagamenti ? "none" : "";

  appData.settings.users.forEach((u) => {
    let inp = document.getElementById(`modal-${u.id}`);
    if (inp) {
      inp.value = (item[u.id] || 0).toFixed(2);
      inp.disabled = hasPagamenti;
      inp.style.opacity = hasPagamenti ? "0.5" : "";
      inp.style.cursor = hasPagamenti ? "not-allowed" : "";
    }
  });

  openModalOverlay(modal);
}

/**
 * Chiude la modale di modifica voce.
 */
function closeModal() {
  closeModalOverlay("editModal");
}

/**
 * Salva le modifiche apportate nella modale di modifica voce.
 */
function saveModalChanges() {
  const id = parseInt(document.getElementById("modal-id").value);
  const type = document.getElementById("modal-type").value;
  if (type === "costo") {
    let item = appData.costi.find((c) => c.id === id);
    item.cat = document.getElementById("modal-cat").value;
    item.desc = document.getElementById("modal-desc").value;
    item.prezzo =
      parseFloat(document.getElementById("modal-prezzo").value) || 0;
    item.note = getRichEditorHTML("modal-note");
    const confEl = document.getElementById("modal-confermato");
    if (confEl) {
      item.confermato = confEl.value === "true";
    }
    // Aggiorna le quote utente solo se i campi non sono disabilitati
    // (se ci sono pagamenti registrati, i totali vengono da recalcUserTotals)
    const hasPagamenti = item.pagamenti && item.pagamenti.length > 0;
    if (!hasPagamenti) {
      item.originQuote = {};
      appData.settings.users.forEach((u) => {
        let inp = document.getElementById(`modal-${u.id}`);
        const val = inp ? parseFloat(inp.value) || 0 : 0;
        item[u.id] = val;
        item.originQuote[u.id] = val;
      });
      item.originPaid = appData.settings.users.reduce(
        (acc, u) => acc + (item[u.id] || 0),
        0,
      );
    } else {
      recalcUserTotals(item);
    }
  } else {
    let item = appData.budget.find((b) => b.id === id);
    item.desc = document.getElementById("modal-desc").value;
    item.note = getRichEditorHTML("modal-note");
    item.isMutuo = document.getElementById("modal-is-mutuo").checked;
    appData.settings.users.forEach((u) => {
      let inp = document.getElementById(`modal-${u.id}`);
      item[u.id] = inp ? parseFloat(inp.value) || 0 : 0;
    });
  }
  closeModal();
  saveDataLocally();
  if (currentDetailId !== null) {
    const curItem = appData.costi.find((c) => c.id === currentDetailId);
    if (curItem) renderDetailView(curItem);
  }
  showNotification("Modifiche salvate!");
}

/**
 * Elimina una voce direttamente dalla modale di modifica.
 */
async function deleteFromModal() {
  const result = await showConfirm(
    "Eliminare questa voce?",
    "Questa azione rimuoverà definitivamente la voce.",
  );
  if (result.isConfirmed) {
    const id = parseInt(document.getElementById("modal-id").value);
    const type = document.getElementById("modal-type").value;
    if (type === "costo") {
      appData.costi = appData.costi.filter((c) => c.id !== id);
      (appData.qa || []).forEach((q) => {
        if (q.linkedCostIds)
          q.linkedCostIds = q.linkedCostIds.filter((cid) => cid !== id);
      });
      (appData.tasks || []).forEach((t) => {
        if (t.linkedCostIds)
          t.linkedCostIds = t.linkedCostIds.filter((cid) => cid !== id);
      });
      (appData.notes || []).forEach((n) => {
        if (n.linkedCostIds)
          n.linkedCostIds = n.linkedCostIds.filter((cid) => cid !== id);
      });
      if (currentDetailId === id) {
        closeDetailView();
      }
    } else {
      appData.budget = appData.budget.filter((b) => b.id !== id);
    }
    closeModal();
    saveDataLocally();
    showNotification("Voce eliminata");
  }
}

/**
 * Elimina una voce di costo direttamente dalla tabella con conferma.
 * @param {number} id - ID della voce di costo.
 */
async function deleteCostItem(id) {
  const item = appData.costi.find((c) => c.id === id);
  const name = item ? `"${item.desc}"` : "questa voce";
  const result = await showConfirm(
    `Eliminare ${name}?`,
    "Questa azione rimuoverà definitivamente la voce di spesa e i relativi collegamenti.",
  );
  if (result.isConfirmed) {
    appData.costi = appData.costi.filter((c) => c.id !== id);
    (appData.qa || []).forEach((q) => {
      if (q.linkedCostIds)
        q.linkedCostIds = q.linkedCostIds.filter((cid) => cid !== id);
    });
    (appData.tasks || []).forEach((t) => {
      if (t.linkedCostIds)
        t.linkedCostIds = t.linkedCostIds.filter((cid) => cid !== id);
    });
    (appData.notes || []).forEach((n) => {
      if (n.linkedCostIds)
        n.linkedCostIds = n.linkedCostIds.filter((cid) => cid !== id);
    });
    if (currentDetailId === id) {
      closeDetailView();
    }
    saveDataLocally();
    showNotification("Voce di spesa eliminata");
  }
}

/**
 * Elimina una voce di budget direttamente dalla tabella con conferma.
 * @param {number} id - ID della voce di budget.
 */

function populateLinkedCostSelect(selectEl, currentIds = []) {
  if (!selectEl) return;
  selectEl.innerHTML = '<option value="">Collega a un costo casa...</option>';
  if (!appData.costi || appData.costi.length === 0) return;

  const currentSet = new Set((currentIds || []).map((id) => Number(id)));
  const sortedCosti = [...appData.costi].sort((a, b) =>
    (a.desc || "").localeCompare(b.desc || "", "it", { sensitivity: "base" }),
  );

  sortedCosti.forEach((cost) => {
    if (!currentSet.has(Number(cost.id))) {
      const opt = document.createElement("option");
      opt.value = cost.id;
      opt.textContent = cost.desc || "Senza titolo";
      selectEl.appendChild(opt);
    }
  });
}

/**
 * Renderizza le chips dei costi collegati all'interno di un contenitore nel modale.
 * @param {HTMLElement} containerEl - Contenitore chips.
 * @param {number[]} idsArray - ID dei costi collegati.
 * @param {Function} onRemove - Callback invocata alla rimozione.
 */
function renderLinkedCostsChips(containerEl, idsArray, onRemove) {
  if (!containerEl) return;
  containerEl.innerHTML = "";
  if (!idsArray || idsArray.length === 0) return;

  idsArray.forEach((costId) => {
    const cost = (appData.costi || []).find((c) => c.id === Number(costId));
    if (!cost) return;

    const chip = document.createElement("div");
    chip.className = "linked-cost-chip";
    const catLabel = cost.cat ? `[${cost.cat}] ` : "";
    chip.innerHTML = `
      <span class="material-symbols-outlined" style="font-size: 15px;">euro</span>
      <span class="linked-cost-chip-name" title="${escapeHTML(catLabel + cost.desc)}">${escapeHTML(catLabel + cost.desc)}</span>
      <button type="button" class="linked-cost-chip-delete" title="Rimuovi collegamento">
        <span class="material-symbols-outlined">close</span>
      </button>
    `;
    chip.querySelector(".linked-cost-chip-delete").onclick = (e) => {
      e.stopPropagation();
      onRemove(costId);
    };
    containerEl.appendChild(chip);
  });
}

/**
 * Crea e restituisce l'elemento DOM card per una Domanda/Q&A.
 * @param {Object} item - Oggetto domanda da appData.qa.
 * @param {boolean} isInsideDetailView - True se renderizzato all'interno della vista dettaglio costo.
 * @returns {HTMLElement}
 */

function sortTable(table, column) {
  if (currentSort.table === table && currentSort.column === column) {
    currentSort.asc = !currentSort.asc;
  } else {
    currentSort.table = table;
    currentSort.column = column;
    currentSort.asc = true;
  }
  renderTables();
}

/**
 * Aggiorna gli indicatori grafici (frecce) di ordinamento nelle intestazioni delle tabelle.
 */
function updateSortHeaders() {
  document.querySelectorAll("th.sortable").forEach((th) => {
    th.classList.remove("active");
    let icon = th.querySelector(".sort-icon");
    if (icon) icon.innerText = "sort";
  });
  if (currentSort.table && currentSort.column) {
    const th = document.querySelector(
      `th[onclick="sortTable('${currentSort.table}', '${currentSort.column}')"]`,
    );
    if (th) {
      th.classList.add("active");
      let icon = th.querySelector(".sort-icon");
      if (icon)
        icon.innerText = currentSort.asc ? "arrow_downward" : "arrow_upward";
    }
  }
}

/**
 * Restituisce i dati ordinati per una specifica tabella.
 * @param {'costi'|'budget'} type - Nome della collezione di dati.
 * @returns {Array<Object>} Array di dati ordinati.
 */
function getSortedData(type) {
  let data = type === "costi" ? [...appData.costi] : [...appData.budget];
  if (currentSort.table === type && currentSort.column) {
    data.sort((a, b) => {
      let valA, valB;
      if (currentSort.column === "cat") {
        valA = a.cat || "";
        valB = b.cat || "";
      } else if (currentSort.column === "desc") {
        valA = a.desc || "";
        valB = b.desc || "";
      } else if (currentSort.column === "prezzo") {
        valA = a.prezzo || 0;
        valB = b.prezzo || 0;
      } else if (currentSort.column.startsWith("u")) {
        valA = a[currentSort.column] || 0;
        valB = b[currentSort.column] || 0;
      } else if (currentSort.column === "restante") {
        let sumA = appData.settings.users.reduce(
          (acc, u) => acc + (a[u.id] || 0),
          0,
        );
        let sumB = appData.settings.users.reduce(
          (acc, u) => acc + (b[u.id] || 0),
          0,
        );
        valA = (a.prezzo || 0) - sumA;
        valB = (b.prezzo || 0) - sumB;
      } else if (currentSort.column === "totale") {
        valA = appData.settings.users.reduce(
          (acc, u) => acc + (a[u.id] || 0),
          0,
        );
        valB = appData.settings.users.reduce(
          (acc, u) => acc + (b[u.id] || 0),
          0,
        );
      } else if (currentSort.column === "confermato") {
        valA = a.confermato === true ? 1 : 0;
        valB = b.confermato === true ? 1 : 0;
      }
      if (typeof valA === "string")
        return currentSort.asc
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      else return currentSort.asc ? valA - valB : valB - valA;
    });
  }
  return data;
}

/**
 * Esegue il rendering dell'header dell'app, dell'immagine hero e della configurazione impostazioni.
 */

function buildDynamicForms() {
  const addCostContainer = document.getElementById("add-costo-users-inputs");
  if (addCostContainer) {
    addCostContainer.innerHTML = "";
    appData.settings.users.forEach((u) => {
      let div = document.createElement("div");
      div.className = "input-field";
      div.innerHTML = `<label>Pagato: ${u.name} (€)</label><input type="number" step="0.01" id="add-costo-${u.id}" placeholder="0.00" onblur="roundInput(this)">`;
      addCostContainer.appendChild(div);
    });
  }

  const addBudgetContainer = document.getElementById("add-budget-users-inputs");
  if (addBudgetContainer) {
    addBudgetContainer.innerHTML = "";
    appData.settings.users.forEach((u) => {
      let div = document.createElement("div");
      div.className = "input-field";
      div.innerHTML = `<label>Quota ${u.name} (€)</label><input type="number" step="0.01" id="add-budget-${u.id}" placeholder="0.00" onblur="roundInput(this)">`;
      addBudgetContainer.appendChild(div);
    });
  }

  const modalContainer = document.getElementById("modal-users-inputs");
  if (modalContainer) {
    modalContainer.innerHTML = "";
    appData.settings.users.forEach((u) => {
      let div = document.createElement("div");
      div.className = "input-field";
      div.innerHTML = `<label>Quota ${u.name} (€)</label><input type="number" step="0.01" id="modal-${u.id}" onblur="roundInput(this)">`;
      modalContainer.appendChild(div);
    });
  }

  const costiCards = document.getElementById("costi-top-cards");
  if (costiCards) {
    let cardsHTML = `
                    <div class="stat-card stat-card-full" style="background-color: var(--md-sys-color-surface-container-high); color: var(--md-sys-color-on-surface);">
                        <span class="stat-card-label" style="font-size: 14px; opacity: 0.9;">Costo Totale Stimato</span>
                        <div class="stat-value" id="stat-costi-page-tot">€ 0.00</div>
                    </div>
                `;
    appData.settings.users.forEach((u, i) => {
      let colorClass = i % 2 === 0 ? "secondary" : "tertiary";
      cardsHTML += `
                        <div class="stat-card ${colorClass} stat-card-user">
                            <span class="stat-card-label" style="font-size: 14px; opacity: 0.9;">Pagato ${u.name}</span>
                            <div class="stat-value sensitive-value" id="stat-costi-page-${u.id}">€ 0.00</div>
                        </div>
                    `;
    });
    cardsHTML += `
                    <div class="stat-card stat-card-full" style="background-color: var(--md-sys-color-primary-container);">
                        <span class="stat-card-label" style="font-size: 14px; opacity: 0.9;">Da Pagare</span>
                        <div class="stat-value sensitive-value" id="stat-costi-page-restante">€ 0.00</div>
                    </div>
                `;
    appData.settings.users.forEach((u) => {
      cardsHTML += `
                    <div class="stat-card stat-card-user" style="background-color: var(--md-sys-color-surface-container-high); color: var(--md-sys-color-on-surface);">
                        <span class="stat-card-label" style="font-size: 14px; opacity: 0.9;">Da Pagare ${u.name}</span>
                        <div class="stat-value sensitive-value" id="stat-costi-page-restante-${u.id}">€ 0.00</div>
                    </div>
                `;
    });
    costiCards.innerHTML = cardsHTML;
  }

  const budgetCards = document.getElementById("budget-top-cards");
  if (budgetCards) {
    let bCardsHTML = `
                    <div class="stat-card stat-card-full" style="background-color: var(--md-sys-color-primary-container);">
                        <span class="stat-card-label" style="font-size: 14px; opacity: 0.9;">Budget Totale</span>
                        <div class="stat-value sensitive-value" id="stat-budget-page-tot">€ 0.00</div>
                    </div>
                `;
    appData.settings.users.forEach((u, i) => {
      let colorClass = i % 2 === 0 ? "secondary" : "tertiary";
      bCardsHTML += `
                        <div class="stat-card ${colorClass} stat-card-user">
                            <span class="stat-card-label" style="font-size: 14px; opacity: 0.9;">Quota ${u.name}</span>
                            <div class="stat-value sensitive-value" id="stat-budget-page-${u.id}">€ 0.00</div>
                        </div>
                    `;
    });
    budgetCards.innerHTML = bCardsHTML;
  }

  let costiHead = `
                <th style="width: 40px;"></th>
                <th class="sortable" onclick="sortTable('costi', 'cat')">Categoria <span class="material-symbols-outlined sort-icon">sort</span></th>
                <th class="sortable" onclick="sortTable('costi', 'desc')">Descrizione <span class="material-symbols-outlined sort-icon">sort</span></th>
                <th class="sortable" onclick="sortTable('costi', 'prezzo')">Prezzo <span class="material-symbols-outlined sort-icon">sort</span></th>
            `;
  appData.settings.users.forEach((u) => {
    costiHead += `<th class="sortable" onclick="sortTable('costi', '${u.id}')">Pagato (${u.name}) <span class="material-symbols-outlined sort-icon">sort</span></th>`;
  });
  costiHead += `
                <th class="sortable" onclick="sortTable('costi', 'restante')">Restante <span class="material-symbols-outlined sort-icon">sort</span></th>
                <th class="sortable" onclick="sortTable('costi', 'confermato')">Stato <span class="material-symbols-outlined sort-icon">sort</span></th>
                <th>Note</th>
                <th style="width: 80px; text-align: center;">Azioni</th>
            `;
  let thCosti = document.getElementById("table-costi-header");
  if (thCosti) thCosti.innerHTML = costiHead;

  let budgetHead = `
                <th style="width: 40px;"></th>
                <th class="sortable" onclick="sortTable('budget', 'desc')">Descrizione <span class="material-symbols-outlined sort-icon">sort</span></th>
            `;
  appData.settings.users.forEach((u) => {
    budgetHead += `<th class="sortable" onclick="sortTable('budget', '${u.id}')">${u.name} (€) <span class="material-symbols-outlined sort-icon">sort</span></th>`;
  });
  budgetHead += `
                <th class="sortable" onclick="sortTable('budget', 'totale')">Totale (€) <span class="material-symbols-outlined sort-icon">sort</span></th>
                <th>Note</th>
                <th style="width: 80px; text-align: center;">Azioni</th>
            `;
  let thBudget = document.getElementById("table-budget-header");
  if (thBudget) thBudget.innerHTML = budgetHead;

  const selUser = document.getElementById("mutuo-singolo-user");
  if (selUser) {
    selUser.innerHTML = "";
    appData.settings.users.forEach((u) => {
      let opt = document.createElement("option");
      opt.value = u.id;
      opt.innerText = u.name;
      selUser.appendChild(opt);
    });
  }
}

/**
 * Ripartisce automaticamente l'importo totale di una nuova spesa secondo le quote percentuali degli utenti.
 */
function autoSplitAdd() {
  let total =
    parseFloat(document.getElementById("add-costo-prezzo").value) || 0;
  if (total > 0) {
    appData.settings.users.forEach((u) => {
      let val = (total * (u.share / 100)).toFixed(2);
      let input = document.getElementById(`add-costo-${u.id}`);
      if (input) input.value = val;
    });
  }
}

/**
 * Ripartisce automaticamente l'importo totale all'interno della modale di modifica secondo le quote percentuali.
 * @param {string} target - Nome identificativo del contesto modale.
 */
function autoSplit(target) {
  let total = parseFloat(document.getElementById("modal-prezzo").value) || 0;
  if (total > 0) {
    appData.settings.users.forEach((u) => {
      let val = (total * (u.share / 100)).toFixed(2);
      let input = document.getElementById(`modal-${u.id}`);
      if (input) input.value = val;
    });
  }
}

/**
 * Converte una stringa formattata come valuta in un valore numerico float.
 * @param {string|number} value - Stringa o numero da analizzare.
 * @returns {number} Valore numerico pulito.
 */

function addCategory() {
  const nameInput = document.getElementById("new-cat-name");
  const colorInput = document.getElementById("new-cat-color");
  const isImmobileInput = document.getElementById("new-cat-is-immobile");

  const name = nameInput.value.trim();
  const color = colorInput.value;
  const isImmobile = isImmobileInput ? isImmobileInput.checked : false;

  if (!name)
    return M3Swal.fire({
      title: "Attenzione",
      text: "Inserisci un nome per la categoria",
      icon: "warning",
    });
  if (!appData.settings.categories) appData.settings.categories = {};
  if (appData.settings.categories[name])
    return M3Swal.fire({
      title: "Attenzione",
      text: "Categoria già presente",
      icon: "warning",
    });

  appData.settings.categories[name] = {
    color: color,
    isImmobile: isImmobile,
  };
  nameInput.value = "";
  if (isImmobileInput) isImmobileInput.checked = false;
  saveDataLocally();
  showNotification("Categoria aggiunta!");
}

/**
 * Apre la modale per modificare nome, colore o stato immobile di una categoria.
 * @param {string} name - Nome attuale della categoria.
 */
function openEditCatModal(name) {
  const catObj = appData.settings.categories[name];
  const color = typeof catObj === "string" ? catObj : catObj.color;
  const isImmobile =
    typeof catObj === "object" ? !!catObj.isImmobile : name === "Immobili";

  document.getElementById("cat-modal-old-name").value = name;
  document.getElementById("cat-modal-name").value = name;
  document.getElementById("cat-modal-color").value = color || "#6750A4";
  document.getElementById("cat-modal-is-immobile").checked = isImmobile;
  openModalOverlay("catModal");
}

/**
 * Salva le modifiche apportate alla categoria aggiornando a cascata tutte le spese associate.
 */
function saveCategoryEdit() {
  const oldName = document.getElementById("cat-modal-old-name").value;
  const newName = document.getElementById("cat-modal-name").value.trim();
  const newColor = document.getElementById("cat-modal-color").value;
  const newIsImmobile = document.getElementById(
    "cat-modal-is-immobile",
  ).checked;

  if (!newName)
    return M3Swal.fire({
      title: "Attenzione",
      text: "Il nome non può essere vuoto",
      icon: "warning",
    });
  if (oldName !== newName) {
    if (appData.settings.categories[newName])
      return M3Swal.fire({
        title: "Attenzione",
        text: "Nome categoria già utilizzato",
        icon: "warning",
      });
    appData.costi.forEach((c) => {
      if (c.cat === oldName) c.cat = newName;
    });
    delete appData.settings.categories[oldName];
  }
  appData.settings.categories[newName] = {
    color: newColor,
    isImmobile: newIsImmobile,
  };
  document.getElementById("catModal").classList.remove("active");
  saveDataLocally();
  showNotification("Categoria aggiornata!");
}

/**
 * Elimina una categoria di spesa riassegnando a 'Senza Categoria' le voci orfane.
 */
async function deleteCategory() {
  const name = document.getElementById("cat-modal-old-name").value;
  const inUse = appData.costi.some((c) => c.cat === name);

  const result = await showConfirm(
    `Eliminare la categoria "${name}"?`,
    inUse
      ? "La categoria è associata ad alcune voci. Verranno convertite in 'Senza Categoria'."
      : "L'operazione non può essere annullata.",
  );

  if (result.isConfirmed) {
    if (inUse) {
      appData.costi.forEach((c) => {
        if (c.cat === name) c.cat = "Senza Categoria";
      });
      if (!appData.settings.categories["Senza Categoria"]) {
        appData.settings.categories["Senza Categoria"] = {
          color: "#9E9E9E",
          isImmobile: false,
        };
      }
    }
    delete appData.settings.categories[name];
    closeModalOverlay("catModal");
    saveDataLocally();
    showNotification("Categoria eliminata");
  }
}

/**
 * Popola dinamicamente le tendine select delle categorie nei form di aggiunta e modifica.
 */
function populateCategorySelects() {
  const selects = [
    document.getElementById("add-costo-cat"),
    document.getElementById("modal-cat"),
    document.getElementById("qa-modal-category"),
    document.getElementById("task-modal-category"),
  ];
  let baseOptions = "";
  if (appData.settings && appData.settings.categories) {
    Object.keys(appData.settings.categories)
      .sort()
      .forEach((cat) => {
        baseOptions += `<option value="${cat}">${cat}</option>`;
      });
  }
  selects.forEach((select) => {
    if (select) {
      const currentVal = select.value;
      let optionsHTML = baseOptions;
      if (
        select.id === "qa-modal-category" ||
        select.id === "task-modal-category"
      ) {
        optionsHTML =
          '<option value="Generale">Generale</option>' + baseOptions;
      }
      select.innerHTML = optionsHTML;
      if (currentVal) select.value = currentVal;
    }
  });
}

/**
 * Esegue il rendering della sezione Riepilogo Categorie: calcola il totale, il pagato,
 * il restante e la percentuale di completamento per ciascuna categoria. Rimuove l'intera card se il totale è 0.
 */
function renderCategoriesSection() {
  const cardsContainer = document.getElementById("categories-summary-cards");
  const tbody = document.querySelector("#table-categories-summary tbody");
  if (!cardsContainer || !tbody) return;

  cardsContainer.innerHTML = "";
  tbody.innerHTML = "";

  let categories =
    appData.settings && appData.settings.categories
      ? Object.keys(appData.settings.categories).sort()
      : [];
  let catData = {};

  categories.forEach((cat) => {
    catData[cat] = { total: 0, paid: 0, remaining: 0 };
  });

  appData.costi.forEach((c) => {
    let cat = c.cat || "Senza Categoria";
    if (!catData[cat]) catData[cat] = { total: 0, paid: 0, remaining: 0 };

    let paidItem = appData.settings.users.reduce(
      (acc, u) => acc + (c[u.id] || 0),
      0,
    );
    catData[cat].total += c.prezzo || 0;
    catData[cat].paid += paidItem;
  });

  let grandTotal = 0,
    grandPaid = 0,
    grandRemaining = 0;
  let chartLabels = [],
    chartDataPaid = [],
    chartDataTotal = [],
    chartColors = [];

  Object.keys(catData).forEach((cat) => {
    let d = catData[cat];
    d.remaining = d.total - d.paid;
    grandTotal += d.total;
    grandPaid += d.paid;
    grandRemaining += d.remaining;

    const catObj = appData.settings.categories[cat];
    let color =
      typeof catObj === "string" ? catObj : catObj ? catObj.color : "#9E9E9E";
    let textColor = getContrastYIQ(color);
    let perc = d.total > 0 ? (d.paid / d.total) * 100 : 0;

    // Popolamento dataset grafico (solo per categorie con spesa o se total > 0)
    if (d.total > 0) {
      chartLabels.push(cat);
      chartDataPaid.push(d.paid);
      chartDataTotal.push(d.total);
      chartColors.push(color);

      // 1. RIMUOVI INTERA CARD SE TOTALE È 0
      let card = document.createElement("div");
      card.className = "cat-stat-card";
      card.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="cat-badge" style="background-color: ${color}; color: ${textColor}; font-size: 13px;">${cat}</span>
                            <span style="font-size: 13px; font-weight: 600; color: var(--md-sys-color-outline);">${perc.toFixed(0)}%</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top: 4px;">
                            <div>
                                <span style="font-size: 11px; color: var(--md-sys-color-outline);">Pagato Insieme</span>
                                <div style="font-size: 18px; font-weight: 600; color: var(--md-sys-color-primary);">${formatCurrency(d.paid)}</div>
                            </div>
                            <div style="text-align: right;">
                                <span style="font-size: 11px; color: var(--md-sys-color-outline);">Totale Categoria</span>
                                <div style="font-size: 18px; font-weight: 500;">${formatCurrency(d.total)}</div>
                            </div>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${Math.min(100, perc)}%; background-color: ${color};"></div>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size: 12px; margin-top: 2px;">
                            <span style="color: var(--md-sys-color-outline);">Restante da Saldare:</span>
                            <b>${formatRestanteCurrency(d.remaining)}</b>
                        </div>
                    `;
      cardsContainer.appendChild(card);
    }

    // Inserimento riga tabella riassuntiva
    let tr = document.createElement("tr");
    tr.innerHTML = `
                    <td class="col-cat" data-label="Categoria"><span class="cat-badge" style="background-color: ${color}; color: ${textColor};">${cat}</span></td>
                    <td class="col-prezzo" data-label="Costo Totale"><b>${formatCurrency(d.total)}</b></td>
                    <td class="col-user" data-label="Pagato Finora" style="color: var(--md-sys-color-primary); font-weight: 500;">${formatCurrency(d.paid)}</td>
                    <td class="col-restante" data-label="Restante">${formatRestanteCurrency(d.remaining)}</td>
                    <td class="col-totale" data-label="% Completamento" style="font-weight: 500;">${d.total > 0 ? `<span class="sensitive-value">${perc.toFixed(1)}%</span>` : "-"}</td>
                `;
    tbody.appendChild(tr);
  });

  let grandPerc = grandTotal > 0 ? (grandPaid / grandTotal) * 100 : 0;
  let trTotal = document.createElement("tr");
  trTotal.style.backgroundColor = "var(--md-sys-color-surface-container-high)";
  trTotal.style.fontWeight = "bold";
  trTotal.innerHTML = `
                <td class="col-desc" data-label="Categoria"><b>TOTALE COMPLESSIVO</b></td>
                <td class="col-prezzo" data-label="Costo Totale"><b>${formatCurrency(grandTotal)}</b></td>
                <td class="col-user" data-label="Pagato Finora" style="color: var(--md-sys-color-primary);"><b>${formatCurrency(grandPaid)}</b></td>
                <td class="col-restante" data-label="Restante"><b>${formatRestanteCurrency(grandRemaining)}</b></td>
                <td class="col-totale" data-label="% Completamento"><b><span class="sensitive-value">${grandPerc.toFixed(1)}%</span></b></td>
            `;
  tbody.appendChild(trTotal);

  const isDark = document.body.classList.contains("dark-mode");
  const textColor = isDark ? "#E6E1E5" : "#1C1B1F";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  const ctxCat = document.getElementById("categoriesBarChart");
  if (ctxCat) {
    if (catBarChartInstance) catBarChartInstance.destroy();
    const barBg = isDark ? "#332D41" : "#ECE6F0";
    catBarChartInstance = new Chart(ctxCat.getContext("2d"), {
      type: "bar",
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: "Pagato Finora (€)",
            data: chartDataPaid,
            backgroundColor: chartColors,
            borderRadius: 6,
          },
          {
            label: "Costo Totale (€)",
            data: chartDataTotal,
            backgroundColor: barBg,
            borderRadius: 6,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              font: { family: "'Google Sans Flex', sans-serif" },
              color: textColor,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: { color: textColor },
          },
          y: { grid: { display: false }, ticks: { color: textColor } },
        },
      },
    });
  }
}

/**
 * Calcola e aggiorna le metriche globali, i bilanci di conguaglio tra partecipanti,
 * la liquidità residua e aggiorna i grafici (Bar Chart e Doughnut Chart) nella vista Riepilogo.
 */
function updateChartsAndStats() {
  let budgetPianificatoTotale = appData.budget.reduce((acc, curr) => {
    let s = appData.settings.users.reduce(
      (a, u) => a + (parseFloat(curr[u.id]) || 0),
      0,
    );
    return acc + s;
  }, 0);

  // Calcola i risparmi netti generati per ciascun partecipante dal monitoraggio
  let totRisparmiTutti = 0;
  let userRisparmiNetti = {};
  if (appData.savingsMonitor) {
    (appData.settings.users || []).forEach((usr) => {
      const sm = calculateSavingsMetrics(usr.id);
      const r = sm && sm.isConfigured ? sm.risparmioNetto || 0 : 0;
      userRisparmiNetti[usr.id] = r;
      totRisparmiTutti += r;
    });
  }

  // Il Budget Totale effettivo include le risorse da righe più i risparmi netti accumulati
  let budgetTotale = budgetPianificatoTotale + totRisparmiTutti;

  let costoTotale = appData.costi.reduce(
    (acc, curr) => acc + (curr.prezzo || 0),
    0,
  );
  let userSpesePagate = {};
  let userBudgetPianificato = {};
  let userBudgetTotali = {};
  let userMutuoTotali = {};
  let userBudgetSenzaMutuo = {};

  appData.settings.users.forEach((u) => {
    userSpesePagate[u.id] = appData.costi.reduce(
      (acc, curr) => acc + (parseFloat(curr[u.id]) || 0),
      0,
    );
    userBudgetPianificato[u.id] = appData.budget.reduce(
      (acc, curr) => acc + (parseFloat(curr[u.id]) || 0),
      0,
    );
    // Il budget dell'utente si aggiorna incorporando i risparmi netti che ha generato
    userBudgetTotali[u.id] =
      userBudgetPianificato[u.id] + (userRisparmiNetti[u.id] || 0);

    let mutuoRow = appData.budget.find((b) => b.isMutuo);
    userMutuoTotali[u.id] = mutuoRow ? parseFloat(mutuoRow[u.id]) || 0 : 0;
    userBudgetSenzaMutuo[u.id] = userBudgetTotali[u.id] - userMutuoTotali[u.id];
  });

  let totalePagato = Object.values(userSpesePagate).reduce((a, b) => a + b, 0);
  let restante = costoTotale - totalePagato;
  let progressoPercentuale =
    costoTotale > 0 ? (totalePagato / costoTotale) * 100 : 0;

  // Calcolo conguaglio debiti/crediti in base alle quote pattuite
  let conguagliHtml = "";
  appData.settings.users.forEach((u) => {
    let quotaDovuta = totalePagato * (u.share / 100);
    let saldoU = userSpesePagate[u.id] - quotaDovuta;
    conguagliHtml += `<div style="font-size: 13px; font-weight: 500;">${u.name}: ${formatColoredCurrency(saldoU)}</div>`;
  });

  let liquiditaResiduaReale = budgetTotale - costoTotale;
  let liquiditaUtentiDettaglio = "";
  appData.settings.users.forEach((u) => {
    let quotaCostoU = costoTotale * (u.share / 100);
    let residuoU = userBudgetTotali[u.id] - quotaCostoU;
    liquiditaUtentiDettaglio += `<small style="font-size: 12px; margin-right: 6px;">${u.name}: <b>${formatCurrency(residuoU)}</b></small>`;
  });

  document.getElementById("stat-budget-tot").innerHTML =
    formatColoredCurrency(budgetTotale);
  document.getElementById("stat-costo-tot").innerHTML =
    formatCurrency(costoTotale);
  document.getElementById("stat-restante-tot").innerHTML =
    formatRestanteCurrency(restante);

  document.getElementById("stat-progresso").innerText =
    progressoPercentuale.toFixed(1) + "%";
  document.getElementById("stat-conguaglio").innerHTML = conguagliHtml;
  document.getElementById("stat-liquidita").innerHTML = `
                ${formatColoredCurrency(liquiditaResiduaReale)}
                <div style="font-size: 12px; font-weight: 400; color: var(--md-sys-color-outline); margin-top: 4px;">${liquiditaUtentiDettaglio}</div>
            `;

  const repTotals = document.getElementById("riepilogo-users-totals");
  if (repTotals) {
    repTotals.innerHTML = "";
    appData.settings.users.forEach((u) => {
      let costU = userSpesePagate[u.id];
      let rimanentiSenzaMutuo = userBudgetSenzaMutuo[u.id] - costU;
      let rimanentiConMutuo = userBudgetTotali[u.id] - costU;

      let div = document.createElement("div");
      let html = `
                        <span style="font-size: 13px; color: var(--md-sys-color-outline);">${u.name}</span>
                        <div style="font-size: 20px; font-weight: 500;">Speso: ${formatCurrency(costU)}</div>
                        <div style="font-size: 13px; margin-top:4px;">Rimanenti: <b>${formatColoredCurrency(rimanentiSenzaMutuo)}</b> <small>(senza mutuo)</small></div>
                    `;

      if (userMutuoTotali[u.id] > 0) {
        html += `<div style="font-size: 13px; margin-top:2px;">Rimanenti: <b>${formatColoredCurrency(rimanentiConMutuo)}</b> <small>(con mutuo)</small></div>`;
      }

      div.innerHTML = html;
      repTotals.appendChild(div);
    });
  }

  let statCostiTot = document.getElementById("stat-costi-page-tot");
  if (statCostiTot) statCostiTot.innerHTML = formatCurrency(costoTotale);

  appData.settings.users.forEach((u) => {
    let el = document.getElementById(`stat-costi-page-${u.id}`);
    if (el) el.innerHTML = formatColoredCurrency(userSpesePagate[u.id]);
  });

  let statCostiRest = document.getElementById("stat-costi-page-restante");
  if (statCostiRest) statCostiRest.innerHTML = formatRestanteCurrency(restante);

  appData.settings.users.forEach((u) => {
    let el = document.getElementById(`stat-costi-page-restante-${u.id}`);
    if (el) {
      let sharePercent =
        typeof u.share === "number"
          ? u.share
          : 100 / appData.settings.users.length;
      let quotaU = costoTotale * (sharePercent / 100);
      let restU = quotaU - (userSpesePagate[u.id] || 0);
      el.innerHTML = formatRestanteCurrency(restU);
    }
  });

  let statBudgetTot = document.getElementById("stat-budget-page-tot");
  if (statBudgetTot) {
    let totHtml = formatColoredCurrency(budgetTotale);
    if (totRisparmiTutti !== 0) {
      const isPos = totRisparmiTutti > 0;
      const color = isPos
        ? "var(--md-sys-color-success)"
        : "var(--md-sys-color-error)";
      const sign = isPos ? "+" : "";
      totHtml += `<div style="font-size: 12px; font-weight: 500; color: ${color}; margin-top: 2px;">${formatCurrency(budgetPianificatoTotale)} a budget ${sign}${formatCurrency(totRisparmiTutti)} risparmi</div>`;
    }
    statBudgetTot.innerHTML = totHtml;
  }

  appData.settings.users.forEach((u) => {
    let el = document.getElementById(`stat-budget-page-${u.id}`);
    if (el) {
      let rU = userRisparmiNetti[u.id] || 0;
      let html = `${formatColoredCurrency(userBudgetTotali[u.id])}`;
      if (rU !== 0) {
        const isPos = rU > 0;
        const color = isPos
          ? "var(--md-sys-color-success)"
          : "var(--md-sys-color-error)";
        const sign = isPos ? "+" : "";
        html += `<div style="font-size: 12px; font-weight: 500; color: ${color}; margin-top: 3px;">
          ${formatCurrency(userBudgetPianificato[u.id])} a budget ${sign}${formatCurrency(rU)} risparmi
        </div>`;
      }
      if (userMutuoTotali[u.id] > 0) {
        html += `<div style="font-size: 12px; font-weight: 400; color: var(--md-sys-color-outline); margin-top: 2px;">Senza mutuo: <b>${formatCurrency(userBudgetSenzaMutuo[u.id])}</b></div>`;
      }
      el.innerHTML = html;
    }
  });

  const isDark = document.body.classList.contains("dark-mode");
  const primaryColor = isDark ? "#D0BCFF" : "#6750A4";
  const secondaryColor = isDark ? "#4F378B" : "#EADDFF";
  const tertiaryColor = isDark ? "#633B48" : "#FFD8E4";
  const surfaceContainerHigh = isDark ? "#302E34" : "#ECE6F0";
  const fedeColor = isDark ? "#FFB1C8" : "#d81b60";
  const textColor = isDark ? "#E6E1E5" : "#1C1B1F";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  // Render Grafico a Barre Stato Finanziario
  if (barChartInstance) barChartInstance.destroy();
  const ctxBar = document.getElementById("barChart");
  if (ctxBar) {
    Chart.defaults.font.family = "'Google Sans Flex', sans-serif";
    barChartInstance = new Chart(ctxBar.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Budget Totale", "Costo Stimato", "Speso", "Da Pagare"],
        datasets: [
          {
            label: "Importo in €",
            data: [budgetTotale, costoTotale, totalePagato, restante],
            backgroundColor: [
              secondaryColor,
              tertiaryColor,
              primaryColor,
              surfaceContainerHigh,
            ],
            categoryPercentage: 0.85,
            barPercentage: 0.9,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 0 },
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              padding: 6,
            },
            afterFit: function (axis) {
              axis.width = Math.max(axis.width + 16, 75);
            },
          },
          x: {
            grid: { display: false },
            ticks: { color: textColor },
          },
        },
      },
    });
  }

  // Render Grafico a Ciambella Ripartizione Spese
  if (pieChartInstance) pieChartInstance.destroy();
  const ctxPie = document.getElementById("pieChart");
  if (ctxPie) {
    let pieData = appData.settings.users.map((u) => userSpesePagate[u.id]);
    let pieColors = appData.settings.users.map((u, idx) =>
      idx === 0
        ? primaryColor
        : idx === 1
          ? fedeColor
          : autoColors[idx % autoColors.length],
    );
    if (pieData.every((v) => v === 0))
      pieData = appData.settings.users.map(() => 0.1);

    pieChartInstance = new Chart(ctxPie.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: appData.settings.users.map((u) => u.name),
        datasets: [
          {
            data: pieData,
            backgroundColor: pieColors,
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              boxWidth: 12,
              padding: 12,
              color: textColor,
            },
          },
        },
      },
    });
  }

  if (
    document.fonts &&
    document.fonts.ready &&
    !window._fontsReadyChartListener
  ) {
    window._fontsReadyChartListener = true;
    document.fonts.ready.then(() => {
      if (barChartInstance) barChartInstance.update();
      if (catBarChartInstance) catBarChartInstance.update();
    });
  }
}

// ===== SISTEMA PAGAMENTI A RATE =====

/**
 * Funzione di utilità per sanificare stringhe HTML.
 * @param {string} str - Stringa da sanificare.
 */

function getPaymentsRegisteredTotal(item) {
  if (!item || !item.pagamenti || item.pagamenti.length === 0) return 0;
  return item.pagamenti.reduce((acc, p) => {
    if (!p.quote) return acc;
    return (
      acc +
      appData.settings.users.reduce(
        (a, u) => a + (parseFloat(p.quote[u.id]) || 0),
        0,
      )
    );
  }, 0);
}

/**
 * Calcola la somma dei pagamenti registrati per un singolo utente.
 * @param {Object} item - Voce costo.
 * @param {string} userId - ID utente (es: 'u1', 'u2').
 * @returns {number} Somma registrata per l'utente.
 */
function getPaymentsRegisteredForUser(item, userId) {
  if (!item || !item.pagamenti || item.pagamenti.length === 0) return 0;
  return item.pagamenti.reduce((acc, p) => {
    return (
      acc + (p.quote && p.quote[userId] ? parseFloat(p.quote[userId]) || 0 : 0)
    );
  }, 0);
}

/**
 * Calcola l'importo pagato dichiarato che non è ancora stato formalmente registrato a rate.
 * @param {Object} item - Voce costo.
 * @returns {number} Importo ancora da registrare.
 */
function getUnregisteredPaymentAmount(item) {
  if (!item) return 0;
  const currentPaid = appData.settings.users.reduce(
    (acc, u) => acc + (parseFloat(item[u.id]) || 0),
    0,
  );
  const originPaid =
    item.originPaid !== undefined
      ? Math.max(parseFloat(item.originPaid) || 0, currentPaid)
      : currentPaid;
  const registered = getPaymentsRegisteredTotal(item);
  return Math.max(0, originPaid - registered);
}

/**
 * Ricalcola i totali per ogni utente sommando le quote dai pagamenti.
 * IMPORTANTE: Non sovrascrive né riduce le quote storiche/originarie se i pagamenti
 * registrati non le hanno ancora coperte per intero. Se i pagamenti registrati
 * superano il valore originario, incrementa correttamente il Totale Pagato.
 * @param {Object} item - Voce di costo da ricalcolare.
 */
function recalcUserTotals(item) {
  if (!item) return;
  if (!item.pagamenti) item.pagamenti = [];

  // Assicura originQuote per non perdere la memoria del totale pagato dichiarato
  if (!item.originQuote) {
    item.originQuote = {};
    appData.settings.users.forEach((u) => {
      item.originQuote[u.id] = parseFloat(item[u.id]) || 0;
    });
  }
  const sumOrigin = appData.settings.users.reduce(
    (acc, u) => acc + (item.originQuote[u.id] || 0),
    0,
  );
  if (item.originPaid === undefined) {
    item.originPaid = sumOrigin;
  }

  // Per ogni utente, l'importo pagato visualizzato è il massimo tra la quota storica
  // e la somma dei pagamenti formali registrati a rate
  appData.settings.users.forEach((u) => {
    const regUser = getPaymentsRegisteredForUser(item, u.id);
    const origUser =
      item.originQuote && item.originQuote[u.id] !== undefined
        ? item.originQuote[u.id]
        : parseFloat(item[u.id]) || 0;
    item[u.id] = Math.max(origUser, regUser);
  });

  // Se i pagamenti registrati superano il vecchio totale dichiarato, aggiorna originPaid
  const totalRegistered = getPaymentsRegisteredTotal(item);
  if (totalRegistered > item.originPaid) {
    item.originPaid = totalRegistered;
    appData.settings.users.forEach((u) => {
      item.originQuote[u.id] = item[u.id];
    });
  }
}

/**
 * Apre la pagina di dettaglio per una voce di costo.
 * @param {number} id - ID della voce.
 */
function openDetailView(id) {
  currentDetailId = id;
  const item = appData.costi.find((c) => c.id === id);
  if (!item) return;
  // Inizializza pagamenti se assenti (retrocompatibilità)
  if (!item.pagamenti) item.pagamenti = [];
  renderDetailView(item);
  document
    .querySelectorAll(".view-section")
    .forEach((el) => el.classList.remove("active"));
  document.getElementById("view-detail").classList.add("active");
  const mainContainer = document.getElementById("main-scroll-container");
  if (mainContainer) mainContainer.scrollTop = 0;
}

/**
 * Torna alla lista costi e nasconde la pagina di dettaglio.
 */
function closeDetailView() {
  currentDetailId = null;
  document.getElementById("view-detail").classList.remove("active");
  const qaCard = document.getElementById("detail-linked-qa-card");
  if (qaCard) qaCard.style.display = "none";
  const taskCard = document.getElementById("detail-linked-tasks-card");
  if (taskCard) taskCard.style.display = "none";
  const noteCard = document.getElementById("detail-linked-notes-card");
  if (noteCard) noteCard.style.display = "none";
  document
    .querySelectorAll(".view-section")
    .forEach((el) => el.classList.remove("active"));
  document.getElementById("view-costi").classList.add("active");
  document.title = "Costi Casa | Costi Casa";
  const titleEl = document.getElementById("page-main-title");
  if (titleEl) titleEl.innerText = "Costi Casa";
}

/**
 * Renderizza tutte le informazioni di una voce di costo nella pagina dettaglio.
 * @param {Object} item - Voce di costo da visualizzare.
 */
function renderDetailView(item) {
  // Badge categoria
  const catObj = appData.settings.categories[item.cat];
  const catColor =
    typeof catObj === "string" ? catObj : catObj ? catObj.color : "#9E9E9E";
  // Titolo descrizione
  document.getElementById("detail-desc").innerText = item.desc || "";

  // Griglia info
  const sumPaid = appData.settings.users.reduce(
    (acc, u) => acc + (item[u.id] || 0),
    0,
  );
  const restante = (item.prezzo || 0) - sumPaid;

  const isConfermato = item.confermato === true;
  const statusBadgeHTML = `<span class="status-badge ${isConfermato ? "confermato" : "non-confermato"}" style="cursor: pointer; margin-left: 8px;" title="Clicca per invertire lo stato" onclick="toggleCostoConfermato(${item.id})"><span class="material-symbols-outlined">${isConfermato ? "check_circle" : "cancel"}</span> ${isConfermato ? "Confermato" : "Non confermato"}</span>`;
  const isPagato = restante <= 0.005 && ((item.prezzo || 0) > 0 || sumPaid > 0);
  const pagatoBadgeHTML = isPagato
    ? `<span class="badge-pagato" style="margin-left: 8px;"><span class="material-symbols-outlined">check_circle</span> Pagato</span>`
    : "";

  document.getElementById("detail-badge").innerHTML =
    `<span class="cat-badge" style="background-color: ${catColor}; color: white;">${item.cat || ""}</span>${statusBadgeHTML}${pagatoBadgeHTML}`;
  let gridHTML = `
          <div class="detail-info-chip">
            <span class="chip-label">Prezzo Totale</span>
            <span class="chip-value sensitive-value">${formatCurrency(item.prezzo || 0)}</span>
          </div>
          <div class="detail-info-chip">
            <span class="chip-label">Totale Pagato</span>
            <span class="chip-value sensitive-value" style="color: var(--md-sys-color-primary)">${formatCurrency(sumPaid)}</span>
          </div>
          <div class="detail-info-chip">
            <span class="chip-label">Restante</span>
            <span class="chip-value sensitive-value">${isPagato ? '<span class="badge-pagato"><span class="material-symbols-outlined">check_circle</span> Pagato</span>' : formatRestanteCurrency(restante)}</span>
          </div>`;
  appData.settings.users.forEach((u) => {
    const sharePercent =
      typeof u.share === "number"
        ? u.share
        : 100 / appData.settings.users.length;
    const quotaU = (item.prezzo || 0) * (sharePercent / 100);
    const paidU = parseFloat(item[u.id]) || 0;
    const restU = quotaU - paidU;
    gridHTML += `
          <div class="detail-info-chip">
            <span class="chip-label">Restante ${u.name}</span>
            <span class="chip-value sensitive-value">${formatRestanteCurrency(restU)}</span>
          </div>`;
  });
  appData.settings.users.forEach((u) => {
    gridHTML += `
            <div class="detail-info-chip">
              <span class="chip-label">Pagato da ${u.name}</span>
              <span class="chip-value sensitive-value" style="color: var(--md-sys-color-primary)">${formatCurrency(item[u.id] || 0)}</span>
            </div>`;
  });
  const numPagamenti = item.pagamenti ? item.pagamenti.length : 0;
  gridHTML += `
          <div class="detail-info-chip">
            <span class="chip-label">N° Pagamenti</span>
            <span class="chip-value">${numPagamenti}</span>
          </div>`;
  document.getElementById("detail-info-grid").innerHTML = gridHTML;

  // Note
  const noteSection = document.getElementById("detail-note-section");
  if (item.note && String(item.note).trim()) {
    const detailNoteEl = document.getElementById("detail-note");
    detailNoteEl.style.whiteSpace = "pre-wrap";
    detailNoteEl.innerHTML = renderRichContent(
      item.note,
      "costi",
      item.id,
      "note",
    );
    noteSection.style.display = "block";
  } else {
    noteSection.style.display = "none";
  }

  // Gestione stato completamento al 100%
  const isCompletato = (item.prezzo || 0) > 0 && restante <= 0.005;
  const addPayBtn = document.getElementById("detail-add-payment-btn");
  const compBadge = document.getElementById("detail-completato-badge");
  if (addPayBtn && compBadge) {
    if (isCompletato) {
      addPayBtn.style.display = "none";
      compBadge.style.display = "inline-flex";
    } else {
      addPayBtn.style.display = "inline-flex";
      compBadge.style.display = "none";
    }
  }

  // Banner Warning per Pagamenti Dichiarati ma NON ANCORA REGISTRATI a rate:
  const nonRegistrato = getUnregisteredPaymentAmount(item);
  const registratoTot = getPaymentsRegisteredTotal(item);
  const totalePagato = appData.settings.users.reduce(
    (acc, u) => acc + (parseFloat(item[u.id]) || 0),
    0,
  );

  let draftBanner = document.getElementById("detail-draft-banner");
  if (nonRegistrato > 0.005) {
    if (!draftBanner) {
      draftBanner = document.createElement("div");
      draftBanner.id = "detail-draft-banner";
      const paymentCard = document
        .getElementById("detail-payment-list")
        ?.closest(".card");
      if (paymentCard)
        paymentCard.insertAdjacentElement("beforebegin", draftBanner);
    }
    draftBanner.className = "draft-payment-banner";
    draftBanner.innerHTML = `
            <span class="material-symbols-outlined banner-icon">warning</span>
            <div class="banner-body">
              <p class="banner-title">Pagamento da registrare a rate</p>
              <p class="banner-text">Risultano pagati in totale <b>${formatCurrency(totalePagato)}</b>, ma ne hai registrati formalmente a rate solo <b>${formatCurrency(registratoTot)}</b>. Restano ancora <b>${formatCurrency(nonRegistrato)}</b> da registrare con data e documenti.</p>
              <button class="btn btn-tonal" style="font-size: 13px; padding: 6px 14px;" onclick="openDraftRemainingPaymentModal(${item.id})">
                <span class="material-symbols-outlined" style="font-size: 16px">playlist_add</span>
                Registra quota mancante (${formatCurrency(nonRegistrato)})
              </button>
            </div>`;
    draftBanner.style.display = "flex";
  } else if (draftBanner) {
    draftBanner.style.display = "none";
  }

  // Lista pagamenti
  renderPaymentList(item);
  renderDetailLinkedSections(item);
}

/**
 * Renderizza le sezioni collegate (Domande, Task, Appunti) nella pagina dettaglio del costo.
 * Se una sezione non ha elementi collegati a questo costo, la relativa card viene nascosta.
 * @param {Object} costItem - Voce di costo aperta.
 */
function renderDetailLinkedSections(costItem) {
  if (!costItem) return;
  const costId = costItem.id;

  // Domande collegate
  const qaCard = document.getElementById("detail-linked-qa-card");
  const qaList = document.getElementById("detail-linked-qa-list");
  if (qaCard && qaList) {
    const linkedQA = (appData.qa || []).filter(
      (q) => Array.isArray(q.linkedCostIds) && q.linkedCostIds.includes(costId),
    );
    if (linkedQA.length > 0) {
      qaList.innerHTML = "";
      linkedQA.forEach((q) => qaList.appendChild(createQACardElement(q, true)));
      qaCard.style.display = "block";
    } else {
      qaCard.style.display = "none";
      qaList.innerHTML = "";
    }
  }

  // Task collegati
  const taskCard = document.getElementById("detail-linked-tasks-card");
  const taskList = document.getElementById("detail-linked-tasks-list");
  if (taskCard && taskList) {
    const linkedTasks = (appData.tasks || []).filter(
      (t) => Array.isArray(t.linkedCostIds) && t.linkedCostIds.includes(costId),
    );
    if (linkedTasks.length > 0) {
      taskList.innerHTML = "";
      linkedTasks.forEach((t) =>
        taskList.appendChild(createTaskCardElement(t, true)),
      );
      taskCard.style.display = "block";
    } else {
      taskCard.style.display = "none";
      taskList.innerHTML = "";
    }
  }

  // Appunti collegati
  const noteCard = document.getElementById("detail-linked-notes-card");
  const noteList = document.getElementById("detail-linked-notes-list");
  if (noteCard && noteList) {
    const linkedNotes = (appData.notes || []).filter(
      (n) => Array.isArray(n.linkedCostIds) && n.linkedCostIds.includes(costId),
    );
    if (linkedNotes.length > 0) {
      noteList.innerHTML = "";
      linkedNotes.forEach((n) =>
        noteList.appendChild(createNoteCardElement(n, true)),
      );
      noteCard.style.display = "block";
    } else {
      noteCard.style.display = "none";
      noteList.innerHTML = "";
    }
  }
}

/**
 * Renderizza la lista pagamenti nella pagina dettaglio.
 * @param {Object} item - Voce di costo.
 */
function renderPaymentList(item) {
  const container = document.getElementById("detail-payment-list");
  if (!container) return;
  container.innerHTML = "";
  if (!item.pagamenti || item.pagamenti.length === 0) {
    container.innerHTML = `<div class="payment-empty">
            <span class="material-symbols-outlined">payments</span>
            Nessun pagamento registrato.<br>Clicca "Aggiungi Pagamento" per iniziare.
          </div>`;
    return;
  }

  // Ordina per data decrescente
  const sorted = [...item.pagamenti].sort((a, b) =>
    (b.data || "").localeCompare(a.data || ""),
  );
  sorted.forEach((p) => {
    const totPagamento = appData.settings.users.reduce(
      (acc, u) => acc + (p.quote && p.quote[u.id] ? p.quote[u.id] : 0),
      0,
    );
    const userBadges = appData.settings.users
      .filter((u) => p.quote && p.quote[u.id] > 0)
      .map((u) => `<span class="payment-user-badge">${u.name}</span>`)
      .join("");

    const amountChips = appData.settings.users
      .filter((u) => p.quote && p.quote[u.id] > 0)
      .map(
        (u) =>
          `<span class="payment-amount-chip">${u.name}: ${formatCurrency(p.quote[u.id])}</span>`,
      )
      .join(
        '<span style="color: var(--md-sys-color-outline); margin: 0 2px">·</span>',
      );

    const dataFormatted = p.data
      ? new Date(p.data + "T00:00:00").toLocaleDateString("it-IT", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "—";

    // Fatture / Documenti come link chip (supporta { nome, url } o stringa url legacy)
    const fattureHTML =
      p.fatture && p.fatture.length > 0
        ? `<div class="payment-item-fatture">${p.fatture
            .map((f, i) => {
              const url = typeof f === "string" ? f : f && f.url ? f.url : "";
              let label =
                typeof f === "object" && f && f.nome && f.nome.trim()
                  ? f.nome.trim()
                  : "";
              if (!label && url) {
                try {
                  label =
                    new URL(url).hostname.replace("www.", "") || `Doc ${i + 1}`;
                } catch {
                  label = `Doc ${i + 1}`;
                }
              }
              if (!label) label = `Doc ${i + 1}`;
              const isLocalImage =
                url.startsWith("data:image/") ||
                url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i);
              const icon = isLocalImage ? "image" : "receipt_long";
              const clickAction = isLocalImage
                ? `onclick="event.stopPropagation(); openLightbox('${url.replace(/'/g, "\\'")}'); return false;"`
                : `onclick="event.stopPropagation()"`;
              const hrefAttr =
                !isLocalImage && url
                  ? `href="${url}" target="_blank" rel="noopener"`
                  : `href="javascript:void(0)"`;
              return `<a ${hrefAttr} ${clickAction} class="fattura-link-chip" title="${url.startsWith("data:") ? "Foto scontrino allegata (clicca per ingrandire)" : url || label}"><span class="material-symbols-outlined">${icon}</span>${label}</a>`;
            })
            .join("")}</div>`
        : "";

    const div = document.createElement("div");
    div.className = "payment-item";
    div.innerHTML = `
            <span class="material-symbols-outlined payment-item-icon">payments</span>
            <div class="payment-item-body">
              <div class="payment-item-top">
                <span class="payment-item-date">${dataFormatted}</span>
                ${userBadges}
                <span class="payment-total-responsive">${formatCurrency(totPagamento)}</span>
              </div>
              <div class="payment-item-amounts">${amountChips}</div>
              ${p.commento ? `<div class="payment-item-comment">${renderRichContent(p.commento, "costi", item.id, "payment")}</div>` : ""}
              ${fattureHTML}
            </div>
            <div class="payment-item-actions">
              <button class="btn-icon" title="Modifica pagamento" onclick="event.stopPropagation(); openPaymentModal(${item.id}, '${p.id}')">
                <span class="material-symbols-outlined">edit</span>
              </button>
            </div>`;
    container.appendChild(div);
  });
}

/**
 * Apre il modale edit dalla pagina dettaglio.
 */
function openDetailEditModal() {
  if (currentDetailId !== null) openEditModal("costo", currentDetailId);
}

/**
 * Apre il modale pagamento pre-compilato con le quote mancanti ancora da registrare a rate.
 * @param {number} costoId - ID della voce costo.
 */
function openDraftRemainingPaymentModal(costoId) {
  openPaymentModal(costoId, null);
  requestAnimationFrame(() => {
    const item = appData.costi.find((c) => c.id === costoId);
    if (!item) return;
    appData.settings.users.forEach((u) => {
      const regUser = getPaymentsRegisteredForUser(item, u.id);
      const origUser =
        item.originQuote && item.originQuote[u.id] !== undefined
          ? item.originQuote[u.id]
          : parseFloat(item[u.id]) || 0;
      const diff = Math.max(0, origUser - regUser);
      const inp = document.getElementById(`pay-quota-${u.id}`);
      if (inp && diff > 0) inp.value = diff.toFixed(2);
    });
  });
}

/**
 * Apre il modale per aggiungere o modificare un pagamento.
 * @param {number} costoId - ID della voce costo.
 * @param {string|null} payId - ID del pagamento da modificare (null per nuovo).
 */
function openPaymentModal(costoId, payId = null) {
  const item = appData.costi.find((c) => c.id === costoId);
  if (!item) return;

  const sumPaid = appData.settings.users.reduce(
    (acc, u) => acc + (item[u.id] || 0),
    0,
  );
  const totalePrezzo = item.prezzo || 0;
  const restante = totalePrezzo - sumPaid;

  // Se non è modifica ed è già saldato al 100%, blocca l'inserimento
  if (!payId && totalePrezzo > 0 && restante <= 0.005) {
    return M3Swal.fire({
      title: "Costo già saldato",
      text: "Questa voce è già stata pagata al 100%. Non è possibile aggiungere ulteriori pagamenti.",
      icon: "info",
    });
  }

  document.getElementById("pay-costo-id").value = costoId;
  document.getElementById("pay-edit-id").value = payId || "";

  const isEdit = !!payId;
  document.getElementById("payment-modal-title").innerText = isEdit
    ? "Modifica Pagamento"
    : "Aggiungi Pagamento";
  document.getElementById("pay-delete-btn").style.display = isEdit
    ? "inline-flex"
    : "none";

  // Calcola il limite massimo per questo pagamento (escludendo il pagamento in modifica)
  let giaPagatoAltri = 0;
  if (item.pagamenti && item.pagamenti.length > 0) {
    item.pagamenti.forEach((p) => {
      if (!payId || p.id != payId) {
        appData.settings.users.forEach((u) => {
          giaPagatoAltri += p.quote && p.quote[u.id] ? p.quote[u.id] : 0;
        });
      }
    });
  }
  const maxConsentito =
    totalePrezzo > 0 ? Math.max(0, totalePrezzo - giaPagatoAltri) : null;
  const maxInfoEl = document.getElementById("pay-max-info");
  if (maxInfoEl) {
    if (maxConsentito !== null) {
      maxInfoEl.innerHTML = `
              <span class="material-symbols-outlined" style="font-size: 18px; margin-top: 2px; flex-shrink: 0;">info</span>
              <div style="display: flex; flex-direction: column; gap: 4px; line-height: 1.4;">
                <div>Massimo registrabile per questo pagamento: <b>${formatCurrency(maxConsentito)}</b></div>
                <div style="font-size: 12px; color: var(--md-sys-color-outline);">(Costo totale: ${formatCurrency(totalePrezzo)})</div>
              </div>`;
      maxInfoEl.style.display = "flex";
    } else {
      maxInfoEl.style.display = "none";
    }
  }

  // Data default: oggi
  const today = new Date().toISOString().split("T")[0];

  // Costruisce i campi importo per utente
  const usersContainer = document.getElementById("pay-users-inputs");
  usersContainer.innerHTML = "";
  appData.settings.users.forEach((u) => {
    const row = document.createElement("div");
    row.className = "pay-user-row";
    row.innerHTML = `
            <label for="pay-quota-${u.id}">${u.name} (€)</label>
            <div class="input-field">
              <input type="number" step="0.01" id="pay-quota-${u.id}" placeholder="0.00" onblur="roundInput(this)">
            </div>`;
    usersContainer.appendChild(row);
  });

  // Resetta sezione fatture
  document.getElementById("pay-fatture-inputs").innerHTML = "";

  if (isEdit) {
    const payment =
      item && item.pagamenti ? item.pagamenti.find((p) => p.id == payId) : null;
    if (payment) {
      document.getElementById("pay-data").value = payment.data || today;
      setRichEditorHTML("pay-commento", payment.commento || "");
      appData.settings.users.forEach((u) => {
        const inp = document.getElementById(`pay-quota-${u.id}`);
        if (inp)
          inp.value =
            payment.quote && payment.quote[u.id]
              ? payment.quote[u.id].toFixed(2)
              : "";
      });
      // Carica le fatture / documenti esistenti
      (payment.fatture || []).forEach((f) => addFatturaRow(f));
    }
  } else {
    document.getElementById("pay-data").value = today;
    setRichEditorHTML("pay-commento", "");
  }

  openModalOverlay("paymentModal");
}

/**
 * Aggiunge una riga input per documento/fattura nel modale pagamento (con Nome e URL).
 * @param {Object|string} data - Dati documento { nome, url } o stringa url.
 */
function addFatturaRow(data = {}) {
  const nome =
    typeof data === "string" ? "" : data && data.nome ? data.nome : "";
  const url =
    typeof data === "string" ? data : data && data.url ? data.url : "";
  const container = document.getElementById("pay-fatture-inputs");
  const row = document.createElement("div");
  row.className = "fattura-row";
  const isImage =
    url.startsWith("data:image/") ||
    url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i);

  row.innerHTML = `
          <div class="fattura-inputs">
            <div class="input-field fattura-nome-field">
              <input type="text" class="fattura-nome" placeholder="Nome doc (es: Acconto, Scontrino)" value="${nome.replace(/"/g, "&quot;")}" style="font-size: 13px;">
            </div>
            <div class="input-field fattura-url-field" style="position: relative;">
              <input type="url" class="fattura-url" placeholder="Link Drive o carica foto..." value="${url.replace(/"/g, "&quot;")}" style="font-size: 13px; padding-right: 38px;">
              <label class="btn-icon fattura-upload-btn" title="Carica foto/scontrino da PC o scatta da smartphone" style="position: absolute; right: 2px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; color: ${isImage ? "var(--md-sys-color-success)" : "var(--md-sys-color-primary)"}; margin: 0;">
                <input type="file" accept="image/*" style="display: none;" onchange="handleFatturaPhotoUpload(event, this)">
                <span class="material-symbols-outlined" style="font-size: 19px;">${isImage ? "image" : "add_a_photo"}</span>
              </label>
            </div>
          </div>
          <button type="button" class="btn-icon fattura-del-btn" title="Rimuovi documento" onclick="this.closest('.fattura-row').remove()">
            <span class="material-symbols-outlined">close</span>
          </button>`;
  container.appendChild(row);
  if (!url && !nome) {
    const firstInp = row.querySelector(".fattura-nome");
    if (firstInp) firstInp.focus();
  }
}

/**
 * Gestisce il caricamento e compressione di una foto scontrino/ricevuta da PC o smartphone.
 * @param {Event} event - Evento change dell'input file.
 * @param {HTMLElement} inputElement - Riferimento all'input file scatenante.
 */
async function handleFatturaPhotoUpload(event, inputElement) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const row = inputElement.closest(".fattura-row");
  if (!row) return;

  const urlInput = row.querySelector(".fattura-url");
  const nameInput = row.querySelector(".fattura-nome");
  const iconSpan = inputElement.parentElement.querySelector(
    ".material-symbols-outlined",
  );

  try {
    const compressedUrl = await compressImageFile(file, 1600, 1600, 0.8);
    if (urlInput) {
      urlInput.value = compressedUrl;
    }
    if (nameInput && !nameInput.value.trim()) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[_-]/g, " ");
      nameInput.value = cleanName
        ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
        : "Scontrino / Ricevuta";
    }
    if (iconSpan) {
      iconSpan.textContent = "image";
      inputElement.parentElement.style.color = "var(--md-sys-color-success)";
    }
    showNotification("Foto scontrino caricata con successo!");
  } catch (err) {
    console.error("Errore compressione foto:", err);
    showNotification(
      "Errore caricamento",
      "Impossibile elaborare l'immagine",
      "error",
    );
  } finally {
    event.target.value = "";
  }
}

/**
 * Chiude il modale pagamento.
 */
function closePaymentModal() {
  closeModalOverlay("paymentModal");
}

/**
 * Salva un pagamento (nuovo o modifica esistente).
 */
function savePayment() {
  const costoId = parseInt(document.getElementById("pay-costo-id").value);
  const payId = document.getElementById("pay-edit-id").value;
  const data = document.getElementById("pay-data").value;
  const commento = getRichEditorHTML("pay-commento");

  const quote = {};
  let hasSomething = false;
  appData.settings.users.forEach((u) => {
    const val =
      parseFloat(document.getElementById(`pay-quota-${u.id}`)?.value) || 0;
    quote[u.id] = val;
    if (val > 0) hasSomething = true;
  });

  if (!hasSomething) {
    return M3Swal.fire({
      title: "Attenzione",
      text: "Inserisci almeno un importo per uno degli utenti.",
      icon: "warning",
    });
  }

  const item = appData.costi.find((c) => c.id === costoId);
  if (!item) return;
  if (!item.pagamenti) item.pagamenti = [];

  // Validazione limite 100%: il pagamento non deve superare il totale del costo
  const totalePrezzo = item.prezzo || 0;
  let giaPagatoAltri = 0;
  if (item.pagamenti && item.pagamenti.length > 0) {
    item.pagamenti.forEach((p) => {
      if (!payId || p.id != payId) {
        appData.settings.users.forEach((u) => {
          giaPagatoAltri += p.quote && p.quote[u.id] ? p.quote[u.id] : 0;
        });
      }
    });
  }
  const totaleQuesto = Object.values(quote).reduce((acc, v) => acc + v, 0);
  if (totalePrezzo > 0) {
    const maxConsentito = Math.max(0, totalePrezzo - giaPagatoAltri);
    if (totaleQuesto > maxConsentito + 0.005) {
      return M3Swal.fire({
        title: "Importo non consentito",
        text: `L'importo inserito (${formatCurrency(totaleQuesto)}) supera il limite massimo disponibile di ${formatCurrency(maxConsentito)}. Il totale pagato non può superare il 100% del costo (${formatCurrency(totalePrezzo)}).`,
        icon: "warning",
      });
    }
  }

  // Raccoglie i documenti / fatture con nome e URL
  const fatture = Array.from(
    document
      .getElementById("pay-fatture-inputs")
      .querySelectorAll(".fattura-row"),
  )
    .map((row) => {
      const nome = row.querySelector(".fattura-nome")?.value.trim() || "";
      const url = row.querySelector(".fattura-url")?.value.trim() || "";
      return { nome, url };
    })
    .filter((f) => f.url.length > 0 || f.nome.length > 0);

  if (payId) {
    // Modifica pagamento esistente
    const idx = item.pagamenti.findIndex((p) => p.id == payId);
    if (idx !== -1) {
      item.pagamenti[idx] = {
        id: item.pagamenti[idx].id,
        data,
        quote,
        commento,
        fatture,
      };
    }
  } else {
    // Nuovo pagamento
    item.pagamenti.push({
      id: Date.now(),
      data,
      quote,
      commento,
      fatture,
    });
  }

  recalcUserTotals(item);
  saveDataLocally();
  renderTables();
  closePaymentModal();

  // Aggiorna il dettaglio se aperto
  if (currentDetailId === costoId) renderDetailView(item);

  showNotification(payId ? "Pagamento aggiornato!" : "Pagamento aggiunto!");
}

/**
 * Elimina il pagamento attualmente aperto nel modale.
 */
async function deletePaymentFromModal() {
  const result = await showConfirm(
    "Eliminare questo pagamento?",
    "Questa azione è irreversibile.",
  );
  if (!result.isConfirmed) return;
  const costoId = parseInt(document.getElementById("pay-costo-id").value);
  const payId = document.getElementById("pay-edit-id").value;
  deletePayment(costoId, payId);
  closePaymentModal();
}

/**
 * Elimina un pagamento da una voce costo.
 * @param {number} costoId - ID della voce costo.
 * @param {string} payId - ID del pagamento da eliminare.
 */
function deletePayment(costoId, payId) {
  const item = appData.costi.find((c) => c.id === costoId);
  if (!item || !item.pagamenti) return;
  item.pagamenti = item.pagamenti.filter((p) => p.id != payId);
  recalcUserTotals(item);
  saveDataLocally();
  renderTables();
  if (currentDetailId === costoId) renderDetailView(item);
  showNotification("Pagamento eliminato");
}

/**
 * Inverte lo stato di conferma di una voce di costo (Confermato / Non confermato).
 * @param {number} id - ID univoco della voce costo.
 */
function toggleCostoConfermato(id) {
  const item = appData.costi.find((c) => c.id === id);
  if (!item) return;
  const nuovoStato = item.confermato === true ? false : true;
  item.confermato = nuovoStato;
  saveDataLocally();
  renderTables();
  if (currentDetailId === id) renderDetailView(item);
  showNotification(
    nuovoStato ? "Stato costo: Confermato" : "Stato costo: Non confermato",
  );
}

/**
 * Inizializza la modalità di visualizzazione tabelle (Schede vs Tabella).
 */

function renderTables() {
  updateSortHeaders();
  updateTableViewModeUI();
  const tCosti = document.querySelector("#table-costi tbody");
  if (tCosti) {
    tCosti.innerHTML = "";
    getSortedData("costi").forEach((c, index) => {
      const catObj = appData.settings.categories[c.cat];
      const catColor =
        typeof catObj === "string" ? catObj : catObj ? catObj.color : "#9E9E9E";
      const isImmobile =
        typeof catObj === "object" ? !!catObj.isImmobile : c.cat === "Immobili";

      let badgeHTML = `<span class="cat-badge" style="background-color: ${catColor}; color: white;">${c.cat || ""}</span>`;
      let sumPaid = appData.settings.users.reduce(
        (acc, u) => acc + (c[u.id] || 0),
        0,
      );
      let restante = (c.prezzo || 0) - sumPaid;

      let tr = document.createElement("tr");
      tr.setAttribute("draggable", "false");
      tr.addEventListener("dragstart", (e) =>
        handleDragStart(e, index, "costi"),
      );
      tr.addEventListener("drop", (e) => handleDrop(e, index, "costi"));
      tr.addEventListener("dragover", handleDragOver);
      tr.addEventListener("dragend", handleDragEnd);

      // Click sulla riga apre il dettaglio (ma non sui pulsanti o status badge)
      tr.addEventListener("click", (e) => {
        if (
          e.target.closest("td:last-child") ||
          e.target.closest(".col-actions") ||
          e.target.closest(".status-badge") ||
          e.target.closest("button") ||
          e.target.classList.contains("drag-handle")
        )
          return;
        openDetailView(c.id);
      });

      let immobileBadge = isImmobile
        ? '<span style="font-size:11px; background:var(--md-sys-color-secondary-container); color:var(--md-sys-color-on-secondary-container); padding:2px 6px; border-radius:4px; margin-left:6px;" title="Incluso nel valore immobile per il mutuo">Immobile Mutuo</span>'
        : "";

      // Badge conteggio pagamenti
      const numPagamenti = c.pagamenti ? c.pagamenti.length : 0;
      const pagamentiBadge =
        numPagamenti > 0
          ? `<span class="payments-count-badge"><span class="material-symbols-outlined">payments</span>${numPagamenti}</span>`
          : "";

      // Warning mancata registrazione: mostra SOLO l'icona di warning accanto alla matita
      const nonRegistrato = getUnregisteredPaymentAmount(c);
      const warningIcon =
        nonRegistrato > 0.005
          ? `<span class="material-symbols-outlined" style="color: #f59e0b; font-size: 20px; vertical-align: middle; cursor: pointer;" title="Pagamenti non ancora registrati a rate" onclick="event.stopPropagation(); openDetailView(${c.id})">warning</span>`
          : "";

      // Stato Confermato / Non Confermato
      const isConfermato = c.confermato === true;
      const statusBadge = `<span class="status-badge ${isConfermato ? "confermato" : "non-confermato"}" title="Clicca per invertire lo stato" onclick="event.stopPropagation(); toggleCostoConfermato(${c.id})"><span class="material-symbols-outlined">${isConfermato ? "check_circle" : "cancel"}</span> ${isConfermato ? "Confermato" : "Non confermato"}</span>`;

      // Badge Pagato nella colonna Restante: se saldato mostra direttamente il badge Pagato
      const isPagato =
        restante <= 0.005 && ((c.prezzo || 0) > 0 || sumPaid > 0);
      const restanteHtml = isPagato
        ? `<span class="badge-pagato" title="Costo interamente saldato"><span class="material-symbols-outlined">check_circle</span> Pagato</span>`
        : formatRestanteCurrency(restante);

      const hasNote = c.note && String(c.note).trim().length > 0;
      let rowHtml = `<td class="col-drag" style="width: 30px; padding: 12px 4px;"><span class="material-symbols-outlined drag-handle" onmouseenter="this.closest('tr').setAttribute('draggable', 'true')" onmouseleave="this.closest('tr').setAttribute('draggable', 'false')">drag_indicator</span></td>
                     <td class="col-cat" data-label="Categoria">${badgeHTML}</td>
                     <td class="col-desc" data-label="Descrizione" style="white-space: pre-wrap;"><b>${c.desc}</b>${pagamentiBadge} ${immobileBadge}</td>
                     <td class="col-prezzo" data-label="Prezzo Totale">${formatCurrency(c.prezzo)}</td>`;
      appData.settings.users.forEach((u) => {
        rowHtml += `<td class="col-user" data-user="${u.id}" data-label="Pagato (${u.name})" style="color:var(--md-sys-color-primary);">${formatCurrency(c[u.id] || 0)}</td>`;
      });
      rowHtml += `<td class="col-restante" data-label="Restante" style="font-weight: 500; white-space: nowrap;">${restanteHtml}</td>
                  <td class="col-stato" data-label="Stato">${statusBadge}</td>
                  <td class="col-note ${hasNote ? "" : "col-note-empty"}" data-label="Note" style="white-space: pre-wrap;">${renderRichContent(c.note, "costi", c.id, "note")}</td>
                  <td class="col-actions" data-label="Azioni" style="white-space: nowrap;"><div style="display: inline-flex; align-items: center; gap: 4px;">${warningIcon}<button class="btn-icon" title="Modifica voce" onclick="event.stopPropagation(); openEditModal('costo', ${c.id})"><span class="material-symbols-outlined">edit</span></button><button class="btn-icon" title="Elimina voce" onclick="event.stopPropagation(); deleteCostItem(${c.id})"><span class="material-symbols-outlined" style="color: var(--md-sys-color-error);">delete</span></button></div></td>`;
      tr.innerHTML = rowHtml;
      tCosti.appendChild(tr);
    });
  }

  const tBudget = document.querySelector("#table-budget tbody");
  if (tBudget) {
    tBudget.innerHTML = "";
    getSortedData("budget").forEach((b, index) => {
      let sumB = appData.settings.users.reduce(
        (acc, u) => acc + (b[u.id] || 0),
        0,
      );
      let tr = document.createElement("tr");
      tr.setAttribute("draggable", "false");
      tr.addEventListener("dragstart", (e) =>
        handleDragStart(e, index, "budget"),
      );
      tr.addEventListener("drop", (e) => handleDrop(e, index, "budget"));
      tr.addEventListener("dragover", handleDragOver);
      tr.addEventListener("dragend", handleDragEnd);

      const hasNoteB = b.note && String(b.note).trim().length > 0;
      let rowHtml = `<td class="col-drag" style="width: 30px; padding: 12px 4px;"><span class="material-symbols-outlined drag-handle" onmouseenter="this.closest('tr').setAttribute('draggable', 'true')" onmouseleave="this.closest('tr').setAttribute('draggable', 'false')">drag_indicator</span></td>
                     <td class="col-desc" data-label="Descrizione" style="white-space: pre-wrap;"><b>${b.desc}</b> ${b.isMutuo ? '<span style="font-size:11px; background:var(--md-sys-color-primary-container); color:var(--md-sys-color-on-primary-container); padding:2px 6px; border-radius:4px; margin-left:6px; font-weight:600;">Mutuo</span>' : b.isDebito ? '<span style="font-size:11px; background:var(--md-sys-color-error-container); color:var(--md-sys-color-on-error-container); padding:2px 6px; border-radius:4px; margin-left:6px; font-weight:600;">Debito / Rata</span>' : ""}</td>`;
      appData.settings.users.forEach((u) => {
        rowHtml += `<td class="col-user" data-user="${u.id}" data-label="Quota ${u.name}">${formatColoredCurrency(b[u.id] || 0)}</td>`;
      });
      rowHtml += `<td class="col-totale" data-label="Totale" style="font-weight: 500;">${formatColoredCurrency(sumB)}</td>
                  <td class="col-note ${hasNoteB ? "" : "col-note-empty"}" data-label="Note" style="white-space: pre-wrap;">${renderRichContent(b.note, "budget", b.id, "note")}</td>
                  <td class="col-actions" data-label="Azioni" style="white-space: nowrap;"><div style="display: inline-flex; align-items: center; gap: 4px;">${b.isDebito ? `<button class="btn-icon" title="Modifica debito nella sezione Debiti" onclick="openEditDebitoModal(${b.debitoId})"><span class="material-symbols-outlined">edit</span></button><button class="btn-icon" title="Elimina debito" onclick="deleteDebito(${b.debitoId})"><span class="material-symbols-outlined" style="color: var(--md-sys-color-error);">delete</span></button>` : `<button class="btn-icon" title="Modifica voce" onclick="openEditModal('budget', ${b.id})"><span class="material-symbols-outlined">edit</span></button><button class="btn-icon" title="Elimina voce" onclick="deleteBudgetItem(${b.id})"><span class="material-symbols-outlined" style="color: var(--md-sys-color-error);">delete</span></button>`}</div></td>`;
      tr.innerHTML = rowHtml;
      tBudget.appendChild(tr);
    });

    // Righe di riepilogo con risparmi netti accumulati
    let userRisparmi = {};
    let totRisparmi = 0;
    if (appData.savingsMonitor) {
      (appData.settings.users || []).forEach((u) => {
        const sm = calculateSavingsMetrics(u.id);
        const r = sm && sm.isConfigured ? sm.risparmioNetto || 0 : 0;
        userRisparmi[u.id] = r;
        totRisparmi += r;
      });
    }

    if (totRisparmi !== 0) {
      let rRow = `<tr>
        <td class="col-drag" style="width: 30px; padding: 12px 4px; text-align: center;"><span class="material-symbols-outlined" style="color: var(--md-sys-color-outline); font-size: 18px; cursor: default;" title="Voce fissa bloccata">lock</span></td>
        <td class="col-desc" data-label="Descrizione" style="white-space: pre-wrap;"><b>Risparmi Netti Generati</b> <span style="font-size:11px; background:var(--md-sys-color-secondary-container); color:var(--md-sys-color-on-secondary-container); padding:2px 6px; border-radius:4px; margin-left:6px;">Risparmio</span></td>`;
      appData.settings.users.forEach((u) => {
        const rVal = userRisparmi[u.id] || 0;
        rRow += `<td class="col-user" data-user="${u.id}" data-label="Quota ${u.name}">${formatColoredCurrency(rVal)}</td>`;
      });
      rRow += `
        <td class="col-totale" data-label="Totale" style="font-weight: 500;">${formatColoredCurrency(totRisparmi)}</td>
        <td class="col-note" data-label="Note" style="white-space: pre-wrap;"><small>Dal monitoraggio risparmio</small></td>
        <td class="col-actions" data-label="Azioni"><button class="btn-icon" onclick="nav('savings')" title="Voce bloccata (gestita nel monitoraggio risparmi)"><span class="material-symbols-outlined" style="color: var(--md-sys-color-outline);">lock</span></button></td>
      </tr>`;
      tBudget.insertAdjacentHTML("beforeend", rRow);
    }
  }
}

// ==============================================================================
// MONITORAGGIO RISPARMIO NETTO & INTEGRAZIONE BUDGET
// ==============================================================================

/**
 * Formatta una data completa (YYYY-MM-DD o YYYY-MM) in Giorno Mese Anno (es. "15 Giugno 2027").
 * @param {string} dateStr
 * @returns {string}
 */
