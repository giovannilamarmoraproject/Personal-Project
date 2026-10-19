/**
 * ============================================================================== 
 * CALCOLATORE MUTUO, AMMORTAMENTO FRANCESE & SALVAGUARDIA LIQUIDITÀ
 * ============================================================================== 
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
