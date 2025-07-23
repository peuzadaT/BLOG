// Chaves da sua conexão Supabase
const SUPABASE_URL = 'https://kfgnzzyyiwjnnqqocthe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_AeqnognjK0lUB9yegzIHiw_U0vcNSt6';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função para formatar números como moeda brasileira (R$)
const formatPrice = (price) => {
    if (price === null || price === undefined) return '';
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

document.addEventListener('DOMContentLoaded', async () => {
    
    const categoryTitle = document.getElementById('category-title');
    const categorySubtitle = document.getElementById('category-subtitle');
    const productGrid = document.getElementById('product-grid');

    const params = new URLSearchParams(window.location.search);
    const categoryName = params.get('cat');

    if (!categoryName) {
        categoryTitle.textContent = 'Categoria não encontrada';
        categorySubtitle.textContent = 'Por favor, volte à página inicial e selecione uma categoria.';
        return;
    }

    categoryTitle.textContent = `Achados de ${categoryName}`;
    categorySubtitle.textContent = `Os melhores produtos e ofertas que encontrámos na categoria ${categoryName}.`;
    document.title = `${categoryName} - Achado Digital`;

    const { data: articles, error } = await supabaseClient
        .from('articles')
        .select('*')
        .eq('category', categoryName)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar produtos:', error);
        productGrid.innerHTML = '<p>Não foi possível carregar os produtos.</p>';
        return;
    }

    if (articles.length === 0) {
        productGrid.innerHTML = '<p>Ainda não há achados publicados nesta categoria. Volte em breve!</p>';
        return;
    }

    productGrid.innerHTML = '';
    articles.forEach(article => {
        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'card-wrap';

        // --- LÓGICA DO CONTEÚDO DO CARTÃO ---

        // 1. Preço e Desconto
        let priceHTML = '';
        if (article.price) {
            if (article.discount_price && article.discount_price < article.price) {
                const discountPercentage = Math.round(((article.price - article.discount_price) / article.price) * 100);
                priceHTML = `
                    <div class="price-section">
                        <span class="old-price">De ${formatPrice(article.price)}</span>
                        <div class="current-price-line">
                            <span class="current-price">Por ${formatPrice(article.discount_price)}</span>
                            <span class="discount-badge">${discountPercentage}% OFF</span>
                        </div>
                    </div>`;
            } else {
                priceHTML = `<div class="price-section"><div class="current-price-line"><span class="current-price">${formatPrice(article.price)}</span></div></div>`;
            }
        }
        
        // 2. Cupom
        let couponHTML = '';
        if (article.coupon_code) {
            couponHTML = `
                <div class="coupon-container">
                    <div><i class="fas fa-ticket-alt"></i> Cupom: <strong>${article.coupon_code}</strong></div>
                    <button class="copy-coupon-btn" data-coupon="${article.coupon_code}">Copiar</button>
                </div>`;
        }
        
        // 3. Selo Loja Oficial
        const officialStoreTag = article.is_official_store ? '<div class="official-store-tag"><i class="fas fa-check-circle"></i> Loja Oficial</div>' : '';

        // 4. Link para Análise Completa
        const detailsLinkHTML = article.full_content 
            ? `<a href="blogs.html#${article.id}" class="details-link">Ler Análise Completa &rarr;</a>` 
            : `<div class="no-details-link"></div>`; // Espaço vazio para manter o alinhamento
            
        // 5. Botões de Compra (Onde Comprar)
        let buyButtonsHTML = '';
        if (article.product_link_amazon || article.product_link_mercado_livre || article.product_link_shopee) {
            buyButtonsHTML = '<div class="buy-buttons-container">';
            if (article.product_link_amazon) buyButtonsHTML += `<a href="${article.product_link_amazon}" target="_blank" class="buy-button amazon">Comprar na Amazon</a>`;
            if (article.product_link_mercado_livre) buyButtonsHTML += `<a href="${article.product_link_mercado_livre}" target="_blank" class="buy-button mercado-livre">Mercado Livre</a>`;
            if (article.product_link_shopee) buyButtonsHTML += `<a href="${article.product_link_shopee}" target="_blank" class="buy-button shopee">Shopee</a>`;
            buyButtonsHTML += '</div>';
        }

        // --- MONTAGEM FINAL DO HTML DO CARTÃO ---
        cardWrapper.innerHTML = `
            <div class="product-card">
                <div class="card-bg" style="background-image: url(${article.image_url})">
                    ${officialStoreTag}
                </div>
                <div class="card-info">
                    <h3 class="product-title">${article.title}</h3>
                    <p class="product-summary">${article.summary}</p>
                    ${priceHTML}
                    ${couponHTML}
                    <div class="shipping-info">
                        <i class="fas fa-shipping-fast"></i>
                        <span>${article.shipping_info || 'Consulte o frete no site'}</span>
                    </div>
                    ${buyButtonsHTML}
                    ${detailsLinkHTML}
                </div>
            </div>
        `;
        
        productGrid.appendChild(cardWrapper);
    });

    // Adiciona a funcionalidade de "Copiar Cupom"
    document.querySelectorAll('.copy-coupon-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const coupon = e.target.dataset.coupon;
            navigator.clipboard.writeText(coupon).then(() => {
                e.target.textContent = 'Copiado!';
                setTimeout(() => { e.target.textContent = 'Copiar'; }, 2000);
            });
        });
    });

    // Lógica de animação 3D para cada cartão
    document.querySelectorAll('.card-wrap').forEach(card => {
        // ... (código de animação 3D que já lhe enviei antes)
    });
});