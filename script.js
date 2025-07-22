// /script.js (Versão Final Corrigida)

const SUPABASE_URL = 'https://kfgnzzyyiwjnnqqocthe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmZ256enl5aXdqbm5xcW9jdGhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTY5NTYsImV4cCI6MjA2ODc5Mjk1Nn0.CbixmtD5nE5vSppUzuwGiDg9mco_e-agbnxjVHq6NAo';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById("custom-carousel");
    if (!carousel) return; // Se não estiver na página inicial, não faz nada

    // --- Definição das Funções ---

    const fetchLatestArticles = async () => {
        const { data, error } = await supabaseClient
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error("Erro ao buscar artigos para o carrossel:", error);
            carousel.innerHTML = `<p style="color: red; text-align: center;">Não foi possível carregar os destaques.</p>`;
            return [];
        }
        return data;
    };

    const buildCarouselCards = (articles) => {
        carousel.innerHTML = '';
        if (articles.length === 0) return;
        
        articles.forEach((article, index) => {
            const card = document.createElement('div');
            card.className = 'carousel-card';
            card.dataset.index = index;
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <div class="carousel-card-content">
                            <img src="${article.image_url}" alt="${article.title}" class="carousel-card-image">
                            <h3>${article.title}</h3>
                            <p>${article.summary}</p>
                            <div class="carousel-card-footer"><span>${new Date(article.created_at).toLocaleDateString()}</span></div>
                        </div>
                    </div>
                    <div class="card-back">
                        <div class="carousel-card-content">
                             <h3>${article.title}</h3>
                             <p>Clique para ler o artigo completo no nosso blog e descobrir todos os detalhes!</p>
                             <a href="pages/blogs.html#${article.id}" class="read-full-btn">Ver no Blog</a>
                        </div>
                    </div>
                </div>`;
            carousel.appendChild(card);
        });
    };

    const initializeCarouselLogic = () => {
        const cards = carousel.querySelectorAll(".carousel-card");
        if (cards.length === 0) return;
        
        const prevBtn = document.getElementById("prev-btn");
        const nextBtn = document.getElementById("next-btn");
        let currentIndex = 0, theta = 0;
        const totalCards = cards.length, angle = 360 / totalCards;

        function getRadius() {
            if (window.innerWidth <= 576) return 220;
            if (window.innerWidth <= 768) return 280;
            return 400;
        }

        function arrangeCards() {
            const radius = getRadius();
            cards.forEach((card, index) => {
                const cardAngle = angle * index;
                const transformValue = `rotateY(${cardAngle}deg) translateZ(${radius}px)`;
                card.style.transform = transformValue;
                card.style.setProperty('--card-transform', transformValue);
            });
        }

        function updateActiveCard() {
            currentIndex = Math.round(-theta / angle) % totalCards;
            if (currentIndex < 0) currentIndex += totalCards;
            cards.forEach((card, index) => {
                card.classList.toggle("active", index === currentIndex);
                card.classList.remove("flipped");
            });
        }

        function rotateCarousel() {
            const radius = getRadius();
            carousel.style.transform = `translateZ(${-radius}px) rotateY(${theta}deg)`;
            updateActiveCard();
        }

        function nextCard() { theta -= angle; rotateCarousel(); }
        function prevCard() { theta += angle; rotateCarousel(); }

        function flipCard(e) {
            const card = e.currentTarget;
            if (parseInt(card.dataset.index) === currentIndex) {
                card.classList.toggle("flipped");
            }
        }

        prevBtn.addEventListener("click", prevCard);
        nextBtn.addEventListener("click", nextCard);
        cards.forEach(card => card.addEventListener("click", flipCard));
        document.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") prevCard();
            if (e.key === "ArrowRight") nextCard();
        });
        window.addEventListener("resize", () => { arrangeCards(); rotateCarousel(); });
        
        arrangeCards();
        rotateCarousel();
    };

    const loadHomepage = async () => {
        const articles = await fetchLatestArticles();
        buildCarouselCards(articles);
        initializeCarouselLogic();
    };

    // --- Inicialização ---
    loadHomepage();
});