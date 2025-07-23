// Chaves da sua conexão Supabase
const SUPABASE_URL = 'https://kfgnzzyyiwjnnqqocthe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_AeqnognjK0lUB9yegzIHiw_U0vcNSt6';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função para iniciar o editor de texto
const initTinyMCE = () => {
    if (tinymce.get('full_content')) return;
    tinymce.init({
        selector: '#full_content',
        plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
    });
};

document.addEventListener('DOMContentLoaded', () => {
    
    // Mapeamento de todos os elementos HTML que o script vai usar
    const authView = document.getElementById('auth-view');
    const dashboardView = document.getElementById('admin-dashboard-view');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const newArticleBtn = document.getElementById('new-article-btn');
    const articlesListUl = document.querySelector('#articles-list ul');
    const articleFormContainer = document.getElementById('article-form-container');
    const articleForm = document.getElementById('article-form');
    const formTitle = document.getElementById('form-main-title');
    const submitBtn = document.getElementById('submit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const imageFileInput = document.getElementById('image_file');
    const imagePreview = document.getElementById('image-preview');

    // Funções auxiliares para mostrar e esconder o formulário de artigos
    const showForm = (mode = 'create', article = null) => {
        articleForm.reset();
        document.getElementById('article-id').value = '';
        imagePreview.style.display = 'none';
        
        if (mode === 'create') {
            formTitle.textContent = 'Criar Novo Artigo';
            submitBtn.textContent = 'Publicar Artigo';
            tinymce.get('full_content')?.setContent('');
        } else if (mode === 'edit' && article) {
            formTitle.textContent = 'A Editar Artigo';
            submitBtn.textContent = 'Atualizar Artigo';
            
            // Preenche os campos que você já tinha
            document.getElementById('article-id').value = article.id;
            document.getElementById('title').value = article.title;
            document.getElementById('category').value = article.category;
            document.getElementById('summary').value = article.summary;
            tinymce.get('full_content')?.setContent(article.full_content || '');
            
            if (article.image_url) {
                imagePreview.src = article.image_url;
                imagePreview.style.display = 'block';
            }

            // CORRIGIDO: Preenche os novos campos do Card Platina
            document.getElementById('is_official_store').checked = article.is_official_store;
            document.getElementById('price').value = article.price;
            document.getElementById('discount_price').value = article.discount_price;
            document.getElementById('coupon_code').value = article.coupon_code;
            document.getElementById('shipping_info').value = article.shipping_info;
        }
        articleFormContainer.style.display = 'block';
    };
    const hideForm = () => {
        articleFormContainer.style.display = 'none';
        articleForm.reset();
    };

    // Função para carregar a lista de artigos do Supabase
    const loadArticles = async () => {
        const { data, error } = await supabaseClient.from('articles').select('id, title').order('created_at', { ascending: false });
        if (error) return console.error('Erro ao carregar artigos:', error);
        articlesListUl.innerHTML = '';
        data.forEach(article => {
            articlesListUl.innerHTML += `<li><span>${article.title}</span><div class="article-actions"><button class="btn-edit" data-id="${article.id}">Editar</button><button class="btn-delete" data-id="${article.id}">Apagar</button></div></li>`;
        });
    };

    // Função que verifica se o utilizador está logado e direciona para a visão correta
    const checkUserAndRedirect = async () => {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
            authView.style.display = 'none';
            dashboardView.style.display = 'grid';
            initTinyMCE();
            await loadArticles();
        } else {
            authView.style.display = 'flex';
            dashboardView.style.display = 'none';
        }
    };
    
    // --- LÓGICA DE EVENTOS ---
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) alert('Erro no login: ' + error.message);
        else checkUserAndRedirect();
    });

    logoutBtn.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        checkUserAndRedirect();
    });

    newArticleBtn.addEventListener('click', () => showForm('create'));
    cancelEditBtn.addEventListener('click', hideForm);

    imageFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            imagePreview.src = URL.createObjectURL(file);
            imagePreview.style.display = 'block';
        }
    });

    articlesListUl.addEventListener('click', async (e) => {
        const target = e.target;
        const articleId = target.dataset.id;
        if (target.classList.contains('btn-edit')) {
            const { data, error } = await supabaseClient.from('articles').select('*').eq('id', articleId).single();
            if (error) return alert('Erro ao buscar dados do artigo.');
            showForm('edit', data);
        }
        if (target.classList.contains('btn-delete')) {
            if (confirm('Tem a certeza que quer apagar este artigo?')) {
                const { error } = await supabaseClient.from('articles').delete().match({ id: articleId });
                if (error) alert('Erro ao apagar artigo.');
                else await loadArticles();
            }
        }
    });

    articleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        const articleId = document.getElementById('article-id').value;
        const imageFile = imageFileInput.files[0];
        let imageUrl = document.getElementById('image-preview').src;
        
        if (imageFile) {
            const fileName = `${Date.now()}-${imageFile.name}`;
            const { data: uploadData, error: uploadError } = await supabaseClient.storage.from('article-images').upload(fileName, imageFile, { upsert: true });
            if (uploadError) {
                submitBtn.disabled = false;
                return alert('Erro no upload da imagem: ' + uploadError.message);
            }
            const { publicUrl } = supabaseClient.storage.from('article-images').getPublicUrl(uploadData.path).data;
            imageUrl = publicUrl;
        }

        // CORRIGIDO: Objeto de dados com todos os campos do "Card Platina"
        const articleData = {
            title: document.getElementById('title').value,
            category: document.getElementById('category').value,
            summary: document.getElementById('summary').value,
            full_content: tinymce.get('full_content').getContent(),
            image_url: imageUrl.startsWith('http') ? imageUrl : null,
            is_official_store: document.getElementById('is_official_store').checked,
            price: document.getElementById('price').value || null,
            discount_price: document.getElementById('discount_price').value || null,
            coupon_code: document.getElementById('coupon_code').value,
            shipping_info: document.getElementById('shipping_info').value
        };

        const { error } = articleId
            ? await supabaseClient.from('articles').update(articleData).match({ id: articleId })
            : await supabaseClient.from('articles').insert([articleData]);

        if (error) {
            alert('Erro ao salvar o artigo: ' + error.message);
        }
        
        hideForm();
        await loadArticles();
        submitBtn.disabled = false;
    });

    // --- EXECUÇÃO INICIAL ---
    checkUserAndRedirect();
});