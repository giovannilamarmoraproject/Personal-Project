// Calendario Reale Formula 1 (Orari Italiani Europe/Rome) + Team Radio Soundboard
(function () {
    // Calendario ufficiale F1 fine stagione 2026 + apertura 2027 (orari italiani CET/CEST)
    const F1_CALENDAR = [
        {
            name: "GP di Las Vegas 2026",
            circuit: "Las Vegas Strip Circuit, USA",
            code: "LAS VEGAS",
            start: "2026-11-19T00:00:00+01:00",
            end: "2026-11-22T09:00:00+01:00",
            sessions: [
                { label: "Prove Libere 1 (FP1)", dt: "2026-11-20T01:30:00+01:00", display: "Ven 20 Nov · 01:30" },
                { label: "Prove Libere 2 (FP2)", dt: "2026-11-20T05:00:00+01:00", display: "Ven 20 Nov · 05:00" },
                { label: "Prove Libere 3 (FP3)", dt: "2026-11-21T01:30:00+01:00", display: "Sab 21 Nov · 01:30" },
                { label: "Qualifiche", dt: "2026-11-21T05:00:00+01:00", display: "Sab 21 Nov · 05:00" },
                { label: "Gara (50 giri)", dt: "2026-11-22T05:00:00+01:00", display: "Dom 22 Nov · 05:00" }
            ]
        },
        {
            name: "GP del Qatar 2026",
            circuit: "Lusail International Circuit, Qatar",
            code: "QATAR",
            start: "2026-11-27T00:00:00+01:00",
            end: "2026-11-29T22:00:00+01:00",
            sessions: [
                { label: "Prove Libere 1 (FP1)", dt: "2026-11-27T14:30:00+01:00", display: "Ven 27 Nov · 14:30" },
                { label: "Prove Libere 2 (FP2)", dt: "2026-11-27T18:00:00+01:00", display: "Ven 27 Nov · 18:00" },
                { label: "Prove Libere 3 (FP3)", dt: "2026-11-28T15:30:00+01:00", display: "Sab 28 Nov · 15:30" },
                { label: "Qualifiche", dt: "2026-11-28T19:00:00+01:00", display: "Sab 28 Nov · 19:00" },
                { label: "Gara", dt: "2026-11-29T17:00:00+01:00", display: "Dom 29 Nov · 17:00" }
            ]
        },
        {
            name: "GP di Abu Dhabi 2026",
            circuit: "Yas Marina Circuit, UAE",
            code: "ABU DHABI",
            start: "2026-12-04T00:00:00+01:00",
            end: "2026-12-06T20:00:00+01:00",
            sessions: [
                { label: "Prove Libere 1 (FP1)", dt: "2026-12-04T10:30:00+01:00", display: "Ven 4 Dic · 10:30" },
                { label: "Prove Libere 2 (FP2)", dt: "2026-12-04T14:00:00+01:00", display: "Ven 4 Dic · 14:00" },
                { label: "Prove Libere 3 (FP3)", dt: "2026-12-05T11:30:00+01:00", display: "Sab 5 Dic · 11:30" },
                { label: "Qualifiche", dt: "2026-12-05T15:00:00+01:00", display: "Sab 5 Dic · 15:00" },
                { label: "Gara (Gran Finale)", dt: "2026-12-06T14:00:00+01:00", display: "Dom 6 Dic · 14:00" }
            ]
        },
        {
            name: "GP d'Australia 2027",
            circuit: "Albert Park, Melbourne",
            code: "AUSTRALIA",
            start: "2027-03-05T00:00:00+01:00",
            end: "2027-03-07T12:00:00+01:00",
            sessions: [
                { label: "Prove Libere 1 (FP1)", dt: "2027-03-05T02:30:00+01:00", display: "Ven 5 Mar · 02:30" },
                { label: "Prove Libere 2 (FP2)", dt: "2027-03-05T06:00:00+01:00", display: "Ven 5 Mar · 06:00" },
                { label: "Prove Libere 3 (FP3)", dt: "2027-03-06T02:30:00+01:00", display: "Sab 6 Mar · 02:30" },
                { label: "Qualifiche", dt: "2027-03-06T06:00:00+01:00", display: "Sab 6 Mar · 06:00" },
                { label: "Gara", dt: "2027-03-07T05:00:00+01:00", display: "Dom 7 Mar · 05:00" }
            ]
        }
    ];

    function formatDateIT(isoStr) {
        const d = new Date(isoStr);
        return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }

    function renderLiveWidget() {
        const container = document.getElementById("f1-live-widget");
        if (!container) return;

        const now = new Date();

        let activeGP = null;
        let nextGP = null;

        for (const gp of F1_CALENDAR) {
            const s = new Date(gp.start);
            const e = new Date(gp.end);
            if (now >= s && now <= e) {
                activeGP = gp;
                break;
            }
            if (s > now && !nextGP) {
                nextGP = gp;
            }
        }

        const targetGP = activeGP || nextGP || F1_CALENDAR[F1_CALENDAR.length - 1];
        let nextSession = targetGP.sessions.find(s => new Date(s.dt) > now) || targetGP.sessions[targetGP.sessions.length - 1];
        const diffMs = Math.max(0, new Date(nextSession.dt) - now);
        const days = Math.floor(diffMs / 86400000);
        const hours = Math.floor((diffMs % 86400000) / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);

        const isLive = Boolean(activeGP);
        const raceSession = targetGP.sessions[targetGP.sessions.length - 1];

        const badgeHtml = isLive
            ? `<span class="f1-live-badge is-live"><span class="f1-pulse-dot"></span> WEEKEND DI GARA IN CORSO · ${targetGP.name}</span>`
            : `<span class="f1-live-badge is-off"><i class="fa-solid fa-pause"></i> NESSUN GP OGGI · PAUSA STRATEGICA</span>`;

        const headlineHtml = isLive
            ? `<h2 class="title" style="margin-bottom:10px;">Andrea è al Muretto per il ${targetGP.name}!</h2>
               <p class="description">Circuito: <strong>${targetGP.circuit}</strong>. Prossima occasione per rovinare la gara: <strong>${nextSession.label} (${nextSession.display})</strong>.</p>`
            : `<h2 class="title" style="margin-bottom:10px;">Oh no! Oggi non sono riuscito a far perdere la Ferrari...</h2>
               <p class="description">Ci riproverò <strong>${formatDateIT(raceSession.dt)}</strong> al <strong>${targetGP.name}</strong> (${targetGP.circuit})! Nel frattempo sto preparando il Piano G.</p>`;

        const rowsHtml = targetGP.sessions.map(s => {
            const isNext = s === nextSession;
            return `<tr class="${isNext ? 'next-session' : ''}">
                <td>${s.label} ${isNext ? '<span style="color:#FF014F; font-size:12px; margin-left:6px;">● PROSSIMA</span>' : ''}</td>
                <td>${s.display} (Ora Italiana)</td>
                <td>Sky Sport F1 / NOW / F1 Live</td>
            </tr>`;
        }).join("");

        const showFullCalendar = container.dataset.full === "true";
        let fullCalHtml = "";
        if (showFullCalendar) {
            fullCalHtml = `
                <div class="mt--40">
                    <h3 class="title mb--20">Prossimi Appuntamenti Ufficiali F1 (Orari Italiani)</h3>
                    <div class="row g-4">
                        ${F1_CALENDAR.map(gp => `
                            <div class="col-lg-6">
                                <div style="background:#141414; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:22px;">
                                    <h4 style="color:#fff; margin-bottom:4px;">${gp.name}</h4>
                                    <p style="color:#aaa; font-size:14px; margin-bottom:12px;">${gp.circuit}</p>
                                    <ul style="list-style:none; padding:0; margin:0; font-size:14px; color:#ddd; line-height:1.9;">
                                        ${gp.sessions.map(s => `<li><strong style="color:#FF014F;">${s.label}:</strong> ${s.display}</li>`).join("")}
                                    </ul>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="f1-live-card">
                <div>${badgeHtml}</div>
                ${headlineHtml}
                <div class="f1-countdown-grid">
                    <div class="f1-cd-box"><span class="num">${String(days).padStart(2, '0')}</span><span class="lbl">Giorni</span></div>
                    <div class="f1-cd-box"><span class="num">${String(hours).padStart(2, '0')}</span><span class="lbl">Ore</span></div>
                    <div class="f1-cd-box"><span class="num">${String(mins).padStart(2, '0')}</span><span class="lbl">Minuti</span></div>
                    <div class="f1-cd-box"><span class="num">${String(secs).padStart(2, '0')}</span><span class="lbl">Secondi</span></div>
                </div>
                <div style="overflow-x:auto;">
                    <table class="f1-sessions-table">
                        <thead><tr><th>Sessione</th><th>Orario Italiano</th><th>Diretta</th></tr></thead>
                        <tbody>${rowsHtml}</tbody>
                    </table>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:14px; margin-top:26px;">
                    <a class="tmp-btn hover-icon-reverse radius-round" href="https://www.formula1.com/en/timing/f1-live" target="_blank" rel="noopener">
                        <span class="icon-reverse-wrapper">
                            <span class="btn-text">Segui Live Timing F1</span>
                            <span class="btn-icon"><i class="fa-sharp fa-regular fa-arrow-right"></i></span>
                            <span class="btn-icon"><i class="fa-sharp fa-regular fa-arrow-right"></i></span>
                        </span>
                    </a>
                    <a class="tmp-btn hover-icon-reverse radius-round" style="background:#1e1e24; border:1px solid rgba(255,255,255,0.15);" href="https://sport.sky.it/formula-1" target="_blank" rel="noopener">
                        <span class="icon-reverse-wrapper">
                            <span class="btn-text">Diretta Sky Sport F1</span>
                            <span class="btn-icon"><i class="fa-sharp fa-regular fa-arrow-right"></i></span>
                            <span class="btn-icon"><i class="fa-sharp fa-regular fa-arrow-right"></i></span>
                        </span>
                    </a>
                    ${!showFullCalendar ? `<a class="tmp-btn hover-icon-reverse radius-round" style="background:#1e1e24; border:1px solid rgba(255,255,255,0.15);" href="live.html"><span class="icon-reverse-wrapper"><span class="btn-text">Calendario Completo</span><span class="btn-icon"><i class="fa-sharp fa-regular fa-arrow-right"></i></span><span class="btn-icon"><i class="fa-sharp fa-regular fa-arrow-right"></i></span></span></a>` : ''}
                </div>
            </div>
            ${fullCalHtml}
        `;
    }

    // Team Radio Audio Player
    let currentAudio = null;
    let currentBtn = null;

    window.playTeamRadio = function (btn, file, ttsFallbackText) {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        if (currentBtn) {
            currentBtn.classList.remove("playing");
        }

        btn.classList.add("playing");
        currentBtn = btn;

        const audio = new Audio("assets/audio/" + file);
        currentAudio = audio;

        audio.onended = function () {
            if (ttsFallbackText && window.speechSynthesis) {
                const u = new SpeechSynthesisUtterance(ttsFallbackText);
                u.lang = "en-GB";
                u.rate = 0.95;
                u.pitch = 0.9;
                u.onend = () => btn.classList.remove("playing");
                window.speechSynthesis.speak(u);
            } else {
                btn.classList.remove("playing");
            }
        };
        audio.onerror = function () {
            btn.classList.remove("playing");
        };
        audio.play().catch(() => btn.classList.remove("playing"));
    };

    document.addEventListener("DOMContentLoaded", function () {
        renderLiveWidget();
        setInterval(renderLiveWidget, 1000);
    });
})();
