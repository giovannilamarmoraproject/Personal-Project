/**
 * ============================================================================== 
 * APPUNTI, DOMANDE & RISPOSTE (Q&A), TO-DO & GALLERIA RENDER 3D
 * ============================================================================== 
 */

async function handleRenderPhotoUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const urlInput = document.getElementById("new-render-url");
  const titleInput = document.getElementById("new-render-title");
  const typeSelect = document.getElementById("new-render-type");

  try {
    const compressedUrl = await compressImageFile(file, 1920, 1920, 0.8);
    if (urlInput) urlInput.value = compressedUrl;
    if (titleInput && !titleInput.value.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      titleInput.value = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    }
    if (typeSelect && typeSelect.value === "pdf") {
      typeSelect.value = "image";
      onRenderTypeChange();
    }
    showNotification("Foto caricata! Clicca 'Aggiungi Elemento' per salvare");
  } catch (err) {
    console.error("Errore caricamento render:", err);
    showNotification("Errore caricamento", "Impossibile elaborare l'immagine", "error");
  } finally {
    event.target.value = "";
  }
}

/**
 * Aggiorna i controlli di inserimento quando l'utente cambia il tipo di file (Immagine vs PDF).
 * I PDF sono abilitati esclusivamente tramite Google Drive / URL per non appesantire il backup.
 */
function onRenderTypeChange() {
  const typeSelect = document.getElementById("new-render-type");
  const uploadBtn = document.getElementById("btn-render-photo-upload");
  const label = document.getElementById("new-render-url-label");
  const urlInput = document.getElementById("new-render-url");
  if (!typeSelect) return;

  if (typeSelect.value === "pdf") {
    if (uploadBtn) uploadBtn.style.display = "none";
    if (label) label.textContent = "Link Documento PDF (Google Drive o URL)";
    if (urlInput) urlInput.placeholder = "https://drive.google.com/file/d/...";
  } else {
    if (uploadBtn) uploadBtn.style.display = "inline-flex";
    if (label) label.textContent = "Link File (URL, Drive o Foto)";
    if (urlInput) urlInput.placeholder = "https://... oppure carica foto da PC/mobile";
  }
}

/**
 * Aggiunge un nuovo ambiente personalizzato per categorizzare render e piantine.
 */
function addRoomCategory() {
  const input = document.getElementById("new-room-name");
  const val = input.value.trim();
  if (!val)
    return M3Swal.fire({
      title: "Attenzione",
      text: "Inserisci un nome per l'ambiente",
      icon: "warning",
    });
  if (appData.settings.roomCategories.includes(val))
    return M3Swal.fire({
      title: "Attenzione",
      text: "Ambiente già presente",
      icon: "warning",
    });
  appData.settings.roomCategories.push(val);
  input.value = "";
  saveDataLocally();
  showNotification("Ambiente aggiunto!");
}

/**
 * Rimuove un ambiente esistente riassegnando i file a 'Generale Casa'.
 * @param {number} idx - Indice dell'ambiente nell'array `roomCategories`.
 */
async function removeRoomCategory(idx) {
  const room = appData.settings.roomCategories[idx];
  const result = await showConfirm(
    `Rimuovere "${room}"?`,
    "I file associati verranno spostati in 'Generale Casa'.",
  );
  if (result.isConfirmed) {
    appData.settings.roomCategories.splice(idx, 1);
    appData.settings.renders.forEach((r) => {
      if (r.room === room) r.room = "Generale Casa";
    });
    saveDataLocally();
    showNotification("Ambiente rimosso");
  }
}

/**
 * Aggiunge un elemento multimediale (immagine, render o PDF) alla galleria.
 */
function addRenderItem() {
  const urlInput = document.getElementById("new-render-url");
  const titleInput = document.getElementById("new-render-title");
  const roomSelect = document.getElementById("new-render-room");
  const typeSelect = document.getElementById("new-render-type");

  if (!urlInput || !urlInput.value.trim())
    return M3Swal.fire({
      title: "Attenzione",
      text: "Inserisci l'URL del file",
      icon: "warning",
    });

  const url = urlInput.value.trim();
  const title = titleInput.value.trim() || "Allegato";
  const room = roomSelect ? roomSelect.value : "Generale Casa";
  const type = typeSelect ? typeSelect.value : "image";

  appData.settings.renders.push({ url, title, room, type });
  urlInput.value = "";
  titleInput.value = "";
  saveDataLocally();
  showNotification("Elemento multimediale aggiunto!");
}

/**
 * Elimina un elemento dalla galleria multimediale.
 * @param {number} index - Indice dell'elemento nell'array `renders`.
 */
async function removeRender(index) {
  const result = await showConfirm(
    "Rimuovere questo file?",
    "Il file non sarà più visibile nella galleria.",
  );
  if (result.isConfirmed) {
    appData.settings.renders.splice(index, 1);
    saveDataLocally();
    showNotification("File rimosso");
  }
}

/**
 * Aggiunge una nuova voce nei Costi o nel Budget leggendo i valori dai form.
 * @param {'costo'|'budget'} type - Tipologia della voce da inserire.
 */

function createQACardElement(item, isInsideDetailView = false) {
  const category = item.category || "Generale";
  const isAnswered = item.answer && item.answer.trim().length > 0;
  const statusBadge = isAnswered
    ? `<span class="cat-badge" style="background-color: var(--md-sys-color-success); color: #141218;">Risposta Ricevuta</span>`
    : `<span class="cat-badge" style="background-color: var(--md-sys-color-surface-container-high); color: var(--md-sys-color-on-surface);">In Attesa</span>`;

  let topicBg = "var(--md-sys-color-primary-container)";
  let topicColor = "var(--md-sys-color-on-primary-container)";
  if (
    category !== "Generale" &&
    appData.settings &&
    appData.settings.categories &&
    appData.settings.categories[category]
  ) {
    topicBg = appData.settings.categories[category].color;
    topicColor = "#FFFFFF";
  }

  const card = document.createElement("div");
  card.className = "qa-card";

  // 1. Intestazione con Categoria, Status, data e pulsanti azione
  const headerDiv = document.createElement("div");
  headerDiv.style.cssText =
    "display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; flex-wrap: wrap;";
  headerDiv.innerHTML = `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <span class="cat-badge" style="background-color: ${topicBg}; color: ${topicColor}; font-size: 13px;">${category}</span>
          ${statusBadge}
      </div>
      <div style="display: flex; gap: 4px; align-items: center;">
          <span style="font-size: 12px; color: var(--md-sys-color-outline); margin-right: 8px;">${item.date || ""}</span>
          <button class="btn-icon" onclick="openEditQAModal(${item.id})" title="Modifica"><span class="material-symbols-outlined">edit</span></button>
          <button class="btn-icon" onclick="deleteQAItem(${item.id})" title="Elimina" style="color: var(--md-sys-color-error);"><span class="material-symbols-outlined">delete</span></button>
      </div>
  `;
  card.appendChild(headerDiv);

  // 2. Argomento e Testo della Domanda
  const bodyDiv = document.createElement("div");
  bodyDiv.style.marginTop = "4px";
  bodyDiv.innerHTML = `
      ${item.topic ? `<div style="font-size: 16px; font-weight: 700; color: var(--md-sys-color-on-surface); margin-bottom: 8px;">${escapeHTML(item.topic)}</div>` : ""}
      <div style="font-size: 15px; color: var(--md-sys-color-on-surface); display: flex; gap: 8px; align-items: flex-start;">
          <span class="material-symbols-outlined" style="color: var(--md-sys-color-primary); font-size: 20px; flex-shrink: 0; margin-top: 2px;">help</span>
          <div style="flex: 1; min-width: 0; white-space: pre-wrap;">${renderRichContent(item.question, "qa", item.id, "question")}</div>
      </div>
  `;
  card.appendChild(bodyDiv);

  // 2b. Badge Costi Casa collegati (se non siamo già dentro il dettaglio del costo)
  if (
    !isInsideDetailView &&
    Array.isArray(item.linkedCostIds) &&
    item.linkedCostIds.length > 0
  ) {
    const linkedCosts = item.linkedCostIds
      .map((cid) => (appData.costi || []).find((c) => c.id === Number(cid)))
      .filter(Boolean);
    if (linkedCosts.length > 0) {
      const linkedDiv = document.createElement("div");
      linkedDiv.className = "card-linked-costs";
      linkedDiv.innerHTML = linkedCosts
        .map(
          (cost) =>
            `<a class="card-linked-cost-badge" onclick="event.stopPropagation(); openDetailView(${cost.id});" title="Apri dettaglio costo: ${escapeHTML(cost.desc)}">
              <span class="material-symbols-outlined">euro</span>
              <span>${escapeHTML(cost.desc)}</span>
            </a>`,
        )
        .join("");
      card.appendChild(linkedDiv);
    }
  }

  // 3. Immagini collegate alla Domanda (tra domanda e risposta)
  if (item.images && item.images.length > 0) {
    const imgGrid = document.createElement("div");
    imgGrid.className = "note-images-grid";

    item.images.forEach((imgUrl, idx) => {
      const thumb = document.createElement("div");
      thumb.className = "note-image-thumb";
      thumb.title = "Clicca per ingrandire";
      thumb.onclick = () => openLightbox(item.images, idx);

      const img = document.createElement("img");
      img.src = imgUrl;
      img.alt = `Foto ${idx + 1}`;
      img.loading = "lazy";

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "note-image-delete-btn";
      delBtn.title = "Elimina immagine";
      delBtn.innerHTML = `<span class="material-symbols-outlined">close</span>`;
      delBtn.onclick = (e) => {
        deleteQAImageDirect(item.id, idx, e);
      };

      thumb.appendChild(img);
      thumb.appendChild(delBtn);
      imgGrid.appendChild(thumb);
    });

    card.appendChild(imgGrid);
  }

  // 4. Risposta o messaggio di attesa
  const answerDiv = document.createElement("div");
  if (isAnswered) {
    answerDiv.style.cssText =
      "background: var(--md-sys-color-surface-container-high); border-radius: var(--md-sys-shape-corner-medium); padding: 14px 16px; margin-top: 8px; border-left: 4px solid var(--md-sys-color-success);";
    answerDiv.innerHTML = `
        <div style="font-size: 12px; font-weight: 600; color: var(--md-sys-color-success); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <span class="material-symbols-outlined" style="font-size: 16px;">check_circle</span> Risposta:
        </div>
        <div style="font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${renderRichContent(item.answer, "qa", item.id, "answer")}</div>
    `;
  } else {
    answerDiv.style.cssText =
      "font-size: 13px; color: var(--md-sys-color-outline); font-style: italic; display: flex; align-items: center; gap: 6px; margin-top: 8px;";
    answerDiv.innerHTML = `
        <span class="material-symbols-outlined" style="font-size: 16px;">pending</span> In attesa di risposta dal fornitore o professionista.
    `;
  }
  card.appendChild(answerDiv);

  return card;
}

/**
 * Esegue il rendering della lista di domande e risposte (Q&A).
 */
function renderQASection() {
  const container = document.getElementById("qa-container");
  if (!container) return;
  container.innerHTML = "";

  if (!appData.qa || appData.qa.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--md-sys-color-outline); padding: 40px 16px;">
          <span class="material-symbols-outlined" style="font-size: 48px; opacity: 0.5;">quiz</span>
          <p style="margin: 12px 0 0 0;">Nessuna domanda presente. Clicca su "Aggiungi Domanda" per iniziare.</p>
      </div>
    `;
    return;
  }

  const groupedQA = {};
  appData.qa.forEach((item) => {
    const category = item.category || "Generale";
    if (!groupedQA[category]) groupedQA[category] = [];
    groupedQA[category].push(item);
  });

  Object.keys(groupedQA)
    .sort()
    .forEach((category) => {
      let catColor = "var(--md-sys-color-primary)";
      if (
        appData.settings &&
        appData.settings.categories &&
        appData.settings.categories[category]
      ) {
        catColor = appData.settings.categories[category].color;
      }

      const groupHeader = document.createElement("h3");
      groupHeader.style.cssText =
        "margin-top: 24px; margin-bottom: 12px; font-size: 18px; border-bottom: 1px solid var(--md-sys-color-outline-variant); padding-bottom: 8px; display: flex; align-items: center; gap: 8px;";
      groupHeader.innerHTML = `<span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: ${catColor};"></span>${category}`;
      container.appendChild(groupHeader);

      groupedQA[category].sort((a, b) => {
        const aAnswered = a.answer && a.answer.trim().length > 0;
        const bAnswered = b.answer && b.answer.trim().length > 0;
        if (aAnswered === bAnswered) return 0;
        return aAnswered ? 1 : -1;
      });

      groupedQA[category].forEach((item) => {
        container.appendChild(createQACardElement(item, false));
      });
    });
}

let currentQAImages = [];

async function handleQAImageUpload(event) {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;

  let addedCount = 0;
  for (const file of files) {
    try {
      const compressedUrl = await compressImageFile(file);
      currentQAImages.push(compressedUrl);
      addedCount++;
    } catch (err) {
      console.error("Errore compressione immagine domanda:", err);
      showNotification(
        "Errore caricamento",
        "Impossibile elaborare " + file.name,
        "error",
      );
    }
  }
  event.target.value = "";
  renderQAModalImagesPreview();
  if (addedCount > 0) {
    showNotification(
      addedCount === 1
        ? "Immagine caricata"
        : `${addedCount} immagini caricate`,
    );
  }
}

async function promptAddQAImageUrl() {
  const result = await M3Swal.fire({
    title: "Aggiungi Immagine via Link",
    input: "url",
    inputLabel: "Inserisci l'indirizzo web dell'immagine o link Drive",
    inputPlaceholder: "https://...",
    showCancelButton: true,
    confirmButtonText: "Aggiungi",
    cancelButtonText: "Annulla",
    inputValidator: (value) => {
      if (!value || !value.trim()) {
        return "Inserisci un URL valido";
      }
    },
  });
  if (result.isConfirmed && result.value) {
    const formatted = formatFileUrl(result.value.trim());
    currentQAImages.push(formatted.url || result.value.trim());
    renderQAModalImagesPreview();
  }
}

function renderQAModalImagesPreview() {
  const preview = document.getElementById("qa-modal-images-preview");
  if (!preview) return;
  preview.innerHTML = "";

  if (!currentQAImages || currentQAImages.length === 0) {
    preview.innerHTML = `<p class="note-images-empty-hint">Nessuna immagine allegata. Carica una foto o inserisci un link.</p>`;
    return;
  }

  currentQAImages.forEach((imgUrl, index) => {
    const thumb = document.createElement("div");
    thumb.className = "note-image-thumb";
    thumb.title = "Clicca per ingrandire";
    thumb.onclick = () => openLightbox(currentQAImages, index);

    const img = document.createElement("img");
    img.src = imgUrl;
    img.alt = `Allegato ${index + 1}`;
    img.loading = "lazy";

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "note-image-delete-btn";
    delBtn.title = "Rimuovi immagine";
    delBtn.innerHTML = `<span class="material-symbols-outlined">close</span>`;
    delBtn.onclick = (e) => {
      e.stopPropagation();
      removeQAModalImage(index);
    };

    thumb.appendChild(img);
    thumb.appendChild(delBtn);
    preview.appendChild(thumb);
  });
}

function removeQAModalImage(index) {
  currentQAImages.splice(index, 1);
  renderQAModalImagesPreview();
}

async function deleteQAImageDirect(qaId, imgIndex, event) {
  if (event) event.stopPropagation();
  const item = appData.qa.find((q) => q.id === qaId);
  if (!item || !item.images || !item.images[imgIndex]) return;

  const result = await showConfirm(
    "Eliminare questa immagine?",
    "L'immagine verrà rimossa definitivamente da questa domanda.",
    "Elimina",
  );
  if (result.isConfirmed) {
    item.images.splice(imgIndex, 1);
    saveDataLocally();
    renderQASection();
    if (currentDetailId !== null) {
      const curItem = appData.costi.find((c) => c.id === currentDetailId);
      if (curItem) renderDetailView(curItem);
    }
    showNotification("Immagine eliminata");
  }
}

let currentQALinkedCostIds = [];

function handleQAAddLinkedCost(selectEl) {
  const val = parseInt(selectEl.value);
  if (!val) return;
  if (!currentQALinkedCostIds.includes(val)) {
    currentQALinkedCostIds.push(val);
    renderQALinkedCostsPreview();
  }
  selectEl.value = "";
}

function removeQALinkedCost(costId) {
  currentQALinkedCostIds = currentQALinkedCostIds.filter((id) => id !== costId);
  renderQALinkedCostsPreview();
}

function renderQALinkedCostsPreview() {
  const container = document.getElementById("qa-modal-linked-costs-chips");
  renderLinkedCostsChips(container, currentQALinkedCostIds, removeQALinkedCost);
  const select = document.getElementById("qa-modal-linked-cost-select");
  populateLinkedCostSelect(select, currentQALinkedCostIds);
}

/**
 * Apre la modale per inserire una nuova domanda.
 * @param {number|null} preselectedCostId - ID opzionale del costo da preselezionare.
 */
function openAddQAModal(preselectedCostId = null) {
  document.getElementById("qa-modal-id").value = "";
  document.getElementById("qa-modal-title").innerText = "Nuova Domanda";
  document.getElementById("qa-modal-category").value = "Generale";
  document.getElementById("qa-modal-topic").value = "";
  setRichEditorHTML("qa-modal-question", "");
  setRichEditorHTML("qa-modal-answer", "");
  document.getElementById("qa-btn-delete").style.display = "none";
  currentQAImages = [];
  renderQAModalImagesPreview();
  currentQALinkedCostIds = preselectedCostId ? [Number(preselectedCostId)] : [];
  renderQALinkedCostsPreview();
  openModalOverlay("qaModal");
}

/**
 * Apre la modale per modificare una domanda/risposta esistente.
 * @param {number} id - ID univoco dell'elemento Q&A.
 */
function openEditQAModal(id) {
  const item = appData.qa.find((q) => q.id === id);
  if (!item) return;
  document.getElementById("qa-modal-id").value = id;
  document.getElementById("qa-modal-title").innerText =
    "Modifica Domanda & Risposta";
  document.getElementById("qa-modal-category").value =
    item.category || "Generale";
  document.getElementById("qa-modal-topic").value = item.topic || "";
  setRichEditorHTML("qa-modal-question", item.question || "");
  setRichEditorHTML("qa-modal-answer", item.answer || "");
  document.getElementById("qa-btn-delete").style.display = "inline-flex";
  currentQAImages = Array.isArray(item.images) ? [...item.images] : [];
  renderQAModalImagesPreview();
  currentQALinkedCostIds = Array.isArray(item.linkedCostIds)
    ? [...item.linkedCostIds]
    : [];
  renderQALinkedCostsPreview();
  openModalOverlay("qaModal");
}

/**
 * Chiude la modale di modifica o creazione Q&A.
 */
function closeQAModal() {
  closeModalOverlay("qaModal");
  currentQAImages = [];
  currentQALinkedCostIds = [];
  const preview = document.getElementById("qa-modal-images-preview");
  if (preview) preview.innerHTML = "";
  const chips = document.getElementById("qa-modal-linked-costs-chips");
  if (chips) chips.innerHTML = "";
}

/**
 * Salva le modifiche o crea una nuova domanda nel database locale.
 */
function saveQAModalChanges() {
  const idVal = document.getElementById("qa-modal-id").value;
  const category =
    document.getElementById("qa-modal-category").value || "Generale";
  const topic = document.getElementById("qa-modal-topic").value.trim();
  const question = getRichEditorHTML("qa-modal-question");
  const answer = getRichEditorHTML("qa-modal-answer");

  if (!question)
    return M3Swal.fire({
      title: "Attenzione",
      text: "Inserisci il testo della domanda",
      icon: "warning",
    });

  if (idVal) {
    const item = appData.qa.find((q) => q.id === parseInt(idVal));
    if (item) {
      item.category = category;
      item.topic = topic;
      item.question = question;
      item.answer = answer;
      item.images = [...currentQAImages];
      item.linkedCostIds = [...currentQALinkedCostIds];
    }
  } else {
    const today = new Date();
    const dateStr = today.toLocaleDateString("it-IT");
    appData.qa.unshift({
      id: Date.now(),
      category,
      topic,
      question,
      answer,
      images: [...currentQAImages],
      linkedCostIds: [...currentQALinkedCostIds],
      date: dateStr,
    });
  }
  closeQAModal();
  saveDataLocally();
  renderQASection();
  if (currentDetailId !== null) {
    const curItem = appData.costi.find((c) => c.id === currentDetailId);
    if (curItem) renderDetailView(curItem);
  }
  showNotification("Domanda salvata!");
}

/**
 * Elimina un elemento Q&A identificato dal suo ID.
 * @param {number} id - ID della domanda.
 */
async function deleteQAItem(id) {
  const result = await showConfirm(
    "Eliminare questa domanda?",
    "Non sarà più possibile recuperarla.",
  );
  if (result.isConfirmed) {
    appData.qa = appData.qa.filter((q) => q.id !== id);
    saveDataLocally();
    renderQASection();
    if (currentDetailId !== null) {
      const curItem = appData.costi.find((c) => c.id === currentDetailId);
      if (curItem) renderDetailView(curItem);
    }
    showNotification("Domanda eliminata");
  }
}

/**
 * Elimina la domanda visualizzata all'interno della modale Q&A.
 */
async function deleteQAFromModal() {
  const idVal = document.getElementById("qa-modal-id").value;
  if (!idVal) return;
  const result = await showConfirm(
    "Eliminare questa domanda?",
    "Non sarà più possibile recuperarla.",
  );
  if (result.isConfirmed) {
    appData.qa = appData.qa.filter((q) => q.id !== parseInt(idVal));
    closeQAModal();
    saveDataLocally();
    renderQASection();
    if (currentDetailId !== null) {
      const curItem = appData.costi.find((c) => c.id === currentDetailId);
      if (curItem) renderDetailView(curItem);
    }
    showNotification("Domanda eliminata");
  }
}

/**
 * /**
 * Crea e restituisce l'elemento DOM card per un Task.
 * @param {Object} item - Oggetto task da appData.tasks.
 * @param {boolean} isInsideDetailView - True se renderizzato all'interno della vista dettaglio costo.
 * @returns {HTMLElement}
 */
function createTaskCardElement(item, isInsideDetailView = false) {
  const category = item.category || "Generale";
  let topicBg = "var(--md-sys-color-primary-container)";
  let topicColor = "var(--md-sys-color-on-primary-container)";
  if (
    category !== "Generale" &&
    appData.settings &&
    appData.settings.categories &&
    appData.settings.categories[category]
  ) {
    topicBg = appData.settings.categories[category].color;
    topicColor = "#FFFFFF";
  }

  let dueDateBadge = "";
  if (item.dueDate) {
    const dateObj = new Date(item.dueDate);
    const dateStr = dateObj.toLocaleDateString("it-IT");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dateObj - today) / (1000 * 60 * 60 * 24));
    const isExpiringOrExpired = !item.completed && diffDays < 10;
    dueDateBadge = `<span class="cat-badge" style="background-color: ${isExpiringOrExpired ? "var(--md-sys-color-error)" : "var(--md-sys-color-surface-container-high)"}; color: ${isExpiringOrExpired ? "#FFFFFF" : "var(--md-sys-color-on-surface)"}; display: flex; align-items: center; gap: 4px;"><span class="material-symbols-outlined" style="font-size: 14px;">calendar_month</span> ${dateStr}</span>`;
  }

  const card = document.createElement("div");
  card.className = "qa-card";
  card.style.opacity = item.completed ? "0.6" : "1";

  const createdDateStr = new Date(item.id).toLocaleDateString("it-IT");

  // 1. Header con Categoria, Badge, Scadenza, Data e Azioni
  const headerDiv = document.createElement("div");
  headerDiv.style.cssText =
    "display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; flex-wrap: wrap;";
  headerDiv.innerHTML = `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <span class="cat-badge" style="background-color: ${topicBg}; color: ${topicColor}; font-size: 13px;">${category}</span>
          ${item.completed ? `<span class="cat-badge" style="background-color: var(--md-sys-color-success); color: #141218;">Completato</span>` : ""}
          ${dueDateBadge}
      </div>
      <div style="display: flex; gap: 4px; align-items: center;">
          <span style="font-size: 12px; color: var(--md-sys-color-outline); margin-right: 8px;">${createdDateStr}</span>
          <button class="btn-icon" onclick="toggleTaskStatus(${item.id})" title="${item.completed ? "Segna da completare" : "Segna come completato"}">
              <span class="material-symbols-outlined" style="color: ${item.completed ? "var(--md-sys-color-outline)" : "var(--md-sys-color-success)"};">${item.completed ? "undo" : "check_circle"}</span>
          </button>
          <button class="btn-icon" onclick="openEditTaskModal(${item.id})" title="Modifica"><span class="material-symbols-outlined">edit</span></button>
          <button class="btn-icon" onclick="deleteTaskItem(${item.id})" title="Elimina" style="color: var(--md-sys-color-error);"><span class="material-symbols-outlined">delete</span></button>
      </div>
  `;
  card.appendChild(headerDiv);

  // 2. Titolo del Task
  const titleDiv = document.createElement("div");
  titleDiv.style.marginTop = "4px";
  titleDiv.innerHTML = `
      <div style="font-size: 16px; font-weight: 700; color: var(--md-sys-color-on-surface); margin-bottom: 4px; text-decoration: ${item.completed ? "line-through" : "none"};">${escapeHTML(item.title)}</div>
  `;
  card.appendChild(titleDiv);

  // 2b. Badge Costi Casa collegati (se non siamo già dentro il dettaglio del costo)
  if (
    !isInsideDetailView &&
    Array.isArray(item.linkedCostIds) &&
    item.linkedCostIds.length > 0
  ) {
    const linkedCosts = item.linkedCostIds
      .map((cid) => (appData.costi || []).find((c) => c.id === Number(cid)))
      .filter(Boolean);
    if (linkedCosts.length > 0) {
      const linkedDiv = document.createElement("div");
      linkedDiv.className = "card-linked-costs";
      linkedDiv.innerHTML = linkedCosts
        .map(
          (cost) =>
            `<a class="card-linked-cost-badge" onclick="event.stopPropagation(); openDetailView(${cost.id});" title="Apri dettaglio costo: ${escapeHTML(cost.desc)}">
              <span class="material-symbols-outlined">euro</span>
              <span>${escapeHTML(cost.desc)}</span>
            </a>`,
        )
        .join("");
      card.appendChild(linkedDiv);
    }
  }

  // 3. Immagini collegate al Task
  if (item.images && item.images.length > 0) {
    const imgGrid = document.createElement("div");
    imgGrid.className = "note-images-grid";

    item.images.forEach((imgUrl, idx) => {
      const thumb = document.createElement("div");
      thumb.className = "note-image-thumb";
      thumb.title = "Clicca per ingrandire";
      thumb.onclick = () => openLightbox(item.images, idx);

      const img = document.createElement("img");
      img.src = imgUrl;
      img.alt = `Foto ${idx + 1}`;
      img.loading = "lazy";

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "note-image-delete-btn";
      delBtn.title = "Elimina immagine";
      delBtn.innerHTML = `<span class="material-symbols-outlined">close</span>`;
      delBtn.onclick = (e) => {
        deleteTaskImageDirect(item.id, idx, e);
      };

      thumb.appendChild(img);
      thumb.appendChild(delBtn);
      imgGrid.appendChild(thumb);
    });

    card.appendChild(imgGrid);
  }

  // 4. Descrizione del Task
  if (item.desc) {
    const descDiv = document.createElement("div");
    descDiv.style.cssText =
      "font-size: 15px; color: var(--md-sys-color-on-surface); display: flex; gap: 8px; align-items: flex-start; margin-top: 6px;";
    descDiv.innerHTML = `
        <span class="material-symbols-outlined" style="color: var(--md-sys-color-outline); font-size: 20px; flex-shrink: 0; margin-top: 2px;">notes</span>
        <div style="flex: 1; min-width: 0; white-space: pre-wrap;">${renderRichContent(item.desc, "tasks", item.id, "desc")}</div>
    `;
    card.appendChild(descDiv);
  }

  return card;
}

/**
 * Esegue il rendering della sezione Task.
 */
function renderTaskSection() {
  const activeContainer = document.getElementById("task-container");
  const completedContainer = document.getElementById(
    "completed-task-container",
  );
  if (!activeContainer || !completedContainer) return;
  activeContainer.innerHTML = "";
  completedContainer.innerHTML = "";

  if (!appData.tasks || appData.tasks.length === 0) {
    activeContainer.innerHTML = `
      <div style="text-align: center; color: var(--md-sys-color-outline); padding: 40px 16px;">
          <span class="material-symbols-outlined" style="font-size: 48px; opacity: 0.5;">task</span>
          <p style="margin: 12px 0 0 0;">Nessun task presente. Clicca su "Aggiungi Task" per iniziare.</p>
      </div>
    `;
    const deskB = document.getElementById("task-badge-desktop");
    const mobB = document.getElementById("task-badge-mobile");
    const drawB = document.getElementById("task-badge-drawer");
    if (deskB) deskB.style.display = "none";
    if (mobB) mobB.style.display = "none";
    if (drawB) drawB.style.display = "none";
    return;
  }

  const activeTasks = appData.tasks.filter((t) => !t.completed);
  const completedTasks = appData.tasks.filter((t) => t.completed);

  let totalExpiring = 0;
  const todayReset = new Date();
  todayReset.setHours(0, 0, 0, 0);
  activeTasks.forEach((item) => {
    if (item.dueDate) {
      const diffDays = Math.ceil(
        (new Date(item.dueDate) - todayReset) / (1000 * 60 * 60 * 24),
      );
      if (diffDays < 10) totalExpiring++;
    }
  });

  const desktopBadge = document.getElementById("task-badge-desktop");
  const mobileBadge = document.getElementById("task-badge-mobile");
  const drawerBadge = document.getElementById("task-badge-drawer");
  if (totalExpiring > 0) {
    if (desktopBadge) {
      desktopBadge.innerText = totalExpiring;
      desktopBadge.style.display = "block";
    }
    if (mobileBadge) {
      mobileBadge.innerText = totalExpiring;
      mobileBadge.style.display = "block";
    }
    if (drawerBadge) {
      drawerBadge.innerText = totalExpiring;
      drawerBadge.style.display = "inline-block";
    }
  } else {
    if (desktopBadge) desktopBadge.style.display = "none";
    if (mobileBadge) mobileBadge.style.display = "none";
    if (drawerBadge) drawerBadge.style.display = "none";
  }

  const renderTasks = (tasks, container) => {
    const groupedTasks = {};
    tasks.forEach((item) => {
      const category = item.category || "Generale";
      if (!groupedTasks[category]) groupedTasks[category] = [];
      groupedTasks[category].push(item);
    });

    Object.keys(groupedTasks)
      .sort()
      .forEach((category) => {
        let catColor = "var(--md-sys-color-primary)";
        if (
          appData.settings &&
          appData.settings.categories &&
          appData.settings.categories[category]
        ) {
          catColor = appData.settings.categories[category].color;
        }

        const groupHeader = document.createElement("h3");
        groupHeader.style.cssText =
          "margin-top: 24px; margin-bottom: 12px; font-size: 18px; border-bottom: 1px solid var(--md-sys-color-outline-variant); padding-bottom: 8px; display: flex; align-items: center; gap: 8px;";
        groupHeader.innerHTML = `<span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: ${catColor};"></span>${category}`;
        container.appendChild(groupHeader);

        groupedTasks[category].sort((a, b) => {
          if (a.dueDate && !b.dueDate) return -1;
          if (!a.dueDate && b.dueDate) return 1;
          if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
          }
          return 0;
        });

        groupedTasks[category].forEach((item) => {
          container.appendChild(createTaskCardElement(item, false));
        });
      });
  };

  if (activeTasks.length > 0) {
    renderTasks(activeTasks, activeContainer);
  } else {
    activeContainer.innerHTML =
      '<p style="color: var(--md-sys-color-outline); padding: 16px 0;">Nessun task attivo.</p>';
  }

  const completedTitle = document.getElementById("completed-tasks-title");
  if (completedTasks.length > 0) {
    if (completedTitle) completedTitle.style.display = "block";
    renderTasks(completedTasks, completedContainer);
  } else {
    if (completedTitle) completedTitle.style.display = "none";
    completedContainer.innerHTML = "";
  }
}

let currentTaskImages = [];
let currentTaskLinkedCostIds = [];

function handleTaskAddLinkedCost(selectEl) {
  const val = parseInt(selectEl.value);
  if (!val) return;
  if (!currentTaskLinkedCostIds.includes(val)) {
    currentTaskLinkedCostIds.push(val);
    renderTaskLinkedCostsPreview();
  }
  selectEl.value = "";
}

function removeTaskLinkedCost(costId) {
  currentTaskLinkedCostIds = currentTaskLinkedCostIds.filter(
    (id) => id !== costId,
  );
  renderTaskLinkedCostsPreview();
}

function renderTaskLinkedCostsPreview() {
  const container = document.getElementById("task-modal-linked-costs-chips");
  renderLinkedCostsChips(
    container,
    currentTaskLinkedCostIds,
    removeTaskLinkedCost,
  );
  const select = document.getElementById("task-modal-linked-cost-select");
  populateLinkedCostSelect(select, currentTaskLinkedCostIds);
}

async function handleTaskImageUpload(event) {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;

  let addedCount = 0;
  for (const file of files) {
    try {
      const compressedUrl = await compressImageFile(file);
      currentTaskImages.push(compressedUrl);
      addedCount++;
    } catch (err) {
      console.error("Errore compressione immagine task:", err);
      showNotification(
        "Errore caricamento",
        "Impossibile elaborare " + file.name,
        "error",
      );
    }
  }
  event.target.value = "";
  renderTaskModalImagesPreview();
  if (addedCount > 0) {
    showNotification(
      addedCount === 1
        ? "Immagine caricata"
        : `${addedCount} immagini caricate`,
    );
  }
}

async function promptAddTaskImageUrl() {
  const result = await M3Swal.fire({
    title: "Aggiungi Immagine via Link",
    input: "url",
    inputLabel: "Inserisci l'indirizzo web dell'immagine o link Drive",
    inputPlaceholder: "https://...",
    showCancelButton: true,
    confirmButtonText: "Aggiungi",
    cancelButtonText: "Annulla",
    inputValidator: (value) => {
      if (!value || !value.trim()) {
        return "Inserisci un URL valido";
      }
    },
  });
  if (result.isConfirmed && result.value) {
    const formatted = formatFileUrl(result.value.trim());
    currentTaskImages.push(formatted.url || result.value.trim());
    renderTaskModalImagesPreview();
  }
}

function renderTaskModalImagesPreview() {
  const preview = document.getElementById("task-modal-images-preview");
  if (!preview) return;
  preview.innerHTML = "";

  if (!currentTaskImages || currentTaskImages.length === 0) {
    preview.innerHTML = `<p class="note-images-empty-hint">Nessuna immagine allegata. Carica una foto o inserisci un link.</p>`;
    return;
  }

  currentTaskImages.forEach((imgUrl, index) => {
    const thumb = document.createElement("div");
    thumb.className = "note-image-thumb";
    thumb.title = "Clicca per ingrandire";
    thumb.onclick = () => openLightbox(currentTaskImages, index);

    const img = document.createElement("img");
    img.src = imgUrl;
    img.alt = `Allegato ${index + 1}`;
    img.loading = "lazy";

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "note-image-delete-btn";
    delBtn.title = "Rimuovi immagine";
    delBtn.innerHTML = `<span class="material-symbols-outlined">close</span>`;
    delBtn.onclick = (e) => {
      e.stopPropagation();
      removeTaskModalImage(index);
    };

    thumb.appendChild(img);
    thumb.appendChild(delBtn);
    preview.appendChild(thumb);
  });
}

function removeTaskModalImage(index) {
  currentTaskImages.splice(index, 1);
  renderTaskModalImagesPreview();
}

async function deleteTaskImageDirect(taskId, imgIndex, event) {
  if (event) event.stopPropagation();
  const item = appData.tasks.find((t) => t.id === taskId);
  if (!item || !item.images || !item.images[imgIndex]) return;

  const result = await showConfirm(
    "Eliminare questa immagine?",
    "L'immagine verrà rimossa definitivamente da questo task.",
    "Elimina",
  );
  if (result.isConfirmed) {
    item.images.splice(imgIndex, 1);
    saveDataLocally();
    renderTaskSection();
    if (currentDetailId !== null) {
      const curItem = appData.costi.find((c) => c.id === currentDetailId);
      if (curItem) renderDetailView(curItem);
    }
    showNotification("Immagine eliminata");
  }
}

/**
 * Apre la modale per inserire un nuovo task.
 * @param {number|null} preselectedCostId - ID opzionale del costo da preselezionare.
 */
function openAddTaskModal(preselectedCostId = null) {
  document.getElementById("task-modal-id").value = "";
  document.getElementById("task-modal-header-title").innerText = "Nuovo Task";
  document.getElementById("task-modal-category").value = "Generale";
  document.getElementById("task-modal-title").value = "";
  document.getElementById("task-modal-dueDate").value = "";
  setRichEditorHTML("task-modal-desc", "");
  document.getElementById("task-btn-delete").style.display = "none";
  currentTaskImages = [];
  renderTaskModalImagesPreview();
  currentTaskLinkedCostIds = preselectedCostId
    ? [Number(preselectedCostId)]
    : [];
  renderTaskLinkedCostsPreview();
  openModalOverlay("taskModal");
}

function openEditTaskModal(id) {
  const item = appData.tasks.find((t) => t.id === id);
  if (!item) return;
  document.getElementById("task-modal-id").value = id;
  document.getElementById("task-modal-header-title").innerText =
    "Modifica Task";
  document.getElementById("task-modal-category").value =
    item.category || "Generale";
  document.getElementById("task-modal-title").value = item.title || "";
  document.getElementById("task-modal-dueDate").value = item.dueDate || "";
  setRichEditorHTML("task-modal-desc", item.desc || "");
  document.getElementById("task-btn-delete").style.display = "inline-flex";
  currentTaskImages = Array.isArray(item.images) ? [...item.images] : [];
  renderTaskModalImagesPreview();
  currentTaskLinkedCostIds = Array.isArray(item.linkedCostIds)
    ? [...item.linkedCostIds]
    : [];
  renderTaskLinkedCostsPreview();
  openModalOverlay("taskModal");
}

function closeTaskModal() {
  closeModalOverlay("taskModal");
  currentTaskImages = [];
  currentTaskLinkedCostIds = [];
  const preview = document.getElementById("task-modal-images-preview");
  if (preview) preview.innerHTML = "";
  const chips = document.getElementById("task-modal-linked-costs-chips");
  if (chips) chips.innerHTML = "";
}

function saveTaskModalChanges() {
  const idVal = document.getElementById("task-modal-id").value;
  const category =
    document.getElementById("task-modal-category").value || "Generale";
  const title = document.getElementById("task-modal-title").value.trim();
  const dueDate = document.getElementById("task-modal-dueDate").value;
  const desc = getRichEditorHTML("task-modal-desc");

  if (!title)
    return M3Swal.fire({
      title: "Attenzione",
      text: "Inserisci il titolo del task",
      icon: "warning",
    });

  if (idVal) {
    const item = appData.tasks.find((t) => t.id === parseInt(idVal));
    if (item) {
      item.category = category;
      item.title = title;
      item.dueDate = dueDate;
      item.desc = desc;
      item.images = [...currentTaskImages];
      item.linkedCostIds = [...currentTaskLinkedCostIds];
    }
  } else {
    appData.tasks.unshift({
      id: Date.now(),
      category,
      title,
      dueDate,
      desc,
      images: [...currentTaskImages],
      linkedCostIds: [...currentTaskLinkedCostIds],
      completed: false,
    });
  }
  closeTaskModal();
  saveDataLocally();
  renderTaskSection();
  if (currentDetailId !== null) {
    const curItem = appData.costi.find((c) => c.id === currentDetailId);
    if (curItem) renderDetailView(curItem);
  }
  showNotification("Task salvato!");
}

async function deleteTaskItem(id) {
  const result = await showConfirm(
    "Eliminare questo task?",
    "Non sarà più possibile recuperarlo.",
  );
  if (result.isConfirmed) {
    appData.tasks = appData.tasks.filter((t) => t.id !== id);
    saveDataLocally();
    renderTaskSection();
    if (currentDetailId !== null) {
      const curItem = appData.costi.find((c) => c.id === currentDetailId);
      if (curItem) renderDetailView(curItem);
    }
    showNotification("Task eliminato");
  }
}

async function deleteTaskFromModal() {
  const idVal = document.getElementById("task-modal-id").value;
  if (!idVal) return;
  const result = await showConfirm(
    "Eliminare questo task?",
    "Non sarà più possibile recuperarla.",
  );
  if (result.isConfirmed) {
    appData.tasks = appData.tasks.filter((t) => t.id !== parseInt(idVal));
    closeTaskModal();
    saveDataLocally();
    renderTaskSection();
    if (currentDetailId !== null) {
      const curItem = appData.costi.find((c) => c.id === currentDetailId);
      if (curItem) renderDetailView(curItem);
    }
    showNotification("Task eliminato");
  }
}

function toggleTaskStatus(id) {
  const item = appData.tasks.find((t) => t.id === id);
  if (item) {
    item.completed = !item.completed;
    saveDataLocally();
    renderTaskSection();
    if (currentDetailId !== null) {
      const curItem = appData.costi.find((c) => c.id === currentDetailId);
      if (curItem) renderDetailView(curItem);
    }
    showNotification(item.completed ? "Task completato!" : "Task ripristinato");
  }
}

// --- APPUNTI ---
let currentNoteImages = [];

/**
 * Comprime un'immagine lato client su canvas prima del salvataggio.
 * Riduce la risoluzione max a 1280px e converte in JPEG con qualità 0.8 per limitare la dimensione a ~80-150KB.
 */
function compressImageFile(
  file,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.8,
) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Il file selezionato non è un'immagine valida."));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

async function handleNoteImageUpload(event) {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;

  let addedCount = 0;
  for (const file of files) {
    try {
      const compressedUrl = await compressImageFile(file);
      currentNoteImages.push(compressedUrl);
      addedCount++;
    } catch (err) {
      console.error("Errore compressione immagine appunto:", err);
      showNotification(
        "Errore caricamento",
        "Impossibile elaborare " + file.name,
        "error",
      );
    }
  }
  event.target.value = "";
  renderNoteModalImagesPreview();
  if (addedCount > 0) {
    showNotification(
      addedCount === 1
        ? "Immagine caricata"
        : `${addedCount} immagini caricate`,
    );
  }
}

async function promptAddNoteImageUrl() {
  const result = await M3Swal.fire({
    title: "Aggiungi Immagine via Link",
    input: "url",
    inputLabel: "Inserisci l'indirizzo web dell'immagine o link Drive",
    inputPlaceholder: "https://...",
    showCancelButton: true,
    confirmButtonText: "Aggiungi",
    cancelButtonText: "Annulla",
    inputValidator: (value) => {
      if (!value || !value.trim()) {
        return "Inserisci un URL valido";
      }
    },
  });
  if (result.isConfirmed && result.value) {
    const formatted = formatFileUrl(result.value.trim());
    currentNoteImages.push(formatted.url || result.value.trim());
    renderNoteModalImagesPreview();
  }
}

function renderNoteModalImagesPreview() {
  const preview = document.getElementById("note-modal-images-preview");
  if (!preview) return;
  preview.innerHTML = "";

  if (!currentNoteImages || currentNoteImages.length === 0) {
    preview.innerHTML = `<p class="note-images-empty-hint">Nessuna immagine allegata. Carica una foto o inserisci un link.</p>`;
    return;
  }

  currentNoteImages.forEach((imgUrl, index) => {
    const thumb = document.createElement("div");
    thumb.className = "note-image-thumb";
    thumb.title = "Clicca per ingrandire";
    thumb.onclick = () => openLightbox(currentNoteImages, index);

    const img = document.createElement("img");
    img.src = imgUrl;
    img.alt = `Allegato ${index + 1}`;
    img.loading = "lazy";

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "note-image-delete-btn";
    delBtn.title = "Rimuovi immagine";
    delBtn.innerHTML = `<span class="material-symbols-outlined">close</span>`;
    delBtn.onclick = (e) => {
      e.stopPropagation();
      removeNoteModalImage(index);
    };

    thumb.appendChild(img);
    thumb.appendChild(delBtn);
    preview.appendChild(thumb);
  });
}

function removeNoteModalImage(index) {
  currentNoteImages.splice(index, 1);
  renderNoteModalImagesPreview();
}

async function deleteNoteImageDirect(noteId, imgIndex, event) {
  if (event) event.stopPropagation();
  const note = appData.notes.find((n) => n.id === noteId);
  if (!note || !note.images || !note.images[imgIndex]) return;

  const result = await showConfirm(
    "Eliminare questa immagine?",
    "L'immagine verrà rimossa definitivamente da questo appunto.",
    "Elimina",
  );
  if (result.isConfirmed) {
    note.images.splice(imgIndex, 1);
    saveDataLocally();
    renderNoteSection();
    if (currentDetailId !== null) {
      const curItem = appData.costi.find((c) => c.id === currentDetailId);
      if (curItem) renderDetailView(curItem);
    }
    showNotification("Immagine eliminata");
  }
}

/**
 * Crea e restituisce l'elemento DOM card per un Appunto.
 * @param {Object} item - Oggetto appunto da appData.notes.
 * @param {boolean} isInsideDetailView - True se renderizzato all'interno della vista dettaglio costo.
 * @returns {HTMLElement}
 */
function createNoteCardElement(item, isInsideDetailView = false) {
  const card = document.createElement("div");
  card.style.cssText =
    "background-color: var(--md-sys-color-surface-container-low); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);";

  const dateStr = item.date
    ? new Date(item.date).toLocaleDateString("it-IT")
    : "";

  // 1. Intestazione con Titolo, data e pulsanti modifica/elimina
  const headerDiv = document.createElement("div");
  headerDiv.style.cssText =
    "display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; flex-wrap: wrap;";
  headerDiv.innerHTML = `
      <div style="font-size: 16px; font-weight: 700; color: var(--md-sys-color-on-surface); margin-bottom: 4px;">${escapeHTML(item.title)}</div>
      <div style="display: flex; gap: 4px; align-items: center;">
          <span style="font-size: 12px; color: var(--md-sys-color-outline); margin-right: 8px;">${dateStr}</span>
          <button class="btn-icon" onclick="openEditNoteModal(${item.id})" title="Modifica"><span class="material-symbols-outlined">edit</span></button>
          <button class="btn-icon" onclick="deleteNoteItem(${item.id})" title="Elimina" style="color: var(--md-sys-color-error);"><span class="material-symbols-outlined">delete</span></button>
      </div>
  `;
  card.appendChild(headerDiv);

  // 1b. Badge Costi Casa collegati (se non siamo già dentro il dettaglio del costo)
  if (
    !isInsideDetailView &&
    Array.isArray(item.linkedCostIds) &&
    item.linkedCostIds.length > 0
  ) {
    const linkedCosts = item.linkedCostIds
      .map((cid) => (appData.costi || []).find((c) => c.id === Number(cid)))
      .filter(Boolean);
    if (linkedCosts.length > 0) {
      const linkedDiv = document.createElement("div");
      linkedDiv.className = "card-linked-costs";
      linkedDiv.innerHTML = linkedCosts
        .map(
          (cost) =>
            `<a class="card-linked-cost-badge" onclick="event.stopPropagation(); openDetailView(${cost.id});" title="Apri dettaglio costo: ${escapeHTML(cost.desc)}">
              <span class="material-symbols-outlined">euro</span>
              <span>${escapeHTML(cost.desc)}</span>
            </a>`,
        )
        .join("");
      card.appendChild(linkedDiv);
    }
  }

  // 2. Immagini collegate: posizionate esattamente tra il titolo e il testo
  if (item.images && item.images.length > 0) {
    const imgGrid = document.createElement("div");
    imgGrid.className = "note-images-grid";

    item.images.forEach((imgUrl, idx) => {
      const thumb = document.createElement("div");
      thumb.className = "note-image-thumb";
      thumb.title = "Clicca per ingrandire";
      thumb.onclick = () => openLightbox(item.images, idx);

      const img = document.createElement("img");
      img.src = imgUrl;
      img.alt = `Foto ${idx + 1}`;
      img.loading = "lazy";

      // Pulsante "X" in alto a destra per eliminare la singola immagine
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "note-image-delete-btn";
      delBtn.title = "Elimina immagine";
      delBtn.innerHTML = `<span class="material-symbols-outlined">close</span>`;
      delBtn.onclick = (e) => {
        deleteNoteImageDirect(item.id, idx, e);
      };

      thumb.appendChild(img);
      thumb.appendChild(delBtn);
      imgGrid.appendChild(thumb);
    });

    card.appendChild(imgGrid);
  }

  // 3. Testo dell'appunto
  if (item.content) {
    const contentDiv = document.createElement("div");
    contentDiv.style.cssText =
      "font-size: 15px; color: var(--md-sys-color-on-surface); margin-top: 6px; line-height: 1.5; white-space: pre-wrap;";
    contentDiv.innerHTML = renderRichContent(item.content, "notes", item.id, "content");
    card.appendChild(contentDiv);
  }

  return card;
}

function renderNoteSection() {
  const container = document.getElementById("notes-container");
  if (!container) return;
  container.innerHTML = "";

  if (!appData.notes || appData.notes.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--md-sys-color-outline); padding: 40px 16px;">
          <span class="material-symbols-outlined" style="font-size: 48px; opacity: 0.5;">edit_note</span>
          <p style="margin: 12px 0 0 0;">Nessun appunto presente. Clicca su "Aggiungi Appunto" per iniziare.</p>
      </div>
    `;
    return;
  }

  const groupedNotes = {};
  appData.notes.forEach((item) => {
    const category = item.category || "Generale Casa";
    if (!groupedNotes[category]) groupedNotes[category] = [];
    groupedNotes[category].push(item);
  });

  Object.keys(groupedNotes)
    .sort()
    .forEach((category) => {
      let catColor = "var(--md-sys-color-primary)";
      // Cerca se esiste un colore associato
      let foundCat = null;
      if (appData.settings && appData.settings.categories) {
        foundCat = Object.values(appData.settings.categories).find(
          (c) => c.name === category,
        );
        if (foundCat) catColor = foundCat.color;
      }

      const groupHeader = document.createElement("h3");
      groupHeader.style.cssText =
        "margin-top: 24px; margin-bottom: 12px; font-size: 18px; border-bottom: 1px solid var(--md-sys-color-outline-variant); padding-bottom: 8px; display: flex; align-items: center; gap: 8px;";
      groupHeader.innerHTML = `<span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: ${catColor};"></span>${category}`;
      container.appendChild(groupHeader);

      groupedNotes[category].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });

      groupedNotes[category].forEach((item) => {
        container.appendChild(createNoteCardElement(item, false));
      });
    });
}

let currentNoteLinkedCostIds = [];

function handleNoteAddLinkedCost(selectEl) {
  const val = parseInt(selectEl.value);
  if (!val) return;
  if (!currentNoteLinkedCostIds.includes(val)) {
    currentNoteLinkedCostIds.push(val);
    renderNoteLinkedCostsPreview();
  }
  selectEl.value = "";
}

function removeNoteLinkedCost(costId) {
  currentNoteLinkedCostIds = currentNoteLinkedCostIds.filter(
    (id) => id !== costId,
  );
  renderNoteLinkedCostsPreview();
}

function renderNoteLinkedCostsPreview() {
  const container = document.getElementById("note-modal-linked-costs-chips");
  renderLinkedCostsChips(
    container,
    currentNoteLinkedCostIds,
    removeNoteLinkedCost,
  );
  const select = document.getElementById("note-modal-linked-cost-select");
  populateLinkedCostSelect(select, currentNoteLinkedCostIds);
}

/**
 * Apre la modale per inserire un nuovo appunto.
 * @param {number|null} preselectedCostId - ID opzionale del costo da preselezionare.
 */
function openAddNoteModal(preselectedCostId = null) {
  document.getElementById("note-modal-id").value = "";
  document.getElementById("note-modal-header-title").innerText =
    "Nuovo Appunto";

  let sel = document.getElementById("note-modal-category");
  sel.innerHTML = "";

  let allCats = new Set([...(appData.settings.roomCategories || [])]);
  if (appData.settings.categories) {
    Object.keys(appData.settings.categories).forEach((c) => allCats.add(c));
  }
  let sortedCats = Array.from(allCats).sort((a, b) => a.localeCompare(b));

  sortedCats.forEach((cat) => {
    let opt = document.createElement("option");
    opt.value = cat;
    opt.innerText = cat;
    sel.appendChild(opt);
  });

  if (sortedCats.includes("Generale Casa")) {
    sel.value = "Generale Casa";
  } else if (sortedCats.length > 0) {
    sel.value = sortedCats[0];
  }

  document.getElementById("note-modal-title").value = "";
  setRichEditorHTML("note-modal-content", "");
  document.getElementById("note-btn-delete").style.display = "none";
  currentNoteImages = [];
  renderNoteModalImagesPreview();
  currentNoteLinkedCostIds = preselectedCostId
    ? [Number(preselectedCostId)]
    : [];
  renderNoteLinkedCostsPreview();
  openModalOverlay("noteModal");
}

function openEditNoteModal(id) {
  const item = appData.notes.find((t) => t.id === id);
  if (!item) return;
  document.getElementById("note-modal-id").value = id;
  document.getElementById("note-modal-header-title").innerText =
    "Modifica Appunto";

  let sel = document.getElementById("note-modal-category");
  sel.innerHTML = "";

  let allCats = new Set([...(appData.settings.roomCategories || [])]);
  if (appData.settings.categories) {
    Object.keys(appData.settings.categories).forEach((c) => allCats.add(c));
  }
  let sortedCats = Array.from(allCats).sort((a, b) => a.localeCompare(b));

  sortedCats.forEach((cat) => {
    let opt = document.createElement("option");
    opt.value = cat;
    opt.innerText = cat;
    sel.appendChild(opt);
  });

  sel.value = item.category || "Generale Casa";
  if (!sel.value && sortedCats.length > 0) sel.value = sortedCats[0];

  document.getElementById("note-modal-title").value = item.title || "";
  setRichEditorHTML("note-modal-content", item.content || "");
  document.getElementById("note-btn-delete").style.display = "flex";
  currentNoteImages = Array.isArray(item.images) ? [...item.images] : [];
  renderNoteModalImagesPreview();
  currentNoteLinkedCostIds = Array.isArray(item.linkedCostIds)
    ? [...item.linkedCostIds]
    : [];
  renderNoteLinkedCostsPreview();
  openModalOverlay("noteModal");
}

function closeNoteModal() {
  closeModalOverlay("noteModal");
  currentNoteImages = [];
  currentNoteLinkedCostIds = [];
  const preview = document.getElementById("note-modal-images-preview");
  if (preview) preview.innerHTML = "";
  const chips = document.getElementById("note-modal-linked-costs-chips");
  if (chips) chips.innerHTML = "";
}

function saveNoteModalChanges() {
  const idVal = document.getElementById("note-modal-id").value;
  const cat = document.getElementById("note-modal-category").value;
  const title = document.getElementById("note-modal-title").value.trim();
  const content = getRichEditorHTML("note-modal-content");

  if (!title) {
    showNotification("Inserisci un titolo per l'appunto", "", "error");
    return;
  }

  if (idVal) {
    const item = appData.notes.find((t) => t.id === parseInt(idVal));
    if (item) {
      item.category = cat;
      item.title = title;
      item.content = content;
      item.images = [...currentNoteImages];
      item.linkedCostIds = [...currentNoteLinkedCostIds];
    }
  } else {
    appData.notes.push({
      id: Date.now(),
      category: cat,
      title: title,
      content: content,
      images: [...currentNoteImages],
      linkedCostIds: [...currentNoteLinkedCostIds],
      date: new Date().toISOString(),
    });
  }
  closeNoteModal();
  saveDataLocally();
  renderNoteSection();
  if (currentDetailId !== null) {
    const curItem = appData.costi.find((c) => c.id === currentDetailId);
    if (curItem) renderDetailView(curItem);
  }
  showNotification("Appunto salvato");
}

async function deleteNoteItem(id) {
  const result = await showConfirm(
    "Eliminare questo appunto?",
    "Non sarà più possibile recuperarlo.",
  );
  if (result.isConfirmed) {
    appData.notes = appData.notes.filter((t) => t.id !== id);
    saveDataLocally();
    renderNoteSection();
    if (currentDetailId !== null) {
      const curItem = appData.costi.find((c) => c.id === currentDetailId);
      if (curItem) renderDetailView(curItem);
    }
    showNotification("Appunto eliminato");
  }
}

async function deleteNoteFromModal() {
  const idVal = document.getElementById("note-modal-id").value;
  if (!idVal) return;
  deleteNoteItem(parseInt(idVal));
  closeNoteModal();
}

/**
 * Apre la modale per configurare il link a Google Drive.
 */

function renderSectionGroup(container, titleText, iconName, itemsHtml, isLast) {
  let section = document.createElement("div");
  section.innerHTML = `
                <div class="gallery-section-title">
                    <span class="material-symbols-outlined" style="font-size: 20px; color: var(--md-sys-color-primary);">${iconName}</span>
                    <span>${titleText}</span>
                </div>
                <div class="gallery-grid">
                    ${itemsHtml}
                </div>
                ${!isLast ? '<hr class="gallery-divider">' : ""}
            `;
  container.appendChild(section);
}

/**
 * Esegue il rendering completo della vista Galleria raggruppando i file per tipologia e ambiente.
 */
function renderGalleryView() {
  const plansCard = document.getElementById("gallery-plans-card");
  const plansContainer = document.getElementById("gallery-plans-container");
  const rendersCard = document.getElementById("gallery-renders-card");
  const rendersContainer = document.getElementById("gallery-renders-container");
  const docsCard = document.getElementById("gallery-docs-card");
  const docsContainer = document.getElementById("gallery-docs-container");
  const emptyState = document.getElementById("gallery-empty-state");

  if (!rendersContainer) return;

  plansContainer.innerHTML = "";
  rendersContainer.innerHTML = "";
  docsContainer.innerHTML = "";

  const allItems = appData.settings.renders || [];
  if (allItems.length === 0) {
    plansCard.style.display = "none";
    rendersCard.style.display = "none";
    docsCard.style.display = "none";
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  const groupedPlans = {};
  const groupedRenders = {};
  const groupedDocs = {};

  allItems.forEach((item) => {
    const fileInfo = formatFileUrl(item.url);
    const isPdf = item.type === "pdf" || fileInfo.type === "pdf";
    const isPlan = item.type === "plan";
    const room = item.room || "Generale Casa";

    if (isPlan) {
      if (!groupedPlans[room]) groupedPlans[room] = [];
      groupedPlans[room].push({ ...item, fileInfo });
    } else if (isPdf) {
      if (!groupedDocs[room]) groupedDocs[room] = [];
      groupedDocs[room].push({ ...item, fileInfo });
    } else {
      if (!groupedRenders[room]) groupedRenders[room] = [];
      groupedRenders[room].push({ ...item, fileInfo });
    }
  });

  const planKeys = Object.keys(groupedPlans);
  if (planKeys.length > 0) {
    plansCard.style.display = "block";
    planKeys.forEach((roomName, idx) => {
      const items = groupedPlans[roomName];
      let itemsHtml = items
        .map(
          (item) => `
                        <div class="gallery-item" onclick="openLightbox('${item.fileInfo.url}')">
                            <img src="${item.fileInfo.url}" alt="${item.title}">
                            <span style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.65); color:#fff; font-size:12px; padding:6px 12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                ${item.title}
                            </span>
                        </div>
                    `,
        )
        .join("");
      renderSectionGroup(
        plansContainer,
        roomName,
        "straighten",
        itemsHtml,
        idx === planKeys.length - 1,
      );
    });
  } else {
    plansCard.style.display = "none";
  }

  let activeRooms = appData.settings.roomCategories.filter(
    (r) => groupedRenders[r] && groupedRenders[r].length > 0,
  );
  Object.keys(groupedRenders).forEach((r) => {
    if (!activeRooms.includes(r)) activeRooms.push(r);
  });

  if (activeRooms.length > 0) {
    rendersCard.style.display = "block";
    activeRooms.forEach((roomName, idx) => {
      const items = groupedRenders[roomName];
      let itemsHtml = items
        .map(
          (item) => `
                        <div class="gallery-item" onclick="openLightbox('${item.fileInfo.url}')">
                            <img src="${item.fileInfo.url}" alt="${item.title}">
                            <span style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.65); color:#fff; font-size:12px; padding:6px 12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                ${item.title}
                            </span>
                        </div>
                    `,
        )
        .join("");
      renderSectionGroup(
        rendersContainer,
        `Ambiente: ${roomName}`,
        "meeting_room",
        itemsHtml,
        idx === activeRooms.length - 1,
      );
    });
  } else {
    rendersCard.style.display = "none";
  }

  const docKeys = Object.keys(groupedDocs);
  if (docKeys.length > 0) {
    docsCard.style.display = "block";
    docKeys.forEach((roomName, idx) => {
      const items = groupedDocs[roomName];
      let itemsHtml = items
        .map(
          (item) => `
                        <div class="gallery-item pdf-card">
                            <span class="material-symbols-outlined" style="font-size: 38px;">picture_as_pdf</span>
                            <span style="font-weight: 500; font-size: 14px; margin-top: 4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width: 90%;">${item.title}</span>
                            <a href="${item.fileInfo.viewUrl || item.url}" target="_blank" class="btn btn-filled" style="height: 32px; font-size: 12px; padding: 0 16px; margin-top: 6px;">
                                Apri PDF
                            </a>
                        </div>
                    `,
        )
        .join("");
      renderSectionGroup(
        docsContainer,
        `Sezione: ${roomName}`,
        "folder",
        itemsHtml,
        idx === docKeys.length - 1,
      );
    });
  } else {
    docsCard.style.display = "none";
  }
}

/**
 * Funzione orchestratrice principale: pulisce i dati e aggiorna tutte le sezioni della dashboard.
 */
