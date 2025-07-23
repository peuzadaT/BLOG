// Suas chaves Supabase
const SUPABASE_URL = 'https://kfgnzzyyiwjnnqqocthe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_AeqnognjK0lUB9yegzIHiw_U0vcNSt6';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    // Seletores dos elementos na página
    const articleGridContainer = document.getElementById('article-grid-container');
    const articleViewContainer = document.getElementById('article-view-container');
    const pageTitle = document.querySelector('.page-title');
    const pageSubtitle = document.querySelector('.page-subtitle');

    if (!articleGridContainer) {
        console.error("Elemento 'article-grid-container' não encontrado. Verifique o seu HTML.");
        return;
    }

    // 1. Função para buscar TODOS os artigos no Supabase
    const fetchArticles = async () => {
        const { data, error } = await supabaseClient
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar artigos:', error);
            articleGridContainer.innerHTML = `<p style="color: red; text-align: center;">Não foi possível carregar os artigos. Verifique o console (F12) para mais detalhes.</p>`;
            return [];
        }
        return data;
    };

    // 2. Função para "desenhar" os cartões dos artigos na página
    const renderArticleGrid = (articles) => {
        articleGridContainer.innerHTML = ''; // Limpa a área antes de adicionar os novos artigos
        
        if (articles.length === 0) {
            articleGridContainer.innerHTML = `<p style="text-align: center;">Ainda nenhum artigo foi publicado. Crie um no seu painel de administração!</p>`;
            return;
        }

        articles.forEach(article => {
            const articleCard = document.createElement('a');
            articleCard.className = 'article-card';
            articleCard.href = `#${article.id}`; // Cria um link para a visualização do artigo
            
            // Conteúdo HTML de cada cartão de artigo
            articleCard.innerHTML = `
                <img src="${article.image_url}" alt="${article.title}" class="article-card-image">
                <div class="article-card-content">
                    <h3>${article.title}</h3>
                    <p>${article.summary}</p>
                    <div class="article-card-footer">
                        <span>${new Date(article.created_at).toLocaleDateString()}</span>
                    </div>
                </div>`;
            
            // Adiciona um evento de clique para mostrar o artigo completo
            articleCard.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.hash = article.id; // Atualiza o URL para incluir o ID do artigo
                showArticleView(article);
            });

            articleGridContainer.appendChild(articleCard);
        });
    };

    // 3. Função para mostrar a visualização de um artigo individual
    const showArticleView = (article) => {
        articleGridContainer.style.display = 'none';
        pageTitle.style.display = 'none';
        pageSubtitle.style.display = 'none';
        
        let ctaButtonsHTML = '';
        if (article.product_link_amazon || article.product_link_mercado_livre || article.product_link_shopee) {
            ctaButtonsHTML += `<div class="cta-container"><h4>Onde Comprar:</h4><div class="cta-buttons">`;
            if (article.product_link_amazon) ctaButtonsHTML += `<a href="${article.product_link_amazon}" target="_blank" class="cta-button amazon">Amazon</a>`;
            if (article.product_link_mercado_livre) ctaButtonsHTML += `<a href="${article.product_link_mercado_livre}" target="_blank" class="cta-button mercado-livre">Mercado Livre</a>`;
            if (article.product_link_shopee) ctaButtonsHTML += `<a href="${article.product_link_shopee}" target="_blank" class="cta-button shopee">Shopee</a>`;
            ctaButtonsHTML += `</div></div>`;
        }

        const authorInfo = `Publicado em ${new Date(article.created_at).toLocaleDateString()}`;
        articleViewContainer.innerHTML = `
            <article>
                <header class="article-header">
                    <span class="category-tag">${article.category}</span>
                    <h2 class="article-title">${article.title}</h2>
                    <p class="author-info">${authorInfo}</p>
                </header>
                <img src="${article.image_url}" alt="${article.title}" class="article-main-image">
                ${ctaButtonsHTML}
                <div class="article-content">${article.full_content}</div>
                <button id="back-to-grid-btn" class="section-button">&larr; Voltar para todos os posts</button>
            </article>`;
        
        articleViewContainer.style.display = 'block';
        document.getElementById('back-to-grid-btn').addEventListener('click', showGridView);
        window.scrollTo(0, 0);
    };

    // 4. Função para voltar à lista de artigos
    const showGridView = () => {
        articleGridContainer.style.display = 'flex';
        pageTitle.style.display = 'block';
        pageSubtitle.style.display = 'block';
        articleViewContainer.style.display = 'none';
        articleViewContainer.innerHTML = '';
        history.pushState("", document.title, window.location.pathname + window.location.search); // Limpa o #id da URL
    };

    // --- LÓGICA DE INICIALIZAÇÃO ---
    // Verifica se a URL já tem um ID de artigo (ex: o utilizador recarregou a página ou veio de um link direto)
    const checkUrlForArticle = async (articles) => {
        const articleId = window.location.hash.substring(1);
        if (articleId) {
            const articleToShow = articles.find(a => a.id === articleId);
            if (articleToShow) {
                showArticleView(articleToShow);
            } else {
                renderArticleGrid(articles); // Se o ID for inválido, mostra a lista normal
            }
        } else {
            renderArticleGrid(articles); // Se não houver ID, mostra a lista normal
        }
    };

    const articles = await fetchArticles();
    await checkUrlForArticle(articles);
});