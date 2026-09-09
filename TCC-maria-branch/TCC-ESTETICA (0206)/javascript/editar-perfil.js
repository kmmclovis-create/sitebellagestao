/* =========================================================
   EDITAR-PERFIL.JS (Versão simplificada - Apenas Nome e Foto)
========================================================= */

const form = document.getElementById('formEditarPerfil');
const btnEditarFoto = document.getElementById('btnEditarFoto');
const modalGaleria = document.getElementById('modalGaleria');
const btnFecharModal = document.getElementById('btnFecharModal');
const listaAvatares = document.getElementById('listaAvatares');
const fotoPreview = document.getElementById('fotoPreview');

// 1. Abre o modal e carrega as imagens do Supabase
// 1. Abre o modal e carrega as imagens do Supabase
// No evento de clique do botão de editar foto (btnEditarFoto):
if (btnEditarFoto) {
    btnEditarFoto.addEventListener('click', async () => {
        modalGaleria.style.display = 'flex'; 
        listaAvatares.innerHTML = '<p>Carregando imagens...</p>';

        const supabase = window.supabase;
        
        // 1. Pega o usuário logado
        const { data: { user } } = await supabase.auth.getUser();

        // Verifica se o login foi realmente via Google e se a URL é do Google (evita falsos positivos de storage)
        const rawFotoGoogle = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
        const isGoogleUser = user?.app_metadata?.provider === 'google' || (rawFotoGoogle && rawFotoGoogle.includes('googleusercontent.com'));
        const fotoGoogle = isGoogleUser ? rawFotoGoogle : null;

        // 2. Lista as imagens do Supabase Storage
        const { data, error } = await supabase.storage.from('fotos_perfil').list();

        if (error) {
            console.error("Erro ao listar imagens:", error.message);
            listaAvatares.innerHTML = '<p>Erro ao carregar imagens.</p>';
            return;
        }

        listaAvatares.innerHTML = ''; // Limpa o "carregando"

        // 3. Exibe a foto do Google APENAS se for um usuário autenticado pelo Google
        if (fotoGoogle) {
            const googleImgElement = document.createElement('img');
            googleImgElement.src = fotoGoogle;
            googleImgElement.className = 'avatar-opcao';
            googleImgElement.title = "Sua foto do Google";
            googleImgElement.style.cssText = 'width: 70px; height: 70px; object-fit: cover; cursor: pointer; border-radius: 50%; margin: 8px; border: 3px solid #db4437;';

            googleImgElement.addEventListener('click', () => {
                fotoPreview.src = fotoGoogle;
                modalGaleria.style.display = 'none';
            });
            listaAvatares.appendChild(googleImgElement);
        }

        // 4. Carrega as demais imagens do Bucket do Supabase normalmente
        if (data) {
            data.forEach(arquivo => {
                if (arquivo.name === '.emptyFolderPlaceholder') return;

                const { data: urlData } = supabase.storage
                    .from('fotos_perfil')
                    .getPublicUrl(arquivo.name);
                
                const imgElement = document.createElement('img');
                imgElement.src = urlData.publicUrl;
                imgElement.className = 'avatar-opcao';
                imgElement.style.cssText = 'width: 70px; height: 70px; object-fit: cover; cursor: pointer; border-radius: 50%; margin: 8px;';

                imgElement.addEventListener('click', () => {
                    fotoPreview.src = urlData.publicUrl;
                    modalGaleria.style.display = 'none';
                });

                listaAvatares.appendChild(imgElement);
            });
        }
    });
}

// 2. Botão para fechar o modal
if (btnFecharModal) {
    btnFecharModal.addEventListener('click', () => {
        modalGaleria.style.display = 'none';
    });
}

// Carregar dados (Com fallback inteligente para a foto do Google)
async function carregarDadosAtuais() {
    const supabase = window.supabase;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data: profile } = await supabase.from('perfis').select('*').eq('id', user.id).single();

    // Preenche o nome (Banco -> Google -> Vazio)
    document.getElementById('nome').value = profile?.nome || user.user_metadata?.full_name || '';

    // Busca a foto: Prioriza o banco, mas se não tiver, busca direto do Google Auth
    const fotoDoBanco = profile?.foto_url;
    const fotoDoGoogle = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    
    // Se o banco estiver vazio, usa a do Google para não perder
    const fotoFinal = fotoDoBanco && !fotoDoBanco.includes('userpadrao') ? fotoDoBanco : (fotoDoGoogle || fotoDoBanco);

    if (fotoFinal && fotoPreview) {
        fotoPreview.src = fotoFinal;
    }
}

// Salvar (Apenas Nome e Foto)
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const supabase = window.supabase;
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert("Você precisa estar logado!");
            window.location.href = 'login.html';
            return;
        }

        // Pega a URL diretamente da imagem que está aparecendo na tela
        const fotoUrl = fotoPreview.src;
        const novoNome = document.getElementById('nome').value;

        // Atualiza na tabela 'perfis'
        const { error } = await supabase
            .from('perfis')
            .update({ 
                nome: novoNome, 
                foto_url: fotoUrl 
            })
            .eq('id', user.id);

        if (error) {
            alert("Erro ao salvar: " + error.message);
        } else {
            alert("Perfil atualizado com sucesso!");
            window.location.href = "perfil.html";
        }
    });
}
document.addEventListener('DOMContentLoaded', carregarDadosAtuais);