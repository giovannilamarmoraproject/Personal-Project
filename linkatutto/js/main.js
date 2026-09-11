(async function initialize() {
  const DEFAULT_STYLE_CSS =
    "align-items: cover; background-repeat: no-repeat; background-color: #323232;";

  const version = "V2.0.1";

  // Supporto Demo Mode: Se ?demo=true, bypass completo di Access Sphere e Strapi
  if (window.location.search.includes("demo")) {
    console.log("🚀 Linkatutto Demo Mode Activated: Auth & Redirects bypassed");
    const demoData = {
      "Core Microservices & Apps": [
        {
          title: "MoneyStats API",
          logo: "https://raw.githubusercontent.com/giovannilamarmoraproject/MoneyStats/master/.github/assets/img/MoneyStats.png",
          link: {
            "Web App": "https://moneystats.giovannilamarmora.com",
            Swagger: "https://moneystats.service.giovannilamarmora.com/swagger-ui/index.html",
            GitHub: "https://github.com/giovannilamarmoraproject/MoneyStats",
          },
          style_css: DEFAULT_STYLE_CSS,
        },
        {
          title: "Access Sphere",
          logo: "https://strapi.giovannilamarmora.com/uploads/3072743_a19ead8f0e.jpg",
          link: {
            Console: "https://access-sphere.giovannilamarmora.com",
            Docs: "https://giovannilamarmora.github.io",
          },
          style_css: DEFAULT_STYLE_CSS,
        },
        {
          title: "Costi Casa",
          logo: "https://projects.giovannilamarmora.com/costi-casa/icon.jpg",
          link: {
            "Web App": "https://costi-casa.giovannilamarmora.com",
            Repo: "https://github.com/giovannilamarmora",
          },
          style_css: DEFAULT_STYLE_CSS,
        },
        {
          title: "Material Home Assistant",
          logo: "https://strapi.giovannilamarmora.com/uploads/material_home_assistant_18ab2c869d.png",
          link: {
            Website: "https://materialhomeassistant.com/",
            GitHub: "https://github.com/giovannilamarmoraproject/Material-Home-Assistant",
          },
          style_css: DEFAULT_STYLE_CSS,
        },
        {
          title: "The Real Marza",
          logo: "https://yt3.googleusercontent.com/T3I5_9aU84CdDowZbjragxSkkIYTWKoTV8wuIqPYBbt1eZi3BQ5HEPH-By-SyGodl6it_hOHTg=s900-c-k-c0x00ffffff-no-rj",
          link: {
            Website: "https://the-real-marza.giovannilamarmora.com",
            YouTube: "https://www.youtube.com/@TheRealMarzaa",
          },
          style_css: DEFAULT_STYLE_CSS,
        },
        {
          title: "Portfolio Service",
          logo: "https://giovannilamarmora.github.io/assets/icons/svg/rounded_white.svg",
          link: {
            Portfolio: "https://giovannilamarmora.github.io/",
            GitHub: "https://github.com/giovannilamarmora",
          },
          style_css: DEFAULT_STYLE_CSS,
        },
      ],
      "Database & Cloud Infrastructure": [
        {
          title: "MySQL Database",
          logo: "https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/mysql/mysql.png",
          link: {
            Console: "https://cloudbeaver.giovannilamarmora.com",
            Docs: "https://dev.mysql.com/doc/",
          },
          style_css: DEFAULT_STYLE_CSS,
        },
        {
          title: "Redis Cache",
          logo: "https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/redis/redis.png",
          link: {
            Website: "https://redis.io/",
            Docs: "https://redis.io/docs/",
          },
          style_css: DEFAULT_STYLE_CSS,
        },
        {
          title: "Strapi CMS",
          logo: "https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/strapi/strapi.png",
          link: {
            Admin: "https://strapi.giovannilamarmora.com/admin",
            Website: "https://strapi.io/",
          },
          style_css: DEFAULT_STYLE_CSS,
        },
        {
          title: "GitBook Docs",
          logo: "https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/gitbook/gitbook.png",
          link: {
            Docs: "https://giovannilamarmora.gitbook.io/",
            Portal: "https://www.gitbook.com",
          },
          style_css: DEFAULT_STYLE_CSS,
        },
        {
          title: "Docker Registry",
          logo: "https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/docker/docker.png",
          link: {
            Hub: "https://hub.docker.com/u/giovannilamarmora",
            Registry: "https://ghcr.io",
          },
          style_css: DEFAULT_STYLE_CSS,
        },
        {
          title: "Kubernetes Cluster",
          logo: "https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/kubernetes/kubernetes.png",
          link: {
            Dashboard: "https://kubernetes.io/",
            Docs: "https://kubernetes.io/docs/",
          },
          style_css: DEFAULT_STYLE_CSS,
        },
      ],
    };
    displayData(demoData);
    hideBlankPage();
    if (typeof animation === "function") animation();
    return;
  }

  // Assicurati che loadConfig sia già definito globalmente
  //const urlConfig = await loadConfig();
  let urlConfig = await configuration;
  if (!urlConfig) urlConfig = await loadConfig();
  console.log("✅ Configuration loaded:", urlConfig);

  /**
   * ------------------------------
   * Access Sphere Authorize
   * ------------------------------
   */
  document.addEventListener("ACCESS_SPHERE_AUTH", (event) => {
    const { success, data, error } = event.detail;
    if (success && !error) {
      getDatas();
    } else {
      localStorage.setItem("errorMessage", error.error.message);
      window.location.href = window.location.origin + "/forbidden.html";
    }
  });

  /**
   * ------------------------------
   * Access Sphere Token
   * ------------------------------
   */
  document.addEventListener("ACCESS_SPHERE_TOKEN", (event) => {
    const { success, data, error } = event.detail;
    if (success && !error) {
      getDatas();
    } else {
      localStorage.setItem("errorMessage", error.error.message);
      window.location.href = window.location.origin + "/forbidden.html";
    }
  });

  /**
   * ------------------------------
   * Strapi Get Data
   * ------------------------------
   */
  function getDatas() {
    const token = localStorage.getItem(urlConfig.client_id + "_strapi-token");
    getStrapiData(urlConfig.strapi_url + urlConfig.linkatutto_datas, token)
      .then((data) => {
        if (data.error != null) {
          localStorage.clear();
          localStorage.setItem("errorMessage", error.toString());
          window.location.href = window.location.origin + "/forbidden.html";
          return;
        }
        displayData(mapData(data)); // JSON data parsed by `data.json()` call
        getSingleDatas();
        hideBlankPage();
        //hideLoginForm();
        animation();
      })
      .catch((error) => {
        //localStorage.clear();
        localStorage.setItem("errorMessage", error.toString());
        window.location.href = window.location.origin + "/forbidden.html";
      });
  }

  function getSingleDatas() {
    const token = localStorage.getItem(urlConfig.client_id + "_strapi-token");
    getStrapiData(urlConfig.strapi_url + urlConfig.linkatutto_data, token)
      .then((data) => {
        if (data.error != null) {
          localStorage.clear();
          localStorage.setItem("errorMessage", error.toString());
          window.location.href = window.location.origin + "/forbidden.html";
          return;
        }
        displaySingleData(data);
      })
      .catch((error) => {
        //localStorage.clear();
        localStorage.setItem("errorMessage", error.toString());
        window.location.href = window.location.origin + "/forbidden.html";
      });
  }

  function hideBlankPage() {
    document.getElementById("blank_page").classList.add("not-display-login");
    document.getElementById("dashboard").classList.remove("not-display");
  }

  function hideLoginForm() {
    document.getElementById("loginForm").classList.add("not-display-login");
    document.getElementById("dashboard").classList.remove("not-display");
  }

  function mapData(inputData) {
    const mappedData = {};

    inputData.data.forEach((item) => {
      const category = item.attributes.category;

      if (!mappedData[category]) {
        mappedData[category] = [];
      }

      const mappedItem = {
        title: item.attributes.title,
        logo:
          item.attributes.logo.data != null
            ? urlConfig.strapi_url + item.attributes.logo.data.attributes.url
            : null,
        link: {},
        style_css:
          item.attributes.style_css == null
            ? DEFAULT_STYLE_CSS
            : item.attributes.style_css.replaceAll("\n", " "),
      };

      if (item.attributes.url) {
        for (const [key, value] of Object.entries(item.attributes.url)) {
          mappedItem.link[key] = value;
        }
      }

      mappedData[category].push(mappedItem);
    });

    return mappedData;
  }

  function displaySingleData(strapi) {
    let strapiData = strapi.data.attributes;
    $(".logo-images").attr("src", strapiData.logo);
    $(".github_url").attr("href", strapiData.github_url);
    $(".log_explore").attr("href", strapiData.log_explore);
    $(".website_url").attr("href", strapiData.website_url);
    $("#copyright-text").text(strapiData.copyright + ". " + version);
    $("#contact_url").attr("href", strapiData.contact_url);
    $("#about_url").attr("href", strapiData.about_url);
    $("#FAQ_url").attr("href", strapiData.FAQ_url);
    $("#support_url").attr("href", strapiData.support_url);
  }

  function displayData(strapi) {
    const dataList = document.getElementById("dataList");
    dataList.innerHTML = ""; // Pulisce eventuali dati precedenti
    for (const key in strapi) {
      if (strapi.hasOwnProperty(key)) {
        const categoryHeader =
          key === "Default"
            ? ""
            : `
          <div class="category-header">
            <div class="category-line line-left"></div>
            <h2 class="category-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
              <span>${key}</span>
            </h2>
            <div class="category-line line-right"></div>
          </div>
        `;

        dataList.innerHTML += `
          <section class="features section">
            ${categoryHeader}
            <div class="wrapper">
              <div class="cols">
                ${createCard(strapi[key], key)}
              </div>
            </div>
          </section>
        `;
      }
    }
  }

  function createCard(datas, categoryName) {
    let res = "";
    const displayCategory =
      categoryName && categoryName !== "Default"
        ? categoryName
        : "Microservice";
    datas.forEach((element) => {
      const bgStyle =
        element.style_css == null ? DEFAULT_STYLE_CSS : element.style_css;
      const logoUrl = element.logo
        ? element.logo
        : "https://raw.githubusercontent.com/giovannilamarmora/giovannilamarmora.github.io/0f58a355856d25a7154482951a3220899ee59d10/assets/icons/svg/rounded_white.svg";

      res += `
        <div class="col">
          <div class="flip-card">
            <div class="card-container">
              <div
                class="front"
                style="
                  background-image: url('${logoUrl}');
                  ${bgStyle}
                "
              >
                <div class="inner">
                  <p>${element.title}</p>
                  <span>${displayCategory}</span>
                </div>
              </div>
              <div class="back">
                <div class="inner">
                  <h1>${element.title}</h1>
                  <div class="back-category-pill">${displayCategory}</div>
                  <div class="after"></div>
                  ${createButton(element.link)}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    return res;
  }

  function createButton(datas) {
    if (!datas || Object.keys(datas).length === 0) {
      return `<div style="font-size: 0.8rem; color: #9398a5; margin-top: 0.5rem;">Nessun endpoint disponibile</div>`;
    }
    let res = `<div class="action-buttons-group">`;
    for (const key in datas) {
      if (datas.hasOwnProperty(key)) {
        res += `
          <a
            href="${datas[key]}"
            target="_blank"
            class="star-button"
            title="${key}"
          >
            <span>${key}</span>
          </a>
        `;
      }
    }
    res += "</div>";
    return res;
  }
})();

/**
 * ------------------------------
 * Logout Process
 * ------------------------------
 */
function logout() {
  console.log("🔴 Logout started...");
  if (window.location.search.includes("demo")) {
    const url = new URL(window.location.href);
    url.searchParams.delete("demo");
    const cleanUrl =
      url.origin +
      url.pathname +
      (url.searchParams.toString() ? "?" + url.searchParams.toString() : "") +
      url.hash;
    window.location.href = cleanUrl;
    return;
  }
  if (window.AccessSphere && typeof window.AccessSphere.logout === "function") {
    window.AccessSphere.logout();
  } else {
    window.location.href = window.location.origin + window.location.pathname;
  }
}

/**
 * ------------------------------
 * Mobile Hamburger Menu Toggle
 * ------------------------------
 */
function initMobileMenu() {
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const siteHeader = document.querySelector(".site-header");
  if (!hamburgerBtn || !mobileMenu || hamburgerBtn.dataset.bound) return;
  hamburgerBtn.dataset.bound = "true";

  hamburgerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = mobileMenu.classList.toggle("open");
    hamburgerBtn.classList.toggle("active", isOpen);
    hamburgerBtn.setAttribute("aria-expanded", isOpen);
    if (siteHeader) siteHeader.classList.toggle("menu-open", isOpen);
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      hamburgerBtn.classList.remove("active");
      hamburgerBtn.setAttribute("aria-expanded", "false");
      if (siteHeader) siteHeader.classList.remove("menu-open");
    });
  });

  document.addEventListener("click", (e) => {
    if (
      mobileMenu.classList.contains("open") &&
      !mobileMenu.contains(e.target) &&
      !hamburgerBtn.contains(e.target)
    ) {
      mobileMenu.classList.remove("open");
      hamburgerBtn.classList.remove("active");
      hamburgerBtn.setAttribute("aria-expanded", "false");
      if (siteHeader) siteHeader.classList.remove("menu-open");
    }
  });
}

/**
 * ------------------------------
 * Card Click/Tap to Flip Handler (Mobile & Touch)
 * ------------------------------
 */
function initCardFlip() {
  document.addEventListener("click", (e) => {
    // If the click is on an actual link or button inside the card, don't flip!
    if (
      e.target.closest("a") ||
      e.target.closest("button") ||
      e.target.closest(".star-button")
    ) {
      return;
    }

    const card = e.target.closest(".flip-card");
    if (card) {
      const isFlipped = card.classList.toggle("flipped");

      // Unflip other cards so only one card is flipped at a time
      document.querySelectorAll(".flip-card.flipped").forEach((otherCard) => {
        if (otherCard !== card) {
          otherCard.classList.remove("flipped");
        }
      });
    } else {
      // Tapping outside cards unflips any open cards
      document.querySelectorAll(".flip-card.flipped").forEach((c) => {
        c.classList.remove("flipped");
      });
    }
  });
}

/**
 * -------------------------------------------------------------
 * Gestione Slider Toggle per il Testo Frontale delle Card
 * Default: testo nascosto (hide-front-card-text)
 * Salvataggio dello stato in localStorage
 * -------------------------------------------------------------
 */
function initCardTextToggle() {
  const STORAGE_KEY = "linkatutto_show_front_text";
  let savedVal = null;
  try {
    savedVal = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    console.warn("localStorage non accessibile:", e);
  }

  // Default: testo nascosto (show = true solo se salvato esplicitamente come "true")
  const isVisible = savedVal === "true";

  function applyVisibility(show, save = true) {
    if (show) {
      document.body.classList.remove("hide-front-card-text");
      document.documentElement.classList.remove("hide-front-card-text");
    } else {
      document.body.classList.add("hide-front-card-text");
      document.documentElement.classList.add("hide-front-card-text");
    }

    const desktopSwitch = document.getElementById("toggle-front-text-switch");
    const mobileSwitch = document.getElementById(
      "mobile-toggle-front-text-switch",
    );
    if (desktopSwitch) desktopSwitch.checked = show;
    if (mobileSwitch) mobileSwitch.checked = show;

    if (save) {
      try {
        localStorage.setItem(STORAGE_KEY, show ? "true" : "false");
      } catch (e) {}
    }
  }

  // Applica stato iniziale (default nascosto)
  applyVisibility(isVisible, false);

  // Listener per cambio stato switch desktop
  const desktopSwitch = document.getElementById("toggle-front-text-switch");
  if (desktopSwitch) {
    desktopSwitch.addEventListener("change", (e) => {
      applyVisibility(e.target.checked, true);
    });
  }

  // Click su tutto il container pill desktop
  const desktopPill = document.getElementById("card-text-toggle");
  if (desktopPill) {
    desktopPill.addEventListener("click", (e) => {
      if (e.target.closest(".switch-toggle")) return;
      if (desktopSwitch) {
        desktopSwitch.checked = !desktopSwitch.checked;
        applyVisibility(desktopSwitch.checked, true);
      }
    });
  }

  // Listener per cambio stato switch mobile
  const mobileSwitch = document.getElementById(
    "mobile-toggle-front-text-switch",
  );
  if (mobileSwitch) {
    mobileSwitch.addEventListener("change", (e) => {
      applyVisibility(e.target.checked, true);
    });
  }

  // Click su tutto il container pill mobile
  const mobilePill = document.getElementById("mobile-card-text-toggle");
  if (mobilePill) {
    mobilePill.addEventListener("click", (e) => {
      if (e.target.closest(".switch-toggle")) return;
      if (mobileSwitch) {
        mobileSwitch.checked = !mobileSwitch.checked;
        applyVisibility(mobileSwitch.checked, true);
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initCardFlip();
    initCardTextToggle();
  });
} else {
  initMobileMenu();
  initCardFlip();
  initCardTextToggle();
}

