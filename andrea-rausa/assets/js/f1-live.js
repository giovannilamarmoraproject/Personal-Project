// Calendario Reale Formula 1 (Orari Italiani Europe/Rome) + Team Radio Soundboard (IT/EN)
(function () {
    const F1_CALENDAR = [
        {
            name_it: "GP di Las Vegas 2026",
            name_en: "2026 Las Vegas Grand Prix",
            circuit: "Las Vegas Strip Circuit, USA",
            start: "2026-11-19T00:00:00+01:00",
            end: "2026-11-22T09:00:00+01:00",
            sessions: [
                { it: "Prove Libere 1 (FP1)", en: "Free Practice 1 (FP1)", dt: "2026-11-20T01:30:00+01:00", disp_it: "Ven 20 Nov · 01:30", disp_en: "Fri 20 Nov · 01:30" },
                { it: "Prove Libere 2 (FP2)", en: "Free Practice 2 (FP2)", dt: "2026-11-20T05:00:00+01:00", disp_it: "Ven 20 Nov · 05:00", disp_en: "Fri 20 Nov · 05:00" },
                { it: "Prove Libere 3 (FP3)", en: "Free Practice 3 (FP3)", dt: "2026-11-21T01:30:00+01:00", disp_it: "Sab 21 Nov · 01:30", disp_en: "Sat 21 Nov · 01:30" },
                { it: "Qualifiche", en: "Qualifying", dt: "2026-11-21T05:00:00+01:00", disp_it: "Sab 21 Nov · 05:00", disp_en: "Sat 21 Nov · 05:00" },
                { it: "Gara (50 giri)", en: "Race (50 laps)", dt: "2026-11-22T05:00:00+01:00", disp_it: "Dom 22 Nov · 05:00", disp_en: "Sun 22 Nov · 05:00" }
            ]
        },
        {
            name_it: "GP del Qatar 2026",
            name_en: "2026 Qatar Grand Prix",
            circuit: "Lusail International Circuit, Qatar",
            start: "2026-11-27T00:00:00+01:00",
            end: "2026-11-29T22:00:00+01:00",
            sessions: [
                { it: "Prove Libere 1 (FP1)", en: "Free Practice 1 (FP1)", dt: "2026-11-27T14:30:00+01:00", disp_it: "Ven 27 Nov · 14:30", disp_en: "Fri 27 Nov · 14:30" },
                { it: "Prove Libere 2 (FP2)", en: "Free Practice 2 (FP2)", dt: "2026-11-27T18:00:00+01:00", disp_it: "Ven 27 Nov · 18:00", disp_en: "Fri 27 Nov · 18:00" },
                { it: "Prove Libere 3 (FP3)", en: "Free Practice 3 (FP3)", dt: "2026-11-28T15:30:00+01:00", disp_it: "Sab 28 Nov · 15:30", disp_en: "Sat 28 Nov · 15:30" },
                { it: "Qualifiche", en: "Qualifying", dt: "2026-11-28T19:00:00+01:00", disp_it: "Sab 28 Nov · 19:00", disp_en: "Sat 28 Nov · 19:00" },
                { it: "Gara", en: "Race", dt: "2026-11-29T17:00:00+01:00", disp_it: "Dom 29 Nov · 17:00", disp_en: "Sun 29 Nov · 17:00" }
            ]
        },
        {
            name_it: "GP di Abu Dhabi 2026",
            name_en: "2026 Abu Dhabi Grand Prix",
            circuit: "Yas Marina Circuit, UAE",
            start: "2026-12-04T00:00:00+01:00",
            end: "2026-12-06T20:00:00+01:00",
            sessions: [
                { it: "Prove Libere 1 (FP1)", en: "Free Practice 1 (FP1)", dt: "2026-12-04T10:30:00+01:00", disp_it: "Ven 4 Dic · 10:30", disp_en: "Fri 4 Dec · 10:30" },
                { it: "Prove Libere 2 (FP2)", en: "Free Practice 2 (FP2)", dt: "2026-12-04T14:00:00+01:00", disp_it: "Ven 4 Dic · 14:00", disp_en: "Fri 4 Dec · 14:00" },
                { it: "Prove Libere 3 (FP3)", en: "Free Practice 3 (FP3)", dt: "2026-12-05T11:30:00+01:00", disp_it: "Sab 5 Dic · 11:30", disp_en: "Sat 5 Dec · 11:30" },
                { it: "Qualifiche", en: "Qualifying", dt: "2026-12-05T15:00:00+01:00", disp_it: "Sab 5 Dic · 15:00", disp_en: "Sat 5 Dec · 15:00" },
                { it: "Gara (Gran Finale)", en: "Race (Season Finale)", dt: "2026-12-06T14:00:00+01:00", disp_it: "Dom 6 Dic · 14:00", disp_en: "Sun 6 Dec · 14:00" }
            ]
        },
        {
            name_it: "GP d'Australia 2027",
            name_en: "2027 Australian Grand Prix",
            circuit: "Albert Park, Melbourne",
            start: "2027-03-05T00:00:00+01:00",
            end: "2027-03-07T12:00:00+01:00",
            sessions: [
                { it: "Prove Libere 1 (FP1)", en: "Free Practice 1 (FP1)", dt: "2027-03-05T02:30:00+01:00", disp_it: "Ven 5 Mar · 02:30", disp_en: "Fri 5 Mar · 02:30" },
                { it: "Prove Libere 2 (FP2)", en: "Free Practice 2 (FP2)", dt: "2027-03-05T06:00:00+01:00", disp_it: "Ven 5 Mar · 06:00", disp_en: "Fri 5 Mar · 06:00" },
                { it: "Prove Libere 3 (FP3)", en: "Free Practice 3 (FP3)", dt: "2027-03-06T02:30:00+01:00", disp_it: "Sab 6 Mar · 02:30", disp_en: "Sat 6 Mar · 02:30" },
                { it: "Qualifiche", en: "Qualifying", dt: "2027-03-06T06:00:00+01:00", disp_it: "Sab 6 Mar · 06:00", disp_en: "Sat 6 Mar · 06:00" },
                { it: "Gara", en: "Race", dt: "2027-03-07T05:00:00+01:00", disp_it: "Dom 7 Mar · 05:00", disp_en: "Sun 7 Mar · 05:00" }
            ]
        }
    ];

    function formatDate(isoStr, lang) {
        const d = new Date(isoStr);
        return d.toLocaleDateString(lang === "en" ? "en-GB" : "it-IT", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
        });
    }

    function renderLiveWidget() {
        const container = document.getElementById("f1-live-widget");
        if (!container) return;

        const lang = typeof window.getSiteLang === "function" ? window.getSiteLang() : "it";
        const isEn = lang === "en";
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
        const gpName = isEn ? targetGP.name_en : targetGP.name_it;
        const nextSession = targetGP.sessions.find(s => new Date(s.dt) > now) || targetGP.sessions[targetGP.sessions.length - 1];
        const nextLabel = isEn ? nextSession.en : nextSession.it;
        const nextDisp = isEn ? nextSession.disp_en : nextSession.disp_it;

        const diffMs = Math.max(0, new Date(nextSession.dt) - now);
        const days = Math.floor(diffMs / 86400000);
        const hours = Math.floor((diffMs % 86400000) / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);

        const isLive = Boolean(activeGP);
        const raceSession = targetGP.sessions[targetGP.sessions.length - 1];

        const badgeHtml = isLive
            ? `<span class="f1-live-badge is-live"><span class="f1-pulse-dot"></span> ${isEn ? 'RACE WEEKEND LIVE' : 'WEEKEND DI GARA IN CORSO'} · ${gpName}</span>`
            : `<span class="f1-live-badge is-off"><i class="fa-solid fa-pause"></i> ${isEn ? 'NO GP TODAY · STRATEGY BREAK' : 'NESSUN GP OGGI · PAUSA STRATEGICA'}</span>`;

        const headlineHtml = isLive
            ? (isEn
                ? `<h2 class="title" style="margin-bottom:10px;">Andrea is on the Pit Wall for the ${gpName}!</h2>
                   <p class="description">Circuit: <strong>${targetGP.circuit}</strong>. Next chance to ruin the race: <strong>${nextLabel} (${nextDisp})</strong>.</p>`
                : `<h2 class="title" style="margin-bottom:10px;">Andrea è al Muretto per il ${gpName}!</h2>
                   <p class="description">Circuito: <strong>${targetGP.circuit}</strong>. Prossima occasione per rovinare la gara: <strong>${nextLabel} (${nextDisp})</strong>.</p>`)
            : (isEn
                ? `<h2 class="title" style="margin-bottom:10px;">Oh no! Today I couldn't make Ferrari lose...</h2>
                   <p class="description">I'll try again on <strong>${formatDate(raceSession.dt, 'en')}</strong> at the <strong>${gpName}</strong> (${targetGP.circuit})! Meanwhile I'm cooking up Plan G.</p>`
                : `<h2 class="title" style="margin-bottom:10px;">Oh no! Oggi non sono riuscito a far perdere la Ferrari...</h2>
                   <p class="description">Ci riproverò <strong>${formatDate(raceSession.dt, 'it')}</strong> al <strong>${gpName}</strong> (${targetGP.circuit})! Nel frattempo sto preparando il Piano G.</p>`);

        const tzNote = isEn ? "(CET / Italian Time)" : "(Ora Italiana)";
        const rowsHtml = targetGP.sessions.map(s => {
            const isNext = s === nextSession;
            const sLabel = isEn ? s.en : s.it;
            const sDisp = isEn ? s.disp_en : s.disp_it;
            return `<tr class="${isNext ? 'next-session' : ''}">
                <td>${sLabel} ${isNext ? `<span style="color:#FF014F; font-size:12px; margin-left:6px;">● ${isEn ? 'NEXT' : 'PROSSIMA'}</span>` : ''}</td>
                <td>${sDisp} ${tzNote}</td>
                <td>Sky Sport F1 / NOW / F1 Live</td>
            </tr>`;
        }).join("");

        const showFullCalendar = container.dataset.full === "true";
        let fullCalHtml = "";
        if (showFullCalendar) {
            fullCalHtml = `
                <div class="mt--40">
                    <h3 class="title mb--20">${isEn ? 'Upcoming Official F1 Schedule (CET / Italian Time)' : 'Prossimi Appuntamenti Ufficiali F1 (Orari Italiani)'}</h3>
                    <div class="row g-4">
                        ${F1_CALENDAR.map(gp => `
                            <div class="col-lg-6">
                                <div style="background:#141414; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:22px;">
                                    <h4 style="color:#fff; margin-bottom:4px;">${isEn ? gp.name_en : gp.name_it}</h4>
                                    <p style="color:#aaa; font-size:14px; margin-bottom:12px;">${gp.circuit}</p>
                                    <ul style="list-style:none; padding:0; margin:0; font-size:14px; color:#ddd; line-height:1.9;">
                                        ${gp.sessions.map(s => `<li><strong style="color:#FF014F;">${isEn ? s.en : s.it}:</strong> ${isEn ? s.disp_en : s.disp_it}</li>`).join("")}
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
                    <div class="f1-cd-box"><span class="num">${String(days).padStart(2, '0')}</span><span class="lbl">${isEn ? 'Days' : 'Giorni'}</span></div>
                    <div class="f1-cd-box"><span class="num">${String(hours).padStart(2, '0')}</span><span class="lbl">${isEn ? 'Hours' : 'Ore'}</span></div>
                    <div class="f1-cd-box"><span class="num">${String(mins).padStart(2, '0')}</span><span class="lbl">${isEn ? 'Minutes' : 'Minuti'}</span></div>
                    <div class="f1-cd-box"><span class="num">${String(secs).padStart(2, '0')}</span><span class="lbl">${isEn ? 'Seconds' : 'Secondi'}</span></div>
                </div>
                <div style="overflow-x:auto;">
                    <table class="f1-sessions-table">
                        <thead><tr><th>${isEn ? 'Session' : 'Sessione'}</th><th>${isEn ? 'Time (CET)' : 'Orario Italiano'}</th><th>${isEn ? 'Broadcast' : 'Diretta'}</th></tr></thead>
                        <tbody>${rowsHtml}</tbody>
                    </table>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:14px; margin-top:26px;">
                    <a class="tmp-btn hover-icon-reverse radius-round" href="https://www.formula1.com/en/timing/f1-live" target="_blank" rel="noopener">
                        <span class="icon-reverse-wrapper">
                            <span class="btn-text">${isEn ? 'Follow F1 Live Timing' : 'Segui Live Timing F1'}</span>
                            <span class="btn-icon"><i class="fa-sharp fa-regular fa-arrow-right"></i></span>
                            <span class="btn-icon"><i class="fa-sharp fa-regular fa-arrow-right"></i></span>
                        </span>
                    </a>
                    <a class="tmp-btn hover-icon-reverse radius-round" style="background:#1e1e24; border:1px solid rgba(255,255,255,0.15);" href="https://sport.sky.it/formula-1" target="_blank" rel="noopener">
                        <span class="icon-reverse-wrapper">
                            <span class="btn-text">${isEn ? 'Watch on Sky Sport F1' : 'Diretta Sky Sport F1'}</span>
                            <span class="btn-icon"><i class="fa-sharp fa-regular fa-arrow-right"></i></span>
                            <span class="btn-icon"><i class="fa-sharp fa-regular fa-arrow-right"></i></span>
                        </span>
                    </a>
                    ${!showFullCalendar ? `<a class="tmp-btn hover-icon-reverse radius-round" style="background:#1e1e24; border:1px solid rgba(255,255,255,0.15);" href="live.html"><span class="icon-reverse-wrapper"><span class="btn-text">${isEn ? 'Full Calendar' : 'Calendario Completo'}</span><span class="btn-icon"><i class="fa-sharp fa-regular fa-arrow-right"></i></span><span class="btn-icon"><i class="fa-sharp fa-regular fa-arrow-right"></i></span></span></a>` : ''}
                </div>
            </div>
            ${fullCalHtml}
        `;
    }

    window.renderF1LiveWidget = renderLiveWidget;

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
