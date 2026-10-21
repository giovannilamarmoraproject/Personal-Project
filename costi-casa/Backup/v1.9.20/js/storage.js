/**
 * ==============================================================================
 * PERSISTENZA DATI, EXPORT/IMPORT, SINCRONIZZAZIONE GIST & WIZARD
 * ==============================================================================
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
        closeModalOverlay("wizardModal");
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

        closeModalOverlay("wizardModal");
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
    openModalOverlay("wizardModal");
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
  closeModalOverlay("wizardModal");
  saveDataLocally();
  showNotification("Dashboard creata con successo!");
}

let settingsUsers = [];

/**
 * Esegue il rendering della lista dei partecipanti all'interno del pannello Impostazioni.
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
