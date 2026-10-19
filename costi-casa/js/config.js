/**
 * ============================================================================== 
 * CONFIGURAZIONI & STATO GLOBALE APPLICAZIONE (v1.9.15)
 * ============================================================================== 
 */

const APP_VERSION = "1.9.15";

// Formattatore di valuta per la lingua italiana (€)
const formatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

/**
 * Formatta un numero come stringa di valuta Euro.
 * @param {number} num - Valore numerico.
 * @returns {string} Stringa formattata.
 */

/**
 * Istanza base personalizzata di SweetAlert2 configurata secondo lo stile Material Expressive 3.
 * Applica le classi CSS definite per modali, titoli, pulsanti e contenitori.
 */
const M3Swal = Swal.mixin({
  heightAuto: false,
  scrollbarPadding: false,
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
