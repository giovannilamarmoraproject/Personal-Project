// Bidirectional IT / EN Translation Engine for Andrea Rausa F1 Portfolio
(function () {
    const STORAGE_KEY = "andrea_f1_lang";

    const IT_TO_EN = {
        "Andrea Rausa - Ingegnere F1 Ferrari | Stratega della Sconfitta": "Andrea Rausa - Ferrari F1 Engineer | Strategist of Defeat",
        "Chi Sono | Andrea Rausa - Ingegnere F1 Ferrari": "About Me | Andrea Rausa - Ferrari F1 Engineer",
        "Disastri F1 (2016–2026) | Andrea Rausa - Ingegnere F1 Ferrari": "F1 Disasters (2016–2026) | Andrea Rausa - Ferrari F1 Engineer",
        "Diario & Team Radio | Andrea Rausa - Ingegnere F1 Ferrari": "Pit Wall Diary & Radio | Andrea Rausa - Ferrari F1 Engineer",
        "Seguilo in Diretta · Live F1 | Andrea Rausa - Ingegnere F1 Ferrari": "Watch Live · F1 Live | Andrea Rausa - Ferrari F1 Engineer",
        "Contatti | Andrea Rausa - Ingegnere F1 Ferrari": "Contact | Andrea Rausa - Ferrari F1 Engineer",
        "Home": "Home",
        "Chi Sono": "About Me",
        "CHI SONO": "ABOUT ME",
        "Disastri F1": "F1 Disasters",
        "Disastri Ferrari 2016–2026": "Ferrari Disasters 2016–2026",
        "Diario & Radio": "Diary & Radio",
        "Diario & Team Radio": "Diary & Team Radio",
        "Live F1": "F1 Live",
        "Seguilo in Diretta · F1 Live": "Watch Live · F1 Live",
        "Contatti": "Contact",
        "Contatta Andrea": "Contact Andrea",
        "Ingegnere di Formula 1 a Maranello, specializzato nel far perdere la Ferrari.": "Formula 1 Engineer in Maranello, specialized in making Ferrari lose.",
        "Dal muretto box al simulatore, trasformo pole position sicure in quinti posti indimenticabili. Esperto certificato di \"We are checking\", Piano G e gomme intermedie sull'asciutto.": "From the pit wall to the simulator, I turn guaranteed pole positions into unforgettable fifth places. Certified expert in \"We are checking\", Plan G, and Intermediate tires on a dry track.",
        "Muretto Box": "Pit Wall",
        "Email Scuderia": "Team Email",
        "Sede Operativa": "Headquarters",
        "seguimi dal muretto": "follow me from the pit wall",
        "Ciao, Box Box": "Hello, Box Box",
        "Sono Andrea Rausa,": "I'm Andrea Rausa,",
        "Ingegnere F1.": "F1 Engineer.",
        "Stratega Ferrari.": "Ferrari Strategist.",
        "Re del Piano G.": "King of Plan G.",
        "Mago dei Pit Stop.": "Pit Stop Wizard.",
        "Garanzia di Sconfitta.": "Defeat Guarantee.",
        "Ingegnere di Formula 1 in Ferrari con una missione precisa: trasformare ogni weekend da podio garantito in un capolavoro di suspense, strategie incomprensibili e rimonte dal fondo.": "Formula 1 Engineer at Ferrari with one clear mission: turning every guaranteed podium weekend into a masterpiece of suspense, baffling strategies, and back-of-the-grid comebacks.",
        "Scopri i Disastri": "Explore Disasters",
        "Strategie Gara": "Race Strategy",
        "Dal Piano A al Piano G": "From Plan A to Plan G",
        "Pit Stop a 3 Ruote": "3-Wheel Pit Stops",
        "12,7s a Zandvoort 2022": "12.7s at Zandvoort 2022",
        "Team Radio": "Team Radio",
        "Seguilo in Diretta": "Watch Live",
        "Calendario F1 Live": "Live F1 Calendar",
        "Anni Senza": "Years Without",
        "Mondiale Piloti": "Drivers' Title",
        "Dal titolo di Kimi Räikkönen nel 2007 (e Costruttori 2008): 19 anni di strategie creative al muretto di Maranello per garantire che la coppa finisca sempre in un altro garage.": "Since Kimi Räikkönen's 2007 title (and 2008 Constructors'): 19 years of creative pit wall strategy in Maranello to ensure the trophy always goes to another garage.",
        "Anni Senza Costruttori (dal 2008)": "Years Without Constructors' (since 2008)",
        "Errori Storici (2016–2026)": "Historic Blunders (2016–2026)",
        "\"We Are Checking\" in Gara": "\"We Are Checking\" in Races",
        "Pit Stop Record a 3 Ruote (2022)": "3-Wheel Pit Stop Record (2022)",
        "Skill da Muretto": "Pit Wall Skills",
        "PIANO E / F / G": "PLAN E / F / G",
        "TEAM RADIO \"WE ARE CHECKING\"": "TEAM RADIO \"WE ARE CHECKING\"",
        "INTERMEDIE SULL'ASCIUTTO": "INTERMEDIATES ON DRY TRACK",
        "DOPPIO PIT STOP SIMULTANEO": "DOUBLE STACK PIT STOP",
        "Ingegneria F1": "F1 Engineering",
        "TELEMETRIA & SABOTAGGIO": "TELEMETRY & SABOTAGE",
        "DEGRADO GOMME ISTANTANEO": "INSTANT TIRE DEGRADATION",
        "DIMENTICARE LA 4ª GOMMA": "FORGETTING THE 4TH TIRE",
        "AGGIORNAMENTI CHE RALLENTANO": "UPGRADES THAT SLOW THE CAR",
        "Specialità di Gara": "Race Specialties",
        "Far Perdere la Ferrari,": "Making Ferrari Lose,",
        "Un GP alla Volta": "One GP at a Time",
        "Dallo studio della telemetria fino al fatidico giro di rientro ai box: ogni decisione è calibrata al millesimo per sorprendere piloti, avversari e soprattutto i tifosi.": "From telemetry analysis to the fateful pit stop lap: every call is timed to the millisecond to surprise drivers, rivals, and above all the tifosi.",
        "Strategia \"We Are Checking\"": "\"We Are Checking\" Strategy",
        "Che il pilota chieda gomme sotto la pioggia o segnali il sedile allagato in Australia 2025, la mia risposta è sempre storica: \"We are checking\" oppure \"Must be the water. Let's add that to the words of wisdom.\"": "Whether the driver asks for wet tires or reports a flooded cockpit in Australia 2025, my answer is always iconic: \"We are checking\" or \"Must be the water. Let's add that to the words of wisdom.\"",
        "Pit Stop a Tre Ruote": "Three-Wheel Pit Stops",
        "Ottimizzo i tempi di sosta rendendoli indimenticabili: pistole bloccate, gomme hard montate con la pista bagnata e doppi pit stop da manuale del caos.": "I optimize pit stop times to make them unforgettable: jammed wheel guns, Hard tires on a wet track, and textbook chaotic double stacks.",
        "Sviluppo Aerodinamico Inverso": "Reverse Aero Development",
        "Ogni pacchetto di aggiornamenti portato in pista è progettato per regalare quel tocco di porpoising e sottosterzo che tiene viva la suspense fino a novembre.": "Every upgrade package brought to the track is engineered to deliver just the right touch of porpoising and understeer to keep the suspense alive until November.",
        "TEAM RADIO ORIGINALI DAL MURETTO": "ORIGINAL PIT WALL TEAM RADIO",
        "Ascolta i Capolavori": "Listen to the Classics",
        "Clicca su un pulsante per ascoltare i veri team radio storici della Formula 1 e del muretto Ferrari.": "Click any button to play real historic Formula 1 and Ferrari pit wall team radios.",
        "Australia 2025 · Audio Reale": "Australia 2025 · Real Audio",
        "Charles segnala il sedile allagato e dal muretto arriva la perla di saggezza.": "Charles reports a flooded seat and the pit wall delivers pure philosophical wisdom.",
        "Muretto Ferrari · Classico": "Ferrari Pit Wall · Classic",
        "Il mantra ufficiale di Andrea ogni volta che la gara rischia di andare bene.": "Andrea's official mantra whenever a race is dangerously close to going well.",
        "Silverstone 2022 · Audio Reale": "Silverstone 2022 · Real Audio",
        "Carlos Sainz implora il muretto di smettere di inventare strategie assurde.": "Carlos Sainz begs the pit wall to stop inventing absurd strategies.",
        "Monaco 2022 · Audio Reale": "Monaco 2022 · Real Audio",
        "Il contrordine leggendario urlato quando il pilota è già dentro la pit lane.": "The legendary last-second abort shouted while the driver is already in the pit lane.",
        "Pit Wall · Audio Reale": "Pit Wall · Real Audio",
        "Il segnale che annuncia un pit stop da 12,7 secondi con tre gomme pronte.": "The call that heralds a 12.7-second pit stop with only three tires ready.",
        "Baku · Audio Reale": "Baku · Real Audio",
        "La reazione media di Charles Leclerc a fine weekend con le nostre strategie.": "Charles Leclerc's average reaction after a weekend on our strategies.",
        "Formazione & Carriera": "Education & Career",
        "Eccellenza Tecnica": "Technical Excellence",
        "al Servizio del Caos": "in Service of Chaos",
        "Un percorso accademico e professionale interamente dedicato a perfezionare l'arte della sconfitta in Formula 1, dal simulatore fino al muretto di Maranello.": "An academic and professional journey entirely dedicated to perfecting the art of defeat in Formula 1, from the simulator to the Maranello pit wall.",
        "Formazione": "Education",
        "Ingegneria del Pit Stop": "Pit Stop Engineering",
        "Tesi sperimentale su come perdere 12 secondi in corsia box partendo da una prima fila completamente rossa.": "Experimental thesis on how to lose 12 seconds in the pit lane after starting from an all-red front row.",
        "Master in Strategie F1": "Master in F1 Strategy",
        "Specializzazione avanzata nella creazione alfabetica di piani di gara dal Piano A fino al leggendario Piano Z.": "Advanced specialization in alphabetical race planning, from Plan A all the way to the legendary Plan Z.",
        "Corso Avanzato Team Radio": "Advanced Team Radio Course",
        "Comunicazione criptica ad alta pressione: come rispondere \"Question?\" a qualsiasi domanda urgente del pilota in gara.": "High-pressure cryptic communication: how to end every urgent race question with \"Question?\".",
        "Dottorato in Degrado Gomme": "PhD in Tire Degradation",
        "Studio approfondito sul graining istantaneo e sulla scelta scientifica della mescola meno adatta all'asfalto.": "In-depth research on instant graining and scientifically picking the worst compound for the tarmac.",
        "Esperienze": "Experience",
        "Maranello (Oggi)": "Maranello (Present)",
        "Responsabile della gestione strategica domenicale. Specializzato nel trasformare weekend dominati dal venerdì in rimonte disperate la domenica.": "Head of Sunday race strategy. Specialized in turning Friday domination into desperate Sunday recovery drives.",
        "simulatore maranello": "maranello simulator",
        "Gestione Sportiva (3 Anni)": "Gestione Sportiva (3 Years)",
        "Sviluppo di pacchetti aerodinamici innovativi capaci di volare al simulatore e perdere 4 decimi al giro nella realtà.": "Development of innovative aero packages that fly in the simulator and lose 4 tenths per lap on the real track.",
        "Migliori Imprese": "Greatest Hits",
        "Trasformare Vittorie Certe": "Turning Guaranteed Wins",
        "in Sconfitte Epiche": "into Epic Defeats",
        "Una selezione curata dei Gran Premi in cui la mia ingegneria strategica ha fatto davvero la differenza (per gli avversari).": "A curated selection of Grands Prix where my strategic engineering truly made the difference (for our rivals).",
        "Monaco 2022: Doppio Pit Stop da Pole a 4°": "Monaco 2022: Double Stack from Pole to 4th",
        "Strategia Box": "Pit Strategy",
        "Zandvoort 2022: Pit Stop a 3 Ruote (12,7s)": "Zandvoort 2022: 3-Wheel Pit Stop (12.7s)",
        "Gestione Pit Box": "Pit Box Management",
        "Ungheria 2022: Gomme Hard con 20°C": "Hungary 2022: Hard Tires at 20°C",
        "Ingegneria Pneumatici": "Tire Engineering",
        "Brasile 2022: Intermedie sull'Asciutto": "Brazil 2022: Intermediates on Dry Track",
        "Brasile 2022: Intermedie su Pista Asciutta": "Brazil 2022: Intermediates on Dry Track",
        "Meteo & Telemetria": "Weather & Telemetry",
        "STORIA VERA 2016–2026": "TRUE STORY 2016–2026",
        "I 6 Disastri Strategici Più Veri": "The 6 Truest Strategic Disasters",
        "Delle Ultime 10 Stagioni Ferrari": "From Ferrari's Last 10 Seasons",
        "Nessuna invenzione: errori realmente accaduti in pista nelle ultime 10 stagioni di Formula 1, firmati idealmente dal muretto di Andrea Rausa.": "Zero fiction: real on-track blunders from the last 10 Formula 1 seasons, proudly signed by Andrea Rausa's pit wall.",
        "Leclerc parte in pole a casa sua, viene richiamato insieme a Sainz con il leggendario \"Box now! No, stay out!\" e chiude 4°.": "Leclerc starts on home pole, gets double-stacked behind Sainz with the iconic \"Box now! No, stay out!\", and finishes 4th.",
        "Carlos Sainz rientra ai box in Olanda ma i meccanici hanno preparato solo 3 gomme: 12,7 secondi fermi cercando la posteriore sinistra.": "Carlos Sainz pits in the Netherlands only to find 3 tires ready: 12.7 seconds stationary looking for the rear-left.",
        "Leclerc è in testa con passo gara dominante; il muretto gli monta gomme Hard bianche che non vanno in temperatura e crolla al 6° posto.": "Leclerc leads with dominant pace; the pit wall bolts on freezing Hard tires and he tumbles down to 6th.",
        "In Q3 a Interlagos l'asfalto è asciutto e tutti girano con le Soft: Ferrari manda in pista solo Leclerc con le gomme verdi Intermedie.": "In Interlagos Q3 the tarmac is dry and everyone runs Softs: Ferrari sends only Leclerc out on green Intermediates.",
        "Leclerc avvisa via radio di avere il sedile pieno d'acqua; risposta dal muretto: \"Must be the water\". E strategia sbagliata sotto la pioggia di Melbourne.": "Leclerc radios that his seat is full of water; pit wall replies: \"Must be the water.\" Plus a botched rain call in Melbourne.",
        "Silverstone 2022: Fuori con Hard Usate": "Silverstone 2022: Stayed Out on Old Hards",
        "Safety Car a 10 giri dalla fine: tutti montano gomme Soft fresche, Ferrari lascia il leader Leclerc in pista con Hard usate fino a farlo scivolare 4°.": "Safety Car with 10 laps to go: everyone pits for fresh Softs, Ferrari leaves leader Leclerc out on worn Hards until he drops to 4th.",
        "Competenze Chiave": "Core Competencies",
        "Decisioni al Millesimo": "Split-Second Calls",
        "per Massimizzare il Dramma": "to Maximize the Drama",
        "Chiamata \"Box, Stay Out\"": "\"Box, Stay Out\" Call",
        "La mia firma inconfondibile: richiamare il pilota ai box e cambiare idea mezzo secondo dopo il suo ingresso in pit lane.": "My unmistakable signature: calling the driver in and changing my mind half a second after pit entry.",
        "Scopri di più": "Learn More",
        "Analisi Meteo Creativa": "Creative Weather Radar",
        "Capacità unica di prevedere pioggia torrenziale sotto un cielo sereno e sole splendente nel bel mezzo di un nubifragio.": "Unique talent for predicting torrential rain under blue skies and sunshine in the middle of a downpour.",
        "Gestione Power Unit": "Power Unit Management",
        "Mappature motore pensate per offrire emozioni forti e colpi di scena proprio quando si è saldamente in testa a cinque giri dal traguardo.": "Engine modes designed to deliver peak drama right when comfortably leading with five laps to go.",
        "In Australia 2025 avevo il sedile completamente allagato e Andrea dal muretto mi ha risposto serio: \"Must be the water. Let's add that to the words of wisdom.\" Genio!": "In Australia 2025 my seat was completely flooded and Andrea deadpan-replied on radio: \"Must be the water. Let's add that to the words of wisdom.\" Pure genius!",
        "Pilota Scuderia Ferrari F1": "Scuderia Ferrari F1 Driver",
        "Simply lovely! Tra Monaco 2022, le gomme Hard in Ungheria e i pit stop a 3 ruote, Andrea è il miglior alleato che potessi desiderare per vincere i miei mondiali!": "Simply lovely! Between Monaco 2022, Hard tires in Hungary, and 3-wheel pit stops, Andrea is the best ally I could ever ask for to win my championships!",
        "4x Campione del Mondo & Fan #1": "4x World Champion & #1 Fan",
        "Sono venuto a Maranello per vincere l'ottavo titolo, ma dopo il primo briefing strategico con Andrea sul Piano G ho capito che sarà una stagione... molto creativa!": "I came to Maranello to win my eighth title, but after my first Plan G strategy briefing with Andrea I realized it's going to be a... very creative season!",
        "Stop inventing! Stop inventing! A Zandvoort 2022 mi ha fatto aspettare 12,7 secondi ai box perché mancava la gomma posteriore sinistra. Indimenticabile!": "Stop inventing! Stop inventing! At Zandvoort 2022 he kept me waiting 12.7 seconds in the box because the rear-left tire was missing. Unforgettable!",
        "Ex Pilota Scuderia Ferrari F1": "Former Scuderia Ferrari F1 Driver",
        "Ho lasciato Maranello nel 2020, ma ancora oggi quando sento \"Copy, we are checking\" alla radio mi viene un brivido lungo la schiena!": "I left Maranello in 2020, yet even today whenever I hear \"Copy, we are checking\" on the radio I still get chills down my spine!",
        "4x Campione del Mondo · Ex Ferrari": "4x World Champion · Ex Ferrari",
        "CONTATTA IL MURETTO": "CONTACT THE PIT WALL",
        "Vuoi Far Perdere Anche il Tuo Team?": "Want Your Team to Lose Too?",
        "Hai una monoposto troppo veloce e vuoi riportare un po' di brivido in campionato? Scrivimi per una consulenza strategica direttamente dal muretto di Maranello.": "Got a car that's too fast and want to bring some thrill back to the championship? Message me for strategic consulting straight from the Maranello pit wall.",
        "Prenota un \"We Are Checking\"": "Book a \"We Are Checking\"",
        "Diario dal Muretto": "Pit Wall Diary",
        "Cronache di Strategie": "Chronicles of Strategies",
        "e Sconfitte Memorabili": "& Memorable Defeats",
        "GP Domenica": "Race Sunday",
        "Ungheria 2022: perché montare le Hard con 20°C mentre tutti usano le Soft": "Hungary 2022: why bolt on Hard tires at 20°C while everyone runs Softs",
        "Australia 2025: \"Must be the water\" e l'arte del team radio filosofico": "Australia 2025: \"Must be the water\" and the art of philosophical team radio",
        "Zandvoort 2022: 12,7 secondi per cercare la posteriore sinistra di Sainz": "Zandvoort 2022: 12.7 seconds searching for Sainz's rear-left tire",
        "Australia 2025: \"Must be the water\" — Le perle filosofiche del muretto": "Australia 2025: \"Must be the water\" — Philosophical Gems from the Pit Wall",
        "Quando Charles Leclerc ha aperto la radio a Melbourne dicendo": "When Charles Leclerc opened the radio in Melbourne saying",
        ", il muretto ha risposto con una calma zen degna di Aristotele:": ", the pit wall replied with Zen calm worthy of Aristotle:",
        "Charles ha replicato:": "Charles replied:",
        "Nel frattempo, siamo anche rimasti fuori con le slick sotto il diluvio. Capolavoro totale.": "Meanwhile, we also stayed out on slicks in pouring rain. Total masterpiece.",
        "Ungheria 2022: Perché montare le Hard bianche con 20°C mentre tutti usano le Soft": "Hungary 2022: Why Bolt On White Hards at 20°C While Everyone Runs Softs",
        "All'Hungaroring Charles stava dominando su Medie. Bastava copiare la strategia di Verstappen... troppo banale! Montando gomme Hard congelate siamo riusciti nell'impresa di far superare una Ferrari in testa da mezzo schieramento in dieci giri.": "At the Hungaroring Charles was dominating on Mediums. Copying Verstappen's strategy would've been way too boring! By fitting ice-cold Hards we got a race-leading Ferrari overtaken by half the grid in ten laps.",
        "Zandvoort 2022: 12,7 secondi ai box per trovare la quarta gomma": "Zandvoort 2022: 12.7 Seconds in the Box Looking for the Fourth Tire",
        "Cambiare 4 gomme in 2 secondi mette ansia. A Zandvoort abbiamo dimostrato che con 3 gomme pronte e una dimenticata in fondo al garage si può creare uno dei momenti televisivi più memorabili della Formula 1 moderna.": "Changing 4 tires in 2 seconds is stressful. At Zandvoort we proved that with 3 tires ready and one forgotten in the back of the garage you can create one of modern F1's most iconic TV moments.",
        "Ingegnere F1 · Maranello": "F1 Engineer · Maranello",
        "Specialista in \"We are checking\" & Piano G": "Specialist in \"We are checking\" & Plan G",
        "Commenti dal Paddock": "Paddock Comments",
        "\"Let's add that to the words of wisdom... Andrea ti prego!\"": "\"Let's add that to the words of wisdom... Andrea please!\"",
        "\"Simply lovely! Continua così Andrea!\"": "\"Simply lovely! Keep it up Andrea!\"",
        "Andrea Rausa: Ingegnere F1 a Maranello": "Andrea Rausa: F1 Engineer in Maranello",
        "Dal muretto box al simulatore di Maranello, mi occupo di garantire che la Scuderia Ferrari mantenga viva la leggendaria striscia di 19 anni senza Mondiale Piloti (dal 2007) e 18 senza Costruttori (dal 2008).": "From the pit wall to the Maranello simulator, I make sure Scuderia Ferrari keeps alive its legendary streak of 19 years without a Drivers' Title (since 2007) and 18 without a Constructors' Title (since 2008).",
        "Autore di chiamate radio immortali come": "Author of immortal radio calls like",
        "e": "and",
        ", trasformo ogni domenica da possibile doppietta in un capolavoro di imprevedibilità.": ", I turn every potential 1-2 Sunday into a masterpiece of unpredictability.",
        "Pronto": "Ready",
        "a Sbagliare Strategia": "to Botch the Strategy",
        "Link Rapidi": "Quick Links",
        "Seguilo in Diretta (Live F1)": "Watch Live (F1 Live)",
        "Contattami": "Contact Me",
        "Migliori Disastri": "Greatest Disasters",
        "| Tutti i Diritti Riservati · Maranello": "| All Rights Reserved · Maranello",
        "Calendario F1": "F1 Calendar",
        "Telemetria Privata": "Private Telemetry",
        "Radio Muretto - We Are Checking": "Pit Wall Radio - We Are Checking",
        "Scrivi al muretto Ferrari: ti risponderemo \"We are checking\" il prima possibile.": "Message the Ferrari pit wall: we'll reply \"We are checking\" as soon as possible.",
        "Invia al Muretto": "Send to Pit Wall",
        "Il tuo Nome": "Your Name",
        "Numero di Telefono": "Phone Number",
        "La tua Email": "Your Email",
        "Oggetto (es. Piano G)": "Subject (e.g. Plan G)",
        "Il tuo Messaggio al Muretto": "Your Message to the Pit Wall"
    };

    const origTextMap = new WeakMap();
    const origPlaceholderMap = new WeakMap();
    let origTitle = null;

    function getLang() {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved === "en" ? "en" : "it";
    }

    function translateNormalized(str, lang) {
        const trimmed = str.replace(/\s+/g, " ").trim();
        if (!trimmed || lang === "it") return str;
        if (Object.prototype.hasOwnProperty.call(IT_TO_EN, trimmed)) {
            const lead = str.match(/^\s*/)[0];
            const trail = str.match(/\s*$/)[0];
            return lead + IT_TO_EN[trimmed] + trail;
        }
        return str;
    }

    function applyTranslations(lang) {
        document.documentElement.lang = lang;

        if (origTitle === null) origTitle = document.title;
        if (!document.getElementById("disaster-detail-root")) {
            document.title = lang === "en" ? (IT_TO_EN[origTitle.trim()] || origTitle) : origTitle;
        }

        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                const p = node.parentElement;
                if (!p) return NodeFilter.FILTER_REJECT;
                const tag = p.tagName;
                if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return NodeFilter.FILTER_REJECT;
                if (
                    p.closest("#f1-live-widget") ||
                    p.closest("#disaster-detail-root") ||
                    p.closest(".lang-switcher") ||
                    p.id === "detail-breadcrumb-title" ||
                    p.id === "detail-breadcrumb-active"
                ) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        let node;
        while ((node = walker.nextNode())) {
            if (!origTextMap.has(node)) {
                origTextMap.set(node, node.nodeValue);
            }
            const original = origTextMap.get(node);
            node.nodeValue = lang === "en" ? translateNormalized(original, "en") : original;
        }

        document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((el) => {
            if (!origPlaceholderMap.has(el)) {
                origPlaceholderMap.set(el, el.getAttribute("placeholder"));
            }
            const orig = origPlaceholderMap.get(el);
            el.setAttribute("placeholder", lang === "en" ? (IT_TO_EN[orig] || orig) : orig);
        });

        document.querySelectorAll(".lang-switch-btn").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.lang === lang);
        });

        if (typeof window.renderF1LiveWidget === "function") {
            window.renderF1LiveWidget();
        }
        if (typeof window.renderDisasterDetail === "function") {
            window.renderDisasterDetail();
        }
    }

    window.getSiteLang = getLang;
    window.setSiteLang = function (lang) {
        const clean = lang === "en" ? "en" : "it";
        localStorage.setItem(STORAGE_KEY, clean);
        applyTranslations(clean);
    };

    document.addEventListener("DOMContentLoaded", function () {
        applyTranslations(getLang());
    });
})();
