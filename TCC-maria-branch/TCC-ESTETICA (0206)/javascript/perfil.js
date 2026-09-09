/* =========================================================
    PERFIL.JS - INTEGRADO AO TRIGGER DO SUPABASE
========================================================= */

const getSupabase = () => window.supabase; 

async function carregarPerfil() {
    const supabaseInstance = getSupabase();
    
    if (!supabaseInstance) {
        console.error("Supabase não inicializado!");
        return;
    }

    // 1. Verifica autenticação
    const { data: { user }, error: authError } = await supabaseInstance.auth.getUser();

    if (authError || !user) {
        console.log("Usuário não logado.");
        window.location.href = 'login.html';
        return;
    }

    // 2. Preenche o e-mail imediatamente
    const emailElement = document.getElementById('emailUsuario');
    if (emailElement) emailElement.innerText = user.email;

    // 3. Preenche "Membro desde" (independe da tabela perfis, lido direto da sessão)
    const dataElement = document.getElementById('dataMembro');
    if (dataElement && user.created_at) {
        const dataCriacao = new Date(user.created_at);
        const mes = dataCriacao.toLocaleDateString('pt-BR', { month: 'long' });
        const ano = dataCriacao.getFullYear();
        dataElement.innerHTML = `<i class="fa-regular fa-calendar"></i> Membro desde ${mes} de ${ano}`;
    }

    // 4. Busca dados na tabela 'perfis' (que o Trigger do banco preencheu automaticamente)
    const { data: profile, error: profileError } = await supabaseInstance
        .from('perfis')
        .select('nome, telefone, foto_url')
        .eq('id', user.id)
        .single();

    // 5. Define nome e foto (com fallback inteligente caso o trigger leve milissegundos para responder)
    const nomeFinal = profile?.nome || user.user_metadata?.full_name || user.email.split('@')[0];
    const fotoFinal = profile?.foto_url || user.user_metadata?.avatar_url;

    const usernameElement = document.getElementById('nomeUsuario');
    if (usernameElement) usernameElement.innerText = nomeFinal;

    if (fotoFinal) {
        const fotoElement = document.getElementById('fotoPerfil');
        if (fotoElement) fotoElement.src = fotoFinal;
    }

    if (profileError) {
        console.warn("Aviso ao buscar perfil:", profileError.message);
    }
}

// Configuração do Botão de Sair (Logout)
async function configurarLogout() {
    const btnLogout = document.querySelector('.logout-account') || document.getElementById('btnSair');
    if (btnLogout) {
        btnLogout.addEventListener('click', async (e) => {
            e.preventDefault();
            const supabase = getSupabase();
            if (!supabase) return;

            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Erro ao sair da conta:", error.message);
                alert("Erro ao tentar sair. Tente novamente.");
            } else {
                window.location.href = "login.html";
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarPerfil();
    configurarLogout();
});