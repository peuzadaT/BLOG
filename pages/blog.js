// /pages/blog.js (Versão Final Corrigida)

const SUPABASE_URL = 'https://kfgnzzyyiwjnnqqocthe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmZ256enl5aXdqbm5xcW9jdGhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTY5NTYsImV4cCI6MjA2ODc5Mjk1Nn0.CbixmtD5nE5vSppUzuwGiDg9mco_e-agbnxjVHq6NAo';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const articleGridContainer = document.getElementById('article-grid-container');
    const articleViewContainer = document.getElementById('article-view-container');
    const pageTitle = document.querySelector('.page-title');
    const pageSubtitle = document.querySelector('.page-subtitle');
    if (!articleGridContainer) return;

    // --- Definição das Funções ---

    const fetchArticles = async () => {
        const { data, error } = await supabaseClient
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar artigos:', error);
            articleGridContainer.innerHTML = `<p style="color: red; text-align: center;">Não foi possível carregar os artigos.</p>`;
            return [];
        }
        return data;
    };

    const renderArticleGrid = (articles) => {
        articleGridContainer.innerHTML = '';
        if (articles.length === 0) {
            articleGridContainer.innerHTML = `<p style="text-align: center;">Ainda nenhum artigo foi publicado.</p>`;
            return;
        }

        articles.forEach(article => {
            const articleCard = document.createElement('a');
            articleCard.className = 'article-card';
            articleCard.href = `#${article.id}`;
            articleCard.innerHTML = `
                <img src="${article.image_url}" alt="${article.title}" class="article-card-image">
                <div class="article-card-content">
                    <h3>${article.title}</h3>
                    <p>${article.summary}</p>
                    <div class="article-card-footer"><span>${new Date(article.created_at).toLocaleDateString()}</span></div>
                </div>`;
            
            articleCard.addEventListener('click', (e) => {
                e.preventDefault();
                showArticleView(article);
            });
            articleGridContainer.appendChild(articleCard);
        });
    };

    const showArticleView = (article) => {
        articleGridContainer.style.display = 'none';
        pageTitle.style.display = 'none';
        pageSubtitle.style.display = 'none';
        
        const authorInfo = `Publicado em ${new Date(article.created_at).toLocaleDateString()}`;
        articleViewContainer.innerHTML = `
            <article>
                <header class="article-header">
                    <span class="category-tag">${article.category}</span>
                    <h2 class="article-title">${article.title}</h2>
                    <p class="author-info">${authorInfo}</p>
                </header>
                <img src="${article.image_url}" alt="${article.title}" class="article-main-image">
                <div class="article-content">${article.full_content}</div>
                <button id="back-to-grid-btn" class="section-button" style="margin-top: 40px;">&larr; Voltar para todos os posts</button>
            </article>`;
        
        articleViewContainer.style.display = 'block';
        document.getElementById('back-to-grid-btn').addEventListener('click', showGridView);
        window.scrollTo(0, 0);
    };

    const showGridView = () => {
        articleGridContainer.style.display = 'grid';
        pageTitle.style.display = 'block';
        pageSubtitle.style.display = 'block';
        articleViewContainer.style.display = 'none';
        articleViewContainer.innerHTML = '';
        history.pushState("", document.title, window.location.pathname + window.location.search);
    };

    // --- Inicialização ---
    const articles = await fetchArticles();
    renderArticleGrid(articles);
});