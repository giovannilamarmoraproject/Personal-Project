/**
 * ============================================================================== 
 * APPLICATION ENTRY POINT, AGGREGATORE VISTE & AVVIO PWA (v1.9.25)
 * ============================================================================== 
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
  initRichTextEditors();
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

