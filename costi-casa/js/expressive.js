/**
 * ==============================================================================
 * MATERIAL 3 EXPRESSIVE (M3E) — MOTION, THEME ENGINE, SCROLL REVEAL & CHARTS
 * ==============================================================================
 */

(function () {
  const STORAGE_KEYS = {
    themeMode: "casaThemeMode", // 'light' | 'dark' | 'auto'
    accent: "casaThemeAccent", // 'viola' | 'oceano' | 'smeraldo' | 'corallo' | 'ambra'
    density: "casaCardDensity", // 'compact' | 'comfortable' | 'spacious'
    reducedMotion: "casaReducedMotion", // 'true' | 'false'
    navStyle: "casaNavStyle", // 'floating' | 'docked'
    navExpanded: "casaNavRailExpanded", // 'true' | 'false'
  };

  let revealObserver = null;
  let mediaQueryDark = null;
  let budgetCompChartInstance = null;
  let budgetUsersChartInstance = null;
  let mutuoBreakdownChartInstance = null;
  let lastMutuoChartData = null;

  /**
   * Legge una variabile CSS computata dal body.
   */
  function getCssVar(name, fallback = "") {
    const val = getComputedStyle(document.body).getPropertyValue(name).trim();
    return val || fallback;
  }

  /**
   * Aggiorna il meta tag theme-color per la status bar PWA/mobile.
   */
  function updateMetaThemeColor() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    const isDark = document.body.classList.contains("dark-mode");
    const bg = isDark ? "#0f1016" : getCssVar("--md-sys-color-primary", "#6750a4");
    meta.setAttribute("content", bg);
  }

  /**
   * Applica modalità tema ('light' | 'dark' | 'auto').
   */
  function setThemeMode(mode, skipChartRefresh = false) {
    const valid = ["light", "dark", "auto"].includes(mode) ? mode : "light";
    localStorage.setItem(STORAGE_KEYS.themeMode, valid);

    let isDark = false;
    if (valid === "dark") {
      isDark = true;
    } else if (valid === "auto") {
      isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    document.body.classList.toggle("dark-mode", isDark);
    localStorage.setItem("casaDarkMode", isDark ? "true" : "false");

    if (typeof updateThemeIcons === "function") {
      updateThemeIcons(isDark);
    }
    updateMetaThemeColor();
    syncAppearanceControlsUI();

    if (!skipChartRefresh) {
      refreshAllChartsTheme();
    }
  }

  /**
   * Applica la palette colore Material You Expressive.
   */
  function setThemeAccent(accent, skipChartRefresh = false) {
    const valid = ["viola", "oceano", "smeraldo", "corallo", "ambra"].includes(accent)
      ? accent
      : "viola";
    localStorage.setItem(STORAGE_KEYS.accent, valid);

    if (valid === "viola") {
      document.body.removeAttribute("data-theme-accent");
    } else {
      document.body.setAttribute("data-theme-accent", valid);
    }

    updateMetaThemeColor();
    syncAppearanceControlsUI();

    if (!skipChartRefresh) {
      refreshAllChartsTheme();
    }
  }

  /**
   * Applica la densità delle card ('compact' | 'comfortable' | 'spacious').
   */
  function setCardDensity(density) {
    const valid = ["compact", "comfortable", "spacious"].includes(density)
      ? density
      : "comfortable";
    localStorage.setItem(STORAGE_KEYS.density, valid);

    if (valid === "comfortable") {
      document.body.removeAttribute("data-card-density");
    } else {
      document.body.setAttribute("data-card-density", valid);
    }

    syncAppearanceControlsUI();
  }

  /**
   * Attiva/disattiva la riduzione delle animazioni.
   */
  function setReducedMotion(reduced) {
    const isReduced = Boolean(reduced);
    localStorage.setItem(STORAGE_KEYS.reducedMotion, isReduced ? "true" : "false");
    document.body.setAttribute("data-reduced-motion", isReduced ? "true" : "false");

    if (isReduced) {
      document.querySelectorAll(".m3-reveal").forEach((el) => {
        el.classList.add("is-visible");
      });
    }
    syncAppearanceControlsUI();
  }

  /**
   * Imposta stile barra laterale desktop ('floating' | 'docked').
   */
  function setNavStyle(style) {
    const valid = style === "docked" ? "docked" : "floating";
    localStorage.setItem(STORAGE_KEYS.navStyle, valid);
    if (valid === "docked") {
      document.body.setAttribute("data-nav-style", "docked");
    } else {
      document.body.removeAttribute("data-nav-style");
    }
    syncAppearanceControlsUI();
  }

  /**
   * Espande o comprime la barra laterale desktop con etichette testuali.
   */
  function toggleNavRailExpand(forceState) {
    const isExpanded =
      typeof forceState === "boolean"
        ? forceState
        : !document.body.classList.contains("nav-rail-expanded");
    document.body.classList.toggle("nav-rail-expanded", isExpanded);
    localStorage.setItem(STORAGE_KEYS.navExpanded, isExpanded ? "true" : "false");

    const icon = document.getElementById("nav-rail-expand-icon");
    if (icon) icon.textContent = isExpanded ? "menu_open" : "menu";
  }

  /**
   * Sincronizza lo stato attivo dei pulsanti nel pannello Impostazioni -> Aspetto & Tema.
   */
  function syncAppearanceControlsUI() {
    const savedMode =
      localStorage.getItem(STORAGE_KEYS.themeMode) ||
      (document.body.classList.contains("dark-mode") ? "dark" : "light");
    const savedAccent = localStorage.getItem(STORAGE_KEYS.accent) || "viola";
    const savedDensity = localStorage.getItem(STORAGE_KEYS.density) || "comfortable";
    const savedReduced = localStorage.getItem(STORAGE_KEYS.reducedMotion) === "true";
    const savedNavStyle = localStorage.getItem(STORAGE_KEYS.navStyle) || "floating";

    document.querySelectorAll(".theme-mode-card").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === savedMode);
    });
    document.querySelectorAll(".accent-swatch-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.accent === savedAccent);
    });
    document.querySelectorAll(".density-btn:not(.nav-style-btn)").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.density === savedDensity);
    });
    document.querySelectorAll(".nav-style-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.navStyle === savedNavStyle);
    });
    const motionCb = document.getElementById("settings-reduced-motion");
    if (motionCb) motionCb.checked = savedReduced;
  }

  /**
   * Ridisegna tutti i grafici attivi quando cambia tema o palette colori.
   */
  function refreshAllChartsTheme() {
    requestAnimationFrame(() => {
      if (typeof updateChartsAndStats === "function") {
        updateChartsAndStats();
      }
      if (typeof renderCategoriesSection === "function") {
        renderCategoriesSection();
      }
      if (
        typeof currentDebitoDetailId !== "undefined" &&
        currentDebitoDetailId !== null &&
        typeof renderDebitoDetailView === "function"
      ) {
        const d = (appData.debiti || []).find((x) => x.id === currentDebitoDetailId);
        if (d) renderDebitoDetailView(d);
      }
      if (lastMutuoChartData) {
        renderMutuoExtraChart(lastMutuoChartData);
      }
    });
  }

  /**
   * Restituisce palette, gradienti, tooltip e animazioni M3 Expressive per Chart.js.
   */
  function getM3ChartTheme() {
    const isDark = document.body.classList.contains("dark-mode");
    const reduced =
      document.body.getAttribute("data-reduced-motion") === "true" ||
      (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    const primary = getCssVar("--m3-chart-bar-1", isDark ? "#cbb4ff" : "#6750a4");
    const secondary = getCssVar("--m3-chart-bar-2", isDark ? "#818cf8" : "#9a82db");
    const tertiary = getCssVar("--m3-chart-bar-3", isDark ? "#f472b6" : "#d81b60");
    const neutral = getCssVar("--m3-chart-bar-4", isDark ? "#64748b" : "#79747e");
    const textColor = isDark ? "#e8e4f0" : "#1c1b1f";
    const mutedColor = isDark ? "#a5a0b5" : "#5e5a68";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(28, 27, 31, 0.06)";

    const tooltip = {
      backgroundColor: isDark ? "rgba(22, 23, 34, 0.96)" : "rgba(28, 27, 31, 0.94)",
      titleColor: "#ffffff",
      bodyColor: "#e6e1f0",
      borderColor: isDark ? "rgba(255, 255, 255, 0.14)" : "rgba(255, 255, 255, 0.1)",
      borderWidth: 1,
      padding: 12,
      cornerRadius: 14,
      boxPadding: 6,
      usePointStyle: true,
      titleFont: { family: "'Google Sans Flex', sans-serif", size: 13, weight: 700 },
      bodyFont: { family: "'Google Sans Flex', sans-serif", size: 12.5, weight: 500 },
    };

    const barAnimation = reduced
      ? false
      : {
          duration: 850,
          easing: "easeOutQuart",
          delay: (ctx) => (ctx.type === "data" && ctx.mode === "default" ? ctx.dataIndex * 75 : 0),
        };

    const doughnutAnimation = reduced
      ? false
      : {
          duration: 950,
          easing: "easeOutQuart",
          animateRotate: true,
          animateScale: true,
        };

    const lineAnimation = reduced
      ? false
      : {
          duration: 900,
          easing: "easeOutQuart",
        };

    function createBarGradient(ctx, colorHex, horizontal = false) {
      if (!ctx || !ctx.createLinearGradient) return colorHex;
      const grad = horizontal
        ? ctx.createLinearGradient(0, 0, 360, 0)
        : ctx.createLinearGradient(0, 0, 0, 280);
      grad.addColorStop(0, colorHex);
      grad.addColorStop(1, colorHex + (isDark ? "99" : "cc"));
      return grad;
    }

    return {
      isDark,
      primary,
      secondary,
      tertiary,
      neutral,
      textColor,
      mutedColor,
      gridColor,
      tooltip,
      barAnimation,
      doughnutAnimation,
      lineAnimation,
      createBarGradient,
    };
  }

  /**
   * Anima il titolo della pagina nell'header con effetto cinetico M3.
   */
  function animatePageTitle() {
    const titleEl = document.getElementById("page-main-title");
    if (!titleEl) return;
    titleEl.classList.remove("title-swap");
    void titleEl.offsetWidth;
    titleEl.classList.add("title-swap");
  }

  /**
   * Inizializza l'IntersectionObserver per le animazioni allo scroll dentro #main-scroll-container.
   */
  function initScrollRevealObserver() {
    const scrollRoot = document.getElementById("main-scroll-container");
    if (!("IntersectionObserver" in window)) return;

    if (revealObserver) revealObserver.disconnect();
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        root: scrollRoot || null,
        threshold: 0.04,
        rootMargin: "0px 0px -18px 0px",
      },
    );
  }

  /**
   * Applica classi di reveal scaglionate agli elementi visibili della vista attiva.
   */
  function refreshScrollReveals(scopeEl) {
    const root = scopeEl || document.querySelector(".view-section.active") || document;
    const isReduced =
      document.body.getAttribute("data-reduced-motion") === "true" ||
      (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    const targets = root.querySelectorAll(
      ".stat-card, .card, .cat-stat-card, .qa-card, .riepilogo-insight-strip, .debito-card",
    );

    if (!revealObserver) initScrollRevealObserver();

    targets.forEach((el, index) => {
      if (isReduced || !revealObserver) {
        el.classList.remove("m3-reveal");
        el.classList.add("is-visible");
        return;
      }
      el.style.setProperty("--reveal-delay", `${Math.min(index, 7) * 55}ms`);
      el.classList.add("m3-reveal");
      el.classList.remove("is-visible");
      revealObserver.observe(el);
    });
  }

  /**
   * Listener di scroll per glass header, progress bar superiore e FAB torna su.
   */
  function initScrollChrome() {
    const scrollContainer = document.getElementById("main-scroll-container");
    const header = document.querySelector(".app-header");
    const progressBar = document.getElementById("scroll-progress-bar");
    const fab = document.getElementById("scroll-top-fab");
    if (!scrollContainer) return;

    let ticking = false;
    scrollContainer.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const st = scrollContainer.scrollTop;
          const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
          const pct = maxScroll > 0 ? Math.min(100, Math.max(0, (st / maxScroll) * 100)) : 0;

          if (header) header.classList.toggle("scrolled", st > 12);
          if (progressBar) progressBar.style.width = `${pct}%`;
          if (fab) fab.classList.toggle("visible", st > 280);
          ticking = false;
        });
      },
      { passive: true },
    );
  }

  /**
   * Riporta dolcemente lo scroll del contenitore principale in cima.
   */
  function scrollToTopMain() {
    const scrollContainer = document.getElementById("main-scroll-container");
    if (!scrollContainer) return;
    scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
  }

  /**
   * Aggiorna i footer delle KPI card, la striscia "Stato Progetto", Top Categorie,
   * il riepilogo Costi e i grafici della sezione Budget.
   */
  function updateRiepilogoInsights(metrics) {
    if (!metrics) return;

    const fmt = (v) => (typeof formatCurrency === "function" ? formatCurrency(v) : `${(v || 0).toFixed(2)} €`);
    const costi = appData.costi || [];
    const confermatiList = costi.filter((c) => c.confermato !== false);
    const daConfermareList = costi.filter((c) => c.confermato === false);
    const confermatiTot = confermatiList.reduce((a, c) => a + (parseFloat(c.prezzo) || 0), 0);
    const daConfermareTot = daConfermareList.reduce((a, c) => a + (parseFloat(c.prezzo) || 0), 0);
    const openTasks = (appData.tasks || []).filter((t) => !t.completed).length;
    const isHealthy = (metrics.liquiditaResiduaReale || 0) >= 0;

    // 1. Mini barra progresso dentro % Spesa Effettuata
    const progressFill = document.getElementById("stat-progresso-bar");
    if (progressFill) {
      const clamped = Math.min(100, Math.max(0, metrics.progressoPercentuale || 0));
      requestAnimationFrame(() => {
        progressFill.style.width = `${clamped.toFixed(1)}%`;
      });
    }

    // 2. Footer informativi dentro le 4 KPI card di Riepilogo
    const budgetSub = document.getElementById("stat-budget-sub");
    if (budgetSub) {
      const coverage = metrics.costoTotale > 0 ? (metrics.budgetTotale / metrics.costoTotale) * 100 : 0;
      budgetSub.innerHTML = `
        <span>Copertura progetto</span>
        <span class="stat-footer-pill ${isHealthy ? "pos" : "neg"}">${coverage.toFixed(1)}%</span>
      `;
    }

    const costoSub = document.getElementById("stat-costo-sub");
    if (costoSub) {
      costoSub.innerHTML = `
        <span>${costi.length} voci totali</span>
        <span class="stat-footer-pill">${confermatiList.length} conf.${daConfermareList.length > 0 ? ` · ${daConfermareList.length} stima` : ""}</span>
      `;
    }

    const restanteSub = document.getElementById("stat-restante-sub");
    if (restanteSub) {
      const remPct = metrics.costoTotale > 0 ? Math.max(0, (metrics.restante / metrics.costoTotale) * 100) : 0;
      restanteSub.innerHTML = `
        <span>Quota residua da saldare</span>
        <span class="stat-footer-pill">${remPct.toFixed(1)}%</span>
      `;
    }

    const progressoSub = document.getElementById("stat-progresso-sub");
    if (progressoSub) {
      progressoSub.innerHTML = `Pagati: <b>${fmt(metrics.totalePagato || 0)}</b>`;
    }

    // 3. Striscia insight Riepilogo
    const pillsContainer = document.getElementById("riepilogo-insight-pills");
    if (pillsContainer) {
      pillsContainer.innerHTML = `
        <span class="insight-pill ${isHealthy ? "status-ok" : "status-warn"}">
          <span class="material-symbols-outlined">${isHealthy ? "verified" : "warning"}</span>
          ${isHealthy ? "Progetto in Budget" : "Sforamento Budget"}
        </span>
        <span class="insight-pill">
          <span class="material-symbols-outlined">receipt_long</span>
          ${confermatiList.length} confermati${daConfermareList.length > 0 ? ` · ${daConfermareList.length} in stima` : ""}
        </span>
        <span class="insight-pill">
          <span class="material-symbols-outlined">task_alt</span>
          ${openTasks} task ${openTasks === 1 ? "aperto" : "aperti"}
        </span>
      `;
    }

    // 4. Top Categorie di Spesa in Riepilogo
    const topCatEl = document.getElementById("riepilogo-top-categories-list");
    if (topCatEl) {
      const catTotals = {};
      const catPaid = {};
      costi.forEach((c) => {
        const cat = c.cat || "Altro";
        catTotals[cat] = (catTotals[cat] || 0) + (parseFloat(c.prezzo) || 0);
        const paidItem = (appData.settings.users || []).reduce((a, u) => a + (parseFloat(c[u.id]) || 0), 0);
        catPaid[cat] = (catPaid[cat] || 0) + paidItem;
      });
      const ranked = Object.keys(catTotals)
        .map((name) => ({
          name,
          total: catTotals[name],
          paid: catPaid[name] || 0,
          color:
            (appData.settings.categories &&
              appData.settings.categories[name] &&
              (appData.settings.categories[name].color || appData.settings.categories[name])) ||
            "#6750a4",
        }))
        .filter((x) => x.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 6);

      if (ranked.length === 0) {
        topCatEl.innerHTML = `<div style="font-size:13px; color:var(--md-sys-color-outline)">Nessuna spesa registrata.</div>`;
      } else {
        topCatEl.innerHTML = ranked
          .map((cat) => {
            const sharePct = metrics.costoTotale > 0 ? (cat.total / metrics.costoTotale) * 100 : 0;
            const paidPct = cat.total > 0 ? Math.min(100, (cat.paid / cat.total) * 100) : 0;
            return `
              <div class="top-cat-item" onclick="switchTab('categorie', 'Costi per Categoria')">
                <div class="top-cat-row">
                  <span style="display:flex; align-items:center; gap:8px; min-width:0">
                    <span class="top-cat-dot" style="background:${cat.color}"></span>
                    <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${cat.name}</span>
                  </span>
                  <span class="sensitive-value">${fmt(cat.total)}</span>
                </div>
                <div class="progress-bar-bg" style="height:6px">
                  <div class="progress-bar-fill" style="width:${paidPct.toFixed(1)}%; background:${cat.color}"></div>
                </div>
                <div class="top-cat-meta">
                  <span>Pagato ${paidPct.toFixed(0)}%</span>
                  <span>${sharePct.toFixed(1)}% del progetto</span>
                </div>
              </div>
            `;
          })
          .join("");
      }
    }

    // 5. Mini Summary Strip in vista Costi Casa
    const costiStrip = document.getElementById("costi-summary-strip");
    if (costiStrip) {
      const paidFullCount = costi.filter((c) => {
        const p = parseFloat(c.prezzo) || 0;
        const paid = (appData.settings.users || []).reduce((a, u) => a + (parseFloat(c[u.id]) || 0), 0);
        return p > 0 && paid >= p - 0.01;
      }).length;
      const avgCost = costi.length > 0 ? metrics.costoTotale / costi.length : 0;
      costiStrip.innerHTML = `
        <span class="insight-pill status-ok">
          <span class="material-symbols-outlined">check_circle</span>
          Confermati: <span class="sensitive-value">${fmt(confermatiTot)}</span>
        </span>
        <span class="insight-pill">
          <span class="material-symbols-outlined">schedule</span>
          In stima: <span class="sensitive-value">${fmt(daConfermareTot)}</span>
        </span>
        <span class="insight-pill">
          <span class="material-symbols-outlined">task_alt</span>
          Saldati 100%: ${paidFullCount} / ${costi.length}
        </span>
        <span class="insight-pill">
          <span class="material-symbols-outlined">analytics</span>
          Media voce: <span class="sensitive-value">${fmt(avgCost)}</span>
        </span>
      `;
    }

    // 6. Grafici extra nella vista Budget
    renderBudgetExtraCharts(metrics);
  }

  /**
   * Renderizza i 2 grafici nella vista Budget (Composizione Fonti & Budget vs Quota Costi).
   */
  function renderBudgetExtraCharts(metrics) {
    if (typeof Chart === "undefined") return;
    const m3 = getM3ChartTheme();
    const users = appData.settings.users || [];

    // Chart A: Composizione Fonti Budget (Doughnut)
    const ctxComp = document.getElementById("budgetCompositionChart");
    if (ctxComp) {
      if (budgetCompChartInstance) budgetCompChartInstance.destroy();
      const labels = [];
      const values = [];
      const palette = [m3.primary, m3.secondary, m3.tertiary, "#10b981", "#f59e0b", "#06b6d4", "#ec4899"];

      (appData.budget || []).forEach((row) => {
        const sum = users.reduce((a, u) => a + (parseFloat(row[u.id]) || 0), 0);
        if (sum > 0) {
          labels.push(row.desc || "Voce Budget");
          values.push(sum);
        }
      });
      if ((metrics.totRisparmiTutti || 0) > 0) {
        labels.push("Risparmi Netti");
        values.push(metrics.totRisparmiTutti);
      }

      if (values.length === 0) {
        labels.push("Nessun dato");
        values.push(1);
      }

      budgetCompChartInstance = new Chart(ctxComp.getContext("2d"), {
        type: "doughnut",
        data: {
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: values.map((_, i) => palette[i % palette.length]),
              borderWidth: 0,
              borderRadius: 7,
              spacing: 3,
              hoverOffset: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "68%",
          animation: m3.doughnutAnimation,
          plugins: {
            legend: {
              position: "right",
              labels: {
                usePointStyle: true,
                pointStyle: "circle",
                color: m3.textColor,
                padding: 12,
                font: { family: "'Google Sans Flex', sans-serif", size: 12, weight: 600 },
              },
            },
            tooltip: {
              ...m3.tooltip,
              callbacks: {
                label: (ctx) => {
                  const tot = ctx.dataset.data.reduce((a, b) => a + b, 0) || 1;
                  const pct = ((ctx.parsed / tot) * 100).toFixed(1);
                  return ` ${ctx.label}: ${formatter.format(ctx.parsed || 0)} (${pct}%)`;
                },
              },
            },
          },
        },
      });
    }

    // Chart B: Budget Disponibile vs Quota Costi per Partecipante (Bar)
    const ctxUsers = document.getElementById("budgetUsersChart");
    if (ctxUsers && metrics.userBudgetTotali) {
      if (budgetUsersChartInstance) budgetUsersChartInstance.destroy();
      const uCtx = ctxUsers.getContext("2d");
      const userLabels = users.map((u) => u.name);
      const userBudgets = users.map((u) => metrics.userBudgetTotali[u.id] || 0);
      const userQuotas = users.map((u) => (metrics.costoTotale || 0) * ((u.share || 0) / 100));

      budgetUsersChartInstance = new Chart(uCtx, {
        type: "bar",
        data: {
          labels: userLabels,
          datasets: [
            {
              label: "Budget Totale (€)",
              data: userBudgets,
              backgroundColor: m3.createBarGradient(uCtx, m3.primary),
              borderRadius: 10,
              borderSkipped: false,
              barPercentage: 0.78,
            },
            {
              label: "Quota Costi Progetto (€)",
              data: userQuotas,
              backgroundColor: m3.createBarGradient(uCtx, m3.tertiary),
              borderRadius: 10,
              borderSkipped: false,
              barPercentage: 0.78,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: m3.barAnimation,
          plugins: {
            legend: {
              position: "top",
              labels: {
                usePointStyle: true,
                pointStyle: "circle",
                color: m3.textColor,
                font: { family: "'Google Sans Flex', sans-serif", size: 12, weight: 600 },
              },
            },
            tooltip: {
              ...m3.tooltip,
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${formatter.format(ctx.parsed.y || 0)}`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              border: { display: false },
              grid: { color: m3.gridColor },
              ticks: {
                color: m3.textColor,
                callback: (v) => (v >= 1000 ? `${(v / 1000).toLocaleString("it-IT")}k €` : `${v} €`),
              },
            },
            x: {
              border: { display: false },
              grid: { display: false },
              ticks: {
                color: m3.textColor,
                font: { family: "'Google Sans Flex', sans-serif", size: 12, weight: 600 },
              },
            },
          },
        },
      });
    }
  }

  /**
   * Renderizza il grafico e le metriche extra nella vista Calcolatore Mutuo.
   */
  function renderMutuoExtraChart(data) {
    if (!data || typeof Chart === "undefined") return;
    lastMutuoChartData = data;
    const card = document.getElementById("mutuo-charts-card");
    const ctxEl = document.getElementById("mutuoBreakdownChart");
    const metricsEl = document.getElementById("mutuo-chart-metrics");
    if (!card || !ctxEl) return;

    const totaleMutuo = Math.max(0, data.totaleMutuo || 0);
    const totalAnticipo = Math.max(0, data.totalAnticipo || 0);
    const totaleInteressi = Math.max(0, data.totaleInteressi || 0);

    if (totaleMutuo <= 0 && totalAnticipo <= 0) {
      card.style.display = "none";
      return;
    }
    card.style.display = "block";

    const m3 = getM3ChartTheme();
    if (mutuoBreakdownChartInstance) mutuoBreakdownChartInstance.destroy();

    mutuoBreakdownChartInstance = new Chart(ctxEl.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: ["Anticipo (Fondi Propri)", "Capitale Mutuo", "Interessi Banca"],
        datasets: [
          {
            data: [totalAnticipo, totaleMutuo, totaleInteressi],
            backgroundColor: [m3.secondary, m3.primary, m3.isDark ? "#fb7185" : "#dc2626"],
            borderWidth: 0,
            borderRadius: 7,
            spacing: 3,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        animation: m3.doughnutAnimation,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              color: m3.textColor,
              padding: 12,
              font: { family: "'Google Sans Flex', sans-serif", size: 11.5, weight: 600 },
            },
          },
          tooltip: {
            ...m3.tooltip,
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${formatter.format(ctx.parsed || 0)}`,
            },
          },
        },
      },
    });

    if (metricsEl) {
      const fmt = (v) => (typeof formatCurrency === "function" ? formatCurrency(v) : `${(v || 0).toFixed(2)} €`);
      const esborsoTotale = totalAnticipo + totaleMutuo + totaleInteressi;
      const incidenzaInteressi = totaleMutuo > 0 ? (totaleInteressi / totaleMutuo) * 100 : 0;
      const pesoAnticipo = totalAnticipo + totaleMutuo > 0 ? (totalAnticipo / (totalAnticipo + totaleMutuo)) * 100 : 0;

      metricsEl.innerHTML = `
        <div class="mutuo-metric-box">
          <div class="mutuo-metric-label">Esborso Reale Complessivo</div>
          <div class="mutuo-metric-val sensitive-value">${fmt(esborsoTotale)}</div>
        </div>
        <div class="mutuo-metric-box">
          <div class="mutuo-metric-label">Incidenza Interessi su Mutuo</div>
          <div class="mutuo-metric-val" style="color: var(--md-sys-color-error)">+${incidenzaInteressi.toFixed(1)}%</div>
        </div>
        <div class="mutuo-metric-box">
          <div class="mutuo-metric-label">Quota Anticipo su Progetto</div>
          <div class="mutuo-metric-val" style="color: var(--md-sys-color-primary)">${pesoAnticipo.toFixed(1)}%</div>
        </div>
        <div class="mutuo-metric-box">
          <div class="mutuo-metric-label">Rata Mensile Stimata</div>
          <div class="mutuo-metric-val sensitive-value">${fmt(data.rataTotale || 0)}</div>
        </div>
      `;
    }
  }

  /**
   * Inizializzazione principale al caricamento dell'app.
   */
  function initExpressiveUI() {
    // Recupera preferenze salvate
    let savedMode = localStorage.getItem(STORAGE_KEYS.themeMode);
    if (!savedMode) {
      savedMode = localStorage.getItem("casaDarkMode") === "true" ? "dark" : "light";
    }
    const savedAccent = localStorage.getItem(STORAGE_KEYS.accent) || "viola";
    const savedDensity = localStorage.getItem(STORAGE_KEYS.density) || "comfortable";
    const savedReduced = localStorage.getItem(STORAGE_KEYS.reducedMotion) === "true";
    const savedNavStyle = localStorage.getItem(STORAGE_KEYS.navStyle) || "floating";
    const savedNavExpanded = localStorage.getItem(STORAGE_KEYS.navExpanded) === "true";

    setThemeAccent(savedAccent, true);
    setCardDensity(savedDensity);
    setReducedMotion(savedReduced);
    setNavStyle(savedNavStyle);
    toggleNavRailExpand(savedNavExpanded);
    setThemeMode(savedMode, true);

    // Ascolta cambiamenti del tema OS se modalità = 'auto'
    if (window.matchMedia) {
      mediaQueryDark = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQueryDark.addEventListener("change", () => {
        if (localStorage.getItem(STORAGE_KEYS.themeMode) === "auto") {
          setThemeMode("auto");
        }
      });
    }

    initScrollChrome();
    initScrollRevealObserver();
    refreshScrollReveals();
    syncAppearanceControlsUI();
  }

  /**
   * Apre il modale di lettura completa per Domande (Q&A), Task e Appunti.
   * @param {'qa'|'task'|'note'} type
   * @param {number} id
   */
  function openItemDetailModal(type, id) {
    const modal = document.getElementById("itemDetailModal");
    if (!modal) return;

    const badgesEl = document.getElementById("item-detail-badges");
    const titleEl = document.getElementById("item-detail-title");
    const linkedEl = document.getElementById("item-detail-linked");
    const bodyEl = document.getElementById("item-detail-body");
    const imagesEl = document.getElementById("item-detail-images");
    const extraEl = document.getElementById("item-detail-extra");
    const leftActionsEl = document.getElementById("item-detail-actions-left");
    const editBtn = document.getElementById("item-detail-edit-btn");

    let item = null;
    let parentCost = null;
    if (type === "qa") item = (appData.qa || []).find((x) => x.id === id);
    else if (type === "task") item = (appData.tasks || []).find((x) => x.id === id);
    else if (type === "note") item = (appData.notes || []).find((x) => x.id === id);
    else if (type === "payment" && id && typeof id === "object") {
      parentCost = (appData.costi || []).find((c) => c.id === id.costId);
      if (parentCost && Array.isArray(parentCost.pagamenti)) {
        item = parentCost.pagamenti.find((p) => String(p.id) === String(id.paymentId));
      }
    }
    if (!item) return;

    const esc = (s) => (typeof escapeHTML === "function" ? escapeHTML(s || "") : s || "");
    const rich = (txt, col, field) =>
      typeof renderRichContent === "function" ? renderRichContent(txt || "", col, item.id, field) : esc(txt);

    let badgesHtml = "";
    let titleText = "";
    let bodyHtml = "";
    let extraHtml = "";
    leftActionsEl.innerHTML = "";

    const cat = item.category || "Generale";
    let catBg = "var(--md-sys-color-primary-container)";
    let catFg = "var(--md-sys-color-on-primary-container)";
    if (cat !== "Generale" && appData.settings?.categories?.[cat]) {
      catBg = appData.settings.categories[cat].color || catBg;
      catFg = "#ffffff";
    }

    if (type === "qa") {
      const isAns = item.answer && item.answer.trim().length > 0;
      badgesHtml = `
        <span class="cat-badge" style="background:${catBg}; color:${catFg}">${esc(cat)}</span>
        <span class="cat-badge" style="background:${isAns ? "var(--md-sys-color-success)" : "var(--md-sys-color-surface-container-high)"}; color:${isAns ? "#141218" : "var(--md-sys-color-on-surface)"}">${isAns ? "Risposta Ricevuta" : "In Attesa"}</span>
        ${item.date ? `<span style="font-size:12px; color:var(--md-sys-color-outline); margin-left:auto">${esc(item.date)}</span>` : ""}
      `;
      titleText = item.topic || "Domanda";
      bodyHtml = rich(item.question, "qa", "question");
      extraHtml = isAns
        ? `<div class="item-detail-answer-box">
             <div style="font-size:12px; font-weight:700; color:var(--md-sys-color-success); margin-bottom:6px; display:flex; align-items:center; gap:6px">
               <span class="material-symbols-outlined" style="font-size:16px">check_circle</span> Risposta
             </div>
             <div style="font-size:14.5px; line-height:1.55; white-space:pre-wrap">${rich(item.answer, "qa", "answer")}</div>
           </div>`
        : `<div style="margin-top:14px; font-size:13px; color:var(--md-sys-color-outline); font-style:italic; display:flex; align-items:center; gap:6px">
             <span class="material-symbols-outlined" style="font-size:16px">pending</span> In attesa di risposta dal fornitore o professionista.
           </div>`;
      editBtn.onclick = () => {
        closeItemDetailModal();
        if (typeof openEditQAModal === "function") openEditQAModal(item.id);
      };
    } else if (type === "task") {
      const createdDate = new Date(item.id).toLocaleDateString("it-IT");
      let dueBadge = "";
      if (item.dueDate) {
        const dStr = new Date(item.dueDate + "T00:00:00").toLocaleDateString("it-IT");
        dueBadge = `<span class="cat-badge" style="background:var(--md-sys-color-surface-container-high); color:var(--md-sys-color-on-surface); display:inline-flex; align-items:center; gap:4px"><span class="material-symbols-outlined" style="font-size:14px">calendar_month</span> ${dStr}</span>`;
      }
      badgesHtml = `
        <span class="cat-badge" style="background:${catBg}; color:${catFg}">${esc(cat)}</span>
        ${item.completed ? `<span class="cat-badge" style="background:var(--md-sys-color-success); color:#141218">Completato</span>` : `<span class="cat-badge" style="background:var(--md-sys-color-secondary-container); color:var(--md-sys-color-on-secondary-container)">Da Completare</span>`}
        ${dueBadge}
        <span style="font-size:12px; color:var(--md-sys-color-outline); margin-left:auto">${createdDate}</span>
      `;
      titleText = item.title || "Task";
      bodyHtml = item.desc
        ? rich(item.desc, "tasks", "desc")
        : `<span style="color:var(--md-sys-color-outline); font-style:italic">Nessuna descrizione aggiuntiva.</span>`;
      leftActionsEl.innerHTML = `
        <button type="button" class="btn btn-tonal" onclick="toggleTaskStatus(${item.id}); closeItemDetailModal();">
          <span class="material-symbols-outlined">${item.completed ? "undo" : "check_circle"}</span>
          ${item.completed ? "Riapri" : "Completa"}
        </button>
      `;
      editBtn.onclick = () => {
        closeItemDetailModal();
        if (typeof openEditTaskModal === "function") openEditTaskModal(item.id);
      };
    } else if (type === "note") {
      const dateStr = item.date ? new Date(item.date).toLocaleDateString("it-IT") : "";
      badgesHtml = `
        <span class="cat-badge" style="background:var(--md-sys-color-primary-container); color:var(--md-sys-color-on-primary-container)">Appunto</span>
        ${dateStr ? `<span style="font-size:12px; color:var(--md-sys-color-outline); margin-left:auto">${dateStr}</span>` : ""}
      `;
      titleText = item.title || "Appunto";
      bodyHtml = item.content
        ? rich(item.content, "notes", "content")
        : `<span style="color:var(--md-sys-color-outline); font-style:italic">Appunto vuoto.</span>`;
      editBtn.onclick = () => {
        closeItemDetailModal();
        if (typeof openEditNoteModal === "function") openEditNoteModal(item.id);
      };
    } else if (type === "payment" && parentCost) {
      const fmt = (v) => (typeof formatCurrency === "function" ? formatCurrency(v) : `${(v || 0).toFixed(2)} €`);
      const users = appData.settings.users || [];
      const totPay = users.reduce((acc, u) => acc + (item.quote && item.quote[u.id] ? parseFloat(item.quote[u.id]) || 0 : 0), 0);
      const dataFmt = item.data
        ? new Date(item.data + "T00:00:00").toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })
        : "—";
      const sharesHtml = users
        .filter((u) => item.quote && parseFloat(item.quote[u.id]) > 0)
        .map((u) => `<span class="insight-pill">${esc(u.name)}: <b>${fmt(item.quote[u.id])}</b></span>`)
        .join("");

      badgesHtml = `
        <span class="cat-badge" style="background:var(--md-sys-color-primary-container); color:var(--md-sys-color-on-primary-container)">Pagamento</span>
        <span class="cat-badge" style="background:var(--md-sys-color-surface-container-high); color:var(--md-sys-color-on-surface)">${esc(parentCost.desc || "Costo")}</span>
        <span style="font-size:12px; color:var(--md-sys-color-outline); margin-left:auto">${dataFmt}</span>
      `;
      titleText = `Importo Pagato: ${formatter.format(totPay)}`;
      bodyHtml = `
        <div style="margin-bottom:14px">
          <div style="font-size:11px; font-weight:700; color:var(--md-sys-color-outline); margin-bottom:6px; text-transform:uppercase; letter-spacing:0.4px">Quote versate per partecipante</div>
          <div style="display:flex; flex-wrap:wrap; gap:8px">${sharesHtml}</div>
        </div>
        <div>
          <div style="font-size:11px; font-weight:700; color:var(--md-sys-color-outline); margin-bottom:6px; text-transform:uppercase; letter-spacing:0.4px">Note / Descrizione pagamento</div>
          ${item.commento ? `<div style="padding:10px 14px; border-radius:12px; background:var(--md-sys-color-surface-container-low); border:1px solid var(--md-sys-color-outline-variant); white-space:pre-wrap">${rich(item.commento, "costi", parentCost.id, "payment")}</div>` : `<span style="color:var(--md-sys-color-outline); font-style:italic">Nessun commento aggiuntivo.</span>`}
        </div>
      `;
      if (item.fatture && item.fatture.length > 0) {
        const docs = item.fatture
          .map((f, idx) => {
            const url = typeof f === "string" ? f : f && f.url ? f.url : "";
            const label = (typeof f === "object" && f && f.nome && f.nome.trim()) ? f.nome.trim() : `Documento ${idx + 1}`;
            const isImg = url.startsWith("data:image/") || /\.(jpeg|jpg|gif|png|webp)($|\?)/i.test(url);
            if (isImg) {
              return `<a href="javascript:void(0)" onclick="openLightbox('${url.replace(/'/g, "\\'")}')" class="fattura-link-chip"><span class="material-symbols-outlined">image</span>${esc(label)}</a>`;
            }
            return `<a href="${url}" target="_blank" rel="noopener" class="fattura-link-chip"><span class="material-symbols-outlined">receipt_long</span>${esc(label)}</a>`;
          })
          .join("");
        extraHtml = `<div style="margin-top:16px"><div style="font-size:12px; font-weight:700; color:var(--md-sys-color-outline); margin-bottom:8px; text-transform:uppercase">Fatture / Documenti Allegati</div><div class="payment-item-fatture">${docs}</div></div>`;
      }
      editBtn.onclick = () => {
        closeItemDetailModal();
        if (typeof openPaymentModal === "function") openPaymentModal(parentCost.id, item.id);
      };
    }

    badgesEl.innerHTML = badgesHtml;
    titleEl.textContent = titleText;
    bodyEl.style.whiteSpace = type === "payment" ? "normal" : "pre-wrap";
    bodyEl.innerHTML = bodyHtml;
    extraEl.innerHTML = extraHtml;

    // Linked costs
    const linkedCosts = (item.linkedCostIds || [])
      .map((cid) => (appData.costi || []).find((c) => c.id === Number(cid)))
      .filter(Boolean);
    if (linkedCosts.length > 0) {
      linkedEl.style.display = "flex";
      linkedEl.innerHTML = linkedCosts
        .map(
          (cost) =>
            `<a class="card-linked-cost-badge" onclick="closeItemDetailModal(); openDetailView(${cost.id});">
              <span class="material-symbols-outlined">euro</span>
              <span>${esc(cost.desc)}</span>
            </a>`,
        )
        .join("");
    } else {
      linkedEl.style.display = "none";
      linkedEl.innerHTML = "";
    }

    // Images
    if (item.images && item.images.length > 0) {
      imagesEl.style.display = "flex";
      imagesEl.innerHTML = "";
      item.images.forEach((imgUrl, idx) => {
        const thumb = document.createElement("div");
        thumb.className = "note-image-thumb";
        thumb.title = "Clicca per ingrandire";
        thumb.onclick = () => openLightbox(item.images, idx);
        thumb.innerHTML = `<img src="${imgUrl}" alt="Foto ${idx + 1}" loading="lazy" />`;
        imagesEl.appendChild(thumb);
      });
    } else {
      imagesEl.style.display = "none";
      imagesEl.innerHTML = "";
    }

    if (typeof openModalOverlay === "function") {
      openModalOverlay("itemDetailModal");
    } else {
      modal.classList.add("active");
    }
  }

  function closeItemDetailModal() {
    if (typeof closeModalOverlay === "function") {
      closeModalOverlay("itemDetailModal");
    } else {
      const modal = document.getElementById("itemDetailModal");
      if (modal) modal.classList.remove("active");
    }
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeItemDetailModal();
  });

  // Esposizione globale
  window.openItemDetailModal = openItemDetailModal;
  window.closeItemDetailModal = closeItemDetailModal;
  window.setThemeMode = setThemeMode;
  window.setThemeAccent = setThemeAccent;
  window.setCardDensity = setCardDensity;
  window.setReducedMotion = setReducedMotion;
  window.setNavStyle = setNavStyle;
  window.toggleNavRailExpand = toggleNavRailExpand;
  window.syncAppearanceControlsUI = syncAppearanceControlsUI;
  window.refreshAllChartsTheme = refreshAllChartsTheme;
  window.getM3ChartTheme = getM3ChartTheme;
  window.animatePageTitle = animatePageTitle;
  window.refreshScrollReveals = refreshScrollReveals;
  window.scrollToTopMain = scrollToTopMain;
  window.updateRiepilogoInsights = updateRiepilogoInsights;
  window.renderBudgetExtraCharts = renderBudgetExtraCharts;
  window.renderMutuoExtraChart = renderMutuoExtraChart;
  window.initExpressiveUI = initExpressiveUI;
})();
