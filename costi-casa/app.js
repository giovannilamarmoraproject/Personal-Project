/**
 * Istanza base personalizzata di SweetAlert2 configurata secondo lo stile Material Expressive 3.
 * Applica le classi CSS definite per modali, titoli, pulsanti e contenitori.
 */
const M3Swal = Swal.mixin({
  customClass: {
    popup: "m3-swal-popup",
    title: "m3-swal-title",
    htmlContainer: "m3-swal-html",
    actions: "m3-swal-actions",
    confirmButton: "btn btn-filled m3-swal-confirm",
    cancelButton: "btn btn-tonal m3-swal-cancel",
  },
  buttonsStyling: false,
});

/**
 * Mostra una notifica toast temporanea di successo o informazione.
 * @param {string} title - Titolo principale della notifica.
 * @param {string} [text=''] - Testo descrittivo opzionale.
 * @param {string} [icon='success'] - Icona di SweetAlert (success, warning, error, info).
 * @returns {Promise} Promise restituita da Swal.fire.
 */
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  customClass: {
    popup: "m3-swal-toast",
  },
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

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

// Configurazioni e strutture dati di default per inizializzazione pulita
const defaultCats = {
  Immobili: { color: "#3F51B5", isImmobile: true },
  Extra: { color: "#FF9800", isImmobile: false },
  "Spese Acquisto": { color: "#9C27B0", isImmobile: false },
  "Lavori e Utenze": { color: "#00BCD4", isImmobile: false },
  Arredo: { color: "#E91E63", isImmobile: false },
};
const defaultRooms = [
  "Generale Casa",
  "Cucina",
  "Soggiorno",
  "Bagno",
  "Zona Notte",
];
const defaultMortgage = {
  years: 30,
  rate: 3.25,
  mode: "auto",
  singleUser: "",
  selectedExtraCostIds: [],
};

const defaultData = {
  budget: [],
  costi: [],
  debiti: [],
  qa: [],
  tasks: [],
  notes: [],
  settings: {
    configured: false,
    darkMode: false,
    users: [{ id: "u1", name: "Utente", share: 100, safetyFund: 5000 }],
    heroImage: "",
    driveLink: "",
    roomCategories: defaultRooms,
    renders: [],
    categories: defaultCats,
    mortgage: defaultMortgage,
  },
};

// Caricamento dello stato persistito da localStorage o fallback su defaultData
let appData = JSON.parse(localStorage.getItem("casaData")) || defaultData;
let barChartInstance = null;
let pieChartInstance = null;
let catBarChartInstance = null;
let currentSort = { table: null, column: null, asc: true };
const autoColors = [
  "#E91E63",
  "#9C27B0",
  "#3F51B5",
  "#2196F3",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#FF9800",
  "#FF5722",
  "#795548",
];

let isMutuoManualEdit = false;
let isMutuoParamsEditing = false;
let manualCustomMortgage = null;
let isMortgageEditing = false;
let lastCalculatedUserMutuo = {};

// Flag to prevent infinite loops when saving from gist
let isSyncingToGist = false;

let casaGithubConfig = { enabled: false, token: "", gistId: "" };
try {
  let storedGh = localStorage.getItem("casaGithubConfig");
  if (storedGh) {
    casaGithubConfig = JSON.parse(storedGh);
    // Rimuovi dai vecchi appData per non inviarlo in cloud
    if (appData.settings && appData.settings.githubSync) {
      delete appData.settings.githubSync;
      localStorage.setItem("casaData", JSON.stringify(appData));
    }
  } else {
    if (appData.settings && appData.settings.githubSync) {
      casaGithubConfig = appData.settings.githubSync;
      localStorage.setItem(
        "casaGithubConfig",
        JSON.stringify(casaGithubConfig),
      );
      delete appData.settings.githubSync;
      localStorage.setItem("casaData", JSON.stringify(appData));
    }
  }
} catch (e) {
  console.error("Errore migrazione Github config", e);
}

function saveGithubConfig() {
  localStorage.setItem("casaGithubConfig", JSON.stringify(casaGithubConfig));
}

/**
 * Pulisce e assicura l'integrità strutturale dell'oggetto appData prima di ogni operazione.
 * Garantisce che gli array esistano e i campi legacy vengano migrati coerentemente.
 */
function sanitizeData() {
  if (!appData.settings)
    appData.settings = JSON.parse(JSON.stringify(defaultData.settings));
  if (
    !appData.settings.roomCategories ||
    appData.settings.roomCategories.length === 0
  ) {
    appData.settings.roomCategories = [...defaultRooms];
  }
  appData.settings.roomCategories = appData.settings.roomCategories.filter(
    (r) => r !== "Piantine & Schemi" && r !== "Preventivi & Contratti",
  );
  if (appData.settings.roomCategories.length === 0) {
    appData.settings.roomCategories = [...defaultRooms];
  }

  if (!appData.settings.mortgage) {
    appData.settings.mortgage = JSON.parse(JSON.stringify(defaultMortgage));
  }
  if (!Array.isArray(appData.settings.mortgage.selectedExtraCostIds)) {
    appData.settings.mortgage.selectedExtraCostIds = [];
  }

  if (!appData.qa) appData.qa = [];
  appData.qa.forEach((q) => {
    if (!q.images) {
      q.images = q.image ? [q.image] : [];
    }
    if (!Array.isArray(q.linkedCostIds)) {
      q.linkedCostIds = [];
    }
  });
  if (!appData.tasks) appData.tasks = [];
  appData.tasks.forEach((t) => {
    if (!t.images) {
      t.images = t.image ? [t.image] : [];
    }
    if (!Array.isArray(t.linkedCostIds)) {
      t.linkedCostIds = [];
    }
  });
  if (!appData.notes) appData.notes = [];
  appData.notes.forEach((n) => {
    if (!n.images) {
      n.images = n.image ? [n.image] : [];
    }
    if (!Array.isArray(n.linkedCostIds)) {
      n.linkedCostIds = [];
    }
  });

  if (!appData.settings.renders) appData.settings.renders = [];

  // Normalizzazione elementi multimediali della galleria
  appData.settings.renders = appData.settings.renders.map((r) => {
    if (typeof r === "string") {
      let info = formatFileUrl(r);
      return {
        url: r,
        type: info.type === "pdf" ? "pdf" : "image",
        room: "Generale Casa",
        title: "Documento / Render",
      };
    }
    let rawUrl = r && typeof r.url === "string" ? r.url : "";
    let info = formatFileUrl(rawUrl);
    let type = r.type || (info.type === "pdf" ? "pdf" : "image");
    let room = r.room || "Generale Casa";
    if (room === "Piantine & Schemi") {
      type = "plan";
      room = "Generale Casa";
    } else if (room === "Preventivi & Contratti") {
      type = "pdf";
      room = "Generale Casa";
    }
    return {
      url: rawUrl,
      type: type,
      room: room,
      title: r.title || "Allegato",
    };
  });

  if (
    !appData.settings.categories ||
    Object.keys(appData.settings.categories).length === 0
  ) {
    appData.settings.categories = JSON.parse(JSON.stringify(defaultCats));
  }

  // Migrazione categorie legacy da stringa colore ad oggetto { color, isImmobile }
  Object.keys(appData.settings.categories).forEach((cat) => {
    let val = appData.settings.categories[cat];
    if (typeof val === "string") {
      appData.settings.categories[cat] = {
        color: val,
        isImmobile: cat === "Immobili",
      };
    }
  });

  if (!appData.settings.users || appData.settings.users.length === 0) {
    appData.settings.users = [
      { id: "u1", name: "Utente", share: 100, safetyFund: 5000 },
    ];
  } else {
    appData.settings.users.forEach((u) => {
      if (u.safetyFund === undefined) u.safetyFund = 5000;
    });
  }

  // Normalizzazione tabella costi
  if (!appData.costi) appData.costi = [];
  appData.costi = appData.costi.filter(
    (c) => c && c.desc && c.desc.trim().toLowerCase() !== "totale",
  );
  let colorIndex = 0;
  appData.costi.forEach((c) => {
    if (c.gio !== undefined) {
      c.u1 = c.gio;
      delete c.gio;
    }
    if (c.fede !== undefined) {
      c.u2 = c.fede;
      delete c.fede;
    }
    // Retrocompatibilità: inizializza array pagamenti se assente
    if (!c.pagamenti) c.pagamenti = [];

    // Tracciamento quote originarie/dichiarate per rilevare pagamenti non ancora registrati a rate
    if (!c.originQuote) {
      c.originQuote = {};
      appData.settings.users.forEach((u) => {
        c.originQuote[u.id] = parseFloat(c[u.id]) || 0;
      });
    }
    const sumOrigin = appData.settings.users.reduce(
      (acc, u) => acc + (c.originQuote[u.id] || 0),
      0,
    );
    if (c.originPaid === undefined) {
      c.originPaid = sumOrigin;
    }

    let catName = c.cat ? c.cat.trim() : "Senza Categoria";
    c.cat = catName;
    if (!appData.settings.categories[catName]) {
      appData.settings.categories[catName] = {
        color: autoColors[colorIndex % autoColors.length],
        isImmobile: catName === "Immobili",
      };
      colorIndex++;
    }
  });

  // Assicura che i costi collegati puntino solo a ID di costo realmente esistenti
  const validCostIds = new Set(appData.costi.map((c) => c.id));
  appData.qa.forEach((q) => {
    q.linkedCostIds = q.linkedCostIds.filter((cid) => validCostIds.has(cid));
  });
  appData.tasks.forEach((t) => {
    t.linkedCostIds = t.linkedCostIds.filter((cid) => validCostIds.has(cid));
  });
  appData.notes.forEach((n) => {
    n.linkedCostIds = n.linkedCostIds.filter((cid) => validCostIds.has(cid));
  });

  // Normalizzazione tabella budget
  // Inizializzazione e normalizzazione modulo Debiti & Finanziamenti
  if (!appData.debiti) appData.debiti = [];
  appData.debiti.forEach((d) => {
    if (d.rata !== undefined) d.rata = parseFloat(d.rata) || 0;
    if (d.mesiRimanenti !== undefined) d.mesiRimanenti = parseInt(d.mesiRimanenti, 10) || 0;
    if (d.giornoPagamento !== undefined) d.giornoPagamento = parseInt(d.giornoPagamento, 10) || 1;
    if (!d.userId && appData.settings.users[0]) d.userId = appData.settings.users[0].id;
    if (d.totaleInizialeMesi === undefined) d.totaleInizialeMesi = d.mesiRimanenti;
  });
  syncDebitiToBudget();

  if (!appData.budget) appData.budget = [];
  appData.budget = appData.budget.filter(
    (b) =>
      b &&
      b.desc &&
      b.desc.trim().toLowerCase() !== "totale" &&
      b.desc.trim().toLowerCase() !== "risparmi accumulati",
  );
  appData.budget.forEach((b) => {
    if (b.gio !== undefined) {
      b.u1 = b.gio;
      delete b.gio;
    }
    if (b.fede !== undefined) {
      b.u2 = b.fede;
      delete b.fede;
    }
    if (b.isMutuo === undefined) b.isMutuo = false;
  });

  // Inizializzazione modulo Monitoraggio Risparmio Netto
  const todayDefault = new Date().toISOString().split("T")[0];
  if (!appData.savingsMonitor) {
    appData.savingsMonitor = {
      dataAvvio: todayDefault,
      dataRogito: "2027-04-30",
      selectedUser: appData.settings.users[0] ? appData.settings.users[0].id : "u1",
      userConfig: {},
      storico: [],
    };
  }
  if (!appData.savingsMonitor.userConfig) appData.savingsMonitor.userConfig = {};
  if (!appData.savingsMonitor.storico) appData.savingsMonitor.storico = [];
  if (!appData.savingsMonitor.dataAvvio || appData.savingsMonitor.dataAvvio === "2024-01-01") {
    appData.savingsMonitor.dataAvvio = todayDefault;
  }
  if (!appData.savingsMonitor.dataRogito) appData.savingsMonitor.dataRogito = "2027-04-30";
  if (!appData.savingsMonitor.selectedUser && appData.settings.users[0]) {
    appData.savingsMonitor.selectedUser = appData.settings.users[0].id;
  }

  appData.settings.users.forEach((u) => {
    if (!appData.savingsMonitor.userConfig[u.id]) {
      appData.savingsMonitor.userConfig[u.id] = {
        capitaleIniziale: null,
        ultimoSaldoConto: null,
        trasferimentiAttivi: [],
        debitiAttivi: [],
      };
    } else {
      // Pulisce eventuali dati dummy di test residui (22500 / 20970) se non c'è uno storico reale
      const cfg = appData.savingsMonitor.userConfig[u.id];
      if (
        cfg.capitaleIniziale === 22500 &&
        cfg.ultimoSaldoConto === 20970 &&
        (!appData.savingsMonitor.storico || appData.savingsMonitor.storico.length === 0)
      ) {
        cfg.capitaleIniziale = null;
        cfg.ultimoSaldoConto = null;
        cfg.trasferimentiAttivi = [];
        cfg.debitiAttivi = [];
      }
    }
  });
}

/**
 * Salva l'URL dell'immagine di copertina (Hero) nelle impostazioni.
 */
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
function addEntry(type) {
  if (type === "costo") {
    const cat = document.getElementById("add-costo-cat").value;
    const desc = document.getElementById("add-costo-desc").value.trim();
    const prezzo =
      parseFloat(document.getElementById("add-costo-prezzo").value) || 0;
    const note = document.getElementById("add-costo-note").value;

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
    document.getElementById("add-costo-note").value = "";
    if (confermatoEl) confermatoEl.value = "false";
    appData.settings.users.forEach((u) => {
      let inp = document.getElementById(`add-costo-${u.id}`);
      if (inp) inp.value = "";
    });
    showNotification("Costo aggiunto con successo!");
    toggleAddForm("costo", false);
  } else {
    const desc = document.getElementById("add-budget-desc").value.trim();
    const note = document.getElementById("add-budget-note").value;
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
    document.getElementById("add-budget-note").value = "";
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
    document.getElementById("add-costo-note").value = "";
    appData.settings.users.forEach((u) => {
      let inp = document.getElementById(`add-costo-${u.id}`);
      if (inp) inp.value = "";
    });
  } else {
    document.getElementById("add-budget-desc").value = "";
    document.getElementById("add-budget-note").value = "";
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
  document.getElementById("modal-note").value = item.note || "";

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

  modal.classList.add("active");
}

/**
 * Chiude la modale di modifica voce.
 */
function closeModal() {
  document.getElementById("editModal").classList.remove("active");
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
    item.note = document.getElementById("modal-note").value;
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
    item.note = document.getElementById("modal-note").value;
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
async function deleteBudgetItem(id) {
  const item = appData.budget.find((b) => b.id === id);
  if (item && item.isDebito && item.debitoId) {
    return deleteDebito(item.debitoId);
  }
  const name = item ? `"${item.desc}"` : "questa voce";
  const result = await showConfirm(
    `Eliminare ${name}?`,
    "Questa azione rimuoverà definitivamente la voce dal budget.",
  );
  if (result.isConfirmed) {
    appData.budget = appData.budget.filter((b) => b.id !== id);
    saveDataLocally();
    showNotification("Voce di budget eliminata");
  }
}

/**
 * Popola un elemento <select> con l'elenco dei costi casa disponibili da collegare.
 * @param {HTMLSelectElement} selectEl - Menu a tendina.
 * @param {number[]} currentIds - Array degli ID dei costi già collegati (da escludere).
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
          <span class="material-symbols-outlined" style="color: var(--md-sys-color-primary); font-size: 20px;">help</span>
          <span style="white-space: pre-wrap;">${escapeHTML(item.question)}</span>
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
        <div style="font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${escapeHTML(item.answer)}</div>
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
  document.getElementById("qa-modal-question").value = "";
  document.getElementById("qa-modal-answer").value = "";
  document.getElementById("qa-btn-delete").style.display = "none";
  currentQAImages = [];
  renderQAModalImagesPreview();
  currentQALinkedCostIds = preselectedCostId ? [Number(preselectedCostId)] : [];
  renderQALinkedCostsPreview();
  document.getElementById("qaModal").classList.add("active");
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
  document.getElementById("qa-modal-question").value = item.question || "";
  document.getElementById("qa-modal-answer").value = item.answer || "";
  document.getElementById("qa-btn-delete").style.display = "inline-flex";
  currentQAImages = Array.isArray(item.images) ? [...item.images] : [];
  renderQAModalImagesPreview();
  currentQALinkedCostIds = Array.isArray(item.linkedCostIds)
    ? [...item.linkedCostIds]
    : [];
  renderQALinkedCostsPreview();
  document.getElementById("qaModal").classList.add("active");
}

/**
 * Chiude la modale di modifica o creazione Q&A.
 */
function closeQAModal() {
  document.getElementById("qaModal").classList.remove("active");
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
  const question = document.getElementById("qa-modal-question").value.trim();
  const answer = document.getElementById("qa-modal-answer").value.trim();

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
      "font-size: 15px; color: var(--md-sys-color-on-surface); display: flex; gap: 8px; align-items: flex-start; white-space: pre-wrap; margin-top: 6px;";
    descDiv.innerHTML = `
        <span class="material-symbols-outlined" style="color: var(--md-sys-color-outline); font-size: 20px;">notes</span>
        <span>${escapeHTML(item.desc)}</span>
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
  document.getElementById("task-modal-desc").value = "";
  document.getElementById("task-btn-delete").style.display = "none";
  currentTaskImages = [];
  renderTaskModalImagesPreview();
  currentTaskLinkedCostIds = preselectedCostId
    ? [Number(preselectedCostId)]
    : [];
  renderTaskLinkedCostsPreview();
  document.getElementById("taskModal").classList.add("active");
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
  document.getElementById("task-modal-desc").value = item.desc || "";
  document.getElementById("task-btn-delete").style.display = "inline-flex";
  currentTaskImages = Array.isArray(item.images) ? [...item.images] : [];
  renderTaskModalImagesPreview();
  currentTaskLinkedCostIds = Array.isArray(item.linkedCostIds)
    ? [...item.linkedCostIds]
    : [];
  renderTaskLinkedCostsPreview();
  document.getElementById("taskModal").classList.add("active");
}

function closeTaskModal() {
  document.getElementById("taskModal").classList.remove("active");
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
  const desc = document.getElementById("task-modal-desc").value.trim();

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
      "font-size: 15px; color: var(--md-sys-color-on-surface); margin-top: 6px; white-space: pre-wrap; line-height: 1.5;";
    contentDiv.innerText = item.content;
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
  document.getElementById("note-modal-content").value = "";
  document.getElementById("note-btn-delete").style.display = "none";
  currentNoteImages = [];
  renderNoteModalImagesPreview();
  currentNoteLinkedCostIds = preselectedCostId
    ? [Number(preselectedCostId)]
    : [];
  renderNoteLinkedCostsPreview();
  document.getElementById("noteModal").classList.add("active");
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
  document.getElementById("note-modal-content").value = item.content || "";
  document.getElementById("note-btn-delete").style.display = "flex";
  currentNoteImages = Array.isArray(item.images) ? [...item.images] : [];
  renderNoteModalImagesPreview();
  currentNoteLinkedCostIds = Array.isArray(item.linkedCostIds)
    ? [...item.linkedCostIds]
    : [];
  renderNoteLinkedCostsPreview();
  document.getElementById("noteModal").classList.add("active");
}

function closeNoteModal() {
  document.getElementById("noteModal").classList.remove("active");
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
  const content = document.getElementById("note-modal-content").value.trim();

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
function renderAll() {
  sanitizeData();

  // Migrazione temporanea da appData a localStorage se casaDarkMode non esiste
  if (
    localStorage.getItem("casaDarkMode") === null &&
    appData.settings &&
    appData.settings.hasOwnProperty("darkMode")
  ) {
    localStorage.setItem(
      "casaDarkMode",
      appData.settings.darkMode ? "true" : "false",
    );
  }

  const isDark = localStorage.getItem("casaDarkMode") === "true";
  if (isDark) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
  updateThemeIcons(isDark);

  const hero = document.getElementById("hero-header");
  if (hero && appData.settings.heroImage) {
    hero.style.backgroundImage = `url('${appData.settings.heroImage}')`;
    hero.style.display = "block";
  }

  buildDynamicForms();
  populateCategorySelects();
  renderHeaderAndSettings();
  initTableViewMode();
  renderTables();
  renderCategoriesSection();
  renderQASection();
  renderTaskSection();
  renderNoteSection();
  renderSavingsSection();
  renderDebitiSection();
  updateChartsAndStats();
  calculateMortgage();
  if (currentDetailId !== null) {
    const curCost = appData.costi.find((c) => c.id === currentDetailId);
    if (curCost) {
      renderDetailView(curCost);
    } else {
      closeDetailView();
    }
  }
}

/**
 * Scarica i dati correnti in formato JSON
 */
function exportDataJSON() {
  sanitizeData();
  const dataStr = getSafeAppDataForExport();
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `CostiCasa_Backup_${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Importa i dati da un file JSON e ricarica l'app
 */
function importDataJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (importedData && typeof importedData === "object") {
        appData = importedData;
        sanitizeData();
        localStorage.setItem("casaData", JSON.stringify(appData));
        document.getElementById("wizardModal").classList.remove("active");
        renderAll();
        showNotification("Dati importati con successo!");
        // Try to sync to gist if enabled
        if (casaGithubConfig && casaGithubConfig.enabled) {
          syncToGist();
        }
      } else {
        throw new Error("Formato non valido");
      }
    } catch (error) {
      M3Swal.fire("Errore", "File JSON non valido o corrotto.", "error");
    }
    event.target.value = ""; // Reset input
  };
  reader.readAsText(file);
}

async function wizardSyncFromGist() {
  const token = document.getElementById("wizard-github-token").value.trim();
  const gistId = document.getElementById("wizard-github-gistId").value.trim();

  if (!token || !gistId) {
    return M3Swal.fire(
      "Attenzione",
      "Devi inserire sia il Token che il Gist ID per recuperare il backup.",
      "warning",
    );
  }

  const btn = document.getElementById("btn-wizard-sync");
  btn.innerHTML =
    '<span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">sync</span> Download in corso...';

  try {
    const response = await fetch(
      `https://api.github.com/gists/${gistId}?t=${Date.now()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (response.ok) {
      const data = await response.json();
      const content = data.files["casaData.json"]?.content;
      if (content) {
        const parsed = JSON.parse(content);
        appData = parsed;
        sanitizeData();
        // Force save settings
        casaGithubConfig.enabled = true;
        casaGithubConfig.token = token;
        casaGithubConfig.gistId = gistId;
        saveGithubConfig();
        localStorage.setItem("casaData", JSON.stringify(appData));

        document.getElementById("wizardModal").classList.remove("active");
        renderAll();
        showNotification("Dati ripristinati da GitHub!");
      } else {
        throw new Error("File casaData.json non trovato nel Gist");
      }
    } else {
      throw new Error("Errore durante la connessione a GitHub");
    }
  } catch (err) {
    console.error(err);
    M3Swal.fire(
      "Errore",
      "Impossibile scaricare i dati. Verifica il Token e il Gist ID.",
      "error",
    );
  } finally {
    btn.innerHTML =
      '<span class="material-symbols-outlined">cloud_download</span> Scarica e Accedi';
  }
}

function toggleGithubSettings() {
  const enabled = document.getElementById("settings-github-enabled").checked;
  document.getElementById("github-settings-container").style.display = enabled
    ? "flex"
    : "none";
}

async function saveGithubSettings() {
  const enabled = document.getElementById("settings-github-enabled").checked;
  const token = document.getElementById("settings-github-token").value.trim();
  const gistId = document.getElementById("settings-github-gistId").value.trim();

  if (enabled && !token) {
    return M3Swal.fire(
      "Attenzione",
      "Devi inserire un Token GitHub se abiliti la sincronizzazione.",
      "warning",
    );
  }

  casaGithubConfig.enabled = enabled;
  casaGithubConfig.token = token;
  casaGithubConfig.gistId = gistId;

  saveGithubConfig();

  // Preveniamo che il salvataggio inneschi un push automatico a Gist,
  // così l'utente non sovrascrive involontariamente i dati cloud con quelli locali.
  const wasSyncing = isSyncingToGist;
  isSyncingToGist = true;
  saveDataLocally();
  isSyncingToGist = wasSyncing;

  showNotification("Configurazione salvata con successo", "", "info");
  if (!enabled) {
    showNotification("Sincronizzazione GitHub disabilitata", "", "info");
  }
}

async function forcePullFromGist() {
  showNotification("Ripristino in corso...", "", "info");
  await syncToGist(true, true);
}

async function forcePushToGist() {
  showNotification("Salvataggio su Gist in corso...", "", "info");
  await syncToGist(false, true);
}

function getSafeAppDataForExport() {
  let safeData = JSON.parse(JSON.stringify(appData));
  if (safeData.settings && safeData.settings.githubSync) {
    delete safeData.settings.githubSync;
  }
  return JSON.stringify(safeData, null, 2);
}

/**
 * Esegue la sincronizzazione bidirezionale con GitHub Gist.
 * Se non esiste il Gist, lo crea.
 * Se forcePull è true, tenta sempre di scaricare la versione remota prima.
 */
async function syncToGist(forcePull = false, manualAction = false) {
  if (isSyncingToGist) return;
  if (!casaGithubConfig || !casaGithubConfig.enabled || !casaGithubConfig.token)
    return;

  isSyncingToGist = true;
  const token = casaGithubConfig.token;
  let gistId = casaGithubConfig.gistId;

  const btnSync = document.getElementById("btn-force-sync");
  if (btnSync)
    btnSync.innerHTML =
      '<span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">sync</span> Sincronizzazione...';

  try {
    // Se non c'è il Gist ID, creiamolo
    if (!gistId) {
      const response = await fetch("https://api.github.com/gists", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: "CostiCasa Backup Data",
          public: false,
          files: {
            "casaData.json": {
              content: getSafeAppDataForExport(),
            },
          },
        }),
      });

      if (!response.ok) throw new Error("Errore creazione Gist");
      const data = await response.json();
      casaGithubConfig.gistId = data.id;
      saveGithubConfig();
      document.getElementById("settings-github-gistId").value = data.id;
      renderHeaderAndSettings();
      showNotification("Nuovo Gist creato e dati caricati con successo!");
    } else {
      // C'è un Gist ID. Proviamo a scaricare i dati più recenti prima di sovrascrivere.
      // Per semplificare: se forcePull è vero o se l'app è stata appena caricata, scarichiamo.
      // Altrimenti sovrascriviamo con la versione locale.
      if (forcePull) {
        const response = await fetch(
          `https://api.github.com/gists/${gistId}?t=${Date.now()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );
        if (response.ok) {
          const data = await response.json();
          const content = data.files["casaData.json"]?.content;
          if (content) {
            const parsed = JSON.parse(content);
            const remoteTime = parsed.lastUpdated || 0;
            const localTime = appData.lastUpdated || 0;

            if (remoteTime > localTime) {
              appData = parsed;
              sanitizeData();
              localStorage.setItem("casaData", JSON.stringify(appData));
              renderAll();
              showNotification("Dati scaricati e sincronizzati da GitHub!");
            } else if (localTime > remoteTime) {
              // Locale è più recente (probabilmente un push saltato precedentemente). Facciamo push!
              isSyncingToGist = false; // Sblocchiamo per permettere il push ricorsivo
              syncToGist(false, manualAction);
              return;
            } else {
              if (manualAction)
                showNotification("I dati sono già sincronizzati!");
            }
          }
        }
      } else {
        // Sovrascrivi remoto (Push)
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            files: {
              "casaData.json": {
                content: getSafeAppDataForExport(),
              },
            },
          }),
        });
        if (!response.ok) throw new Error("Errore aggiornamento Gist");
        if (manualAction) {
          showNotification("Dati salvati su GitHub con successo!");
        }
      }
    }
  } catch (err) {
    console.error(err);
    if (forcePull)
      M3Swal.fire(
        "Errore Sync",
        "Impossibile contattare GitHub. Verifica il token e la connessione.",
        "error",
      );
  } finally {
    isSyncingToGist = false;
    if (btnSync)
      btnSync.innerHTML =
        '<span class="material-symbols-outlined">sync</span> Sincronizza Ora';
  }
}

// Aggiungo animazione spin nel CSS se non c'è
if (!document.getElementById("spin-style")) {
  const style = document.createElement("style");
  style.id = "spin-style";
  style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}

/**
 */
function saveDataLocally(skipTimestamp = false) {
  sanitizeData();
  if (!skipTimestamp) {
    appData.lastUpdated = Date.now();
  }
  localStorage.setItem("casaData", JSON.stringify(appData));
  renderAll();

  // Background sync
  if (casaGithubConfig && casaGithubConfig.enabled) {
    syncToGist(false);
  }
}

// Variabili e funzioni per la gestione del Wizard iniziale di configurazione partecipanti
let wizardUsers = [{ id: "u1", name: "Utente", share: 100, safetyFund: 5000 }];

/**
 * Esegue il rendering dei partecipanti configurabili all'interno del wizard iniziale.
 */
function renderWizardUsers() {
  const container = document.getElementById("wizard-users-container");
  container.innerHTML = "";
  wizardUsers.forEach((u, idx) => {
    let div = document.createElement("div");
    div.style.cssText =
      "background: var(--md-sys-color-surface-container-low); padding: 16px; border-radius: var(--md-sys-shape-corner-medium); border: 1px solid var(--md-sys-color-surface-container-high); position: relative;";
    div.innerHTML = `
                    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end;">
                        <div class="input-field" style="flex: 2; min-width: 140px;">
                            <label style="font-weight: 600;">Nome</label>
                            <input type="text" value="${u.name}" placeholder="Es. Mario" oninput="wizardUsers[${idx}].name = this.value">
                        </div>
                        <div class="input-field" style="flex: 1; min-width: 90px;">
                            <label style="font-weight: 600;">Quota (%)</label>
                            <input type="number" value="${u.share}" placeholder="100" oninput="wizardUsers[${idx}].share = parseFloat(this.value)||0">
                        </div>
                        <div class="input-field" style="flex: 1.2; min-width: 120px;">
                            <label style="font-weight: 600;">Fondo Sicurezza (€)</label>
                            <input type="number" value="${u.safetyFund}" placeholder="5000" oninput="wizardUsers[${idx}].safetyFund = parseFloat(this.value)||0">
                        </div>
                        ${wizardUsers.length > 1 ? `<button type="button" class="btn btn-error" style="height: 48px; padding: 0 12px; margin-bottom: 2px;" onclick="removeWizardUser(${idx})" title="Rimuovi partecipante"><span class="material-symbols-outlined">delete</span></button>` : ""}
                    </div>
                `;
    container.appendChild(div);
  });
}

/**
 * Aggiunge una nuova riga utente nel wizard.
 */
function addWizardUser() {
  let newId = "u" + Date.now();
  if (wizardUsers.length === 1) wizardUsers[0].share = 50;
  wizardUsers.push({
    id: newId,
    name: "Partecipante " + (wizardUsers.length + 1),
    share: 50,
    safetyFund: 5000,
  });
  renderWizardUsers();
}

/**
 * Rimuove un utente dal wizard.
 * @param {number} idx - Indice utente.
 */
function removeWizardUser(idx) {
  wizardUsers.splice(idx, 1);
  renderWizardUsers();
}

/**
 * Controlla se la dashboard è già configurata, altrimenti apre il wizard.
 */
function checkWizard() {
  if (!appData.settings || !appData.settings.configured) {
    wizardUsers =
      appData.settings &&
      appData.settings.users &&
      appData.settings.users.length > 0
        ? [...appData.settings.users]
        : [{ id: "u1", name: "Utente", share: 100, safetyFund: 5000 }];
    renderWizardUsers();
    document.getElementById("wizardModal").classList.add("active");
  }
}

/**
 * Conclude la procedura guidata e salva i dati iniziali.
 */
function finishWizard() {
  if (!appData.settings)
    appData.settings = JSON.parse(JSON.stringify(defaultData.settings));
  appData.settings.users = [...wizardUsers];
  appData.settings.configured = true;
  document.getElementById("wizardModal").classList.remove("active");
  saveDataLocally();
  showNotification("Dashboard creata con successo!");
}

let settingsUsers = [];

/**
 * Esegue il rendering della lista dei partecipanti all'interno del pannello Impostazioni.
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
function parseCurrencyInput(value) {
  if (!value) return 0;
  if (typeof value === "number") return value;
  let cleaned = value.replace(/[^0-9,-]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

/**
 * Alterna tra la vista a card fissa di sintesi e la scheda di modifica parametri mutuo.
 * @param {boolean} [forceState] - True per aprire la modifica, False per tornare alla sintesi.
 */
function toggleMutuoParamsEdit(forceState) {
  if (typeof forceState === "boolean") {
    isMutuoParamsEditing = forceState;
  } else {
    isMutuoParamsEditing = !isMutuoParamsEditing;
  }

  const viewCard = document.getElementById("mutuo-params-view-card");
  const editCard = document.getElementById("mutuo-params-edit-card");

  if (viewCard && editCard) {
    if (isMutuoParamsEditing) {
      viewCard.style.display = "none";
      editCard.style.display = "block";
    } else {
      editCard.style.display = "none";
      viewCard.style.display = "block";
      updateMutuoParamsSummaryUI();
    }
  }
}

/**
 * Aggiorna i valori visualizzati nella card fissa di sintesi dei parametri mutuo.
 */
function updateMutuoParamsSummaryUI() {
  const totProjEl = document.getElementById("mutuo-totale-progetto");
  const costoCasaEl = document.getElementById("mutuo-casa-costo");
  const anniEl = document.getElementById("mutuo-anni");
  const tassoEl = document.getElementById("mutuo-tasso");
  const modalitaEl = document.getElementById("mutuo-modalita");
  const singoloUserEl = document.getElementById("mutuo-singolo-user");
  const singoloInteroEl = document.getElementById("mutuo-singolo-intero");

  const sumTotProj = document.getElementById("mutuo-summary-totale-progetto");
  const sumCasa = document.getElementById("mutuo-summary-valore-immobile");
  const sumDurata = document.getElementById("mutuo-summary-durata");
  const sumTasso = document.getElementById("mutuo-summary-tasso");
  const sumModalita = document.getElementById("mutuo-summary-modalita");

  if (sumTotProj && totProjEl) {
    const val = parseCurrencyInput(totProjEl.value);
    sumTotProj.innerText = formatter.format(val);
  }
  if (sumCasa && costoCasaEl) {
    const val = parseCurrencyInput(costoCasaEl.value);
    sumCasa.innerText = formatter.format(val);
  }
  if (sumDurata && anniEl) {
    sumDurata.innerText = `${anniEl.value || 30} Anni`;
  }
  if (sumTasso && tassoEl) {
    sumTasso.innerText = `${tassoEl.value || 0}%`;
  }
  if (sumModalita && modalitaEl) {
    const mode = modalitaEl.value;
    if (mode === "singolo") {
      let userName = "Singolo";
      if (singoloUserEl && singoloUserEl.value) {
        const u = (appData.settings.users || []).find(
          (x) => x.id === singoloUserEl.value,
        );
        if (u) userName = u.name;
      }
      const isIntero = singoloInteroEl && singoloInteroEl.checked;
      sumModalita.innerText = `${userName}${isIntero ? " (100% Intero)" : ""}`;
    } else if (mode === "entrambi") {
      sumModalita.innerText = "Cointestato (Quote %)";
    } else {
      sumModalita.innerText = "Calcolo Automatico";
    }
  }
}

/**
 * Abilita o disabilita la modalità di override manuale per il Totale Progetto e il Valore Immobile del Mutuo.
 */
function toggleEditMutuoInputs() {
  isMutuoManualEdit = !isMutuoManualEdit;
  const btn = document.getElementById("btn-toggle-edit-mutuo");
  const icon = document.getElementById("icon-edit-mutuo");
  const text = document.getElementById("text-edit-mutuo");
  const totProjEl = document.getElementById("mutuo-totale-progetto");
  const costoCasaEl = document.getElementById("mutuo-casa-costo");

  if (isMutuoManualEdit) {
    totProjEl.removeAttribute("readonly");
    costoCasaEl.removeAttribute("readonly");
    totProjEl.style.background = "var(--md-sys-color-surface)";
    costoCasaEl.style.background = "var(--md-sys-color-surface)";
    totProjEl.value = parseCurrencyInput(totProjEl.value).toFixed(2);
    costoCasaEl.value = parseCurrencyInput(costoCasaEl.value).toFixed(2);

    btn.classList.remove("btn-tonal");
    btn.classList.add("btn-filled");
    icon.innerText = "lock_reset";
    text.innerText = "Ripristina Calcolo Automatico";
  } else {
    manualCustomMortgage = null;
    isMortgageEditing = false;
    totProjEl.setAttribute("readonly", "true");
    costoCasaEl.setAttribute("readonly", "true");
    totProjEl.style.background = "var(--md-sys-color-surface-container-high)";
    costoCasaEl.style.background = "var(--md-sys-color-surface-container-high)";

    btn.classList.remove("btn-filled");
    btn.classList.add("btn-tonal");
    icon.innerText = "edit";
    text.innerText = "Modifica Prezzi";
    calculateMortgage();
  }
}

/**
 * Avvia la modalità di modifica inline dell'importo del mutuo nella card.
 */
function startMortgageEdit() {
  isMortgageEditing = true;
  calculateMortgage();
  setTimeout(() => {
    const inp = document.getElementById("manual-mortgage-input");
    if (inp) {
      inp.focus();
      inp.select();
    }
  }, 50);
}

/**
 * Salva il valore personalizzato inserito manualmente nell'input del mutuo.
 */
function saveManualMortgage() {
  const inp = document.getElementById("manual-mortgage-input");
  if (inp) {
    let val = parseFloat(inp.value);
    if (isNaN(val) || val < 0) val = 0;
    manualCustomMortgage = val;
  }
  isMortgageEditing = false;
  calculateMortgage();
}

/**
 * Ripristina il calcolo automatico del mutuo basato sulla liquidità disponibile.
 */
function resetManualMortgage() {
  manualCustomMortgage = null;
  isMortgageEditing = false;
  calculateMortgage();
}

/**
 * Salva i parametri globali del mutuo (anni, tasso, modalità) in localStorage.
 * @param {boolean} [triggerCalculate=true] - Se true, ricalcola le rate immediatamente.
 */
function saveMortgageSettings(triggerCalculate = true) {
  if (!appData.settings.mortgage) appData.settings.mortgage = {};
  const anni = parseInt(document.getElementById("mutuo-anni")?.value) || 30;
  const tasso = parseFloat(document.getElementById("mutuo-tasso")?.value) || 0;
  const modalita = document.getElementById("mutuo-modalita")?.value || "auto";
  const singleUser = document.getElementById("mutuo-singolo-user")?.value || "";
  const singleUserFull =
    document.getElementById("mutuo-singolo-intero")?.checked || false;

  appData.settings.mortgage.years = anni;
  appData.settings.mortgage.rate = tasso;
  appData.settings.mortgage.mode = modalita;
  appData.settings.mortgage.singleUser = singleUser;
  appData.settings.mortgage.singleUserFull = singleUserFull;

  localStorage.setItem("casaData", JSON.stringify(appData));
  if (triggerCalculate) calculateMortgage();
}

/**
 * Calcola le quote del mutuo, l'anticipo necessario, la rata mensile (ammortamento alla francese)
 * e gli interessi complessivi per ciascun utente e per l'intero progetto.
 */
function calculateMortgage() {
  let totProjEl = document.getElementById("mutuo-totale-progetto");
  let costoCasaEl = document.getElementById("mutuo-casa-costo");
  let totaleProgetto = 0;
  let costoCasaImmobile = 0;

  if (isMutuoManualEdit) {
    totaleProgetto = parseFloat(totProjEl.value) || 0;
    costoCasaImmobile = parseFloat(costoCasaEl.value) || 0;
  } else {
    costoCasaImmobile = appData.costi
      .filter((c) => {
        const catObj = appData.settings.categories[c.cat];
        return typeof catObj === "object"
          ? !!catObj.isImmobile
          : c.cat === "Immobili";
      })
      .reduce((acc, curr) => acc + (curr.prezzo || 0), 0);

    if (costoCasaEl)
      costoCasaEl.value = formatter.format(costoCasaImmobile || 0);

    totaleProgetto = appData.costi.reduce(
      (acc, curr) => acc + (curr.prezzo || 0),
      0,
    );
    if (totProjEl) totProjEl.value = formatter.format(totaleProgetto || 0);
  }

  if (appData.settings.mortgage) {
    const elAnni = document.getElementById("mutuo-anni");
    const elTasso = document.getElementById("mutuo-tasso");
    const elModalita = document.getElementById("mutuo-modalita");
    const elSingleUser = document.getElementById("mutuo-singolo-user");

    if (
      elAnni &&
      appData.settings.mortgage.years !== undefined &&
      document.activeElement !== elAnni
    ) {
      elAnni.value = appData.settings.mortgage.years;
    }
    if (
      elTasso &&
      appData.settings.mortgage.rate !== undefined &&
      document.activeElement !== elTasso
    ) {
      elTasso.value = appData.settings.mortgage.rate;
    }
    if (
      elModalita &&
      appData.settings.mortgage.mode !== undefined &&
      document.activeElement !== elModalita
    ) {
      elModalita.value = appData.settings.mortgage.mode;
    }
    if (
      elSingleUser &&
      appData.settings.mortgage.singleUser &&
      document.activeElement !== elSingleUser
    ) {
      elSingleUser.value = appData.settings.mortgage.singleUser;
    }

    const elSingleUserFull = document.getElementById("mutuo-singolo-intero");
    if (
      elSingleUserFull &&
      appData.settings.mortgage.singleUserFull !== undefined
    ) {
      elSingleUserFull.checked = appData.settings.mortgage.singleUserFull;
    }
  }

  const anni = parseInt(document.getElementById("mutuo-anni")?.value) || 30;
  const tassoAnnuo =
    parseFloat(document.getElementById("mutuo-tasso")?.value) || 0;
  const modalita = document.getElementById("mutuo-modalita")?.value || "auto";

  const singoloField = document.getElementById("mutuo-singolo-user-field");
  if (singoloField)
    singoloField.style.display = modalita === "singolo" ? "block" : "none";

  const interoContainer = document.getElementById(
    "mutuo-singolo-intero-container",
  );
  if (interoContainer)
    interoContainer.style.display = modalita === "singolo" ? "block" : "none";

  let userFunds = {};
  appData.settings.users.forEach((u) => {
    const baseFund = appData.budget.reduce((acc, curr) => {
      if (curr.isMutuo) return acc;
      return acc + (curr[u.id] || 0);
    }, 0);
    let netSavings = 0;
    if (appData.savingsMonitor) {
      const sm = calculateSavingsMetrics(u.id);
      if (sm && sm.isConfigured && sm.risparmioNetto > 0) {
        netSavings = sm.risparmioNetto;
      }
    }
    userFunds[u.id] = baseFund + netSavings;
  });

  let userFondoSicurezza = {};
  appData.settings.users.forEach((u) => {
    userFondoSicurezza[u.id] = u.safetyFund !== undefined ? u.safetyFund : 5000;
  });

  let userAnticipo = {};
  let userMutuo = {};

  let totaleQuote =
    appData.settings.users.reduce((acc, u) => acc + u.share, 0) || 100;

  if (manualCustomMortgage !== null) {
    let mTot = manualCustomMortgage;
    let antTot = Math.max(0, totaleProgetto - mTot);

    if (modalita === "singolo") {
      let targetId =
        document.getElementById("mutuo-singolo-user")?.value ||
        appData.settings.users[0]?.id;
      let intero =
        document.getElementById("mutuo-singolo-intero")?.checked || false;

      appData.settings.users.forEach((u) => {
        if (intero) {
          if (u.id === targetId) {
            userMutuo[u.id] = mTot;
            userAnticipo[u.id] = antTot;
          } else {
            userMutuo[u.id] = 0;
            userAnticipo[u.id] = 0;
          }
        } else {
          let quotaProgettoU = totaleProgetto * (u.share / totaleQuote);
          if (u.id === targetId) {
            userMutuo[u.id] = mTot;
            userAnticipo[u.id] = Math.max(0, quotaProgettoU - mTot);
          } else {
            userMutuo[u.id] = 0;
            // l'altro utente copre la sua quota con i propri fondi
            userAnticipo[u.id] = Math.min(
              quotaProgettoU,
              Math.max(
                0,
                (userFunds[u.id] || 0) - (userFondoSicurezza[u.id] || 0),
              ),
            );
          }
        }
      });
    } else if (modalita === "entrambi") {
      appData.settings.users.forEach((u) => {
        let quotaRel = u.share / totaleQuote;
        userMutuo[u.id] = mTot * quotaRel;
        userAnticipo[u.id] = antTot * quotaRel;
      });
    } else {
      let totalMissing = 0;
      let missingFunds = {};
      appData.settings.users.forEach((u) => {
        let quotaProgettoU = totaleProgetto * (u.share / totaleQuote);
        let fondiLiberiU = Math.max(
          0,
          (userFunds[u.id] || 0) - (userFondoSicurezza[u.id] || 0),
        );
        let missing = Math.max(0, quotaProgettoU - fondiLiberiU);
        missingFunds[u.id] = missing;
        totalMissing += missing;
      });

      if (totalMissing > 0) {
        appData.settings.users.forEach((u) => {
          let shareOfMissing = missingFunds[u.id] / totalMissing;
          userMutuo[u.id] = mTot * shareOfMissing;
          userAnticipo[u.id] = Math.max(
            0,
            totaleProgetto * (u.share / totaleQuote) - userMutuo[u.id],
          );
        });
      } else {
        appData.settings.users.forEach((u) => {
          let quotaRel = u.share / totaleQuote;
          userMutuo[u.id] = mTot * quotaRel;
          userAnticipo[u.id] = antTot * quotaRel;
        });
      }
    }
  } else {
    if (modalita === "entrambi") {
      let liquiditaTotaleDisponibile = appData.settings.users.reduce(
        (acc, u) => {
          let fondiLiberi = Math.max(
            0,
            (userFunds[u.id] || 0) - (userFondoSicurezza[u.id] || 0),
          );
          return acc + fondiLiberi;
        },
        0,
      );

      let anticipoTotaleGlobale = Math.min(
        totaleProgetto,
        liquiditaTotaleDisponibile,
      );
      let mutuoTotaleGlobale = Math.max(
        0,
        totaleProgetto - anticipoTotaleGlobale,
      );

      appData.settings.users.forEach((u) => {
        let quotaRelativa = u.share / totaleQuote;
        userAnticipo[u.id] = anticipoTotaleGlobale * quotaRelativa;
        userMutuo[u.id] = mutuoTotaleGlobale * quotaRelativa;
      });
    } else if (modalita === "singolo") {
      let targetId =
        document.getElementById("mutuo-singolo-user")?.value ||
        appData.settings.users[0]?.id;
      let intero =
        document.getElementById("mutuo-singolo-intero")?.checked || false;

      appData.settings.users.forEach((u) => {
        let fondiLiberi = Math.max(
          0,
          (userFunds[u.id] || 0) - (userFondoSicurezza[u.id] || 0),
        );

        if (intero) {
          if (u.id === targetId) {
            let anticipo = Math.min(totaleProgetto, fondiLiberi);
            userAnticipo[u.id] = anticipo;
            userMutuo[u.id] = Math.max(0, totaleProgetto - anticipo);
          } else {
            userAnticipo[u.id] = 0;
            userMutuo[u.id] = 0;
          }
        } else {
          let quotaProgettoU = totaleProgetto * (u.share / totaleQuote);
          let anticipo = Math.min(quotaProgettoU, fondiLiberi);

          if (u.id === targetId) {
            userAnticipo[u.id] = anticipo;
            userMutuo[u.id] = Math.max(0, quotaProgettoU - anticipo);
          } else {
            userAnticipo[u.id] = anticipo;
            userMutuo[u.id] = 0;
          }
        }
      });
    } else {
      appData.settings.users.forEach((u) => {
        let quotaProgettoU = totaleProgetto * (u.share / totaleQuote);
        let fondiLiberiU = Math.max(
          0,
          (userFunds[u.id] || 0) - (userFondoSicurezza[u.id] || 0),
        );
        let anticipoU = Math.min(quotaProgettoU, fondiLiberiU);
        let mutuoU = Math.max(0, quotaProgettoU - anticipoU);

        userAnticipo[u.id] = anticipoU;
        userMutuo[u.id] = mutuoU;
      });
    }

    // Verifica che il mutuo non superi il tetto massimo del valore dell'immobile
    let totalMutuoCheck = Object.values(userMutuo).reduce((a, b) => a + b, 0);
    if (totalMutuoCheck > costoCasaImmobile && costoCasaImmobile > 0) {
      let eccesso = totalMutuoCheck - costoCasaImmobile;
      appData.settings.users.forEach((u) => {
        if (userMutuo[u.id] > 0 && totalMutuoCheck > 0) {
          let mutuoShare = userMutuo[u.id] / totalMutuoCheck;
          let taglio = Math.min(userMutuo[u.id], eccesso * mutuoShare);
          userMutuo[u.id] -= taglio;
          userAnticipo[u.id] += taglio;
        }
      });
    }

    // Arrotondamento per eccesso ai 1000€ per simulare l'erogazione bancaria standard
    appData.settings.users.forEach((u) => {
      if (userMutuo[u.id] > 0) {
        userMutuo[u.id] = Math.ceil(userMutuo[u.id] / 1000) * 1000;
        let quotaProgettoU = totaleProgetto * (u.share / totaleQuote);
        userAnticipo[u.id] = Math.max(0, quotaProgettoU - userMutuo[u.id]);
      }
    });
  }

  let nRate = anni * 12;
  let rMensile = tassoAnnuo / 100 / 12;
  let rataTotale = 0;
  let totaleInteressiComplessivo = 0;
  let totaleRestituitoComplessivo = 0;

  let utentiRisultatiHTML = "";
  let resultCardsHTML = "";
  let totalMutuo = Object.values(userMutuo).reduce((a, b) => a + b, 0);
  let totalAnticipo = Object.values(userAnticipo).reduce((a, b) => a + b, 0);
  lastCalculatedUserMutuo = { ...userMutuo };
  let percentualeMutuo =
    totaleProgetto > 0 ? (totalMutuo / totaleProgetto) * 100 : 0;
  let percentualeAnticipo =
    totaleProgetto > 0 ? (totalAnticipo / totaleProgetto) * 100 : 0;

  appData.settings.users.forEach((u) => {
    let m = userMutuo[u.id] || 0;
    let rataU = 0;
    let totaleRestituitoU = 0;
    let interessiU = 0;

    if (m > 0 && nRate > 0) {
      if (rMensile === 0) {
        rataU = m / nRate;
      } else {
        // Formula ammortamento alla francese a rata costante
        rataU =
          (m * (rMensile * Math.pow(1 + rMensile, nRate))) /
          (Math.pow(1 + rMensile, nRate) - 1);
      }
      totaleRestituitoU = rataU * nRate;
      interessiU = Math.max(0, totaleRestituitoU - m);
    }

    rataTotale += rataU;
    totaleInteressiComplessivo += interessiU;
    totaleRestituitoComplessivo += totaleRestituitoU;

    let rataAnnualeU = rataU * 12;

    utentiRisultatiHTML += `
                    <tr>
                        <td class="col-desc" data-label="Utente"><b>${u.name}</b></td>
                        <td class="col-metric" data-label="Fondi Totali">${formatCurrency(userFunds[u.id])}</td>
                        <td class="col-metric" data-label="Fondo Sicurezza" style="color: var(--md-sys-color-outline);">${formatCurrency(userFondoSicurezza[u.id])}</td>
                        <td class="col-metric" data-label="Disponibile">${formatCurrency(Math.max(0, userFunds[u.id] - userFondoSicurezza[u.id]))}</td>
                        <td class="col-metric" data-label="Anticipo"><span class="sensitive-value">${formatCurrency(userAnticipo[u.id])}</span></td>
                        <td class="col-metric" data-label="Mutuo Necessario" style="color: var(--md-sys-color-primary); font-weight: 500;">${formatCurrency(m)}</td>
                        <td class="col-metric" data-label="Rata Mensile" style="font-weight: 700;"><span class="sensitive-value" style="white-space: nowrap;">${formatCurrency(rataU)}&nbsp;/m</span></td>
                        <td class="col-metric" data-label="Rata Annuale" style="font-weight: 500;"><span class="sensitive-value" style="white-space: nowrap;">${formatCurrency(rataAnnualeU)}&nbsp;/a</span></td>
                        <td class="col-metric" data-label="Interessi Totali" style="color: var(--md-sys-color-error); font-weight: 500;">${formatCurrency(interessiU)}</td>
                        <td class="col-metric" data-label="Totale Restituito" style="font-weight: 600;">${formatCurrency(totaleRestituitoU)}</td>
                    </tr>
                `;
  });

  let percentualeInteressi =
    totalMutuo > 0 ? (totaleInteressiComplessivo / totalMutuo) * 100 : 0;
  let rataAnnualeTotale = rataTotale * 12;

  resultCardsHTML += `
                <div class="stat-card" style="background-color: var(--md-sys-color-primary-container);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 14px; opacity: 0.9;">Mutuo Richiesto (<span class="sensitive-value">${percentualeMutuo.toFixed(1)}%</span>)</span>
                        ${
                          manualCustomMortgage !== null
                            ? `
                            <button class="btn-icon" onclick="resetManualMortgage()" title="Ripristina calcolo automatico" style="color: var(--md-sys-color-on-primary-container); height: 28px; width: 28px; padding: 0;">
                                <span class="material-symbols-outlined" style="font-size: 18px;">lock_reset</span>
                            </button>
                        `
                            : ""
                        }
                    </div>
                    
                    ${
                      isMortgageEditing
                        ? `
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                            <input type="number" step="1000" id="manual-mortgage-input" value="${Math.round(totalMutuo)}" 
                                   style="background: transparent; border: 1px solid rgba(0,0,0,0.2); border-radius: 8px; font-size: 22px; font-weight: 600; width: 100%; color: var(--md-sys-color-on-primary-container); padding: 4px 8px; font-family: inherit; outline: none;"
                                   onkeydown="if(event.key==='Enter') saveManualMortgage()">
                            <button class="btn-icon" onclick="saveManualMortgage()" title="Salva Mutuo" style="color: var(--md-sys-color-on-primary-container); background: rgba(0,0,0,0.08); flex-shrink: 0; width: 36px; height: 36px; padding: 0;">
                                <span class="material-symbols-outlined" style="font-size: 22px;">check</span>
                            </button>
                        </div>
                    `
                        : `
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
                            <div class="stat-value">${formatCurrency(totalMutuo)}</div>
                            <button class="btn-icon" onclick="startMortgageEdit()" title="Modifica Mutuo" style="color: var(--md-sys-color-on-primary-container);">
                                <span class="material-symbols-outlined" style="font-size: 20px;">edit</span>
                            </button>
                        </div>
                    `
                    }

                    <button class="btn btn-filled" style="margin-top: 8px; height: 32px; font-size: 12px; justify-content: center;" onclick="applyMortgageToBudget(${JSON.stringify(userMutuo).replace(/"/g, "&quot;")})">
                        <span class="material-symbols-outlined" style="font-size: 16px;">sync</span> Riporta nel Budget
                    </button>
                </div>
                <div class="stat-card secondary" title="Liquidità e fondi propri versati dai partecipanti per coprire la quota non finanziata dal mutuo">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 14px; opacity: 0.9;">Anticipo (Fondi Propri)</span>
                        ${
                          percentualeAnticipo > 0
                            ? `<span style="font-size: 13px; font-weight: 500; opacity: 0.85;">(<span class="sensitive-value">${percentualeAnticipo.toFixed(1)}%</span>)</span>`
                            : ""
                        }
                    </div>
                    <div class="stat-value sensitive-value">${formatCurrency(totalAnticipo)}</div>
                    <div style="font-size: 12px; opacity: 0.95; margin-top: 4px; display: flex; flex-direction: column; gap: 2px;">
                        ${appData.settings.users
                          .map(
                            (u) =>
                              `<div>${escapeHTML(u.name)}: <b class="sensitive-value">${formatCurrency(userAnticipo[u.id] || 0)}</b></div>`
                          )
                          .join("")}
                    </div>
                </div>
                <div class="stat-card tertiary">
                    <span style="font-size: 14px; opacity: 0.9;">Rata Mensile & Annuale</span>
                    <div class="stat-value">${formatCurrency(rataTotale)} /mese</div>
                    <div style="font-size: 13px; opacity: 0.9; margin-top: 2px;">All'anno: <b>${formatCurrency(rataAnnualeTotale)}</b></div>
                </div>
                <div class="stat-card" style="background-color: var(--md-sys-color-surface-container-high); color: var(--md-sys-color-on-surface);">
                    <span style="font-size: 14px; opacity: 0.9;">Interessi Totali Banca</span>
                    <div style="display: flex; align-items: baseline; gap: 8px;">
                        <div class="stat-value" style="color: var(--md-sys-color-error);">${formatCurrency(totaleInteressiComplessivo)}</div>
                        <span style="font-size: 14px; font-weight: 500; color: var(--md-sys-color-error);">(<span class="sensitive-value">${percentualeInteressi.toFixed(1)}%</span>)</span>
                    </div>
                    <div style="font-size: 12px; color: var(--md-sys-color-outline); margin-top: 2px;">Restituzione totale: <b>${formatCurrency(totaleRestituitoComplessivo)}</b></div>
                </div>
            `;

  let resCardsEl = document.getElementById("mutuo-result-cards");
  if (resCardsEl) resCardsEl.innerHTML = resultCardsHTML;
  let tableMutuoTbody = document.querySelector("#table-mutuo-utenti tbody");
  if (tableMutuoTbody) tableMutuoTbody.innerHTML = utentiRisultatiHTML;
  let mutuoDetailsCard = document.getElementById("mutuo-details-card");
  if (mutuoDetailsCard) mutuoDetailsCard.style.display = "block";
  updateTableViewModeUI();
  updateMutuoParamsSummaryUI();
  renderLiquidityGuard();
}

/**
 * Sincronizza i valori del mutuo calcolati all'interno della voce dedicata nella tabella Budget.
 * @param {Object} mutuoValues - Mappa degli importi del mutuo indicizzati per utente.
 */
function applyMortgageToBudget(mutuoValues) {
  let mutuoRow = appData.budget.find((b) => b.isMutuo);
  if (!mutuoRow) {
    mutuoRow = {
      id: Date.now(),
      desc: "Mutuo Casa",
      isMutuo: true,
      note: "Da Chiedere",
    };
    appData.budget.push(mutuoRow);
  }
  appData.settings.users.forEach((u) => {
    mutuoRow[u.id] = mutuoValues[u.id] || 0;
  });
  saveDataLocally();
  showNotification("Valori mutuo aggiornati nel budget!");
}

/* ========================================================
   SALVAGUARDIA LIQUIDITÀ & ANTICIPO MASSIMO IMMOBILE
   ======================================================== */
let currentMortgageContext = null;

/**
 * Restituisce le spese che non sono categorizzate come Immobili.
 * @returns {Array} Elenco dei costi extra
 */
function getEligibleExtraCosts() {
  return (appData.costi || []).filter((c) => {
    const catObj = appData.settings.categories[c.cat];
    const isImm =
      typeof catObj === "object" ? !!catObj.isImmobile : c.cat === "Immobili";
    return !isImm;
  });
}

/**
 * Restituisce gli ID delle voci extra selezionate dall'utente.
 * Se non configurate, di default seleziona tutte le voci extra.
 * @returns {Array<number|string>}
 */
function getSelectedExtraCostIds() {
  if (
    !appData.settings.mortgage ||
    !Array.isArray(appData.settings.mortgage.selectedExtraCostIds)
  ) {
    return [];
  }
  return appData.settings.mortgage.selectedExtraCostIds;
}

/**
 * Attiva o disattiva la selezione di una voce extra per il calcolo dell'anticipo massimo sostenibile.
 * @param {number|string} costId - ID del costo
 */
function toggleExtraCostSelection(costId) {
  if (!appData.settings.mortgage) appData.settings.mortgage = {};
  let current = getSelectedExtraCostIds().slice();
  const idNum = Number(costId);
  const idx = current.findIndex((id) => Number(id) === idNum);
  if (idx > -1) {
    current.splice(idx, 1);
  } else {
    current.push(idNum);
  }
  appData.settings.mortgage.selectedExtraCostIds = current;
  saveDataLocally();
  renderLiquidityGuard();
}

/**
 * Seleziona tutte le voci extra idonee.
 */
function selectAllExtraCosts() {
  if (!appData.settings.mortgage) appData.settings.mortgage = {};
  appData.settings.mortgage.selectedExtraCostIds = getEligibleExtraCosts().map(
    (c) => c.id,
  );
  saveDataLocally();
  renderLiquidityGuard();
}

/**
 * Deseleziona tutte le voci extra.
 */
function deselectAllExtraCosts() {
  if (!appData.settings.mortgage) appData.settings.mortgage = {};
  appData.settings.mortgage.selectedExtraCostIds = [];
  saveDataLocally();
  renderLiquidityGuard();
}

/**
 * Calcola e renderizza il Quadro Liquidità & Anticipo Massimo Immobile:
 * - Informazioni tarate su CHI richiede il mutuo (tutti se cointestato, ripartiti se singolo/parziale)
 * - 4 Indicatori Chiave (Immobile, Extra Selezionate, Capitale Partecipanti, Anticipo Max Sicuro)
 * - Multiselezione delle voci extra espandibile (escludendo gli immobili)
 * - Tabella di ripartizione per chi richiede il mutuo con già saldato e anticipo massimo da dare
 */
function renderLiquidityGuard() {
  const container =
    document.getElementById("mutuo-liquidity-guard-container") ||
    document.getElementById("mutuo-liquidity-guard-card");
  if (!container) return;

  // 1. Spese Immobili (escluse dalla selezione perché costituiscono il valore dell'immobile)
  const immobileCosts = (appData.costi || []).filter((c) => {
    const catObj = appData.settings.categories[c.cat];
    return typeof catObj === "object" ? !!catObj.isImmobile : c.cat === "Immobili";
  });

  let immobilePrezzo = 0;
  let immobileSaldato = 0;
  let userImmobilePaid = {};
  appData.settings.users.forEach((u) => {
    userImmobilePaid[u.id] = 0;
  });

  immobileCosts.forEach((c) => {
    immobilePrezzo += c.prezzo || 0;
    appData.settings.users.forEach((u) => {
      const p = parseFloat(c[u.id]) || 0;
      immobileSaldato += p;
      userImmobilePaid[u.id] += p;
    });
  });
  const immobileDaSaldare = Math.max(0, immobilePrezzo - immobileSaldato);

  // 2. Voci Extra Idonee e Selezione Attiva
  const eligibleCosts = getEligibleExtraCosts();
  const selectedIds = new Set(getSelectedExtraCostIds().map(Number));
  const selectedExtraCosts = eligibleCosts.filter((c) =>
    selectedIds.has(Number(c.id)),
  );

  let extraPrezzo = 0;
  let extraSaldato = 0;
  let userExtraPaid = {};
  appData.settings.users.forEach((u) => {
    userExtraPaid[u.id] = 0;
  });

  selectedExtraCosts.forEach((c) => {
    extraPrezzo += c.prezzo || 0;
    appData.settings.users.forEach((u) => {
      const p = parseFloat(c[u.id]) || 0;
      extraSaldato += p;
      userExtraPaid[u.id] += p;
    });
  });
  const extraDaSaldare = Math.max(0, extraPrezzo - extraSaldato);

  // 3. Liquidità Totale e per Partecipante (da Budget e Riserve di Sicurezza)
  let totaleQuote =
    appData.settings.users.reduce(
      (acc, u) => acc + (parseFloat(u.share) || 0),
      0,
    ) || 100;

  let totalFunds = 0;
  let totalSafetyFund = 0;
  let userFunds = {};
  let userSafetyFund = {};
  let userLiquidFree = {};

  appData.settings.users.forEach((u) => {
    const fondiU = (appData.budget || [])
      .filter((b) => !b.isMutuo)
      .reduce((sum, b) => sum + (parseFloat(b[u.id]) || 0), 0);
    const riservaU = parseFloat(u.safetyFund) || 0;
    const liberiU = Math.max(0, fondiU - riservaU);

    userFunds[u.id] = fondiU;
    userSafetyFund[u.id] = riservaU;
    userLiquidFree[u.id] = liberiU;

    totalFunds += fondiU;
    totalSafetyFund += riservaU;
  });

  const totalLiquidFree = Math.max(0, totalFunds - totalSafetyFund);

  // 4. Determinazione di chi richiede il mutuo (modalità singolo, entrambi o auto)
  const modalita = document.getElementById("mutuo-modalita")?.value || "auto";
  const targetId =
    document.getElementById("mutuo-singolo-user")?.value ||
    appData.settings.users[0]?.id;
  const intero =
    document.getElementById("mutuo-singolo-intero")?.checked || false;

  let mortgageUsers = [];
  if (modalita === "singolo") {
    mortgageUsers = appData.settings.users.filter((u) => u.id === targetId);
    if (mortgageUsers.length === 0 && appData.settings.users.length > 0) {
      mortgageUsers = [appData.settings.users[0]];
    }
  } else if (modalita === "entrambi") {
    mortgageUsers = appData.settings.users.slice();
  } else {
    // Modalità auto: verifica chi ha un disavanzo rispetto alla propria quota
    const totProjVal = (appData.costi || []).reduce(
      (acc, c) => acc + (c.prezzo || 0),
      0,
    );
    const withShortfall = appData.settings.users.filter((u) => {
      const quotaU = totProjVal * ((parseFloat(u.share) || 0) / totaleQuote);
      return quotaU > (userLiquidFree[u.id] || 0);
    });
    mortgageUsers =
      withShortfall.length > 0 ? withShortfall : appData.settings.users.slice();
  }

  const isAllUsers =
    mortgageUsers.length === appData.settings.users.length;

  // Badge testuale Intestatario Mutuo
  const badgeEl = document.getElementById("liquidity-target-badge");
  if (badgeEl) {
    if (isAllUsers) {
      badgeEl.innerHTML = `<span style="font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 8px; background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); display: flex; align-items: center; gap: 4px;"><span class="material-symbols-outlined" style="font-size: 16px;">group</span> Mutuo Cointestato (Tutti i partecipanti)</span>`;
    } else {
      const targetNames = mortgageUsers.map((u) => u.name).join(", ");
      const shareDesc =
        modalita === "singolo" && intero
          ? "100% Intero Immobile"
          : `Quota ${mortgageUsers.map((u) => `${u.name} ${u.share}%`).join(" • ")}`;
      badgeEl.innerHTML = `<span style="font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 8px; background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); display: flex; align-items: center; gap: 4px;"><span class="material-symbols-outlined" style="font-size: 16px;">person</span> Intestatario Mutuo: <b>${targetNames}</b> (${shareDesc})</span>`;
    }
  }

  // 5. Calcolo dei valori per chi chiede il mutuo (Scope Card Superiori & Indicatori)
  let scopeImmobilePrezzo = 0;
  let scopeImmobileSaldato = 0;
  let scopeImmobileDaSaldare = 0;
  let scopeExtraPrezzo = 0;
  let scopeExtraSaldato = 0;
  let scopeExtraDaSaldare = 0;
  let scopeCapitale = 0;
  let scopeSafetyFund = 0;
  let scopeFondiLiberi = 0;

  if (isAllUsers) {
    scopeImmobilePrezzo = immobilePrezzo;
    scopeImmobileSaldato = immobileSaldato;
    scopeImmobileDaSaldare = immobileDaSaldare;
    scopeExtraPrezzo = extraPrezzo;
    scopeExtraSaldato = extraSaldato;
    scopeExtraDaSaldare = extraDaSaldare;
    scopeCapitale = totalFunds;
    scopeSafetyFund = totalSafetyFund;
    scopeFondiLiberi = totalLiquidFree;
  } else {
    let applicantImmobileRatio = 0;
    let applicantExtraRatio = 0;

    if (modalita === "singolo" && intero) {
      applicantImmobileRatio = 1;
      applicantExtraRatio =
        (parseFloat(mortgageUsers[0]?.share) || 0) / totaleQuote;
    } else {
      const sumShares = mortgageUsers.reduce(
        (sum, u) => sum + (parseFloat(u.share) || 0),
        0,
      );
      applicantImmobileRatio = sumShares / totaleQuote;
      applicantExtraRatio = sumShares / totaleQuote;
    }

    scopeImmobilePrezzo = immobilePrezzo * applicantImmobileRatio;
    scopeImmobileSaldato = mortgageUsers.reduce(
      (sum, u) => sum + (userImmobilePaid[u.id] || 0),
      0,
    );
    scopeImmobileDaSaldare = Math.max(
      0,
      scopeImmobilePrezzo - scopeImmobileSaldato,
    );

    scopeExtraPrezzo = extraPrezzo * applicantExtraRatio;
    scopeExtraSaldato = mortgageUsers.reduce(
      (sum, u) => sum + (userExtraPaid[u.id] || 0),
      0,
    );
    scopeExtraDaSaldare = Math.max(0, scopeExtraPrezzo - scopeExtraSaldato);

    scopeCapitale = mortgageUsers.reduce(
      (sum, u) => sum + (userFunds[u.id] || 0),
      0,
    );
    scopeSafetyFund = mortgageUsers.reduce(
      (sum, u) => sum + (userSafetyFund[u.id] || 0),
      0,
    );
    scopeFondiLiberi = Math.max(0, scopeCapitale - scopeSafetyFund);
  }

  // Quota Mutuo deliberata/richiesta per chi chiede il mutuo (dal calcolatore mutuo o dalla riga del budget)
  const mutuoRow = (appData.budget || []).find((b) => b.isMutuo);
  let userMutuoMap = {};
  appData.settings.users.forEach((u) => {
    let mVal = 0;
    if (lastCalculatedUserMutuo && lastCalculatedUserMutuo[u.id] !== undefined) {
      mVal = lastCalculatedUserMutuo[u.id];
    } else if (mutuoRow && mutuoRow[u.id] !== undefined) {
      mVal = parseFloat(mutuoRow[u.id]) || 0;
    }
    userMutuoMap[u.id] = mVal;
  });

  const scopeMutuo = mortgageUsers.reduce(
    (sum, u) => sum + (userMutuoMap[u.id] || 0),
    0,
  );

  // Differenza da saldare di tasca propria per l'immobile: (Residuo Immobile - Mutuo Concesso)
  const scopeSaldoImmobileProprio = Math.max(
    0,
    scopeImmobileDaSaldare - scopeMutuo,
  );

  // Totale esborso effettivo da versare di tasca propria: Saldo Immobile + Spese Extra non nel mutuo
  const scopeTotaleEsborso = scopeSaldoImmobileProprio + scopeExtraDaSaldare;

  // Liquidità residua sui conti dopo aver versato l'esborso totale (disponibile per arredamento, imprevisti, ecc.)
  const scopeLiquiditaResidua = scopeFondiLiberi - scopeTotaleEsborso;

  // 6. Render Indicatori Sintetici (KPI Cards)
  const kpiGridEl = document.getElementById("liquidity-kpi-grid");
  if (kpiGridEl) {
    const immTitle = isAllUsers
      ? "Quota Immobile"
      : `Quota Immobile (${mortgageUsers.map((u) => u.name).join(", ")})`;
    const mutuoTitle = isAllUsers
      ? "Mutuo Concesso Banca"
      : `Mutuo Banca (${mortgageUsers.map((u) => u.name).join(", ")})`;
    const extraTitle = isAllUsers
      ? "Spese Extra non nel Mutuo"
      : `Quota Extra (${mortgageUsers.map((u) => u.name).join(", ")})`;
    const esborsoTitle = isAllUsers
      ? "Totale da Versare (Fondi Propri)"
      : `Esborso Proprio (${mortgageUsers.map((u) => u.name).join(", ")})`;

    const percCoperturaMutuo =
      scopeImmobileDaSaldare > 0
        ? Math.min(100, (scopeMutuo / scopeImmobileDaSaldare) * 100).toFixed(1)
        : "100.0";

    kpiGridEl.innerHTML = `
      <div class="liquidity-kpi-card">
        <div class="liquidity-kpi-card-header">
          <span class="liquidity-kpi-card-title">${immTitle}</span>
          <span class="material-symbols-outlined liquidity-kpi-card-icon">home</span>
        </div>
        <div class="liquidity-kpi-card-val sensitive-value">${formatCurrency(scopeImmobilePrezzo)}</div>
        <div class="liquidity-kpi-card-sub">
          Già saldato: <b class="sensitive-value">${formatCurrency(scopeImmobileSaldato)}</b> • Residuo: <b class="sensitive-value">${formatCurrency(scopeImmobileDaSaldare)}</b>
        </div>
      </div>

      <div class="liquidity-kpi-card">
        <div class="liquidity-kpi-card-header">
          <span class="liquidity-kpi-card-title">${mutuoTitle}</span>
          <span class="material-symbols-outlined liquidity-kpi-card-icon" style="color: var(--md-sys-color-primary);">account_balance</span>
        </div>
        <div class="liquidity-kpi-card-val sensitive-value">${formatCurrency(scopeMutuo)}</div>
        <div class="liquidity-kpi-card-sub">
          Copre il <b>${percCoperturaMutuo}%</b> dell'immobile da saldare
        </div>
      </div>

      <div class="liquidity-kpi-card" style="border-left: 3px solid #f59e0b;">
        <div class="liquidity-kpi-card-header">
          <span class="liquidity-kpi-card-title">${extraTitle}</span>
          <span class="material-symbols-outlined liquidity-kpi-card-icon" style="color: #f59e0b;">payments</span>
        </div>
        <div class="liquidity-kpi-card-val sensitive-value" style="color: #f59e0b;">${formatCurrency(scopeExtraDaSaldare)}</div>
        <div class="liquidity-kpi-card-sub">
          Totale: <span class="sensitive-value">${formatCurrency(scopeExtraPrezzo)}</span> • Saldati: <span class="sensitive-value">${formatCurrency(scopeExtraSaldato)}</span> (${selectedExtraCosts.length}/${eligibleCosts.length} voci)
        </div>
      </div>

      <div class="liquidity-kpi-card" style="border-left: 3px solid var(--md-sys-color-primary); background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container);">
        <div class="liquidity-kpi-card-header">
          <span class="liquidity-kpi-card-title" style="color: var(--md-sys-color-on-primary-container);">${esborsoTitle}</span>
          <span class="material-symbols-outlined liquidity-kpi-card-icon" style="color: var(--md-sys-color-on-primary-container);">wallet</span>
        </div>
        <div class="liquidity-kpi-card-val sensitive-value">${formatCurrency(scopeTotaleEsborso)}</div>
        <div class="liquidity-kpi-card-sub" style="color: var(--md-sys-color-on-primary-container); opacity: 0.95;">
          Casa: <b class="sensitive-value">${formatCurrency(scopeSaldoImmobileProprio)}</b> + Extra: <b class="sensitive-value">${formatCurrency(scopeExtraDaSaldare)}</b>
        </div>
      </div>
    `;

    const bannerEl = document.getElementById("liquidity-residua-banner");
    if (bannerEl) {
      bannerEl.innerHTML = `
        <div style="padding: 14px 18px; border-radius: 12px; background: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-surface-container-high); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; width: 100%; box-sizing: border-box;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: ${scopeLiquiditaResidua >= 0 ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)"}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span class="material-symbols-outlined" style="color: ${scopeLiquiditaResidua >= 0 ? "#16a34a" : "var(--md-sys-color-error)"}; font-size: 22px;">${scopeLiquiditaResidua >= 0 ? "chair" : "warning"}</span>
            </div>
            <div>
              <div style="font-size: 14px; font-weight: 700; color: var(--md-sys-color-on-surface);">
                Liquidità Residua sul Conto dopo il Saldo: <span class="sensitive-value" style="color: ${scopeLiquiditaResidua >= 0 ? "#16a34a" : "var(--md-sys-color-error)"};">${formatCurrency(scopeLiquiditaResidua)}</span>
              </div>
              <div style="font-size: 12px; color: var(--md-sys-color-outline); margin-top: 2px;">
                ${scopeLiquiditaResidua >= 0 ? `Versati i <b>${formatCurrency(scopeTotaleEsborso)}</b> di tasca tua, ti rimarranno questi fondi liberi sul conto per arredamento, trasloco e spese personali.` : `Attenzione: l'esborso necessario supera i tuoi fondi liquidi attualmente registrati.`}
              </div>
            </div>
          </div>
          <div style="font-size: 12px; color: var(--md-sys-color-outline); white-space: nowrap;">
            Fondo di riserva protetto: <b class="sensitive-value">${formatCurrency(scopeSafetyFund)}</b>
          </div>
        </div>
      `;
    }
  }

  // 7. Render Multiselezione Voci Extra Espandibile
  const selectionEl = document.getElementById("extra-cost-selection-container");
  if (selectionEl) {
    const wasOpen =
      document.getElementById("extra-cost-collapsible")?.open || false;

    let itemsHTML = "";
    if (eligibleCosts.length === 0) {
      itemsHTML = `<div style="grid-column: 1 / -1; padding: 16px; text-align: center; color: var(--md-sys-color-outline); font-size: 13px;">Nessuna voce extra registrata nei costi.</div>`;
    } else {
      itemsHTML = eligibleCosts
        .map((c) => {
          const catObj = appData.settings.categories[c.cat];
          const color =
            typeof catObj === "object" ? catObj.color : catObj || "#6750A4";
          const sumPaid = appData.settings.users.reduce(
            (acc, u) => acc + (parseFloat(c[u.id]) || 0),
            0,
          );
          const prezzo = c.prezzo || 0;
          const isSelected = selectedIds.has(Number(c.id));

          let tagHTML = "";
          if (sumPaid >= prezzo && prezzo > 0) {
            tagHTML = `<span class="extra-cost-paid-tag complete">Saldato (100%)</span>`;
          } else if (sumPaid > 0) {
            tagHTML = `<span class="extra-cost-paid-tag partial">Parziale: <span class="sensitive-value">${formatCurrency(sumPaid)}</span> / <span class="sensitive-value">${formatCurrency(prezzo)}</span></span>`;
          } else {
            tagHTML = `<span class="extra-cost-paid-tag unpaid">Da saldare: <span class="sensitive-value">${formatCurrency(prezzo)}</span></span>`;
          }

          return `
            <div class="extra-cost-item-card ${isSelected ? "checked" : ""}" onclick="toggleExtraCostSelection(${c.id})">
              <input type="checkbox" class="extra-cost-checkbox" ${isSelected ? "checked" : ""} onclick="event.stopPropagation(); toggleExtraCostSelection(${c.id})">
              <div class="extra-cost-info">
                <div class="extra-cost-title-row">
                  <span class="extra-cost-desc" title="${escapeHTML(c.desc || "Senza descrizione")}">${escapeHTML(c.desc || "Senza descrizione")}</span>
                  <span class="sensitive-value" style="font-size: 13px; font-weight: 700; flex-shrink: 0;">${formatCurrency(prezzo)}</span>
                </div>
                <div class="extra-cost-meta-row">
                  <span class="extra-cost-cat-pill" style="background-color: ${color};">${escapeHTML(c.cat || "Altro")}</span>
                  ${tagHTML}
                </div>
              </div>
            </div>
          `;
        })
        .join("");
    }

    selectionEl.innerHTML = `
      <details class="extra-cost-collapsible" id="extra-cost-collapsible" ${wasOpen ? "open" : ""}>
        <summary class="extra-cost-summary">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span class="material-symbols-outlined" style="font-size: 20px; color: var(--md-sys-color-primary);">checklist</span>
            <span style="font-size: 14px; font-weight: 700; color: var(--md-sys-color-on-surface);">
              Seleziona Voci Extra da Anticipare / Saldare con Fondi Propri
            </span>
            <span style="font-size: 11.5px; font-weight: 600; padding: 2px 8px; border-radius: 6px; background: var(--md-sys-color-surface-container-high); color: var(--md-sys-color-on-surface);">
              ${selectedExtraCosts.length} di ${eligibleCosts.length} selezionate • <span class="sensitive-value">${formatCurrency(extraPrezzo)}</span>
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 12px; color: var(--md-sys-color-outline);">Gestisci voci</span>
            <span class="material-symbols-outlined expand-chevron">expand_more</span>
          </div>
        </summary>

        <div class="extra-cost-body">
          <div class="extra-cost-selection-header">
            <div style="font-size: 12px; color: var(--md-sys-color-outline);">
              Esclude automaticamente gli immobili già computati. Seleziona quali spese accessorie considerare per il calcolo della liquidità riservata.
            </div>
            <div class="extra-cost-selection-actions">
              <button type="button" class="btn btn-tonal" onclick="selectAllExtraCosts()" style="height: 32px; font-size: 12px; padding: 0 10px;">
                <span class="material-symbols-outlined" style="font-size: 16px;">select_all</span> Seleziona Tutte
              </button>
              <button type="button" class="btn btn-tonal" onclick="deselectAllExtraCosts()" style="height: 32px; font-size: 12px; padding: 0 10px;">
                <span class="material-symbols-outlined" style="font-size: 16px;">deselect</span> Deseleziona Tutte
              </button>
            </div>
          </div>

          <div class="extra-cost-grid">
            ${itemsHTML}
          </div>
        </div>
      </details>
    `;
  }

  // 8. Render Tabella di Ripartizione per chi chiede il mutuo (senza card)
  const splitEl = document.getElementById("liquidity-split-container");
  if (splitEl) {
    let rowsHTML = "";
    let sumQuotaImm = 0;
    let sumGiaSaldatoImm = 0;
    let sumResiduoImm = 0;
    let sumMutuo = 0;
    let sumSaldoImmProprio = 0;
    let sumExtraDaSaldare = 0;
    let sumTotaleEsborso = 0;
    let sumLiquiditaResidua = 0;

    mortgageUsers.forEach((u) => {
      const sharePct = parseFloat(u.share) || 0;
      const userPropertyRatio =
        modalita === "singolo" && intero ? 1 : sharePct / totaleQuote;
      const userExtraRatio = sharePct / totaleQuote;

      const userQuotaImm = immobilePrezzo * userPropertyRatio;
      const userGiaSaldatoImm = userImmobilePaid[u.id] || 0;
      const userResiduoImm = Math.max(0, userQuotaImm - userGiaSaldatoImm);

      const userMutuo = userMutuoMap[u.id] || 0;
      const userSaldoImmProprio = Math.max(0, userResiduoImm - userMutuo);

      const userExtraPrezzo = extraPrezzo * userExtraRatio;
      const userExtraSaldato = userExtraPaid[u.id] || 0;
      const userExtraDaSaldare = Math.max(0, userExtraPrezzo - userExtraSaldato);

      const userTotaleEsborso = userSaldoImmProprio + userExtraDaSaldare;
      const userFondiLiberi = userLiquidFree[u.id] || 0;
      const userLiquiditaResidua = userFondiLiberi - userTotaleEsborso;

      sumQuotaImm += userQuotaImm;
      sumGiaSaldatoImm += userGiaSaldatoImm;
      sumResiduoImm += userResiduoImm;
      sumMutuo += userMutuo;
      sumSaldoImmProprio += userSaldoImmProprio;
      sumExtraDaSaldare += userExtraDaSaldare;
      sumTotaleEsborso += userTotaleEsborso;
      sumLiquiditaResidua += userLiquiditaResidua;

      const shareLabel =
        modalita === "singolo" && intero ? "100% (Intero)" : `${sharePct}%`;

      rowsHTML += `
        <tr>
          <td class="col-desc" data-label="Partecipante">
            <div style="font-weight: 600;">${escapeHTML(u.name)}</div>
            <div style="font-size: 11px; color: var(--md-sys-color-outline);">Riserva: <span class="sensitive-value">${formatCurrency(userSafetyFund[u.id] || 0)}</span></div>
          </td>
          <td class="col-metric" data-label="Quota (%)" style="font-weight: 600;">${shareLabel}</td>
          <td class="col-metric" data-label="Quota Immobile"><span class="sensitive-value">${formatCurrency(userQuotaImm)}</span></td>
          <td class="col-metric" data-label="Già Pagato"><span class="sensitive-value">${formatCurrency(userGiaSaldatoImm)}</span></td>
          <td class="col-metric" data-label="Residuo Casa" style="font-weight: 600;"><span class="sensitive-value">${formatCurrency(userResiduoImm)}</span></td>
          <td class="col-metric" data-label="Mutuo Banca" style="color: var(--md-sys-color-primary);"><span class="sensitive-value">${formatCurrency(userMutuo)}</span></td>
          <td class="col-metric" data-label="Saldo Immobile" style="font-weight: 600;"><span class="sensitive-value">${formatCurrency(userSaldoImmProprio)}</span></td>
          <td class="col-metric" data-label="Extra da Saldare" style="color: #f59e0b; font-weight: 600;"><span class="sensitive-value">${formatCurrency(userExtraDaSaldare)}</span></td>
          <td class="col-metric" data-label="Totale da Versare" style="color: var(--md-sys-color-primary); font-weight: 700;"><span class="sensitive-value">${formatCurrency(userTotaleEsborso)}</span></td>
          <td class="col-metric" data-label="Liquidità Residua" style="font-weight: 700; color: ${userLiquiditaResidua >= 0 ? "var(--md-sys-color-success)" : "var(--md-sys-color-error)"};"><span class="sensitive-value">${formatCurrency(userLiquiditaResidua)}</span></td>
        </tr>
      `;
    });

    const totalShareLabel = isAllUsers
      ? "100%"
      : modalita === "singolo" && intero
        ? "100%"
        : `${mortgageUsers.reduce((s, u) => s + (parseFloat(u.share) || 0), 0)}%`;

    const beneficiaryLabel = isAllUsers
      ? "tutti i partecipanti"
      : `<b>${mortgageUsers.map((u) => escapeHTML(u.name)).join(", ")}</b>`;

    splitEl.innerHTML = `
      <div class="table-card-header" style="font-size: 15px; font-weight: 700; margin-bottom: 10px; color: var(--md-sys-color-on-surface); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="material-symbols-outlined" style="color: var(--md-sys-color-primary); font-size: 20px;">account_balance_wallet</span>
          <span>Piano Esborso Saldo & Liquidità Residua ${isAllUsers ? "per Quota Configurazione" : `(Intestatario: ${mortgageUsers.map((u) => escapeHTML(u.name)).join(", ")})`}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 12px; font-weight: 500; color: var(--md-sys-color-outline);">
            ${isAllUsers ? `Quote applicate: ${appData.settings.users.map((u) => `${escapeHTML(u.name)} ${u.share}%`).join(" • ")}` : `Richiesta mutuo: ${mortgageUsers.map((u) => `${escapeHTML(u.name)} (${modalita === "singolo" && intero ? 100 : u.share}%)`).join(" • ")}`}
          </span>
          <div class="table-view-toggle" data-table="liquidity-split">
            <button type="button" class="btn-toggle active" data-view="cards" onclick="setTableViewMode('cards')" title="Visualizza come Schede">
              <span class="material-symbols-outlined">grid_view</span>
              <span>Schede</span>
            </button>
            <button type="button" class="btn-toggle" data-view="table" onclick="setTableViewMode('table')" title="Visualizza come Tabella">
              <span class="material-symbols-outlined">table_chart</span>
              <span>Tabella</span>
            </button>
          </div>
        </div>
      </div>

      <div class="table-container" style="border-radius: var(--md-sys-shape-corner-medium); border: 1px solid var(--md-sys-color-surface-container-high);">
        <table class="liquidity-split-table">
          <thead>
            <tr>
              <th>Partecipante</th>
              <th style="text-align: center;">Quota (%)</th>
              <th style="text-align: right;">Quota Immobile</th>
              <th style="text-align: right;">Già Pagato</th>
              <th style="text-align: right;">Residuo Casa</th>
              <th style="text-align: right; color: var(--md-sys-color-primary);">Mutuo Banca</th>
              <th style="text-align: right;">Saldo Immobile</th>
              <th style="text-align: right; color: #f59e0b;">Extra da Saldare</th>
              <th style="text-align: right; color: var(--md-sys-color-primary);">Totale da Versare</th>
              <th style="text-align: right; color: var(--md-sys-color-success);">Liquidità Residua</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
            <tr class="total-row">
              <td class="col-desc" data-label="Partecipante"><b>${isAllUsers ? "TOTALE PROGETTO" : "TOTALE INTESTATARIO"}</b></td>
              <td class="col-metric" data-label="Quota (%)" style="font-weight: 700;">${totalShareLabel}</td>
              <td class="col-metric" data-label="Quota Immobile" style="font-weight: 700;"><span class="sensitive-value">${formatCurrency(sumQuotaImm)}</span></td>
              <td class="col-metric" data-label="Già Pagato" style="font-weight: 700;"><span class="sensitive-value">${formatCurrency(sumGiaSaldatoImm)}</span></td>
              <td class="col-metric" data-label="Residuo Casa" style="font-weight: 700;"><span class="sensitive-value">${formatCurrency(sumResiduoImm)}</span></td>
              <td class="col-metric" data-label="Mutuo Banca" style="color: var(--md-sys-color-primary); font-weight: 700;"><span class="sensitive-value">${formatCurrency(sumMutuo)}</span></td>
              <td class="col-metric" data-label="Saldo Immobile" style="font-weight: 700;"><span class="sensitive-value">${formatCurrency(sumSaldoImmProprio)}</span></td>
              <td class="col-metric" data-label="Extra da Saldare" style="color: #f59e0b; font-weight: 700;"><span class="sensitive-value">${formatCurrency(sumExtraDaSaldare)}</span></td>
              <td class="col-metric" data-label="Totale da Versare" style="color: var(--md-sys-color-primary); font-weight: 700;"><span class="sensitive-value">${formatCurrency(sumTotaleEsborso)}</span></td>
              <td class="col-metric" data-label="Liquidità Residua" style="font-weight: 700; color: ${sumLiquiditaResidua >= 0 ? "var(--md-sys-color-success)" : "var(--md-sys-color-error)"};"><span class="sensitive-value">${formatCurrency(sumLiquiditaResidua)}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin-top: 14px; padding: 12px 16px; border-radius: 8px; background: var(--md-sys-color-surface-container); border-left: 4px solid var(--md-sys-color-primary); font-size: 12.5px; line-height: 1.5; color: var(--md-sys-color-on-surface);">
        <div style="font-weight: 700; margin-bottom: 2px; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 6px;">
          <span class="material-symbols-outlined" style="font-size: 18px;">lightbulb</span>
          Riepilogo Esborso Reale di Tasca Propria
        </div>
        Per chiudere l'acquisto dell'immobile, la quota residua da saldare è di <b class="sensitive-value">${formatCurrency(scopeImmobileDaSaldare)}</b>. 
        Con il mutuo deliberato di <b class="sensitive-value">${formatCurrency(scopeMutuo)}</b>, la quota da versare di tasca propria per l'immobile è di soli <b class="sensitive-value">${formatCurrency(scopeSaldoImmobileProprio)}</b>. 
        Sommando le spese extra selezionate non mutuabili (<b class="sensitive-value">${formatCurrency(scopeExtraDaSaldare)}</b>), l'esborso totale effettivo da versare per ${beneficiaryLabel} è di <b class="sensitive-value" style="color: var(--md-sys-color-primary);">${formatCurrency(scopeTotaleEsborso)}</b>.
      </div>
    `;
    updateTableViewModeUI();
  }
}

// Variabili globali per memorizzare l'indice e il tipo di lista durante il Drag & Drop
let draggedIndex = null;
let draggedType = null;

/**
 * Gestisce l'avvio del trascinamento di una riga in tabella.
 * @param {DragEvent} e - Evento di dragstart.
 * @param {number} index - Indice dell'elemento trascinato.
 * @param {'costi'|'budget'} type - Tipo di collezione.
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
function exportData() {
  saveMortgageSettings(false);
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(appData, null, 2));
  const anchor = document.createElement("a");
  anchor.setAttribute("href", dataStr);

  const ora = new Date();
  const year = ora.getFullYear();
  const month = String(ora.getMonth() + 1).padStart(2, "0");
  const day = String(ora.getDate()).padStart(2, "0");
  const hours = String(ora.getHours()).padStart(2, "0");
  const minutes = String(ora.getMinutes()).padStart(2, "0");

  anchor.setAttribute(
    "download",
    `Costi_Casa_${year}-${month}-${day}_${hours}${minutes}.json`,
  );
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

// Formattatore standard per valuta Euro in formato italiano (es. € 1.250,00)
const formatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

/**
 * Formatta un numero come stringa di valuta Euro.
 * @param {number} num - Valore numerico.
 * @returns {string} Stringa formattata.
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
  document.getElementById("catModal").classList.add("active");
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
    document.getElementById("catModal").classList.remove("active");
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
    let s = appData.settings.users.reduce((a, u) => a + (parseFloat(curr[u.id]) || 0), 0);
    return acc + s;
  }, 0);

  // Calcola i risparmi netti generati per ciascun partecipante dal monitoraggio
  let totRisparmiTutti = 0;
  let userRisparmiNetti = {};
  if (appData.savingsMonitor) {
    (appData.settings.users || []).forEach(usr => {
      const sm = calculateSavingsMetrics(usr.id);
      const r = (sm && sm.isConfigured) ? (sm.risparmioNetto || 0) : 0;
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
    userBudgetTotali[u.id] = userBudgetPianificato[u.id] + (userRisparmiNetti[u.id] || 0);

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
      const color = isPos ? "var(--md-sys-color-success)" : "var(--md-sys-color-error)";
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
        const color = isPos ? "var(--md-sys-color-success)" : "var(--md-sys-color-error)";
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

  if (document.fonts && document.fonts.ready && !window._fontsReadyChartListener) {
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
  const pagatoBadgeHTML = isPagato ? `<span class="badge-pagato" style="margin-left: 8px;"><span class="material-symbols-outlined">check_circle</span> Pagato</span>` : "";

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
  if (item.note && item.note.trim()) {
    document.getElementById("detail-note").innerText = item.note;
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
              return `<a ${hrefAttr} ${clickAction} class="fattura-link-chip" title="${url.startsWith("data:") ? "Foto scontrino allegata (clicca per ingrandire)" : (url || label)}"><span class="material-symbols-outlined">${icon}</span>${label}</a>`;
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
              ${p.commento ? `<div class="payment-item-comment">${p.commento}</div>` : ""}
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
      document.getElementById("pay-commento").value = payment.commento || "";
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
    document.getElementById("pay-commento").value = "";
  }

  document.getElementById("paymentModal").classList.add("active");
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
  const iconSpan = inputElement.parentElement.querySelector(".material-symbols-outlined");

  try {
    const compressedUrl = await compressImageFile(file, 1600, 1600, 0.8);
    if (urlInput) {
      urlInput.value = compressedUrl;
    }
    if (nameInput && !nameInput.value.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
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
    showNotification("Errore caricamento", "Impossibile elaborare l'immagine", "error");
  } finally {
    event.target.value = "";
  }
}

/**
 * Chiude il modale pagamento.
 */
function closePaymentModal() {
  document.getElementById("paymentModal").classList.remove("active");
}

/**
 * Salva un pagamento (nuovo o modifica esistente).
 */
function savePayment() {
  const costoId = parseInt(document.getElementById("pay-costo-id").value);
  const payId = document.getElementById("pay-edit-id").value;
  const data = document.getElementById("pay-data").value;
  const commento = document.getElementById("pay-commento").value.trim();

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
      const isPagato = restante <= 0.005 && ((c.prezzo || 0) > 0 || sumPaid > 0);
      const restanteHtml = isPagato
        ? `<span class="badge-pagato" title="Costo interamente saldato"><span class="material-symbols-outlined">check_circle</span> Pagato</span>`
        : formatRestanteCurrency(restante);

      const hasNote = c.note && c.note.trim().length > 0;
      let rowHtml = `<td class="col-drag" style="width: 30px; padding: 12px 4px;"><span class="material-symbols-outlined drag-handle" onmouseenter="this.closest('tr').setAttribute('draggable', 'true')" onmouseleave="this.closest('tr').setAttribute('draggable', 'false')">drag_indicator</span></td>
                     <td class="col-cat" data-label="Categoria">${badgeHTML}</td>
                     <td class="col-desc" data-label="Descrizione" style="white-space: pre-wrap;"><b>${c.desc}</b>${pagamentiBadge} ${immobileBadge}</td>
                     <td class="col-prezzo" data-label="Prezzo Totale">${formatCurrency(c.prezzo)}</td>`;
      appData.settings.users.forEach((u) => {
        rowHtml += `<td class="col-user" data-user="${u.id}" data-label="Pagato (${u.name})" style="color:var(--md-sys-color-primary);">${formatCurrency(c[u.id] || 0)}</td>`;
      });
      rowHtml += `<td class="col-restante" data-label="Restante" style="font-weight: 500; white-space: nowrap;">${restanteHtml}</td>
                  <td class="col-stato" data-label="Stato">${statusBadge}</td>
                  <td class="col-note ${hasNote ? "" : "col-note-empty"}" data-label="Note" style="white-space: pre-wrap;"><small>${c.note || ""}</small></td>
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

      const hasNoteB = b.note && b.note.trim().length > 0;
      let rowHtml = `<td class="col-drag" style="width: 30px; padding: 12px 4px;"><span class="material-symbols-outlined drag-handle" onmouseenter="this.closest('tr').setAttribute('draggable', 'true')" onmouseleave="this.closest('tr').setAttribute('draggable', 'false')">drag_indicator</span></td>
                     <td class="col-desc" data-label="Descrizione" style="white-space: pre-wrap;"><b>${b.desc}</b> ${b.isMutuo ? '<span style="font-size:11px; background:var(--md-sys-color-primary-container); color:var(--md-sys-color-on-primary-container); padding:2px 6px; border-radius:4px; margin-left:6px; font-weight:600;">Mutuo</span>' : (b.isDebito ? '<span style="font-size:11px; background:var(--md-sys-color-error-container); color:var(--md-sys-color-on-error-container); padding:2px 6px; border-radius:4px; margin-left:6px; font-weight:600;">Debito / Rata</span>' : "")}</td>`;
      appData.settings.users.forEach((u) => {
        rowHtml += `<td class="col-user" data-user="${u.id}" data-label="Quota ${u.name}">${formatColoredCurrency(b[u.id] || 0)}</td>`;
      });
      rowHtml += `<td class="col-totale" data-label="Totale" style="font-weight: 500;">${formatColoredCurrency(sumB)}</td>
                  <td class="col-note ${hasNoteB ? "" : "col-note-empty"}" data-label="Note" style="white-space: pre-wrap;"><small>${b.note || ""}</small></td>
                  <td class="col-actions" data-label="Azioni" style="white-space: nowrap;"><div style="display: inline-flex; align-items: center; gap: 4px;">${b.isDebito ? `<button class="btn-icon" title="Modifica debito nella sezione Debiti" onclick="openEditDebitoModal(${b.debitoId})"><span class="material-symbols-outlined">edit</span></button><button class="btn-icon" title="Elimina debito" onclick="deleteDebito(${b.debitoId})"><span class="material-symbols-outlined" style="color: var(--md-sys-color-error);">delete</span></button>` : `<button class="btn-icon" title="Modifica voce" onclick="openEditModal('budget', ${b.id})"><span class="material-symbols-outlined">edit</span></button><button class="btn-icon" title="Elimina voce" onclick="deleteBudgetItem(${b.id})"><span class="material-symbols-outlined" style="color: var(--md-sys-color-error);">delete</span></button>`}</div></td>`;
      tr.innerHTML = rowHtml;
      tBudget.appendChild(tr);
    });

    // Righe di riepilogo con risparmi netti accumulati
    let userRisparmi = {};
    let totRisparmi = 0;
    if (appData.savingsMonitor) {
      (appData.settings.users || []).forEach(u => {
        const sm = calculateSavingsMetrics(u.id);
        const r = (sm && sm.isConfigured) ? (sm.risparmioNetto || 0) : 0;
        userRisparmi[u.id] = r;
        totRisparmi += r;
      });
    }

    if (totRisparmi !== 0) {
      let rRow = `<tr>
        <td class="col-drag" style="width: 30px; padding: 12px 4px; text-align: center;"><span class="material-symbols-outlined" style="color: var(--md-sys-color-outline); font-size: 18px; cursor: default;" title="Voce fissa bloccata">lock</span></td>
        <td class="col-desc" data-label="Descrizione" style="white-space: pre-wrap;"><b>Risparmi Netti Generati</b> <span style="font-size:11px; background:var(--md-sys-color-secondary-container); color:var(--md-sys-color-on-secondary-container); padding:2px 6px; border-radius:4px; margin-left:6px;">Risparmio</span></td>`;
      appData.settings.users.forEach(u => {
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

    const hasNoteS = snap.note && snap.note.trim().length > 0;
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
      <td class="col-note ${hasNoteS ? "" : "col-note-empty"}" data-label="Note" style="font-size: 12px; color: var(--md-sys-color-outline); white-space: pre-wrap;">${snap.note || ""}</td>
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

  // 1. Quota acquisto immobile per questo utente
  const costoCasaImmobile = appData.costi
    .filter((c) => {
      const catObj = appData.settings.categories[c.cat];
      return typeof catObj === "object" ? !!catObj.isImmobile : c.cat === "Immobili";
    })
    .reduce((acc, curr) => acc + (curr.prezzo || 0), 0);

  const sharePercent = typeof user.share === "number" ? user.share : (100 / appData.settings.users.length);
  const quotaAcquistoUtente = (costoCasaImmobile || 0) * (sharePercent / 100);

  // 2. Mutuo stimato per questo utente
  let mutuoRow = appData.budget.find((b) => b.isMutuo);
  const mutuoUtente = mutuoRow ? (parseFloat(mutuoRow[userId]) || 0) : 0;

  // 3. Identifica la voce di Capitale Iniziale già convertita nel monitoraggio cassa
  const uConfig = appData.savingsMonitor?.userConfig[userId] || {};
  const capInizialeVal = parseFloat(metrics.capitaleIniziale) || 0;
  let capInizialeBudgetId = uConfig.budgetId || null;
  if (!capInizialeBudgetId) {
    const matchedBudget = (appData.budget || []).find(b => !b.isMutuo && parseFloat(b[userId]) === capInizialeVal);
    if (matchedBudget) capInizialeBudgetId = matchedBudget.id;
  }

  // 4. Somma delle ALTRE risorse pianificate nel Budget per questo utente (es. Investimenti, Regali)
  const altreRisorseBudget = (appData.budget || [])
    .filter(b => !b.isMutuo && b.id != capInizialeBudgetId)
    .reduce((acc, curr) => acc + (parseFloat(curr[userId]) || 0), 0);

  // 5. Quota contanti netta residua da coprire con la cassa/risparmi
  const quotaResiduaContanti = Math.max(0, quotaAcquistoUtente - mutuoUtente - altreRisorseBudget);

  // 6. Margine di liquidità stimato a saldo rogito
  const margineRogito = metrics.proiezioneLiquiditaRogito - quotaResiduaContanti;
  const isCoperto = margineRogito >= 0;

  grid.innerHTML = `
    <div style="padding: 12px; border-radius: 8px; background: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-surface-container-high);">
      <div style="font-size: 12px; color: var(--md-sys-color-outline);">${metrics.risparmioNetto >= 0 ? `Risparmio Netto ${user.name}` : `Disavanzo Netto ${user.name}`}</div>
      <div style="font-size: 18px; font-weight: 700; color: ${metrics.risparmioNetto >= 0 ? 'var(--md-sys-color-success)' : 'var(--md-sys-color-error)'}; margin-top: 4px;">${formatCurrency(metrics.risparmioNetto)}</div>
      <div style="font-size: 11px; color: var(--md-sys-color-outline); margin-top: 2px;">${metrics.tassoMedioMensile >= 0 ? '+' : ''}${formatCurrency(metrics.tassoMedioMensile)} / mese</div>
    </div>

    <div style="padding: 12px; border-radius: 8px; background: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-surface-container-high);">
      <div style="font-size: 12px; color: var(--md-sys-color-outline);">Liquidità Netta Attuale</div>
      <div style="font-size: 18px; font-weight: 700; margin-top: 4px;">${formatCurrency(metrics.liquiditaNetta)}</div>
      <div style="font-size: 11px; color: var(--md-sys-color-outline); margin-top: 2px;">Saldo reale disponibile</div>
    </div>

    <div style="padding: 12px; border-radius: 8px; background: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-surface-container-high);">
      <div style="font-size: 12px; color: var(--md-sys-color-outline);">Stima Cassa al Rogito</div>
      <div style="font-size: 18px; font-weight: 700; color: var(--md-sys-color-primary); margin-top: 4px;">${formatCurrency(metrics.proiezioneLiquiditaRogito)}</div>
      <div style="font-size: 11px; color: var(--md-sys-color-outline); margin-top: 2px;">${dateLabel} (tra ${metrics.tempoRimanente.label})</div>
    </div>

    <div style="padding: 12px; border-radius: 8px; background: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-surface-container-high);">
      <div style="font-size: 12px; color: var(--md-sys-color-outline);">Margine Copertura Rogito</div>
      <div style="font-size: 18px; font-weight: 700; color: ${isCoperto ? 'var(--md-sys-color-success)' : 'var(--md-sys-color-error)'}; margin-top: 4px;">
        ${isCoperto ? '+' : ''}${formatCurrency(margineRogito)}
      </div>
      <div style="font-size: 11px; color: var(--md-sys-color-outline); margin-top: 2px;">
        ${isCoperto 
          ? `Pienamente coperto (residuo contanti: ${formatCurrency(quotaResiduaContanti)})` 
          : `Capitale mancante (residuo contanti: ${formatCurrency(quotaResiduaContanti)})`}
      </div>
    </div>
  `;

  callout.innerHTML = `
    <span class="material-symbols-outlined" style="color: ${isCoperto ? 'var(--md-sys-color-success)' : 'var(--md-sys-color-error)'}">
      ${isCoperto ? 'verified' : 'warning'}
    </span>
    <div>
      ${isCoperto 
        ? `In base alla stima al <b>${dateLabel}</b>, la tua cassa accumulata sarà di <b>${formatCurrency(metrics.proiezioneLiquiditaRogito)}</b>. Con la tua quota casa di <b>${formatCurrency(quotaAcquistoUtente)}</b> coperta da <b>${formatCurrency(mutuoUtente)}</b> di mutuo e <b>${formatCurrency(altreRisorseBudget)}</b> di altre risorse budget (investimenti/regali), la quota residua da coprire in contanti è di soli <b>${formatCurrency(quotaResiduaContanti)}</b>: avrai un <b>margine di sicurezza positivo di +${formatCurrency(margineRogito)}</b>!`
        : `Alla data del <b>${dateLabel}</b> la tua cassa stimata sarà di <b>${formatCurrency(metrics.proiezioneLiquiditaRogito)}</b> a fronte di una quota residua in contanti di <b>${formatCurrency(quotaResiduaContanti)}</b> (dopo aver scalato ${formatCurrency(mutuoUtente)} di mutuo e ${formatCurrency(altreRisorseBudget)} di altre risorse a budget): mancano <b>${formatCurrency(Math.abs(margineRogito))}</b> per coprire interamente la tua quota.`
      }
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

  document.getElementById("savingsInitialModal").classList.add("active");
}

function closeSavingsInitialModal() {
  closeSavingsInitialBudgetPickerMenu();
  document.getElementById("savingsInitialModal").classList.remove("active");
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
  document.getElementById("savings-modal-note").value = "";

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

  document.getElementById("savingsModal").classList.add("active");
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
  document.getElementById("savings-modal-note").value = snapshot.note || "";

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
  const submitBtn = document.querySelector("#savingsModal .modal-actions .btn-filled");
  if (submitBtn) {
    submitBtn.innerHTML = `<span class="material-symbols-outlined">save</span> Aggiorna Rilevazione`;
  }

  document.getElementById("savingsModal").classList.add("active");
}

function closeSavingsModal() {
  document.getElementById("savingsModal").classList.remove("active");
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
  const note = document.getElementById("savings-modal-note").value.trim();
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
      <div class="debito-card ${isSaldato ? 'saldato' : ''}">
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

        <!-- Note se presenti -->
        ${
          d.note
            ? `<div style="font-size: 12px; color: var(--md-sys-color-outline); background: var(--md-sys-color-surface-container-lowest); padding: 8px 10px; border-radius: 6px; border-left: 3px solid var(--md-sys-color-primary);">
                ${d.note}
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
  document.getElementById("debito-note").value = "";

  populateDebitoUserSelect();
  updateDebitoModalPreview();

  const modal = document.getElementById("debitoModal");
  if (modal) modal.classList.add("active");
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
  document.getElementById("debito-note").value = debito.note || "";

  populateDebitoUserSelect(debito.userId);
  updateDebitoModalPreview();

  const modal = document.getElementById("debitoModal");
  if (modal) modal.classList.add("active");
}

/**
 * Chiude la modale del debito.
 */
function closeDebitoModal() {
  const modal = document.getElementById("debitoModal");
  if (modal) modal.classList.remove("active");
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
  const note = document.getElementById("debito-note").value.trim();

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

  // Controllo Soluzione A: Rata del mese corrente già registrata
  if (debito.ultimoPagamentoMese === currentMonthKey) {
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
    debito.ultimoPagamentoMese = null;
    debito.ultimoPagamentoData = null;

    saveDataLocally();
    showNotification(`Rata ripristinata (${debito.mesiRimanenti} rimaste)`);
  }
}

initPrivacyMode();
checkWizard();
switchTab("riepilogo", "Riepilogo Generale");
renderAll();
// Sincronizza all'avvio se abilitato
if (casaGithubConfig && casaGithubConfig.enabled) {
  syncToGist(true);
}

// Registrazione Service Worker per PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js") // Rimosso ?v=1.7.4
      .then((registration) => {
        // Forza subito il controllo di un eventuale nuovo service-worker.js sul server
        registration.update();

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (
              installingWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.log("Nuova versione trovata, attivazione...");
              installingWorker.postMessage({ type: "SKIP_WAITING" });
            }
          };
        };

        // Polling leggero per aggiornamenti (ogni 60 minuti)
        setInterval(() => registration.update(), 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error("Registrazione ServiceWorker fallita: ", error);
      });

    // Quando il controller cambia (nuovo SW attivo) → ricarica automatica
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        console.log("Nuovo ServiceWorker attivo. Ricaricamento in corso...");
        window.location.reload();
      }
    });
  });
}
