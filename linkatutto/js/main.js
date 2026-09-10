(async function initialize() {
  // Assicurati che loadConfig sia già definito globalmente
  //const urlConfig = await loadConfig();
  let urlConfig = await configuration;
  if (!urlConfig) urlConfig = await loadConfig();
  console.log("✅ Configuration loaded:", urlConfig);

  const DEFAULT_STYLE_CSS =
    "align-items: cover; background-repeat: no-repeat; background-color: #323232;";

  const version = "V2.0.1";

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
        const categoryHeader = key === "Default" ? "" : `
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
    const displayCategory = (categoryName && categoryName !== "Default") ? categoryName : "Microservice";
    datas.forEach((element) => {
      const bgStyle = element.style_css == null ? DEFAULT_STYLE_CSS : element.style_css;
      const logoUrl = element.logo ? element.logo : "https://raw.githubusercontent.com/giovannilamarmora/giovannilamarmora.github.io/0f58a355856d25a7154482951a3220899ee59d10/assets/icons/svg/rounded_white.svg";
      
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
                  <div class="back-category-pill">${displayCategory}</div>
                  <h1>${element.title}</h1>
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

  // Supporto Demo Mode: Se ?demo=true oppure preview locale
  if (window.location.search.includes("demo")) {
    console.log("🚀 Linkatutto Demo Mode Activated");
    const demoData = {
      "Core Microservices": [
        {
          title: "Portfolio Service",
          logo: "https://raw.githubusercontent.com/giovannilamarmora/giovannilamarmora.github.io/0f58a355856d25a7154482951a3220899ee59d10/assets/icons/svg/rounded_white.svg",
          link: { "Swagger": "#", "Actuator": "#", "Repo": "https://github.com/giovannilamarmora" },
          style_css: DEFAULT_STYLE_CSS
        },
        {
          title: "MoneyStats API",
          logo: "https://raw.githubusercontent.com/giovannilamarmoraproject/MoneyStats/master/.github/assets/img/MoneyStats.png",
          link: { "Web App": "https://moneystats.giovannilamarmora.com", "Swagger": "#", "Metrics": "#" },
          style_css: DEFAULT_STYLE_CSS
        },
        {
          title: "Access Sphere",
          logo: "https://raw.githubusercontent.com/giovannilamarmora/giovannilamarmora.github.io/0f58a355856d25a7154482951a3220899ee59d10/assets/icons/svg/rounded_white.svg",
          link: { "Console": "#", "Docs": "#" },
          style_css: DEFAULT_STYLE_CSS
        }
      ],
      "Gateways & Systems": [
        {
          title: "Linkatutto Hub",
          logo: "https://raw.githubusercontent.com/giovannilamarmora/giovannilamarmora.github.io/0f58a355856d25a7154482951a3220899ee59d10/assets/icons/svg/rounded_white.svg",
          link: { "Gateway": "#", "Health": "#" },
          style_css: DEFAULT_STYLE_CSS
        },
        {
          title: "Personal Project Server",
          logo: "https://raw.githubusercontent.com/giovannilamarmora/giovannilamarmora.github.io/0f58a355856d25a7154482951a3220899ee59d10/assets/icons/svg/rounded_white.svg",
          link: { "Central Hub": "/", "The Real Marza": "/the-real-marza/" },
          style_css: DEFAULT_STYLE_CSS
        },
        {
          title: "Home Assistant Proxy",
          logo: "https://raw.githubusercontent.com/giovannilamarmora/giovannilamarmora.github.io/0f58a355856d25a7154482951a3220899ee59d10/assets/icons/svg/rounded_white.svg",
          link: { "Dashboard": "#", "Status": "#" },
          style_css: DEFAULT_STYLE_CSS
        }
      ]
    };
    displayData(demoData);
    hideBlankPage();
  }
})();

/**
 * ------------------------------
 * Logout Process
 * ------------------------------
 */
function logout() {
  console.log("🔴 Logout started...");
  window.AccessSphere.logout();
}

/**
 * ------------------------------
 * Mobile Hamburger Menu Toggle
 * ------------------------------
 */
function initMobileMenu() {
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  if (!hamburgerBtn || !mobileMenu || hamburgerBtn.dataset.bound) return;
  hamburgerBtn.dataset.bound = "true";

  hamburgerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = mobileMenu.classList.toggle("open");
    hamburgerBtn.classList.toggle("active", isOpen);
    hamburgerBtn.setAttribute("aria-expanded", isOpen);
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      hamburgerBtn.classList.remove("active");
      hamburgerBtn.setAttribute("aria-expanded", "false");
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
    if (e.target.closest("a") || e.target.closest("button") || e.target.closest(".star-button")) {
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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initCardFlip();
  });
} else {
  initMobileMenu();
  initCardFlip();
}
