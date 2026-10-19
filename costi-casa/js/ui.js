/**
 * ============================================================================== 
 * UI, TEMI, NOTIFICHE, MODALI & COMPONENTI CONDIVISI
 * ============================================================================== 
 */

function showNotification(title, text = "", icon = "success") {
  return Toast.fire({
    icon: icon,
    title: title,
    text: text,
  });
}

/**
 * Mostra una finestra modale di conferma per azioni distruttive (es. eliminazioni).
 * @param {string} title - Domanda o avviso principale.
 * @param {string} text - Descrizione delle conseguenze dell'azione.
 * @param {string} [confirmBtnText='Elimina'] - Etichetta del pulsante di conferma.
 * @returns {Promise<SweetAlertResult>} Risultato contenente `isConfirmed`.
 */
function showConfirm(title, text, confirmBtnText = "Elimina") {
  return M3Swal.fire({
    title: title,
    text: text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmBtnText,
    cancelButtonText: "Annulla",
    reverseButtons: true,
    customClass: {
      popup: "m3-swal-popup",
      title: "m3-swal-title",
      htmlContainer: "m3-swal-html",
      actions: "m3-swal-actions",
      confirmButton: "btn btn-error m3-swal-confirm",
      cancelButton: "btn btn-tonal m3-swal-cancel",
    },
  });
}

/**
 * Attiva o disattiva la modalità scura (Dark Mode) sul body dell'applicazione.
 * Salva la preferenza all'interno del localStorage.
 */
function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("casaDarkMode", isDark ? "true" : "false");
  updateThemeIcons(isDark);
}

/**
 * Aggiorna le icone della modalità chiara/scura sia nella vista Desktop che Mobile.
 * @param {boolean} isDark - True se la modalità scura è attiva, false altrimenti.
 */
function updateThemeIcons(isDark) {
  const icon = document.getElementById("theme-icon");
  const iconMobile = document.getElementById("theme-icon-mobile");
  const iconName = isDark ? "dark_mode" : "light_mode";
  if (icon) icon.innerText = iconName;
  if (iconMobile) iconMobile.innerText = iconName;
}

/**
 * Attiva o disattiva la modalità Privacy (nasconde importi sensibili).
 * Salva la preferenza solo in localStorage (non nel JSON / Gist).
 */
function togglePrivacyMode() {
  const isPrivacy = document.body.classList.toggle("privacy-mode");
  localStorage.setItem("casaPrivacyMode", isPrivacy ? "true" : "false");
  updatePrivacyIcons(isPrivacy);
}

function updatePrivacyIcons(isPrivacy) {
  const iconDesk = document.getElementById("privacy-icon-desktop");
  const iconMob = document.getElementById("privacy-icon-mobile");
  const iconName = isPrivacy ? "visibility_off" : "visibility";
  if (iconDesk) iconDesk.innerText = iconName;
  if (iconMob) iconMob.innerText = iconName;
}

function initPrivacyMode() {
  const isPrivacy = localStorage.getItem("casaPrivacyMode") === "true";
  if (isPrivacy) {
    document.body.classList.add("privacy-mode");
  } else {
    document.body.classList.remove("privacy-mode");
  }
  updatePrivacyIcons(isPrivacy);
}

/**
 * Apre o chiude il menu contestuale dropdown per dispositivi mobili.
 * @param {Event} [event] - Evento click scatenante.
 */
function toggleMobileMenu(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById("mobile-dropdown-menu");
  if (menu) menu.classList.toggle("active");
}

/**
 * Apre il Navigation Drawer laterale mobile.
 */
function openNavDrawer() {
  const drawer = document.getElementById("nav-drawer");
  const backdrop = document.getElementById("nav-drawer-backdrop");
  if (drawer && backdrop) {
    backdrop.style.display = "block";
    requestAnimationFrame(() => {
      backdrop.classList.add("active");
      drawer.classList.add("active");
    });
  }
}

/**
 * Chiude il Navigation Drawer laterale mobile.
 */
function closeNavDrawer() {
  const drawer = document.getElementById("nav-drawer");
  const backdrop = document.getElementById("nav-drawer-backdrop");
  if (drawer && backdrop) {
    drawer.classList.remove("active");
    backdrop.classList.remove("active");
    setTimeout(() => {
      if (!backdrop.classList.contains("active")) {
        backdrop.style.display = "none";
      }
    }, 280);
  }
}

/**
 * Alterna l'apertura/chiusura del Navigation Drawer laterale mobile.
 */
function toggleNavDrawer() {
  const drawer = document.getElementById("nav-drawer");
  if (drawer && drawer.classList.contains("active")) {
    closeNavDrawer();
  } else {
    openNavDrawer();
  }
}

// Listener globale: chiude il menu a tendina mobile se si clicca fuori dall'area del menu
document.addEventListener("click", function (e) {
  const menu = document.getElementById("mobile-dropdown-menu");
  if (menu && menu.classList.contains("active")) {
    if (!e.target.closest(".header-actions-mobile")) {
      menu.classList.remove("active");
    }
  }
});

// Listener globale per la pressione dei tasti: frecce per lightbox, ESC per chiusura modali
window.addEventListener("keydown", function (e) {
  const lightbox = document.getElementById("lightbox");
  if (lightbox && lightbox.classList.contains("active")) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      lightboxPrev();
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      lightboxNext();
      return;
    }
  }

  if (e.key === "Escape" || e.keyCode === 27) {
    closeNavDrawer();
    closeLightbox(null, true);
    closeModal();
    closeQAModal();
    let driveModal = document.getElementById("driveModal");
    if (driveModal) driveModal.classList.remove("active");
    let catModal = document.getElementById("catModal");
    if (catModal) catModal.classList.remove("active");
    let menu = document.getElementById("mobile-dropdown-menu");
    if (menu) menu.classList.remove("active");
  }
});

/**
 * Analizza e normalizza gli URL (inclusi link diretti o condivisioni di Google Drive).
 * @param {string|Object} urlInput - Stringa URL o oggetto contenente proprietà URL.
 * @returns {{type: string, url: string, rawUrl: string, viewUrl: string}} Dati normalizzati del file.
 */
function formatFileUrl(urlInput) {
  let url = "";
  if (typeof urlInput === "string") {
    url = urlInput;
  } else if (urlInput && typeof urlInput === "object") {
    url = urlInput.url || urlInput.viewUrl || urlInput.rawUrl || "";
  }
  if (!url || typeof url !== "string")
    return { type: "unknown", url: "", rawUrl: "", viewUrl: "" };

  if (url.startsWith("data:image/")) {
    return { type: "image", url: url, rawUrl: url, viewUrl: url };
  }
  if (url.startsWith("data:application/pdf")) {
    return { type: "pdf", url: url, rawUrl: url, viewUrl: url };
  }

  let fileId = null;
  // Estrazione dell'ID file di Google Drive da pattern classici
  let match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) fileId = match[1];
  if (!fileId) {
    match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) fileId = match[1];
  }
  if (!fileId) {
    match = url.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) fileId = match[1];
  }

  if (fileId) {
    // Riconoscimento file PDF su Google Drive
    if (
      url.toLowerCase().includes("pdf") ||
      url.toLowerCase().includes("document")
    ) {
      return {
        type: "pdf",
        viewUrl: `https://drive.google.com/file/d/${fileId}/view`,
        rawUrl: url,
        url: `https://drive.google.com/file/d/${fileId}/view`,
      };
    }
    // Trasformazione in thumbnail ad alta risoluzione per immagini Drive
    return {
      type: "image",
      url: `https://drive.google.com/thumbnail?id=${fileId}&sz=w2560`,
      rawUrl: url,
      viewUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w2560`,
    };
  }
  if (url.toLowerCase().endsWith(".pdf")) {
    return { type: "pdf", viewUrl: url, rawUrl: url, url: url };
  }
  return { type: "image", url: url, rawUrl: url, viewUrl: url };
}


function saveHeroImage() {
  let urlInput = document.getElementById("hero-image-url");
  if (!urlInput) return;
  let url = urlInput.value;
  appData.settings.heroImage =
    formatFileUrl(url).url || formatFileUrl(url).rawUrl;
  urlInput.value = appData.settings.heroImage;
  saveDataLocally();
  renderHeroImage();
  showNotification("Immagine copertina salvata!");
}

/**
 * Gestisce l'upload diretto di una foto per la copertina della Home da PC o smartphone.
 * @param {Event} event - Evento change dell'input file.
 */
async function handleHeroPhotoUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  try {
    const compressedUrl = await compressImageFile(file, 1920, 1080, 0.82);
    appData.settings.heroImage = compressedUrl;
    const urlInput = document.getElementById("hero-image-url");
    if (urlInput) urlInput.value = compressedUrl;
    saveDataLocally();
    renderHeroImage();
    showNotification("Foto di copertina salvata con successo!");
  } catch (err) {
    console.error("Errore caricamento copertina:", err);
    showNotification("Errore caricamento", "Impossibile elaborare l'immagine", "error");
  } finally {
    event.target.value = "";
  }
}

/**
 * Gestisce l'upload di una foto per render o piantine da PC o smartphone.
 * @param {Event} event - Evento change dell'input file.
 */

function openDriveModal() {
  let driveInput = document.getElementById("drive-url-input");
  let settingsDriveInput = document.getElementById("settings-drive-url");
  let val = appData.settings.driveLink || "";
  if (driveInput) driveInput.value = val;
  if (settingsDriveInput) settingsDriveInput.value = val;
  let driveModal = document.getElementById("driveModal");
  if (driveModal) driveModal.classList.add("active");
}

/**
 * Salva il link di Google Drive all'interno delle impostazioni.
 */
function saveDriveLink() {
  let driveInput = document.getElementById("drive-url-input");
  let settingsDriveInput = document.getElementById("settings-drive-url");
  let url =
    driveInput && driveInput.value.trim() !== ""
      ? driveInput.value.trim()
      : settingsDriveInput && settingsDriveInput.value.trim() !== ""
        ? settingsDriveInput.value.trim()
        : "";

  appData.settings.driveLink = url;
  let driveModal = document.getElementById("driveModal");
  if (driveModal) driveModal.classList.remove("active");

  saveDataLocally();
  showNotification("Link Drive salvato!");
}

/**
 * Gestisce l'ordinamento dinamico delle tabelle per colonna.
 * @param {'costi'|'budget'} table - Nome della tabella.
 * @param {string} column - Chiave del campo da ordinare.
 */

function renderHeaderAndSettings() {
  const btnDrive = document.getElementById("btn-drive-link");
  const btnDriveMobile = document.getElementById("btn-drive-link-mobile");
  if (btnDrive) {
    if (appData.settings.driveLink) {
      btnDrive.style.display = "inline-flex";
      btnDrive.href = appData.settings.driveLink;
      if (btnDriveMobile) {
        btnDriveMobile.style.display = "flex";
        btnDriveMobile.href = appData.settings.driveLink;
      }
    } else {
      btnDrive.style.display = "none";
      if (btnDriveMobile) btnDriveMobile.style.display = "none";
    }
  }

  let driveUrlInput = document.getElementById("settings-drive-url");
  if (driveUrlInput) driveUrlInput.value = appData.settings.driveLink || "";

  let ghEnabled = document.getElementById("settings-github-enabled");
  let ghToken = document.getElementById("settings-github-token");
  let ghGistId = document.getElementById("settings-github-gistId");
  if (ghEnabled && casaGithubConfig) {
    ghEnabled.checked = casaGithubConfig.enabled || false;
    ghToken.value = casaGithubConfig.token || "";
    ghGistId.value = casaGithubConfig.gistId || "";

    let ghLink = document.getElementById("link-to-my-gist");
    if (ghLink) {
      if (casaGithubConfig.gistId) {
        ghLink.href = `https://gist.github.com/${casaGithubConfig.gistId}`;
        ghLink.style.display = "inline-flex";
      } else {
        ghLink.style.display = "none";
      }
    }

    toggleGithubSettings();
  }

  const hero = document.getElementById("hero-header");
  if (hero) {
    if (
      appData.settings.heroImage &&
      document.getElementById("view-riepilogo")?.classList.contains("active")
    ) {
      hero.style.backgroundImage = `url('${appData.settings.heroImage}')`;
      hero.style.display = "block";
    } else {
      hero.style.display = "none";
    }
  }

  let heroInput = document.getElementById("hero-image-url");
  if (heroInput && !heroInput.value)
    heroInput.value = appData.settings.heroImage || "";

  const roomSelect = document.getElementById("new-render-room");
  if (roomSelect) {
    roomSelect.innerHTML = appData.settings.roomCategories
      .map((r) => `<option value="${r}">${r}</option>`)
      .join("");
  }

  const roomsContainer = document.getElementById("rooms-container");
  if (roomsContainer) {
    roomsContainer.innerHTML = "";
    appData.settings.roomCategories.forEach((r, idx) => {
      const badge = document.createElement("div");
      badge.className = "cat-badge";
      badge.style.backgroundColor =
        "var(--md-sys-color-surface-container-high)";
      badge.style.color = "var(--md-sys-color-on-surface)";
      badge.style.display = "inline-flex";
      badge.style.alignItems = "center";
      badge.style.gap = "6px";
      badge.innerHTML = `<span>${r}</span>`;
      if (appData.settings.roomCategories.length > 1) {
        badge.innerHTML += `<span class="material-symbols-outlined" style="font-size: 14px; cursor: pointer; opacity: 0.6;" onclick="removeRoomCategory(${idx})">close</span>`;
      }
      roomsContainer.appendChild(badge);
    });
  }

  const settingsGallery = document.getElementById("settings-gallery-edit");
  if (settingsGallery) {
    settingsGallery.innerHTML = "";
    if (appData.settings.renders && appData.settings.renders.length > 0) {
      appData.settings.renders.forEach((item, i) => {
        let fileInfo = formatFileUrl(item.url);
        let isPdf = item.type === "pdf" || fileInfo.type === "pdf";
        let isPlan = item.type === "plan";

        let divEdit = document.createElement("div");
        divEdit.className =
          "gallery-item gallery-item-edit" + (isPdf ? " gallery-item-pdf" : "");
        if (isPdf) {
          divEdit.innerHTML = `
                                <span class="material-symbols-outlined" style="font-size:28px;">picture_as_pdf</span> 
                                <b style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:85%; text-align:center; font-size:12px;">${item.title}</b>
                                <small style="opacity:0.8; font-size:11px;">Documento PDF</small>
                                <button class="delete-btn" onclick="removeRender(${i})"><span class="material-symbols-outlined" style="font-size: 18px;">close</span></button>
                            `;
        } else {
          let badgeTag = isPlan ? "Piantina" : item.room;
          divEdit.innerHTML = `
                                <img src="${fileInfo.url}" alt="${item.title}">
                                <span style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.65); color:#fff; font-size:11px; padding:4px 8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                    ${item.title} (${badgeTag})
                                </span>
                                <button class="delete-btn" onclick="removeRender(${i})"><span class="material-symbols-outlined" style="font-size: 18px;">close</span></button>
                            `;
        }
        settingsGallery.appendChild(divEdit);
      });
    }
  }

  renderGalleryView();

  const catContainer = document.getElementById("categories-container");
  if (catContainer) {
    catContainer.innerHTML = "";
    Object.keys(appData.settings.categories)
      .sort()
      .forEach((cat) => {
        const catObj = appData.settings.categories[cat];
        const color = typeof catObj === "string" ? catObj : catObj.color;
        const isImmobile = typeof catObj === "object" && !!catObj.isImmobile;
        const textColor = getContrastYIQ(color);
        let el = document.createElement("div");
        el.className = "cat-badge";
        el.style.backgroundColor = color;
        el.style.color = textColor;
        el.style.cursor = "pointer";
        el.style.fontSize = "14px";
        el.style.padding = "8px 16px";
        el.title = "Clicca per modificare";
        el.innerHTML = `${cat}${isImmobile ? " 🏠" : ""} <span class="material-symbols-outlined" style="font-size: 14px; vertical-align: middle; margin-left:4px; opacity: 0.7;">edit</span>`;
        el.onclick = () => openEditCatModal(cat);
        catContainer.appendChild(el);
      });
  }

  settingsUsers = JSON.parse(JSON.stringify(appData.settings.users));
  renderSettingsUsers();
}

/**
 * Genera il blocco HTML per un gruppo di elementi della galleria (Piantine, Render, PDF).
 * @param {HTMLElement} container - Elemento contenitore di destinazione.
 * @param {string} titleText - Titolo della sezione o dell'ambiente.
 * @param {string} iconName - Nome dell'icona Material Symbols.
 * @param {string} itemsHtml - Stringa HTML delle card dei file.
 * @param {boolean} isLast - Indica se è l'ultimo elemento per omettere il divider.
 */

function renderSettingsUsers() {
  const container = document.getElementById("settings-users-container");
  if (!container) return;
  container.innerHTML = "";
  settingsUsers.forEach((u, idx) => {
    let div = document.createElement("div");
    div.className = "user-config-card";
    div.innerHTML = `
                    <div class="user-config-row">
                        <div class="input-field">
                            <label>Nome Partecipante</label>
                            <input type="text" value="${u.name}" placeholder="Es. Nome" oninput="settingsUsers[${idx}].name = this.value">
                        </div>
                        <div class="input-field">
                            <label>Quota (%)</label>
                            <input type="number" value="${u.share}" placeholder="50" oninput="settingsUsers[${idx}].share = parseFloat(this.value)||0">
                        </div>
                        <div class="input-field">
                            <label>Fondo Sicurezza (€)</label>
                            <input type="number" value="${u.safetyFund !== undefined ? u.safetyFund : 5000}" placeholder="5000" oninput="settingsUsers[${idx}].safetyFund = parseFloat(this.value)||0">
                        </div>
                        ${
                          settingsUsers.length > 1
                            ? `
                            <button type="button" class="btn btn-error user-config-delete-btn" onclick="removeSettingsUser(${idx})" title="Rimuovi ${u.name}">
                                <span class="material-symbols-outlined">delete</span>
                            </button>
                        `
                            : ""
                        }
                    </div>
                `;
    container.appendChild(div);
  });
}

/**
 * Aggiunge un partecipante nel form delle impostazioni.
 */
function addSettingsUser() {
  let newId = "u" + Date.now();
  settingsUsers.push({
    id: newId,
    name: "Nuovo",
    share: 0,
    safetyFund: 5000,
  });
  renderSettingsUsers();
}

/**
 * Rimuove un partecipante dalle impostazioni previa conferma.
 * @param {number} idx - Indice del partecipante.
 */
async function removeSettingsUser(idx) {
  const user = settingsUsers[idx];
  const result = await showConfirm(
    `Rimuovere ${user.name}?`,
    "I dati relativi a questo partecipante verranno modificati.",
  );
  if (result.isConfirmed) {
    settingsUsers.splice(idx, 1);
    renderSettingsUsers();
  }
}

/**
 * Salva le modifiche apportate ai partecipanti nelle impostazioni.
 */
function saveSettingsUsers() {
  appData.settings.users = [...settingsUsers];
  saveDataLocally();
  showNotification("Partecipanti aggiornati!");
}

/**
 * Ricostruisce dinamicamente i campi di input nei form e nelle tabelle in base al numero di utenti attivi.
 */

function handleDragStart(e, index, type) {
  draggedIndex = index;
  draggedType = type;
  e.target.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

/**
 * Previene il comportamento di default durante il trascinamento per consentire il drop.
 * @param {DragEvent} e - Evento di dragover.
 */
function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

/**
 * Gestisce il rilascio (drop) della riga riordinando l'array sottostante.
 * @param {DragEvent} e - Evento di drop.
 * @param {number} targetIndex - Nuovo indice di destinazione.
 * @param {'costi'|'budget'} type - Tipo di collezione.
 */
function handleDrop(e, targetIndex, type) {
  e.preventDefault();
  if (
    draggedType !== type ||
    draggedIndex === null ||
    draggedIndex === targetIndex
  )
    return;

  let list = type === "costi" ? appData.costi : appData.budget;
  let item = list.splice(draggedIndex, 1)[0];
  list.splice(targetIndex, 0, item);

  draggedIndex = null;
  draggedType = null;
  saveDataLocally();
}

/**
 * Pulisce lo stato visivo al termine del trascinamento.
 * @param {DragEvent} e - Evento di dragend.
 */
function handleDragEnd(e) {
  e.target.classList.remove("dragging");
  e.target.setAttribute("draggable", "false");
  draggedIndex = null;
  draggedType = null;
}

/**
 * Esporta lo stato dell'applicazione generando un file JSON scaricabile con timestamp.
 */

function formatCurrency(num) {
  return `<span class="sensitive-value">${formatter.format(num || 0)}</span>`;
}

/**
 * Formatta una valuta applicando il colore verde per valori positivi e rosso per negativi.
 * @param {number} num - Valore da formattare.
 * @returns {string} Stringa HTML formattata.
 */
function formatColoredCurrency(num) {
  let val = num || 0;
  let formatted = formatter.format(val);
  if (val > 0)
    return `<span class="sensitive-value" style="color: var(--md-sys-color-success); font-weight: 500;">${formatted}</span>`;
  if (val < 0)
    return `<span class="sensitive-value" style="color: var(--md-sys-color-error); font-weight: 500;">${formatted}</span>`;
  return `<span class="sensitive-value">${formatted}</span>`;
}

/**
 * Formatta l'importo restante evidenziando in verde se saldato (<=0) o in rosso se da pagare.
 * @param {number} num - Importo residuo.
 * @returns {string} Stringa HTML formattata.
 */
function formatRestanteCurrency(num) {
  let val = num || 0;
  let formatted = formatter.format(val);
  if (val <= 0)
    return `<span class="sensitive-value" style="color: var(--md-sys-color-success); font-weight: 500;">${formatted}</span>`;
  return `<span class="sensitive-value" style="color: var(--md-sys-color-error); font-weight: 500;">${formatted}</span>`;
}

/**
 * Arrotonda l'input numerico a 2 cifre decimali all'evento di blur.
 * @param {HTMLInputElement} element - Elemento input.
 */
function roundInput(element) {
  if (element.value !== "")
    element.value = parseFloat(element.value).toFixed(2);
}

/**
 * Calcola la luminosità di un colore HEX per determinare se usare testo bianco o nero (contrasto YIQ).
 * @param {string} hexcolor - Colore in formato esadecimale (es. #6750A4).
 * @returns {string} Colore HEX per il testo (#141218 o #FFFFFF).
 */
function getContrastYIQ(hexcolor) {
  hexcolor = hexcolor.replace("#", "");
  var r = parseInt(hexcolor.substr(0, 2), 16);
  var g = parseInt(hexcolor.substr(2, 2), 16);
  var b = parseInt(hexcolor.substr(4, 2), 16);
  var yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#141218" : "#FFFFFF";
}

/**
 * Gestisce la navigazione a schede aggiornando lo stato attivo di menu, indicatori e viste.
 * @param {string} tabId - Identificatore della scheda (es. 'riepilogo', 'costi', 'mutuo').
 * @param {string} pageTitle - Titolo testuale visualizzato nell'header.
 */
function switchTab(tabId, pageTitle) {
  document
    .querySelectorAll(".nav-item")
    .forEach((el) => el.classList.remove("active"));
  document
    .querySelectorAll(".mobile-nav-item")
    .forEach((el) => el.classList.remove("active"));
  document
    .querySelectorAll(".nav-drawer-item")
    .forEach((el) => el.classList.remove("active"));

  let activeTabDesktop = document.getElementById("tab-" + tabId + "-desktop");
  let activeTabMobile = document.getElementById("tab-" + tabId + "-mobile");
  let activeDrawer = document.getElementById("drawer-item-" + tabId);
  if (activeTabDesktop) activeTabDesktop.classList.add("active");
  if (activeTabMobile) activeTabMobile.classList.add("active");
  if (activeDrawer) activeDrawer.classList.add("active");

  document
    .querySelectorAll(".view-section")
    .forEach((el) => el.classList.remove("active"));
  let activeView = document.getElementById("view-" + tabId);
  if (activeView) activeView.classList.add("active");

  const mainContainer = document.getElementById("main-scroll-container");
  if (mainContainer) mainContainer.scrollTop = 0;

  if (pageTitle) {
    document.title = pageTitle + " | Costi Casa";
    const titleEl = document.getElementById("page-main-title");
    if (titleEl) {
      titleEl.innerText = pageTitle;
    }
  }

  const hero = document.getElementById("hero-header");
  if (hero) {
    if (
      tabId === "riepilogo" &&
      appData.settings &&
      appData.settings.heroImage
    ) {
      hero.style.backgroundImage = `url('${appData.settings.heroImage}')`;
      hero.style.display = "block";
    } else {
      hero.style.display = "none";
    }
  }

  // Timeout per ridimensionare correttamente i grafici Chart.js al cambio tab
  setTimeout(() => {
    if (tabId === "riepilogo") {
      if (barChartInstance) barChartInstance.resize();
      if (pieChartInstance) pieChartInstance.resize();
    } else if (tabId === "categorie") {
      if (catBarChartInstance) catBarChartInstance.resize();
    } else if (tabId === "mutuo") {
      calculateMortgage();
    } else if (tabId === "qa") {
      renderQASection();
    } else if (tabId === "savings") {
      renderSavingsSection();
    } else if (tabId === "debiti") {
      renderDebitiSection();
    }
  }, 50);
}

let currentLightboxImages = [];
let currentLightboxIndex = 0;

/**
 * Apre il Lightbox a schermo intero per visualizzare una o più immagini ad alta risoluzione.
 * @param {string|string[]} imagesOrUrl - Singolo URL o array di URL.
 * @param {number} [startIndex=0] - Indice dell'immagine iniziale.
 */
function openLightbox(imagesOrUrl, startIndex = 0) {
  if (Array.isArray(imagesOrUrl)) {
    currentLightboxImages = imagesOrUrl
      .map((item) =>
        typeof item === "string" ? item : item && item.url ? item.url : "",
      )
      .filter(Boolean);
    currentLightboxIndex = Math.max(
      0,
      Math.min(startIndex, currentLightboxImages.length - 1),
    );
  } else if (typeof imagesOrUrl === "string" && imagesOrUrl) {
    currentLightboxImages = [imagesOrUrl];
    currentLightboxIndex = 0;
  } else {
    currentLightboxImages = [];
    currentLightboxIndex = 0;
  }

  updateLightboxDisplay();
  const lightbox = document.getElementById("lightbox");
  if (lightbox) lightbox.classList.add("active");
}

/**
 * Aggiorna immagine visibile, contatore e visibilità freccette nel Lightbox.
 * La freccia sinistra scompare se siamo sulla prima immagine, la destra se siamo sull'ultima.
 */
function updateLightboxDisplay() {
  const imgElem = document.getElementById("lightbox-image");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");
  const counterElem = document.getElementById("lightbox-counter");

  if (!currentLightboxImages || currentLightboxImages.length === 0) {
    if (imgElem) imgElem.src = "";
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
    if (counterElem) counterElem.style.display = "none";
    return;
  }

  const currentUrl = currentLightboxImages[currentLightboxIndex] || "";
  if (imgElem) {
    imgElem.src = currentUrl;
  }

  const total = currentLightboxImages.length;
  if (total > 1) {
    if (counterElem) {
      counterElem.innerText = `${currentLightboxIndex + 1} / ${total}`;
      counterElem.style.display = "block";
    }
    if (prevBtn) {
      prevBtn.style.display = currentLightboxIndex > 0 ? "flex" : "none";
    }
    if (nextBtn) {
      nextBtn.style.display =
        currentLightboxIndex < total - 1 ? "flex" : "none";
    }
  } else {
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
    if (counterElem) counterElem.style.display = "none";
  }
}

function lightboxPrev(event) {
  if (event) event.stopPropagation();
  if (currentLightboxIndex > 0) {
    currentLightboxIndex--;
    updateLightboxDisplay();
  }
}

function lightboxNext(event) {
  if (event) event.stopPropagation();
  if (currentLightboxIndex < currentLightboxImages.length - 1) {
    currentLightboxIndex++;
    updateLightboxDisplay();
  }
}

/**
 * Chiude il lightbox a schermo intero.
 * @param {Event} [event] - Evento click.
 * @param {boolean} [force=false] - Se true, forza la chiusura.
 */
function closeLightbox(event, force = false) {
  if (
    force ||
    (event &&
      (event.target.id === "lightbox" ||
        event.target.closest(".lightbox-close")))
  ) {
    const lightbox = document.getElementById("lightbox");
    if (lightbox) lightbox.classList.remove("active");
    setTimeout(() => {
      const imgElem = document.getElementById("lightbox-image");
      if (imgElem) imgElem.src = "";
      currentLightboxImages = [];
      currentLightboxIndex = 0;
      const prevBtn = document.getElementById("lightbox-prev");
      const nextBtn = document.getElementById("lightbox-next");
      const counterElem = document.getElementById("lightbox-counter");
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
      if (counterElem) counterElem.style.display = "none";
    }, 200);
  }
}

// Supporto swipe per scorrere le immagini del Lightbox da mobile
(function initLightboxTouchSwipe() {
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  function attachSwipeListener() {
    const lightbox = document.getElementById("lightbox");
    if (!lightbox) return;

    lightbox.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches && e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchEndX = touchStartX;
          touchEndY = touchStartY;
        }
      },
      { passive: true },
    );

    lightbox.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches && e.touches.length === 1) {
          touchEndX = e.touches[0].clientX;
          touchEndY = e.touches[0].clientY;
        }
      },
      { passive: true },
    );

    lightbox.addEventListener(
      "touchend",
      () => {
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        if (Math.abs(dx) > 40 && Math.abs(dy) < 75) {
          if (dx < 0) {
            lightboxNext();
          } else {
            lightboxPrev();
          }
        }
      },
      { passive: true },
    );
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", attachSwipeListener);
  } else {
    attachSwipeListener();
  }
})();

/**
 * Aggiunge una nuova categoria di spesa con colore associato e flag immobile.
 */

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
const escapeHtml = escapeHTML;

/** ID della voce costo attualmente visualizzata nel dettaglio */
let currentDetailId = null;

/**
 * Calcola la somma dei pagamenti registrati formalmente per una voce di costo.
 * @param {Object} item - Voce costo.
 * @returns {number} Somma totale registrata nei pagamenti.
 */

function initTableViewMode() {
  updateTableViewModeUI();
}

/**
 * Imposta la modalità di visualizzazione tabelle e la salva in localStorage.
 * @param {'cards'|'table'} mode - 'cards' per Schede mobile senza scroll, 'table' per Tabella classica.
 */
function setTableViewMode(mode) {
  try {
    localStorage.setItem("table_view_mode", mode);
  } catch (e) {
    console.warn("Impossibile salvare preferenza vista:", e);
  }
  updateTableViewModeUI();
  showNotification(
    mode === "cards"
      ? "Vista Schede attiva (ottimizzata mobile)"
      : "Vista Tabella classica attiva",
  );
}

/**
 * Aggiorna le classi del body e i bottoni toggle per la vista tabelle.
 */
function updateTableViewModeUI() {
  let mode = "cards";
  try {
    const saved = localStorage.getItem("table_view_mode");
    if (saved === "table" || saved === "cards") mode = saved;
  } catch (e) {}

  if (mode === "cards") {
    document.body.classList.add("mobile-table-as-cards");
    document.body.classList.remove("mobile-table-as-table");
  } else {
    document.body.classList.remove("mobile-table-as-cards");
    document.body.classList.add("mobile-table-as-table");
  }

  document.querySelectorAll(".table-view-toggle .btn-toggle").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === mode);
  });
}

/**
 * Esegue il rendering delle tabelle Costi e Budget gestendo ordinamento, eventi Drag & Drop e badge.
 */
