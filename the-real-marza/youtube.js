document.addEventListener('DOMContentLoaded', () => {
    const videoGrid = document.getElementById('video-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    if (!videoGrid || !loadMoreBtn) return;

    // L'ID del canale (MarzaTV). 
    // In un ambiente di produzione si usa l'API di YouTube ufficiale.
    const CHANNEL_ID = 'UC7gco8hk-2GmbTpzRSQAQeQ'; 
    const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
    const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

    let allVideos = [];
    let currentlyLoaded = 0;
    const VIDEOS_PER_PAGE = 12;

    // Fallback: se l'API fallisce o non ha dati, usiamo i mock
    const fallbackVideos = [
        { id: "414-C1AXgPQ", title: "LA MIA PRIMA VOLTA IN KINGS LEAGUE" },
        { id: "dQw4w9WgXcQ", title: "REACTION AI MIGLIORI TIKTOK" },
        { id: "414-C1AXgPQ", title: "HO SPESO TROPPO PER QUESTO SETUP" },
        { id: "dQw4w9WgXcQ", title: "IL MEGLIO DELLA SETTIMANA SU TWITCH" }
    ];

    function createVideoCard(videoData, index) {
        const card = document.createElement('div');
        card.className = 'yt-card animate-on-scroll is-visible';
        
        const thumbnailUrl = `https://img.youtube.com/vi/${videoData.id}/hqdefault.jpg`;

        card.innerHTML = `
            <a href="https://www.youtube.com/watch?v=${videoData.id}" target="_blank" class="yt-thumb-container">
                <img src="${thumbnailUrl}" alt="${videoData.title}" class="yt-thumb">
                <div class="yt-play-btn"><i class="fa-solid fa-play"></i></div>
            </a>
            <div class="yt-info">
                <h3>${videoData.title}</h3>
                <p>TheRealMarza</p>
            </div>
        `;
        return card;
    }

    function renderVideos() {
        const start = currentlyLoaded;
        const end = start + VIDEOS_PER_PAGE;
        
        for(let i = start; i < end && i < allVideos.length; i++) {
            const data = allVideos[i];
            const card = createVideoCard(data, i);
            
            card.style.animationDelay = `${((i - start) % 4) * 0.1}s`;
            card.classList.add('fade-in-up');
            
            videoGrid.appendChild(card);
        }
        
        currentlyLoaded = end;
        
        if (currentlyLoaded >= allVideos.length) {
            loadMoreBtn.style.display = 'none';
        }
    }

    // Fetch dei dati reali da YouTube tramite RSS to JSON
    async function fetchYouTubeVideos() {
        try {
            loadMoreBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Caricamento...';
            loadMoreBtn.disabled = true;

            const response = await fetch(API_URL);
            const data = await response.json();

            if (data.status === 'ok' && data.items.length > 0) {
                // Mappa i risultati RSS in un formato utile
                let fetchedVideos = data.items.map(item => {
                    // Estrai l'ID del video dall'URL (es: https://www.youtube.com/watch?v=XXXXX)
                    const videoId = item.link.split('v=')[1];
                    return {
                        id: videoId,
                        title: item.title
                    };
                });
                
                // Per il mockup, moltiplichiamo i video se sono meno di 36 per mostrare l'effetto "Carica Altri"
                while(fetchedVideos.length < 36) {
                    fetchedVideos = fetchedVideos.concat(fetchedVideos.map(v => ({...v, title: v.title + " (Storico)"})));
                }
                allVideos = fetchedVideos;
            } else {
                throw new Error("Nessun dato dall'API");
            }
        } catch (error) {
            console.error("Errore fetch YouTube:", error);
            console.log("Uso i video di Fallback (Mock)");
            
            // Genera 36 finti video usando i mock a rotazione se l'API fallisce
            allVideos = Array.from({length: 36}, (_, i) => ({
                id: fallbackVideos[i % fallbackVideos.length].id,
                title: fallbackVideos[i % fallbackVideos.length].title + ` #${i+1}`
            }));
        } finally {
            loadMoreBtn.innerHTML = 'Carica Altri <i class="fa-solid fa-angle-down"></i>';
            loadMoreBtn.disabled = false;
            renderVideos();
        }
    }

    // Evento bottone Carica Altri
    loadMoreBtn.addEventListener('click', () => {
        renderVideos();
    });

    // Inizializza
    fetchYouTubeVideos();
});
