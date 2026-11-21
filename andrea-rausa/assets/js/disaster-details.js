// Dynamic Bilingual (IT/EN) Ferrari F1 Disaster Case Studies (2016-2026)
(function () {
    const DISASTERS = {
        monaco: {
            img: "assets/images/latest-portfolio/portfoli-img-1.jpg",
            gallery: ["assets/images/experiences/expert-img.jpg", "assets/images/latest-portfolio/portfoli-img-2.jpg"],
            audio: { file: "stay_out.mp3", label_it: 'Ascolta "Stay out! Stay out!"', label_en: 'Play "Stay out! Stay out!"' },
            it: {
                badge: "GP DI MONACO · MAGGIO 2022",
                title: "Monaco 2022: Doppio Pit Stop da Pole a 4°",
                subtitle: "Come trasformare una prima fila tutta rossa a Montecarlo in un capolavoro di caos radio.",
                p1: "Partire dalla pole position a Monaco, il circuito cittadino dove è praticamente impossibile sorpassare, sembrava una condanna alla vittoria. Al giro 21, mentre la pista iniziava ad asciugarsi, il muretto ha orchestrato una sequenza da manuale: prima la sosta in ritardo sulle Intermedie, poi il leggendario doppio pit stop simultaneo dietro a Carlos Sainz.",
                p2: "Il momento più alto di ingegneria comunicativa è arrivato in diretta mondiale: «Box now, box! No, stay out, stay out!» urlato quando Charles Leclerc era già a metà della corsia box, costretto ad attendere in coda e rientrare in pista quarto.",
                facts: [
                    ["Stagione", "2022 (Round 7)"],
                    ["Circuito", "Circuit de Monaco, Monte Carlo"],
                    ["Pilota", "Charles Leclerc (#16)"],
                    ["Griglia → Arrivo", "1° (Pole) → 4°"],
                    ["Errore Chiave", "Doppio pit stop + contrordine in pit lane"],
                    ["Team Radio", "\"Box now! No, stay out, stay out!\""]
                ],
                bullets: [
                    "Prima fila 100% Ferrari in qualifica (Leclerc P1, Sainz P2).",
                    "Undercut subito da Red Bull per 3 giri di esitazione al muretto.",
                    "Doppio stack ai box con Leclerc bloccato dietro il compagno di squadra.",
                    "Risultato finale: vittoria consegnata a Red Bull e meme eterni."
                ]
            },
            en: {
                badge: "MONACO GP · MAY 2022",
                title: "Monaco 2022: Double Stack from Pole to 4th",
                subtitle: "How to turn an all-red front row in Monte Carlo into a masterpiece of pit radio chaos.",
                p1: "Starting from pole position in Monaco—the street circuit where overtaking is virtually impossible—looked like a guaranteed win. On lap 21, as the track dried out, the pit wall orchestrated a textbook disaster: pitting late for Intermediates, then calling a legendary double stack right behind Carlos Sainz.",
                p2: "Peak communication engineering aired live worldwide: \"Box now, box! No, stay out, stay out!\" shouted when Charles Leclerc was already halfway down the pit lane, forcing him to queue behind his teammate and rejoin in fourth.",
                facts: [
                    ["Season", "2022 (Round 7)"],
                    ["Circuit", "Circuit de Monaco, Monte Carlo"],
                    ["Driver", "Charles Leclerc (#16)"],
                    ["Grid → Finish", "1st (Pole) → 4th"],
                    ["Key Blunder", "Double stack + last-second abort"],
                    ["Team Radio", "\"Box now! No, stay out, stay out!\""]
                ],
                bullets: [
                    "All-Ferrari front row lockout in qualifying (Leclerc P1, Sainz P2).",
                    "Undercut by Red Bull after 3 laps of pit-wall hesitation.",
                    "Double stack in the pits leaving Leclerc stacked behind Sainz.",
                    "Final result: victory handed to Red Bull and immortal F1 memes."
                ]
            }
        },
        zandvoort: {
            img: "assets/images/latest-portfolio/portfoli-img-2.jpg",
            gallery: ["assets/images/latest-portfolio/portfoli-img-1.jpg", "assets/images/experiences/expert-img-two.jpg"],
            audio: { file: "box_box.mp3", label_it: 'Ascolta "Box, box!"', label_en: 'Play "Box, box!"' },
            it: {
                badge: "GP D'OLANDA · SETTEMBRE 2022",
                title: "Zandvoort 2022: Pit Stop a 3 Ruote (12,7s)",
                subtitle: "La dimostrazione scientifica che 4 gomme pronte contemporaneamente sono sopravvalutate.",
                p1: "Al giro 15 del Gran Premio d'Olanda, Carlos Sainz viene richiamato ai box per difendersi dagli avversari. La chiamata arriva però così tardi che i meccanici escono dal garage con sole tre gomme in mano: la posteriore sinistra non c'è.",
                p2: "Mentre Carlos resta fermo sui cavalletti per ben 12,7 secondi interminabili (e una pistola pneumatica finisce anche sulla traiettoria di Sergio Pérez), nasce uno degli episodi più iconici della Formula 1 moderna.",
                facts: [
                    ["Stagione", "2022 (Round 15)"],
                    ["Circuito", "Circuit Zandvoort, Paesi Bassi"],
                    ["Pilota", "Carlos Sainz (#55)"],
                    ["Tempo Pit Stop", "12,7 secondi (media F1: 2,4s)"],
                    ["Errore Chiave", "Mancava la gomma posteriore sinistra"],
                    ["Bonus", "Pistola lasciata in pit lane"]
                ],
                bullets: [
                    "Chiamata ai box comunicata troppo tardi alla crew dei meccanici.",
                    "Solo 3 gomme pronte in piazzola all'arrivo della monoposto.",
                    "12,7 secondi di sosta da fermo sotto gli occhi di milioni di spettatori.",
                    "Gara di Sainz compromessa e ulteriore penalità di 5s per unsafe release più tardi."
                ]
            },
            en: {
                badge: "DUTCH GP · SEPTEMBER 2022",
                title: "Zandvoort 2022: 3-Wheel Pit Stop (12.7s)",
                subtitle: "Scientific proof that having all 4 tires ready at the same time is overrated.",
                p1: "On lap 15 of the Dutch Grand Prix, Carlos Sainz is called into the pits to cover rivals. The call comes so late that the pit crew runs out with only three tires: the rear-left is completely missing.",
                p2: "As Carlos sits stranded on the jacks for an agonizing 12.7 seconds (with a wheel gun even left in Sergio Pérez's path), one of modern Formula 1's most iconic TV moments is born.",
                facts: [
                    ["Season", "2022 (Round 15)"],
                    ["Circuit", "Circuit Zandvoort, Netherlands"],
                    ["Driver", "Carlos Sainz (#55)"],
                    ["Pit Stop Time", "12.7 seconds (F1 avg: 2.4s)"],
                    ["Key Blunder", "Rear-left tire missing from pit box"],
                    ["Bonus", "Wheel gun left in the pit lane"]
                ],
                bullets: [
                    "Late pit call left mechanics scrambling out of the garage.",
                    "Only 3 tires waiting in the pit box when the car stopped.",
                    "12.7-second stationary stop broadcast live to millions.",
                    "Sainz's race ruined, followed later by a 5s unsafe release penalty."
                ]
            }
        },
        ungheria: {
            img: "assets/images/latest-portfolio/portfoli-img-3.jpg",
            gallery: ["assets/images/experiences/expert-img-two.jpg", "assets/images/latest-portfolio/portfoli-img-4.jpg"],
            audio: { file: "f1_radio_beep.mp3", tts: "Copy Charles, we are checking. Hard tires, question?", label_it: 'Ascolta "We Are Checking"', label_en: 'Play "We Are Checking"' },
            it: {
                badge: "GP D'UNGHERIA · LUGLIO 2022",
                title: "Ungheria 2022: Gomme Hard con 20°C",
                subtitle: "Come fermare una Ferrari nettamente più veloce montando quattro blocchi di marmo.",
                p1: "All'Hungaroring Charles Leclerc aveva un passo gara eccezionale sulle Medie ed era in piena lotta per la vittoria, nonostante Verstappen partisse 10°. Con temperature dell'asfalto fresche (~20°C), tutti i team avevano già dimostrato che la mescola Hard (bianca) non entrava in temperatura.",
                p2: "Al giro 39, per coprire l'undercut di Verstappen, il muretto monta a Leclerc proprio le gomme Hard. Risultato: aderenza zero, sorpasso immediato di Verstappen (che fa persino un testacoda a 360° e lo risorpassa di nuovo!), sosta extra sulle Soft e sesto posto finale.",
                facts: [
                    ["Stagione", "2022 (Round 13)"],
                    ["Circuito", "Hungaroring, Budapest"],
                    ["Pilota", "Charles Leclerc (#16)"],
                    ["Posizione → Arrivo", "1° (in gara) → 6°"],
                    ["Errore Chiave", "Mescola Hard con pista fredda"],
                    ["Team Radio", "\"These tires are sh*t!\""]
                ],
                bullets: [
                    "Leclerc in testa con passo dominante su gomme Medie.",
                    "Alpine aveva già dimostrato 15 giri prima che le Hard erano lentissime.",
                    "Verstappen (partito 10°) lo supera due volte nonostante un 360° in pista.",
                    "Terzo pit stop obbligato sulle Soft per salvare almeno il 6° posto."
                ]
            },
            en: {
                badge: "HUNGARIAN GP · JULY 2022",
                title: "Hungary 2022: Hard Tires at 20°C",
                subtitle: "How to stop a dominant Ferrari by bolting on four blocks of ice.",
                p1: "At the Hungaroring, Charles Leclerc had blistering pace on Mediums and was leading the race while Verstappen had started 10th. With cool ~20°C track conditions, other teams had already proven the white Hard compound simply could not switch on.",
                p2: "On lap 39, trying to cover Verstappen's undercut, the pit wall fits Leclerc with Hard tires anyway. Result: zero grip, Verstappen overtakes him, spins 360°, overtakes him a second time, and Leclerc pits again for Softs to finish 6th.",
                facts: [
                    ["Season", "2022 (Round 13)"],
                    ["Circuit", "Hungaroring, Budapest"],
                    ["Driver", "Charles Leclerc (#16)"],
                    ["Race Pos → Finish", "1st (leading) → 6th"],
                    ["Key Blunder", "Hard compound on cold tarmac"],
                    ["Team Radio", "\"These tires are sh*t!\""]
                ],
                bullets: [
                    "Leclerc leading comfortably on Mediums.",
                    "Alpine had already proved 15 laps earlier that Hards had no grip.",
                    "Verstappen (started P10) passed him twice despite doing a full 360° spin.",
                    "Forced into a third pit stop for Softs, dropping all the way to P6."
                ]
            }
        },
        brasile: {
            img: "assets/images/latest-portfolio/portfoli-img-4.jpg",
            gallery: ["assets/images/experiences/expert-img.jpg", "assets/images/latest-portfolio/portfoli-img-3.jpg"],
            audio: { file: "i_am_stupid.mp3", label_it: 'Ascolta reazione di Charles', label_en: 'Play Charles reaction' },
            it: {
                badge: "GP DEL BRASILE · NOVEMBRE 2022",
                title: "Brasile 2022: Intermedie su Pista Asciutta",
                subtitle: "Quando il radar meteo del muretto vede un uragano dove ci sono solo nuvole passeggere.",
                p1: "Qualifiche Q3 a Interlagos: il cielo è coperto ma l'asfalto è completamente asciutto. Nove piloti su dieci escono dai box con gomme Soft slick per fare subito il tempo prima di un'eventuale pioggia.",
                p2: "Uno solo esce con le gomme verdi Intermedie da bagnato: Charles Leclerc. Dopo un giro lento a distruggere le intermedie sull'asciutto, rientra ai box per mettere le Soft... esattamente nel momento in cui George Russell finisce nella ghiaia causando la bandiera rossa. Leclerc chiude 10° senza tempo.",
                facts: [
                    ["Stagione", "2022 (Round 21)"],
                    ["Circuito", "Autódromo José Carlos Pace, Interlagos"],
                    ["Pilota", "Charles Leclerc (#16)"],
                    ["Sessione", "Qualifiche Q3 → 10° (senza tempo)"],
                    ["Errore Chiave", "Unico pilota su Intermedie con pista asciutta"],
                    ["Team Radio", "\"Nice one! Am I the only one on Inters?\""]
                ],
                bullets: [
                    "9 piloti su 10 in Q3 su gomme Soft slick.",
                    "Ferrari scommette sulla pioggia immediata che arriva solo 5 minuti dopo.",
                    "Bandiera rossa di Russell impedisce a Leclerc di fare un giro su slick.",
                    "Kevin Magnussen fa la pole con la Haas, Leclerc parte 10°."
                ]
            },
            en: {
                badge: "BRAZILIAN GP · NOVEMBER 2022",
                title: "Brazil 2022: Intermediates on Dry Track",
                subtitle: "When the pit-wall weather radar sees a monsoon under dry skies.",
                p1: "Q3 qualifying at Interlagos: overcast skies, but completely dry tarmac. Nine out of ten drivers leave the garage on Soft slicks to bank a lap before any rain arrives.",
                p2: "Only one car leaves on green Intermediate wet tires: Charles Leclerc. After a slow lap shredding inters on dry asphalt, he pits for Softs—at the exact second George Russell beaches it in the gravel, bringing out the red flag. Leclerc qualifies 10th with no time set.",
                facts: [
                    ["Season", "2022 (Round 21)"],
                    ["Circuit", "Interlagos, São Paulo"],
                    ["Driver", "Charles Leclerc (#16)"],
                    ["Session", "Q3 Qualifying → P10 (no time)"],
                    ["Key Blunder", "Only car on Intermediates on dry track"],
                    ["Team Radio", "\"Nice one! Am I the only one on Inters?\""]
                ],
                bullets: [
                    "9 out of 10 Q3 cars went straight out on Soft slicks.",
                    "Ferrari gambled on rain that only arrived 5 minutes later.",
                    "Russell's red flag prevented Leclerc from ever setting a slick lap.",
                    "Kevin Magnussen took pole for Haas while Leclerc started P10."
                ]
            }
        },
        australia: {
            img: "assets/images/experiences/expert-img.jpg",
            gallery: ["assets/images/experiences/expert-img-two.jpg", "assets/images/latest-portfolio/portfoli-img-4.jpg"],
            audio: { file: "must_be_the_water.mp3", label_it: 'Ascolta "Must be the water" (Audio Reale)', label_en: 'Play "Must be the water" (Real Audio)' },
            it: {
                badge: "GP D'AUSTRALIA · MARZO 2025",
                title: "Australia 2025: \"Must Be The Water\"",
                subtitle: "La frase più filosofica nella storia dei team radio F1, abbinata a slick sotto il diluvio.",
                p1: "Apertura di stagione a Melbourne 2025 sotto una pioggia imprevedibile. Charles Leclerc apre la radio per segnalare un problema nell'abitacolo: «Is there a leakage? I have the seat full of water, like, full of water.»",
                p2: "La risposta dal muretto entra istantaneamente nella storia dello sport: «Must be the water.» E Charles, rassegnato: «Let's add that to the words of wisdom.» Come ciliegina sulla torta, nel finale la Ferrari lascia entrambi i piloti fuori con gomme slick mentre ricomincia a piovere forte, perdendo un mucchio di posizioni.",
                facts: [
                    ["Stagione", "2025 (Round 1)"],
                    ["Circuito", "Albert Park, Melbourne"],
                    ["Piloti", "Charles Leclerc & Lewis Hamilton"],
                    ["Risultato Finale", "8° (Leclerc) e 10° (Hamilton)"],
                    ["Errore Chiave", "Rimasti fuori con le slick sotto la pioggia"],
                    ["Team Radio", "\"Must be the water.\" · \"Words of wisdom.\""]
                ],
                bullets: [
                    "Dialogo radio diventato virale in tutto il mondo in meno di 10 minuti.",
                    "Azzardo di restare in pista su slick durante lo scroscio finale a Melbourne.",
                    "Entrambe le Ferrari superate da mezzo schieramento nel giro di rientro tardivo.",
                    "Debutto di Hamilton in Rosso chiuso al 10° posto dopo una strategia da brividi."
                ]
            },
            en: {
                badge: "AUSTRALIAN GP · MARCH 2025",
                title: "Australia 2025: \"Must Be The Water\"",
                subtitle: "The most philosophical quote in F1 radio history, paired with slicks in a downpour.",
                p1: "2025 season opener in Melbourne under treacherous rain. Charles Leclerc opens the radio to report a cockpit issue: \"Is there a leakage? I have the seat full of water, like, full of water.\"",
                p2: "The pit wall's deadpan reply enters motorsport folklore instantly: \"Must be the water.\" Charles sighs: \"Let's add that to the words of wisdom.\" To top it off, Ferrari leaves both cars out on slicks when heavy rain returns late in the race, tumbling down the order.",
                facts: [
                    ["Season", "2025 (Round 1)"],
                    ["Circuit", "Albert Park, Melbourne"],
                    ["Drivers", "Charles Leclerc & Lewis Hamilton"],
                    ["Finish", "8th (Leclerc) & 10th (Hamilton)"],
                    ["Key Blunder", "Stayed out on slicks in heavy rain"],
                    ["Team Radio", "\"Must be the water.\" · \"Words of wisdom.\""]
                ],
                bullets: [
                    "Radio exchange went viral worldwide within 10 minutes.",
                    "Gambled on staying out on slicks during the late Melbourne shower.",
                    "Both Ferraris swallowed by the field before finally pitting too late.",
                    "Hamilton's Ferrari debut finished P10 after a nerve-wracking strategy call."
                ]
            }
        },
        silverstone: {
            img: "assets/images/experiences/expert-img-two.jpg",
            gallery: ["assets/images/latest-portfolio/portfoli-img-1.jpg", "assets/images/latest-portfolio/portfoli-img-3.jpg"],
            audio: { file: "stop_inventing.mp3", label_it: 'Ascolta "Stop inventing!" (Audio Reale)', label_en: 'Play "Stop inventing!" (Real Audio)' },
            it: {
                badge: "GP DI GRAN BRETAGNA · LUGLIO 2022",
                title: "Silverstone 2022: Fuori con Hard Usate",
                subtitle: "Safety Car a 10 giri dalla fine: tutti mettono Soft nuove, il leader resta su Hard usate.",
                p1: "Silverstone 2022: Charles Leclerc è al comando della gara davanti a Sainz, Pérez e Hamilton. A 10 giri dalla fine entra la Safety Car per il ritiro di Ocon. È un pit stop gratuito da manuale per montare gomme Soft fresche.",
                p2: "Il muretto richiama Sainz (che poi via radio intima «Stop inventing!» quando gli chiedono di fare da tappo), ma lascia il leader Leclerc in pista con gomme Hard usate di 14 giri. Alla ripartenza Leclerc lotta come un leone ma è inerme contro le Soft nuove e chiude 4°.",
                facts: [
                    ["Stagione", "2022 (Round 10)"],
                    ["Circuito", "Silverstone Circuit, UK"],
                    ["Piloti", "Charles Leclerc (#16) & Carlos Sainz (#55)"],
                    ["Posizione Leclerc", "1° (sotto SC) → 4°"],
                    ["Errore Chiave", "Nessun pit stop sotto Safety Car per il leader"],
                    ["Team Radio", "Sainz: \"Stop inventing! Stop inventing!\""]
                ],
                bullets: [
                    "Leclerc in testa con oltre 4 secondi di margine prima della Safety Car.",
                    "Sainz, Pérez e Hamilton montano tutti gomme Soft fresche.",
                    "Leclerc lasciato fuori con Hard usate, facile preda alla ripartenza.",
                    "Sainz conquista la sua prima vittoria ignorando il piano di rallentare il gruppo."
                ]
            },
            en: {
                badge: "BRITISH GP · JULY 2022",
                title: "Silverstone 2022: Stayed Out on Old Hards",
                subtitle: "Safety Car with 10 laps left: everyone pits for fresh Softs, the leader stays on worn Hards.",
                p1: "Silverstone 2022: Charles Leclerc leads ahead of Sainz, Pérez, and Hamilton. With 10 laps to go, Ocon stops on track and brings out the Safety Car—a textbook free pit stop for fresh Soft tires.",
                p2: "The pit wall pits Sainz (who famously replies \"Stop inventing!\" when asked to back up the pack), while leaving race leader Leclerc out on 14-lap-old Hard tires. At the restart Leclerc defends heroically but is powerless against fresh Softs, finishing 4th.",
                facts: [
                    ["Season", "2022 (Round 10)"],
                    ["Circuit", "Silverstone Circuit, UK"],
                    ["Drivers", "Charles Leclerc (#16) & Carlos Sainz (#55)"],
                    ["Leclerc Pos", "1st (under SC) → 4th"],
                    ["Key Blunder", "Didn't pit race leader under Safety Car"],
                    ["Team Radio", "Sainz: \"Stop inventing! Stop inventing!\""]
                ],
                bullets: [
                    "Leclerc led by over 4 seconds before the late Safety Car.",
                    "Sainz, Pérez, and Hamilton all pitted for brand-new Softs.",
                    "Leclerc left stranded on old Hards, a sitting duck at the restart.",
                    "Sainz took his maiden F1 win after refusing orders to hold up the pack."
                ]
            }
        }
    };

    const ORDER = [
        { id: "monaco", it: "Monaco 2022", en: "Monaco 2022" },
        { id: "zandvoort", it: "Zandvoort 2022", en: "Zandvoort 2022" },
        { id: "ungheria", it: "Ungheria 2022", en: "Hungary 2022" },
        { id: "brasile", it: "Brasile 2022", en: "Brazil 2022" },
        { id: "australia", it: "Australia 2025", en: "Australia 2025" },
        { id: "silverstone", it: "Silverstone 2022", en: "Silverstone 2022" }
    ];

    function getKey() {
        const params = new URLSearchParams(window.location.search);
        const gp = (params.get("gp") || "monaco").toLowerCase();
        return DISASTERS[gp] ? gp : "monaco";
    }

    function renderDisasterDetail() {
        const root = document.getElementById("disaster-detail-root");
        if (!root) return;

        const key = getKey();
        const item = DISASTERS[key];
        const lang = typeof window.getSiteLang === "function" ? window.getSiteLang() : "it";
        const isEn = lang === "en";
        const d = isEn ? item.en : item.it;

        // Update breadcrumb & page title
        const h1 = document.getElementById("detail-breadcrumb-title");
        const crumb = document.getElementById("detail-breadcrumb-active");
        if (h1) h1.textContent = d.title;
        if (crumb) crumb.textContent = d.title;
        document.title = `${d.title} | Andrea Rausa - ${isEn ? "Ferrari F1 Engineer" : "Ingegnere F1 Ferrari"}`;

        const switcherPills = ORDER.map(o => {
            const active = o.id === key;
            return `<a href="project-details.html?gp=${o.id}" style="padding:8px 16px; border-radius:999px; font-size:13px; font-weight:700; text-decoration:none; border:1px solid ${active ? '#FF014F' : 'rgba(255,255,255,0.14)'}; background:${active ? '#FF014F' : '#141414'}; color:#fff;">${isEn ? o.en : o.it}</a>`;
        }).join("");

        const audioBtn = item.audio
            ? `<button type="button" class="radio-btn-card mt--25" onclick="playTeamRadio(this, '${item.audio.file}'${item.audio.tts ? `, '${item.audio.tts}'` : ''})">
                   <span class="radio-play-icon"><i class="fa-solid fa-play"></i></span>
                   <span class="radio-btn-meta">
                       <span class="radio-tag">${isEn ? 'ORIGINAL TEAM RADIO' : 'TEAM RADIO ORIGINALE'}</span>
                       <h5>${isEn ? item.audio.label_en : item.audio.label_it}</h5>
                       <p>${isEn ? 'Click to listen to the real pit wall audio.' : 'Clicca per ascoltare l\'audio dal muretto.'}</p>
                   </span>
               </button>`
            : "";

        root.innerHTML = `
            <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-bottom:36px;">
                ${switcherPills}
            </div>
            <div class="row g-5">
                <div class="col-lg-12">
                    <img class="w-100" style="border-radius:20px; max-height:560px; object-fit:cover;" src="${item.img}" alt="${d.title}">
                </div>
                <div class="col-lg-8">
                    <span style="display:inline-block; color:#FF014F; font-weight:700; letter-spacing:1.4px; font-size:13px; margin-bottom:10px;">${d.badge}</span>
                    <h2 class="title">${d.title}</h2>
                    <p class="description mt--10" style="font-size:18px; color:#eee;">${d.subtitle}</p>
                    <p class="description mt--20">${d.p1}</p>
                    <p class="description mt--15">${d.p2}</p>
                    ${audioBtn}
                    <h3 class="title mt--35">${isEn ? 'Key Moments of the Masterpiece' : 'Momenti Chiave del Capolavoro'}</h3>
                    <ul class="mt--15" style="line-height:2; color:#ccc; padding-left:20px;">
                        ${d.bullets.map(b => `<li>${b}</li>`).join("")}
                    </ul>
                    <div class="row g-4 mt--25">
                        ${item.gallery.map(g => `<div class="col-md-6"><img class="w-100" style="border-radius:16px;" src="${g}" alt="${d.title}"></div>`).join("")}
                    </div>
                </div>
                <div class="col-lg-4">
                    <div style="padding:30px; border-radius:20px; background:#141414; border:1px solid rgba(255,255,255,0.08);">
                        <h3 class="title mb--20">${isEn ? 'GP Telemetry Sheet' : 'Scheda Tecnica GP'}</h3>
                        <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:14px; color:#ccc; font-size:15px;">
                            ${d.facts.map(([k, v]) => `<li style="border-bottom:1px solid rgba(255,255,255,0.07); padding-bottom:10px;"><strong style="color:#fff; display:block; font-size:13px; text-transform:uppercase; letter-spacing:0.8px;">${k}</strong>${v}</li>`).join("")}
                        </ul>
                        <a class="tmp-btn hover-icon-reverse radius-round w-100 mt--25" href="project.html">
                            <span class="icon-reverse-wrapper">
                                <span class="btn-text">${isEn ? 'All 6 Disasters' : 'Tutti i 6 Disastri'}</span>
                                <span class="btn-icon"><i class="fa-sharp fa-regular fa-arrow-right"></i></span>
                                <span class="btn-icon"><i class="fa-sharp fa-regular fa-arrow-right"></i></span>
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    window.renderDisasterDetail = renderDisasterDetail;

    document.addEventListener("DOMContentLoaded", renderDisasterDetail);
})();
