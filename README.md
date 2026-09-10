# 🌐 Personal-Project Server · Central Hub

> Portale centrale, showcase digitale e server di hosting per le applicazioni web, esperimenti e integrazioni create da **[Giovanni Lamarmora](https://giovannilamarmora.github.io/)**.

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)](https://nginx.org/)
[![Material 3](https://img.shields.io/badge/Material_Expressive_3-1a73e8?style=for-the-badge&logo=google&logoColor=white)](https://m3.material.io/)
[![Status](https://img.shields.io/badge/Status-Active%20&%20Live-brightgreen?style=for-the-badge)]()

---

## 📑 Indice dei Contenuti
- [Panoramica del Progetto](#-panoramica-del-progetto)
- [Struttura della Repository](#-struttura-della-repository)
- [Progetti e Applicazioni Ospitate](#-progetti-e-applicazioni-ospitate)
- [Avvio con Docker & Docker Compose](#-avvio-con-docker--docker-compose)
- [Guida al Routing Dinamico & NPMPlus](#-guida-al-routing-dinamico--npmplus)
  - [Come Funziona la Logica a Doppia Priorità](#come-funziona-la-logica-a-doppia-priorità)
  - [Caso 1: Dominio Principale con Sottocartelle](#caso-1-dominio-principale-con-sottocartelle)
  - [Caso 2: Sottodominio Diretto Automatico (Zero-Config)](#caso-2-sottodominio-diretto-automatico-zero-config)
  - [Caso 3: Sottodominio Personalizzato con `X-Target-Folder`](#caso-3-sottodominio-personalizzato-con-x-target-folder)
- [Aggiunta di un Nuovo Progetto](#-aggiunta-di-un-nuovo-progetto)
- [Autore & Contatti](#-autore--contatti)

---

## 🎯 Panoramica del Progetto

Questo repository funge da server unificato per ospitare e distribuire progetti web personali. Include:
1. **Central Hub (`index.html`)**: un'interfaccia interattiva progettata con le linee guida **Material Expressive 3** (Dark Mode), dotata di:
   - Bio e status badge dello sviluppatore.
   - Quick Links a Portfolio, GitHub, LinkedIn, CV e contatti diretti.
   - Core Tech Stack Chips (Java, Spring Boot, Angular, Docker, Kubernetes, ecc.).
   - Filtri interattivi per categoria (`Web App`, `Integration & UI`, `WebSite`, `Service`, `Application`).
   - Flip-Card 3D con tag tecnologici sul retro e disposizione reattiva a 3 card per riga con a capo.
2. **Web Applications e Siti Dedicati**: cartelle autonome (es. `the-real-marza`, `costi-casa`) ospitate nello stesso web server.
3. **Nginx Dynamic Reverse Proxy Engine**: un file di configurazione (`nginx.conf`) intelligente che supporta contemporaneamente percorsi a sottocartella e sottodomini dedicati senza dover ricreare o riavviare il container.

---

## 📂 Struttura della Repository

```text
Personal-Project/
├── index.html               # Frontend Central Hub (Material Expressive 3)
├── projects.json            # Database JSON dei progetti, categorie e tag
├── nginx.conf               # Configurazione Nginx con dynamic multi-routing
├── Dockerfile               # Build dell'immagine Docker basata su nginx:alpine
├── docker-compose.yml       # Definizione del servizio Docker con volume per hot-reload
├── .dockerignore            # Esclusione di file non necessari dalla build
├── README.md                # Documentazione del progetto e guida al deployment
│
├── the-real-marza/          # Hub sito web per TheRealMarza (Streamer & Creator)
│   ├── index.html           # Home page con animazioni e statistiche
│   ├── twitch.html          # Player live Twitch integrato con chat e clip
│   ├── youtube.html         # Galleria video e feed dinamico YouTube
│   ├── kingsleague.html     # Squadra e match Kings League TRM
│   ├── setup.html           # Schede hardware e periferiche streaming
│   ├── style.css            # Stili moderni con effetto glassmorphism
│   ├── script.js            # Interattività e animazioni
│   └── assets/              # Loghi, immagini profilo e grafiche
│
└── costi-casa/              # Web App per calcolo spese casa e simulazione mutui
    ├── index.html           # Applicazione frontend
    ├── manifest.json        # Configurazione PWA
    └── service-worker.js    # Supporto offline
```

---

## 🚀 Progetti e Applicazioni Ospitate

| Progetto | Categoria | Descrizione |
| :--- | :--- | :--- |
| **Costi Casa** | `Web App` | Applicazione web PWA per gestione del budget, monitoraggio spese e simulazioni mutuo per l'acquisto della casa. |
| **The Real Marza** | `WebSite` | Hub dedicato a Francesco Marzano che aggrega live Twitch, clip, canale YouTube, setup da streaming e team Kings League. |
| **Material Home Assistant** | `Integration & UI` | Suite di integrazioni e schede per Home Assistant con design Google Material You. *(Punta al dominio esterno materialhomeassistant.com)* |
| **Access Sphere** | `Service` | Piattaforma per gestione identità digitali, MFA e Single Sign-On. |
| **MoneyStats** | `Application` | Applicazione full-stack (Spring Boot + Angular + MySQL) per la gestione delle finanze personali e del patrimonio. |

---

## 🐳 Avvio con Docker & Docker Compose

Il container espone la porta HTTP `80` (mappata di default sulla porta host `8085`).

### 1. Avvio rapido
```bash
docker compose up -d --build
```

### 2. Hot-Reload senza rebuild
Nel file `docker-compose.yml` è montato il volume:
```yaml
volumes:
  - ./:/usr/share/nginx/html:ro
```
Questo significa che ogni modifica ai file HTML/CSS/JS o qualsiasi nuova cartella aggiunta nel progetto è **immediatamente visibile in tempo reale**, senza dover ricostruire l'immagine Docker!

### 3. Log e verifica
```bash
docker compose logs -f
```

---

## 🔀 Guida al Routing Dinamico & NPMPlus

Il server Nginx integrato nel container è programmato per supportare nativamente **tre modalità di accesso concorrenti**, senza richiedere configurazioni complesse o modifiche al codice.

### Come Funziona la Logica a Doppia Priorità

Quando una richiesta arriva al container attraverso **Nginx Proxy Manager Plus (NPMPlus)**:

1. **Priorità 1 (Header esplicito `X-Target-Folder`)**: se da NPMPlus invii l'header personalizzato `X-Target-Folder "nome-cartella"`, Nginx serve immediatamente quella cartella come radice (`/`).
2. **Priorità 2 (Sottodominio automatico)**: se non è specificato nessun header, Nginx legge il sottodominio dalla richiesta HTTP:
   - Se il sottodominio è `project`, `projects`, `www`, `hub` o un IP diretto ➔ Serve il **Central Hub** principale.
   - Se il sottodominio corrisponde a una cartella (es. `the-real-marza.giovannilamarmora.com`) ➔ Serve automaticamente quella cartella come radice (`/`).

---

### CASO 1: Dominio Principale con Sottocartelle

**Obiettivo**:
- `https://project.giovannilamarmora.com/` ➔ Central Hub
- `https://project.giovannilamarmora.com/the-real-marza/` ➔ The Real Marza
- `https://project.giovannilamarmora.com/costi-casa/` ➔ Costi Casa

**Configurazione in NPMPlus**:
1. Vai su **Proxy Hosts** ➔ **Add Proxy Host**.
2. Scheda **Details**:
   - **Domain Names**: `project.giovannilamarmora.com` *(e opzionalmente `projects.giovannilamarmora.com`)*
   - **Scheme**: `http`
   - **Forward Hostname / IP**: `personal-project-hub` *(se su rete Docker)* oppure l'IP locale del server Docker (es. `192.168.1.50`)
   - **Forward Port**: `8085` *(o `80` se usi la rete Docker)*
   - Spunta **Block Common Exploits**
   - Spunta **Websockets Support**
3. Scheda **SSL**:
   - Seleziona il certificato Let's Encrypt
   - Spunta **Force SSL** e **HTTP/2 Support**
4. Salva (**Save**).

---

### CASO 2: Sottodominio Diretto Automatico (Zero-Config)

**Obiettivo**:
- `https://the-real-marza.giovannilamarmora.com/` ➔ Apre direttamente The Real Marza come sito autonomo alla radice `/`, senza dover scrivere `/the-real-marza/` nell'URL.

**Configurazione in NPMPlus**:
1. Vai su **Add Proxy Host**.
2. Scheda **Details**:
   - **Domain Names**: `the-real-marza.giovannilamarmora.com`
   - **Scheme**: `http`
   - **Forward Hostname / IP**: Stesso IP / hostname del Caso 1 (`personal-project-hub` o IP server)
   - **Forward Port**: `8085` *(o `80`)*
   - Spunta **Block Common Exploits**
3. Scheda **SSL**:
   - Seleziona o genera il certificato SSL
   - Spunta **Force SSL**
4. Salva (**Save**).

> **Perché funziona da solo?**
> Nginx estrae la parola `the-real-marza` dal sottodominio e imposta la root su `/usr/share/nginx/html/the-real-marza`. Risorse, favicon e cartella `assets/` relative funzionano senza alcuna configurazione aggiuntiva.

---

### CASO 3: Sottodominio Personalizzato con `X-Target-Folder`

**Obiettivo**:
- Vuoi usare un sottodominio con un nome **diverso** da quello della cartella (ad esempio `stream.giovannilamarmora.com` o `marza.giovannilamarmora.com`) e farlo puntare alla cartella `the-real-marza`.

**Configurazione in NPMPlus**:
1. Vai su **Add Proxy Host**.
2. Scheda **Details**:
   - **Domain Names**: `stream.giovannilamarmora.com`
   - **Forward Hostname / IP**: `personal-project-hub` o IP server
   - **Forward Port**: `8085`
3. Scheda **Advanced**:
   Inserisci questa singola riga di configurazione:
   ```nginx
   proxy_set_header X-Target-Folder "the-real-marza";
   ```
4. Scheda **SSL**:
   - Seleziona il certificato Let's Encrypt
   - Spunta **Force SSL**
5. Salva (**Save**).

> **Cosa succede?**
> L'header `X-Target-Folder` comunica a Nginx di servire direttamente il contenuto di `the-real-marza`, scavalcando il nome del sottodominio. Puoi usare questo metodo per mappare qualunque dominio o sottodominio verso qualsiasi cartella tu desideri.

---

## ➕ Aggiunta di un Nuovo Progetto

Per aggiungere un nuovo progetto al server:

1. **Crea la cartella del progetto**:
   Inserisci la tua cartella con l'`index.html` e i file statici nella radice del repository (es. `./mio-nuovo-progetto`).
2. **Aggiungi la card in `projects.json`**:
   ```json
   {
     "title": "Mio Nuovo Progetto",
     "category": "Web App",
     "description": "Breve descrizione del progetto e delle sue funzionalità.",
     "image": "https://url-immagine-di-copertina.jpg",
     "url": "./mio-nuovo-progetto/",
     "tags": ["Angular", "TypeScript"]
   }
   ```
3. **Accedi subito**:
   - Tramite Central Hub su `project.giovannilamarmora.com/mio-nuovo-progetto/`
   - Tramite sottodominio dedicato creando semplicemente `mio-nuovo-progetto.giovannilamarmora.com` su NPMPlus!

---

## 👨‍💻 Autore & Contatti

**Giovanni Lamarmora**  
*Full-Stack & DevOps Engineer · Milano, Italia*

- 🌐 **Sito Portfolio**: [giovannilamarmora.github.io](https://giovannilamarmora.github.io/)
- 🐙 **GitHub**: [@giovannilamarmora](https://github.com/giovannilamarmora)
- 💼 **LinkedIn**: [/in/giovannilamarmora](https://www.linkedin.com/in/giovannilamarmora)
- ✉️ **Email**: [giovannilamarmora.working@gmail.com](mailto:giovannilamarmora.working@gmail.com)
- 📄 **Curriculum Vitae**: [Visualizza CV](https://drive.google.com/file/d/1MHvusVukjPKKqf-fZ_u18FudraALBb4-/view?usp=drive_link)

---

&copy; 2026 Giovanni Lamarmora. Central Hub Server rilasciato con licenza open-source.