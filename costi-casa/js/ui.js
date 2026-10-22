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
  openModalOverlay("driveModal");
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
  closeModalOverlay("driveModal");

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

  document.querySelectorAll(".version-number, #drawer-version-badge").forEach((el) => {
    el.textContent = `v${APP_VERSION}`;
  });
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
    } else if (tabId === "settings") {
      if (window.innerWidth <= 768) {
        showSettingsMasterList();
      } else {
        // Su schermi tablet/desktop, assicura che una sezione sia attiva nella sidebar
        const hasActive = document.querySelector(".settings-nav-item.active");
        if (!hasActive) {
          const firstNav = document.querySelector(".settings-nav-item");
          if (firstNav) {
            const sec = firstNav.getAttribute("data-section") || "users";
            switchSettingsSection(sec);
          }
        }
      }
    }
  }, 50);
}

/**
 * Gestisce il cambio di sezione attiva nel pannello Impostazioni (Tablet Master-Detail & Mobile drill-down).
 * @param {'users'|'categories'|'rooms'|'media'|'drive'|'backup'} sectionKey
 */
function switchSettingsSection(sectionKey) {
  const sectionTitles = {
    users: "Utenti & Fondo",
    categories: "Categorie Spese",
    rooms: "Ambienti Casa",
    media: "Media & Render",
    drive: "Documenti Condivisi",
    backup: "Dati & Backup",
  };

  // Aggiorna gli elementi della lista / sidebar
  document.querySelectorAll(".settings-nav-item").forEach((btn) => {
    if (btn.getAttribute("data-section") === sectionKey) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Aggiorna i pannelli di contenuto
  document.querySelectorAll(".settings-section-panel").forEach((panel) => {
    if (panel.id === `settings-panel-${sectionKey}`) {
      panel.classList.add("active");
    } else {
      panel.classList.remove("active");
    }
  });

  // Aggiorna il titolo sulla top bar mobile
  const mobileTitle = document.getElementById("settings-mobile-current-title");
  if (mobileTitle && sectionTitles[sectionKey]) {
    mobileTitle.textContent = sectionTitles[sectionKey];
  }

  // Su schermi mobile (< 769px), attiva la visualizzazione della sezione dettaglio
  const layout = document.getElementById("settings-layout");
  if (layout) {
    layout.classList.add("mobile-detail-open");
  }

  // Riporta lo scroll in cima
  const mainContainer = document.getElementById("main-scroll-container");
  if (mainContainer) {
    mainContainer.scrollTop = 0;
  }
}

/**
 * Torna all'elenco principale delle sezioni delle impostazioni (per dispositivi mobili).
 */
function showSettingsMasterList() {
  const layout = document.getElementById("settings-layout");
  if (layout) {
    layout.classList.remove("mobile-detail-open");
  }
  // Su mobile, rimuove la classe active dai pulsanti della lista
  if (window.innerWidth <= 768) {
    document.querySelectorAll(".settings-nav-item").forEach((btn) => {
      btn.classList.remove("active");
    });
  }
  const mainContainer = document.getElementById("main-scroll-container");
  if (mainContainer) {
    mainContainer.scrollTop = 0;
  }
}

// Esporta esplicitamente sullo scope globale window
window.switchSettingsSection = switchSettingsSection;
window.showSettingsMasterList = showSettingsMasterList;

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
 * ============================================================================== 
 * EDITOR DI TESTO FORMATTATO (RICH TEXT) - v1.9.28
 * ============================================================================== 
 */

/**
 * Pulisce il codice HTML per evitare vulnerabilità XSS mantenendo la formattazione sicura.
 * @param {string} html - Stringa HTML da ripulire.
 * @returns {string} HTML sanificato.
 */
function sanitizeRichHTML(html) {
  if (!html) return "";
  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Rimozione tag non ammessi / potenzialmente pericolosi
  const dangerous = temp.querySelectorAll(
    "script, iframe, object, embed, style, link, meta, form, input:not([type='checkbox']), button"
  );
  dangerous.forEach((n) => n.remove());

  // Pulizia attributi non sicuri (es. on*)
  const allElements = temp.querySelectorAll("*");
  allElements.forEach((el) => {
    const attrs = Array.from(el.attributes);
    for (const attr of attrs) {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on")) {
        el.removeAttribute(attr.name);
      } else if (name === "href" || name === "src") {
        if (/^\s*javascript:/i.test(attr.value)) {
          el.removeAttribute(attr.name);
        }
      }
    }
  });

  return temp.innerHTML;
}

/**
 * Restituisce il contenuto formattato HTML da un editor contenteditable.
 * @param {string} editorId - ID dell'elemento contenteditable.
 * @returns {string} Stringa HTML o vuota.
 */
function getRichEditorHTML(editorId) {
  const el = document.getElementById(editorId);
  if (!el) return "";
  const textOnly = el.textContent.trim();
  if (!textOnly && !el.querySelector("img, hr, input")) {
    return "";
  }
  const temp = document.createElement("div");
  temp.innerHTML = el.innerHTML.trim();
  temp.querySelectorAll('.rich-checklist input[type="checkbox"]').forEach((cb) => {
    if (cb.checked) {
      cb.setAttribute("checked", "checked");
    } else {
      cb.removeAttribute("checked");
    }
    cb.removeAttribute("disabled");
  });
  return sanitizeRichHTML(temp.innerHTML);
}

/**
 * Verifica se una stringa contiene tag HTML di formattazione rich text supportati.
 * @param {string} str - Stringa da analizzare.
 * @returns {boolean} True se contiene tag di formattazione.
 */
function isRichHTML(str) {
  if (!str) return false;
  return /<(\/)?(p|div|br|b|strong|i|em|u|s|strike|del|h[1-6]|small|mark|ul|ol|li|blockquote|font|span|a|table|tbody|thead|tfoot|tr|th|td)\b/i.test(String(str));
}

/**
 * Popola un editor contenteditable con HTML o testo piano.
 * @param {string} editorId - ID dell'elemento contenteditable.
 * @param {string} htmlOrText - Contenuto da inserire.
 */
function setRichEditorHTML(editorId, htmlOrText) {
  const el = document.getElementById(editorId);
  if (!el) return;
  if (htmlOrText === null || htmlOrText === undefined) {
    el.innerHTML = "";
    updateRichToolbarActiveStates(el);
    return;
  }
  const str = String(htmlOrText);
  if (!str.trim()) {
    el.innerHTML = "";
    updateRichToolbarActiveStates(el);
    return;
  }
  if (isRichHTML(str)) {
    el.innerHTML = sanitizeRichHTML(str);
    el.querySelectorAll('.rich-checklist input[type="checkbox"]').forEach((cb) => {
      cb.disabled = true;
    });
  } else {
    el.innerHTML = escapeHTML(str).replace(/\r\n/g, "<br>").replace(/\n/g, "<br>");
  }
  updateRichToolbarActiveStates(el);
}

/**
 * Renderizza il testo formattato (o legacy) in una card con checklist interattive.
 * @param {string} content - Contenuto HTML o testo piano.
 * @param {string} [itemType=''] - Tipo di elemento ('qa', 'tasks', 'notes', 'costi', 'budget', 'debiti', 'savings').
 * @param {number} [itemId=0] - ID dell'elemento genitore.
 * @param {string} [fieldName=''] - Nome del campo ('question', 'answer', 'desc', 'content', 'note', 'payment').
 * @returns {string} Stringa HTML renderizzata.
 */
function renderRichContent(content, itemType = "", itemId = 0, fieldName = "") {
  if (content === null || content === undefined) return "";
  const str = String(content);
  if (!str.trim()) return "";

  const isHtml = isRichHTML(str);
  let cleanHTML = "";
  if (isHtml) {
    cleanHTML = sanitizeRichHTML(str);
  } else {
    cleanHTML = escapeHTML(str).replace(/\r\n/g, "<br>").replace(/\n/g, "<br>");
  }

  const container = document.createElement("div");
  container.className = "rich-text-rendered" + (isHtml ? "" : " rich-text-plain");
  container.innerHTML = cleanHTML;

  // I link aprono una nuova scheda e prevengono il click sulla riga tabella
  container.querySelectorAll("a").forEach((a) => {
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
    a.setAttribute("onclick", "event.stopPropagation();");
  });

  // Gestione responsive e scroll orizzontale fluido per tabelle inserite nelle note
  container.querySelectorAll("table").forEach((tbl) => {
    tbl.removeAttribute("width");
    tbl.style.maxWidth = "100%";
    if (tbl.style.width && tbl.style.width.includes("px") && parseInt(tbl.style.width, 10) > 300) {
      tbl.style.width = "100%";
    }
    if (!tbl.parentElement.classList.contains("rich-table-wrapper")) {
      const wrapper = document.createElement("div");
      wrapper.className = "rich-table-wrapper";
      wrapper.setAttribute("onclick", "event.stopPropagation();");
      tbl.parentNode.insertBefore(wrapper, tbl);
      wrapper.appendChild(tbl);
    }
  });

  const checkboxes = container.querySelectorAll('.rich-checklist input[type="checkbox"]');
  checkboxes.forEach((cb, idx) => {
    cb.removeAttribute("disabled");
    if (itemType && itemId && fieldName) {
      cb.setAttribute("data-item-type", itemType);
      cb.setAttribute("data-item-id", itemId);
      cb.setAttribute("data-field-name", fieldName);
      cb.setAttribute("data-cb-index", idx);
      cb.setAttribute(
        "onchange",
        `toggleRichChecklist('${itemType}', ${itemId}, '${fieldName}', this, event)`
      );
    }
  });

  return container.outerHTML;
}

/**
 * Gestisce il cambio di stato di una checkbox di una checklist interattiva sulla card.
 */
function toggleRichChecklist(itemType, itemId, fieldName, checkboxEl, event) {
  if (event) event.stopPropagation();
  const cbIndex = parseInt(checkboxEl.getAttribute("data-cb-index"), 10);

  if (fieldName === "payment") {
    const costItem = (appData.costi || []).find((c) => String(c.id) === String(itemId));
    if (costItem && costItem.pagamenti) {
      for (const p of costItem.pagamenti) {
        if (p.commento && p.commento.includes("rich-checklist")) {
          const temp = document.createElement("div");
          temp.innerHTML = p.commento;
          const cbs = temp.querySelectorAll('.rich-checklist input[type="checkbox"]');
          if (cbs && cbs[cbIndex]) {
            if (checkboxEl.checked) {
              cbs[cbIndex].setAttribute("checked", "checked");
            } else {
              cbs[cbIndex].removeAttribute("checked");
            }
            p.commento = temp.innerHTML;
            saveDataLocally();
            showNotification(checkboxEl.checked ? "Elemento completato" : "Elemento riaperto");
            return;
          }
        }
      }
    }
    return;
  }

  let list = appData[itemType];
  if (!list && itemType === "savings" && appData.savingsMonitor) {
    list = appData.savingsMonitor.storico;
  }
  if (!list) return;
  const item = list.find((x) => String(x.id) === String(itemId));
  if (!item || !item[fieldName]) return;

  const temp = document.createElement("div");
  temp.innerHTML = item[fieldName];
  const cbs = temp.querySelectorAll('.rich-checklist input[type="checkbox"]');
  if (cbs && cbs[cbIndex]) {
    if (checkboxEl.checked) {
      cbs[cbIndex].setAttribute("checked", "checked");
    } else {
      cbs[cbIndex].removeAttribute("checked");
    }
    item[fieldName] = temp.innerHTML;
    saveDataLocally();
    showNotification(
      checkboxEl.checked ? "Elemento completato" : "Elemento riaperto"
    );
  }
}

/**
 * Verifica se un nodo DOM è contenuto all'interno di uno dei tag specificati.
 */
function isInsideTag(node, root, tagNames) {
  let curr = node;
  while (curr && curr !== root) {
    if (curr.nodeType === 1 && tagNames.includes(curr.nodeName.toUpperCase())) {
      return true;
    }
    curr = curr.parentNode;
  }
  return false;
}

/**
 * Restituisce l'antenato DOM che corrisponde a uno dei tag specificati.
 */
function getAncestorTag(node, root, tagNames) {
  let curr = node;
  while (curr && curr !== root) {
    if (curr.nodeType === 1 && tagNames.includes(curr.nodeName.toUpperCase())) {
      return curr;
    }
    curr = curr.parentNode;
  }
  return null;
}

/**
 * Verifica se un nodo è all'interno di una checklist con caselle.
 */
function isInsideChecklist(node, root) {
  let curr = node;
  while (curr && curr !== root) {
    if (curr.nodeType === 1 && curr.nodeName === "UL" && curr.classList.contains("rich-checklist")) {
      return true;
    }
    curr = curr.parentNode;
  }
  return false;
}

/**
 * Verifica se un nodo è all'interno di un tag font con dimensione ridotta.
 */
function isInsideSmallFont(node, root) {
  let curr = node;
  while (curr && curr !== root) {
    if (curr.nodeType === 1 && curr.nodeName === "FONT" && curr.getAttribute("size") === "1") {
      return true;
    }
    curr = curr.parentNode;
  }
  return false;
}

/**
 * Verifica se un nodo ha evidenziazione di testo attiva.
 */
function isHighlighted(node, root) {
  let curr = node;
  while (curr && curr !== root) {
    if (curr.nodeType === 1) {
      if (curr.nodeName === "MARK") return true;
      const bg = curr.style && curr.style.backgroundColor;
      if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)" && bg !== "inherit") {
        return true;
      }
    }
    curr = curr.parentNode;
  }
  return false;
}

/**
 * Aggiorna lo stato visivo (.active) di tutti i pulsanti della toolbar associata all'editor.
 * @param {HTMLElement} editor - Elemento contenteditable attivo.
 */
function updateRichToolbarActiveStates(editor) {
  if (!editor || !editor.id) return;
  const toolbar = document.querySelector(`.rich-editor-toolbar[data-editor-id="${editor.id}"]`);
  if (!toolbar) return;

  const sel = window.getSelection();
  let anchorNode = null;
  if (sel && sel.rangeCount > 0) {
    anchorNode = sel.anchorNode;
  }

  // Se l'editor non contiene il cursore o la selezione, mantieni o pulisci se non ha focus
  if (anchorNode && !editor.contains(anchorNode) && anchorNode !== editor) {
    return;
  }

  const buttons = toolbar.querySelectorAll(".rich-editor-btn[data-command]");
  buttons.forEach((btn) => {
    const cmd = btn.getAttribute("data-command");
    let isActive = false;

    try {
      switch (cmd) {
        case "bold":
          isActive = document.queryCommandState("bold");
          break;
        case "italic":
          isActive = document.queryCommandState("italic");
          break;
        case "underline":
          isActive = document.queryCommandState("underline");
          break;
        case "strikeThrough":
          isActive = document.queryCommandState("strikeThrough");
          break;
        case "insertUnorderedList":
          isActive = document.queryCommandState("insertUnorderedList") && !isInsideChecklist(anchorNode, editor);
          break;
        case "insertOrderedList":
          isActive = document.queryCommandState("insertOrderedList");
          break;
        case "checklist":
          isActive = isInsideChecklist(anchorNode, editor);
          break;
        case "heading":
          isActive = isInsideTag(anchorNode, editor, ["H1", "H2", "H3", "H4", "H5", "H6"]);
          break;
        case "normal": {
          const inHeading = isInsideTag(anchorNode, editor, ["H1", "H2", "H3", "H4", "H5", "H6"]);
          const inQuote = isInsideTag(anchorNode, editor, ["BLOCKQUOTE"]);
          const inList = document.queryCommandState("insertUnorderedList") || document.queryCommandState("insertOrderedList");
          const inChecklist = isInsideChecklist(anchorNode, editor);
          isActive = !inHeading && !inQuote && !inList && !inChecklist;
          break;
        }
        case "small":
          isActive = isInsideTag(anchorNode, editor, ["SMALL"]) || isInsideSmallFont(anchorNode, editor);
          break;
        case "highlight":
          isActive = isInsideTag(anchorNode, editor, ["MARK"]) || isHighlighted(anchorNode, editor);
          break;
        case "quote":
          isActive = isInsideTag(anchorNode, editor, ["BLOCKQUOTE"]);
          break;
        case "createLink":
          isActive = isInsideTag(anchorNode, editor, ["A"]);
          break;
        case "tableMenu":
          isActive = isInsideTag(anchorNode, editor, ["TABLE", "TH", "TD"]);
          break;
        default:
          isActive = false;
          break;
      }
    } catch (e) {
      isActive = false;
    }

    if (isActive) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

/**
 * Mostra un modale Material Design 3 per inserire o modificare un link cliccabile con testo personalizzato.
 * @param {HTMLElement} editor - Elemento contenteditable.
 */
async function promptRichLink(editor) {
  editor.focus();
  const sel = window.getSelection();
  let range = null;
  if (sel && sel.rangeCount > 0) {
    range = sel.getRangeAt(0);
  }

  const existingLink = getAncestorTag(sel ? sel.anchorNode : null, editor, ["A"]);
  const currentText = existingLink ? existingLink.textContent : (range ? range.toString().trim() : "");
  const currentHref = existingLink ? existingLink.getAttribute("href") : "";

  const htmlContent = `
    <div style="text-align: left; display: flex; flex-direction: column; gap: 14px; margin-top: 10px;">
      <div>
        <label style="font-size: 12px; font-weight: 600; color: var(--md-sys-color-primary); display: block; margin-bottom: 4px;">Testo visualizzato</label>
        <input id="swal-link-text" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box; font-size: 14px; height: 42px;" placeholder="Es. Apri Link, Scheda Catasto..." value="${escapeHTML(currentText || 'Apri Link')}">
      </div>
      <div>
        <label style="font-size: 12px; font-weight: 600; color: var(--md-sys-color-primary); display: block; margin-bottom: 4px;">Indirizzo Web (URL)</label>
        <input id="swal-link-url" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box; font-size: 14px; height: 42px;" placeholder="https://..." value="${escapeHTML(currentHref || 'https://')}">
      </div>
    </div>
  `;

  const result = await M3Swal.fire({
    title: existingLink ? "Modifica Link" : "Inserisci Link",
    html: htmlContent,
    showCancelButton: true,
    showDenyButton: !!existingLink,
    confirmButtonText: existingLink ? "Aggiorna" : "Inserisci",
    cancelButtonText: "Annulla",
    denyButtonText: "Rimuovi Link",
    reverseButtons: true,
    customClass: {
      popup: "m3-swal-popup",
      title: "m3-swal-title",
      htmlContainer: "m3-swal-html",
      actions: "m3-swal-actions",
      confirmButton: "btn btn-filled",
      cancelButton: "btn btn-tonal",
      denyButton: "btn btn-error",
    },
    preConfirm: () => {
      const textVal = document.getElementById("swal-link-text").value.trim();
      const urlVal = document.getElementById("swal-link-url").value.trim();
      if (!urlVal || urlVal === "https://" || urlVal === "http://") {
        Swal.showValidationMessage("Inserisci un indirizzo URL valido");
        return false;
      }
      return { text: textVal || urlVal, url: urlVal };
    },
  });

  if (result.isDenied && existingLink) {
    const textNode = document.createTextNode(existingLink.textContent);
    existingLink.replaceWith(textNode);
    updateRichToolbarActiveStates(editor);
    return;
  }

  if (!result.isConfirmed || !result.value) return;

  let finalUrl = result.value.url;
  if (!/^https?:\/\//i.test(finalUrl) && !/^mailto:/i.test(finalUrl) && !/^tel:/i.test(finalUrl)) {
    finalUrl = "https://" + finalUrl;
  }
  const displayText = result.value.text || finalUrl;

  editor.focus();

  if (existingLink) {
    existingLink.href = finalUrl;
    existingLink.textContent = displayText;
    existingLink.target = "_blank";
    existingLink.rel = "noopener noreferrer";
  } else if (range) {
    const a = document.createElement("a");
    a.href = finalUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = displayText;

    range.deleteContents();
    range.insertNode(a);

    const newRange = document.createRange();
    newRange.setStartAfter(a);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }

  updateRichToolbarActiveStates(editor);
}

/**
 * Inserisce o rimuove (toggle) un blocco checklist nell'editor attivo, preservando eventuale testo selezionato.
 * @param {HTMLElement} editor - Elemento contenteditable.
 */
function toggleOrInsertRichChecklist(editor) {
  editor.focus();
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);

  // Se è già dentro una checklist, disattivala (converti in paragrafo normale)
  const ul = getAncestorTag(sel.anchorNode, editor, ["UL"]);
  if (ul && ul.classList.contains("rich-checklist")) {
    const lis = Array.from(ul.querySelectorAll("li"));
    const frag = document.createDocumentFragment();
    lis.forEach((li) => {
      const p = document.createElement("p");
      Array.from(li.childNodes).forEach((child) => {
        if (child.nodeType === 1 && child.nodeName === "INPUT" && child.type === "checkbox") {
          return;
        }
        p.appendChild(child.cloneNode(true));
      });
      if (!p.textContent.trim()) {
        p.innerHTML = "<br>";
      }
      frag.appendChild(p);
    });
    ul.replaceWith(frag);
    updateRichToolbarActiveStates(editor);
    return;
  }

  // Altrimenti inserisci una nuova checklist preservando l'eventuale testo selezionato
  const newUl = document.createElement("ul");
  newUl.className = "rich-checklist";
  const li = document.createElement("li");
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.disabled = true;
  li.appendChild(cb);

  if (!range.collapsed) {
    const contents = range.extractContents();
    li.appendChild(document.createTextNode("\u00A0"));
    li.appendChild(contents);
  } else {
    li.appendChild(document.createTextNode("\u00A0Elemento"));
  }
  newUl.appendChild(li);

  range.deleteContents();
  range.insertNode(newUl);

  const newRange = document.createRange();
  newRange.selectNodeContents(li);
  newRange.collapse(false);
  sel.removeAllRanges();
  sel.addRange(newRange);
  updateRichToolbarActiveStates(editor);
}


/**
 * Sposta il cursore e il focus all'interno di una cella di una tabella rich text.
 * @param {HTMLTableCellElement} cell - Cella th o td da selezionare.
 */
function focusRichTableCell(cell) {
  if (!cell) return;
  const sel = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(cell);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
  const editor = cell.closest(".rich-editor-content");
  if (editor) {
    editor.focus();
    updateRichToolbarActiveStates(editor);
  }
}

/**
 * Inserisce una nuova tabella nel punto corrente del cursore all'interno dell'editor rich text.
 * @param {HTMLElement} editor - Elemento contenteditable.
 * @param {number} rows - Numero di righe del corpo dati.
 * @param {number} cols - Numero di colonne.
 * @param {boolean} hasHeader - Se includere una riga di intestazione thead/th.
 */
function insertRichTable(editor, rows = 3, cols = 3, hasHeader = true) {
  editor.focus();
  const safeRows = Math.max(1, Math.min(parseInt(rows, 10) || 3, 25));
  const safeCols = Math.max(1, Math.min(parseInt(cols, 10) || 3, 10));

  let tableHtml = '<div class="rich-table-wrapper" onclick="event.stopPropagation();"><table>';
  if (hasHeader) {
    tableHtml += '<thead><tr>';
    for (let c = 0; c < safeCols; c++) {
      tableHtml += `<th>Intestazione ${c + 1}</th>`;
    }
    tableHtml += '</tr></thead>';
  }
  tableHtml += '<tbody>';
  for (let r = 0; r < safeRows; r++) {
    tableHtml += '<tr>';
    for (let c = 0; c < safeCols; c++) {
      tableHtml += '<td>&nbsp;</td>';
    }
    tableHtml += '</tr>';
  }
  tableHtml += '</tbody></table></div><p><br></p>';

  const sel = window.getSelection();
  let inserted = false;
  try {
    inserted = document.execCommand("insertHTML", false, tableHtml);
  } catch (e) {
    inserted = false;
  }

  if (!inserted && sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const temp = document.createElement("div");
    temp.innerHTML = tableHtml;
    const frag = document.createDocumentFragment();
    let node;
    while ((node = temp.firstChild)) {
      frag.appendChild(node);
    }
    range.deleteContents();
    range.insertNode(frag);
  }

  const allTables = editor.querySelectorAll("table");
  if (allTables.length > 0) {
    const lastTable = allTables[allTables.length - 1];
    const firstCell = lastTable.querySelector("th, td");
    if (firstCell) {
      focusRichTableCell(firstCell);
    }
  }
}

/**
 * Mostra il popup M3Swal per configurare e inserire una nuova tabella nell'editor.
 * @param {HTMLElement} editor - Elemento contenteditable.
 */
async function promptInsertRichTable(editor) {
  editor.focus();
  const htmlContent = `
    <div style="text-align: left; display: flex; flex-direction: column; gap: 14px; margin-top: 10px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label style="font-size: 12px; font-weight: 600; color: var(--md-sys-color-primary); display: block; margin-bottom: 4px;">Colonne</label>
          <input id="swal-table-cols" type="number" min="1" max="10" value="3" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box; font-size: 14px; height: 42px;">
        </div>
        <div>
          <label style="font-size: 12px; font-weight: 600; color: var(--md-sys-color-primary); display: block; margin-bottom: 4px;">Righe</label>
          <input id="swal-table-rows" type="number" min="1" max="25" value="3" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box; font-size: 14px; height: 42px;">
        </div>
      </div>
      <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; user-select: none;">
        <input id="swal-table-header" type="checkbox" checked style="width: 18px; height: 18px; accent-color: var(--md-sys-color-primary);">
        <span>Includi riga di intestazione</span>
      </label>
    </div>
  `;

  const result = await M3Swal.fire({
    title: "Inserisci Tabella",
    html: htmlContent,
    showCancelButton: true,
    confirmButtonText: "Inserisci",
    cancelButtonText: "Annulla",
    reverseButtons: true,
    customClass: {
      popup: "m3-swal-popup",
      title: "m3-swal-title",
      htmlContainer: "m3-swal-html",
      actions: "m3-swal-actions",
      confirmButton: "btn btn-filled",
      cancelButton: "btn btn-tonal",
    },
    preConfirm: () => {
      const cols = parseInt(document.getElementById("swal-table-cols").value, 10) || 3;
      const rows = parseInt(document.getElementById("swal-table-rows").value, 10) || 3;
      const hasHeader = document.getElementById("swal-table-header").checked;
      if (cols < 1 || cols > 10) {
        Swal.showValidationMessage("Il numero di colonne deve essere tra 1 e 10");
        return false;
      }
      if (rows < 1 || rows > 25) {
        Swal.showValidationMessage("Il numero di righe deve essere tra 1 e 25");
        return false;
      }
      return { cols, rows, hasHeader };
    },
  });

  if (result.isConfirmed && result.value) {
    insertRichTable(editor, result.value.rows, result.value.cols, result.value.hasHeader);
  }
}

/**
 * Aggiunge una nuova riga sopra o sotto la cella specificata.
 * @param {HTMLTableCellElement} cell - Cella di riferimento.
 * @param {"above"|"below"} position - Posizione di inserimento.
 */
function insertRichTableRow(cell, position = "below") {
  if (!cell) return;
  const tr = cell.closest("tr");
  const table = cell.closest("table");
  if (!tr || !table) return;

  const colCount = Math.max(tr.cells.length, (table.rows[0] && table.rows[0].cells.length) || 1);
  const newTr = document.createElement("tr");
  for (let i = 0; i < colCount; i++) {
    const td = document.createElement("td");
    td.innerHTML = "&nbsp;";
    newTr.appendChild(td);
  }

  if (position === "above") {
    tr.before(newTr);
  } else {
    if (tr.parentElement && tr.parentElement.tagName === "THEAD") {
      let tbody = table.querySelector("tbody");
      if (!tbody) {
        tbody = document.createElement("tbody");
        table.appendChild(tbody);
      }
      tbody.insertBefore(newTr, tbody.firstChild);
    } else {
      tr.after(newTr);
    }
  }

  focusRichTableCell(newTr.cells[0]);
}

/**
 * Elimina la riga contenente la cella specificata.
 * Se è l'unica riga della tabella, elimina l'intera tabella.
 * @param {HTMLTableCellElement} cell - Cella di riferimento.
 */
function deleteRichTableRow(cell) {
  if (!cell) return;
  const tr = cell.closest("tr");
  const table = cell.closest("table");
  if (!tr || !table) return;

  const totalRows = table.querySelectorAll("tr").length;
  if (totalRows <= 1) {
    deleteRichTable(table);
    return;
  }

  const nextRow = tr.nextElementSibling || tr.previousElementSibling || (tr.parentElement.tagName === "TBODY" ? table.querySelector("thead tr") : null);
  const colIndex = cell.cellIndex;
  tr.remove();

  if (nextRow && nextRow.cells.length > 0) {
    const targetCell = nextRow.cells[Math.min(colIndex, nextRow.cells.length - 1)];
    focusRichTableCell(targetCell);
  }
}

/**
 * Aggiunge una nuova colonna a sinistra o a destra della cella specificata.
 * @param {HTMLTableCellElement} cell - Cella di riferimento.
 * @param {"left"|"right"} position - Posizione di inserimento.
 */
function insertRichTableColumn(cell, position = "right") {
  if (!cell) return;
  const tr = cell.closest("tr");
  const table = cell.closest("table");
  if (!tr || !table) return;

  const colIndex = cell.cellIndex;
  const targetIndex = position === "right" ? colIndex + 1 : colIndex;

  const rows = table.querySelectorAll("tr");
  rows.forEach((row) => {
    const isHead = row.parentElement && row.parentElement.tagName === "THEAD";
    const newCell = document.createElement(isHead ? "th" : "td");
    newCell.innerHTML = isHead ? "Intestazione" : "&nbsp;";
    if (targetIndex >= row.children.length) {
      row.appendChild(newCell);
    } else {
      row.insertBefore(newCell, row.children[targetIndex]);
    }
  });

  if (tr.children[targetIndex]) {
    focusRichTableCell(tr.children[targetIndex]);
  }
}

/**
 * Elimina la colonna contenente la cella specificata.
 * Se è l'unica colonna, elimina l'intera tabella.
 * @param {HTMLTableCellElement} cell - Cella di riferimento.
 */
function deleteRichTableColumn(cell) {
  if (!cell) return;
  const tr = cell.closest("tr");
  const table = cell.closest("table");
  if (!tr || !table) return;

  const colIndex = cell.cellIndex;
  const rows = Array.from(table.querySelectorAll("tr"));
  const maxCols = Math.max(...rows.map((r) => r.children.length));

  if (maxCols <= 1) {
    deleteRichTable(table);
    return;
  }

  rows.forEach((row) => {
    if (row.children[colIndex]) {
      row.children[colIndex].remove();
    }
  });

  const remainingCells = tr.children;
  if (remainingCells.length > 0) {
    const targetCell = remainingCells[Math.min(colIndex, remainingCells.length - 1)];
    focusRichTableCell(targetCell);
  }
}

/**
 * Rimuove completamente la tabella e il relativo contenitore dall'editor.
 * @param {HTMLTableElement} table - Elemento tabella da rimuovere.
 */
function deleteRichTable(table) {
  if (!table) return;
  const editor = table.closest(".rich-editor-content");
  const wrapper = table.closest(".rich-table-wrapper");
  if (wrapper && wrapper.parentElement) {
    wrapper.remove();
  } else {
    table.remove();
  }
  if (editor) {
    editor.focus();
    updateRichToolbarActiveStates(editor);
  }
}

/**
 * Mostra il menu contestuale con le azioni rapide per la tabella (Aggiungi/Elimina righe e colonne).
 * @param {HTMLElement} editor - Elemento contenteditable.
 * @param {HTMLTableCellElement} cell - Cella attualmente attiva.
 */
async function showRichTableContextMenu(editor, cell) {
  const table = cell.closest("table");
  if (!table) return;

  const htmlContent = `
    <div class="rich-table-menu-grid">
      <button type="button" class="rich-table-menu-item" data-action="add-row-below">
        <span class="material-symbols-outlined">add</span>
        <span>Aggiungi Riga Sotto</span>
      </button>
      <button type="button" class="rich-table-menu-item" data-action="add-row-above">
        <span class="material-symbols-outlined">add</span>
        <span>Aggiungi Riga Sopra</span>
      </button>
      <button type="button" class="rich-table-menu-item" data-action="add-col-right">
        <span class="material-symbols-outlined">add</span>
        <span>Aggiungi Colonna a Destra</span>
      </button>
      <button type="button" class="rich-table-menu-item" data-action="add-col-left">
        <span class="material-symbols-outlined">add</span>
        <span>Aggiungi Colonna a Sinistra</span>
      </button>
      <button type="button" class="rich-table-menu-item" data-action="delete-row">
        <span class="material-symbols-outlined" style="color: var(--md-sys-color-error, #ba1a1a);">table_rows</span>
        <span>Elimina Riga Corrente</span>
      </button>
      <button type="button" class="rich-table-menu-item" data-action="delete-col">
        <span class="material-symbols-outlined" style="color: var(--md-sys-color-error, #ba1a1a);">view_column</span>
        <span>Elimina Colonna Corrente</span>
      </button>
      <button type="button" class="rich-table-menu-item rich-table-menu-danger" data-action="delete-table">
        <span class="material-symbols-outlined">delete</span>
        <span>Elimina Tutta la Tabella</span>
      </button>
    </div>
  `;

  let chosenAction = null;

  await M3Swal.fire({
    title: "Gestione Tabella",
    html: htmlContent,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: "Chiudi",
    customClass: {
      popup: "m3-swal-popup",
      title: "m3-swal-title",
      htmlContainer: "m3-swal-html",
      actions: "m3-swal-actions",
      cancelButton: "btn btn-tonal",
    },
    didOpen: (popup) => {
      popup.querySelectorAll(".rich-table-menu-item").forEach((btn) => {
        btn.addEventListener("click", () => {
          chosenAction = btn.getAttribute("data-action");
          M3Swal.close();
        });
      });
    },
  });

  if (!chosenAction) return;

  switch (chosenAction) {
    case "add-row-below":
      insertRichTableRow(cell, "below");
      break;
    case "add-row-above":
      insertRichTableRow(cell, "above");
      break;
    case "add-col-right":
      insertRichTableColumn(cell, "right");
      break;
    case "add-col-left":
      insertRichTableColumn(cell, "left");
      break;
    case "delete-row":
      deleteRichTableRow(cell);
      break;
    case "delete-col":
      deleteRichTableColumn(cell);
      break;
    case "delete-table":
      deleteRichTable(table);
      break;
  }
}

/**
 * Gestisce il click sul pulsante "Tabella" della toolbar:
 * Se il cursore è già in una tabella, apre il menu di modifica contestuale.
 * Altrimenti, apre il dialogo per inserire una nuova tabella.
 * @param {HTMLElement} editor - Elemento contenteditable.
 */
function handleRichTableToolbarClick(editor) {
  editor.focus();
  const sel = window.getSelection();
  const cell = getAncestorTag(sel ? sel.anchorNode : null, editor, ["TD", "TH"]);
  if (cell) {
    showRichTableContextMenu(editor, cell);
  } else {
    promptInsertRichTable(editor);
  }
}

/**
 * Inizializza le toolbar e i listener per tutti gli editor rich text dell'applicazione.
 */
function initRichTextEditors() {
  document.querySelectorAll(".rich-editor-toolbar .rich-editor-btn").forEach((btn) => {
    if (btn._richInitDone) return;
    btn._richInitDone = true;

    // Impedisce la perdita del focus e della selezione quando si clicca o tocca la toolbar
    const preventLoss = (e) => {
      e.preventDefault();
    };
    btn.addEventListener("mousedown", preventLoss);
    btn.addEventListener("touchstart", preventLoss, { passive: false });

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const toolbar = btn.closest(".rich-editor-toolbar");
      if (!toolbar) return;
      const editorId = toolbar.getAttribute("data-editor-id");
      const editor = document.getElementById(editorId);
      if (!editor) return;

      editor.focus();
      const cmd = btn.getAttribute("data-command");
      const sel = window.getSelection();

      switch (cmd) {
        case "bold":
          document.execCommand("bold", false, null);
          break;
        case "italic":
          document.execCommand("italic", false, null);
          break;
        case "underline":
          document.execCommand("underline", false, null);
          break;
        case "strikeThrough":
          document.execCommand("strikeThrough", false, null);
          break;
        case "heading": {
          const inH = isInsideTag(sel ? sel.anchorNode : null, editor, ["H1", "H2", "H3", "H4", "H5", "H6"]);
          if (inH) {
            document.execCommand("formatBlock", false, "<p>");
          } else {
            document.execCommand("formatBlock", false, "<h3>");
          }
          break;
        }
        case "normal":
          document.execCommand("formatBlock", false, "<p>");
          break;
        case "small": {
          const smallAncestor = getAncestorTag(sel ? sel.anchorNode : null, editor, ["SMALL"]);
          if (smallAncestor) {
            const parent = smallAncestor.parentNode;
            while (smallAncestor.firstChild) {
              parent.insertBefore(smallAncestor.firstChild, smallAncestor);
            }
            smallAncestor.remove();
          } else if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
            const range = sel.getRangeAt(0);
            const smallEl = document.createElement("small");
            smallEl.appendChild(range.extractContents());
            range.insertNode(smallEl);
          } else {
            document.execCommand("fontSize", false, "1");
          }
          break;
        }
        case "highlight": {
          const markAncestor = getAncestorTag(sel ? sel.anchorNode : null, editor, ["MARK"]);
          if (markAncestor) {
            const parent = markAncestor.parentNode;
            while (markAncestor.firstChild) {
              parent.insertBefore(markAncestor.firstChild, markAncestor);
            }
            markAncestor.remove();
          } else if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
            const range = sel.getRangeAt(0);
            const markEl = document.createElement("mark");
            markEl.appendChild(range.extractContents());
            range.insertNode(markEl);
          } else {
            document.execCommand("hiliteColor", false, "#fef08a");
          }
          break;
        }
        case "insertUnorderedList":
          document.execCommand("insertUnorderedList", false, null);
          break;
        case "insertOrderedList":
          document.execCommand("insertOrderedList", false, null);
          break;
        case "checklist":
          toggleOrInsertRichChecklist(editor);
          break;
        case "quote": {
          const inQuote = isInsideTag(sel ? sel.anchorNode : null, editor, ["BLOCKQUOTE"]);
          if (inQuote) {
            document.execCommand("formatBlock", false, "<p>");
          } else {
            document.execCommand("formatBlock", false, "<blockquote>");
          }
          break;
        }
        case "createLink":
          promptRichLink(editor);
          break;
        case "tableMenu":
          handleRichTableToolbarClick(editor);
          break;
        case "removeFormat":
          document.execCommand("removeFormat", false, null);
          document.execCommand("formatBlock", false, "<p>");
          break;
      }

      // Aggiorna immediatamente lo stato attivo dei pulsanti dopo l'azione
      updateRichToolbarActiveStates(editor);
    });
  });

  // Listener live per la selezione e la digitazione all'interno degli editor
  document.querySelectorAll(".rich-editor-content").forEach((editor) => {
    if (editor._richKeyInitDone) return;
    editor._richKeyInitDone = true;

    const onStateChange = () => {
      updateRichToolbarActiveStates(editor);
    };

    editor.addEventListener("keyup", onStateChange);
    editor.addEventListener("mouseup", onStateChange);
    editor.addEventListener("touchend", onStateChange);
    editor.addEventListener("input", onStateChange);
    editor.addEventListener("focus", onStateChange);
    editor.addEventListener("click", onStateChange);

    editor.addEventListener("keydown", (e) => {
            if (e.key === "Tab") {
        const sel = window.getSelection();
        const activeCell = getAncestorTag(sel ? sel.anchorNode : null, editor, ["TD", "TH"]);
        if (activeCell) {
          e.preventDefault();
          const table = activeCell.closest("table");
          if (!table) return;
          const allCells = Array.from(table.querySelectorAll("th, td"));
          const currentIndex = allCells.indexOf(activeCell);

          if (e.shiftKey) {
            if (currentIndex > 0) {
              focusRichTableCell(allCells[currentIndex - 1]);
            }
          } else {
            if (currentIndex < allCells.length - 1) {
              focusRichTableCell(allCells[currentIndex + 1]);
            } else {
              insertRichTableRow(activeCell, "below");
            }
          }
          return;
        }
      }

      if (e.key === "Enter") {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          let node = sel.anchorNode;
          let li = null;
          while (node && node !== editor) {
            if (
              node.nodeName === "LI" &&
              node.parentElement &&
              node.parentElement.classList.contains("rich-checklist")
            ) {
              li = node;
              break;
            }
            node = node.parentNode;
          }
          if (li) {
            e.preventDefault();
            const text = li.textContent.trim();
            if (!text) {
              // Voce vuota: esce dalla checklist e crea un paragrafo normale
              const p = document.createElement("p");
              p.innerHTML = "<br>";
              if (li.parentElement.children.length === 1) {
                li.parentElement.replaceWith(p);
              } else {
                li.parentElement.after(p);
                li.remove();
              }
              const range = document.createRange();
              range.setStart(p, 0);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            } else {
              // Voce valorizzata: crea un nuovo elemento checklist
              const newLi = document.createElement("li");
              const cb = document.createElement("input");
              cb.type = "checkbox";
              cb.disabled = true;
              newLi.appendChild(cb);
              const span = document.createElement("span");
              span.innerHTML = "&nbsp;";
              newLi.appendChild(span);
              li.after(newLi);

              const range = document.createRange();
              range.selectNodeContents(span);
              range.collapse(false);
              sel.removeAllRanges();
              sel.addRange(range);
            }
            updateRichToolbarActiveStates(editor);
          }
        }
      }
    });
  });

  // Listener globale selectionchange per aggiornare istantaneamente la toolbar al cambio cursore
  if (!window._richSelectionInitDone) {
    window._richSelectionInitDone = true;
    document.addEventListener("selectionchange", () => {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      let node = sel.anchorNode;
      while (node) {
        if (node.nodeType === 1 && node.classList && node.classList.contains("rich-editor-content")) {
          updateRichToolbarActiveStates(node);
          break;
        }
        node = node.parentNode;
      }
    });
  }
}

/**
 * Apre un overlay modale assicurando che sia l'overlay che il contenitore interno
 * partano sempre resettati dall'alto (scrollTop = 0).
 * @param {string|HTMLElement} modalInput - ID della modale o elemento DOM.
 */
function openModalOverlay(modalInput) {
  const modal = typeof modalInput === "string" ? document.getElementById(modalInput) : modalInput;
  if (!modal) return;
  modal.scrollTop = 0;
  const content = modal.querySelector(".modal-content");
  if (content) content.scrollTop = 0;
  modal.classList.add("active");
  // Reset immediato e su frame successivo per garantire il layout
  requestAnimationFrame(() => {
    modal.scrollTop = 0;
    if (content) content.scrollTop = 0;
  });
}

/**
 * Chiude un overlay modale resettando lo scroll.
 * @param {string|HTMLElement} modalInput - ID della modale o elemento DOM.
 */
function closeModalOverlay(modalInput) {
  const modal = typeof modalInput === "string" ? document.getElementById(modalInput) : modalInput;
  if (!modal) return;
  modal.classList.remove("active");
  modal.scrollTop = 0;
  const content = modal.querySelector(".modal-content");
  if (content) content.scrollTop = 0;
}

// Observer globale: se qualsiasi classe 'active' viene aggiunta a un .modal-overlay, garantisce scrollTop = 0
if (typeof MutationObserver !== "undefined") {
  const modalScrollObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "class") {
        const target = mutation.target;
        if (target && target.classList && target.classList.contains("modal-overlay") && target.classList.contains("active")) {
          target.scrollTop = 0;
          const content = target.querySelector(".modal-content");
          if (content) content.scrollTop = 0;
          requestAnimationFrame(() => {
            target.scrollTop = 0;
            if (content) content.scrollTop = 0;
          });
        }
      }
    });
  });

  const initModalObservers = () => {
    document.querySelectorAll(".modal-overlay").forEach((el) => {
      modalScrollObserver.observe(el, { attributes: true, attributeFilter: ["class"] });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initModalObservers);
  } else {
    initModalObservers();
  }
}

