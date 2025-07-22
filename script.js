// A função só será executada se encontrar o carrossel na página
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById("custom-carousel");
    if (!carousel) return; // Se não estiver na página inicial, não faz nada

    const cards = carousel.querySelectorAll(".carousel-card");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    if (cards.length === 0 || !prevBtn || !nextBtn) return;

    let currentIndex = 0;
    let theta = 0;
    const totalCards = cards.length;
    const angle = 360 / totalCards;

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
            card.dataset.index = index;
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

    function nextCard() {
        theta -= angle;
        rotateCarousel();
    }

    function prevCard() {
        theta += angle;
        rotateCarousel();
    }

    function flipCard(e) {
        const card = e.currentTarget;
        const cardIndex = parseInt(card.dataset.index);
        if (cardIndex === currentIndex) {
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
    
    window.addEventListener("resize", () => {
        arrangeCards();
        rotateCarousel();
    });

    // Inicialização
    arrangeCards();
    rotateCarousel();
});