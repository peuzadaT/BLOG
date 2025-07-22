// /admin.js (Versão 3.2 - Com ícones e CRUD completo)

const SUPABASE_URL = 'https://kfgnzzyyiwjnnqqocthe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmZ256enl5aXdqbm5xcW9jdGhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTY5NTYsImV4cCI6MjA2ODc5Mjk1Nn0.CbixmtD5nE5vSppUzuwGiDg9mco_e-agbnxjVHq6NAo';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const initTinyMCE = () => {
    tinymce.init({
        selector: '#full_content',
        plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const authView = document.getElementById('auth-view');
    const dashboardView = document.getElementById('admin-dashboard-view');
    const loginForm = document.getElementById('login-form');
    const articleForm = document.getElementById('article-form');
    const articleFormContainer = document.getElementById('article-form-container');
    const logoutBtn = document.getElementById('logout-btn');
    const newArticleBtn = document.getElementById('new-article-btn');
    const articlesListUl = document.querySelector('#articles-list ul');
    const formTitle = document.getElementById('form-main-title');
    const submitBtn = document.getElementById('submit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const imagePreview = document.getElementById('image-preview');
    const imageFileInput = document.getElementById('image_file');

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
            document.getElementById('article-id').value = article.id;
            document.getElementById('title').value = article.title;
            document.getElementById('category').value = article.category;
            document.getElementById('summary').value = article.summary;
            tinymce.get('full_content')?.setContent(article.full_content || '');
            if (article.image_url) {
                imagePreview.src = article.image_url;
                imagePreview.style.display = 'block';
            }
        }
        articleFormContainer.style.display = 'block';
        articleFormContainer.scrollIntoView({ behavior: 'smooth' });
    };

    const hideForm = () => {
        articleFormContainer.style.display = 'none';
        articleForm.reset();
    };

    const loadArticles = async () => {
        const { data, error } = await supabaseClient.from('articles').select('id, title').order('created_at', { ascending: false });
        if (error) return console.error('Erro ao carregar artigos:', error);
        articlesListUl.innerHTML = '';
        data.forEach(article => {
            articlesListUl.innerHTML += `
                <li>
                    <span>${article.title}</span>
                    <div class="article-actions">
                        <button class="btn-edit" data-id="${article.id}"><i class="fa-solid fa-pencil"></i> Editar</button>
                        <button class="btn-delete" data-id="${article.id}"><i class="fa-solid fa-trash"></i> Apagar</button>
                    </div>
                </li>`;
        });
    };

    const deleteArticle = async (id) => {
        const { error } = await supabaseClient.from('articles').delete().match({ id });
        if (error) alert('Erro ao apagar artigo.');
        else await loadArticles();
    };

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

    newArticleBtn.addEventListener('click', () => showForm('create'));
    cancelEditBtn.addEventListener('click', hideForm);
    imageFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            imagePreview.src = URL.createObjectURL(file);
            imagePreview.style.display = 'block';
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { error } = await supabaseClient.auth.signInWithPassword({ email: loginForm.email.value, password: loginForm.password.value });
        if (error) alert('Erro no login: ' + error.message);
        else checkUserAndRedirect();
    });

    logoutBtn.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        checkUserAndRedirect();
    });

    articlesListUl.addEventListener('click', async (e) => {
        const targetButton = e.target.closest('button');
        if (!targetButton) return;
        
        const articleId = targetButton.dataset.id;
        if (targetButton.classList.contains('btn-delete')) {
            if (confirm('Tem a certeza que quer apagar este artigo?')) {
                await deleteArticle(articleId);
            }
        }
        if (targetButton.classList.contains('btn-edit')) {
            const { data, error } = await supabaseClient.from('articles').select('*').eq('id', articleId).single();
            if (error) return alert('Erro ao buscar dados do artigo.');
            showForm('edit', data);
        }
    });

    articleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'A processar...';
        
        const articleId = document.getElementById('article-id').value;
        const imageFile = imageFileInput.files[0];
        let imageUrl = (imagePreview.src.startsWith('http') || imagePreview.src.startsWith('blob:')) ? imagePreview.src : null;

        if (imageFile) {
            const fileName = `${Date.now()}-${imageFile.name}`;
            const { error } = await supabaseClient.storage.from('article-images').upload(fileName, imageFile, { upsert: true });
            if (error) {
                alert('Erro no upload: ' + error.message);
                submitBtn.disabled = false;
                return;
            }
            imageUrl = supabaseClient.storage.from('article-images').getPublicUrl(fileName).data.publicUrl;
        }

        if (!imageUrl && !articleId) {
             alert('Selecione uma imagem para um novo artigo.');
             submitBtn.disabled = false;
             return;
        }

        const articleData = {
            title: document.getElementById('title').value,
            category: document.getElementById('category').value,
            summary: document.getElementById('summary').value,
            full_content: tinymce.get('full_content').getContent(),
            image_url: imageUrl
        };

        const { error } = articleId
            ? await supabaseClient.from('articles').update(articleData).match({ id: articleId })
            : await supabaseClient.from('articles').insert([articleData]);

        if (error) {
            alert('Erro ao guardar o artigo: ' + error.message);
        } else {
            alert(articleId ? 'Artigo atualizado!' : 'Artigo publicado!');
        }
        
        hideForm();
        submitBtn.disabled = false;
        await loadArticles();
    });

    checkUserAndRedirect();
});