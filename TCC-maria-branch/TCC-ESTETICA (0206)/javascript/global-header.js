/* =========================================================
   GLOBAL-HEADER.JS - Atualiza a foto no topo de todas as páginas
========================================================= */

document.addEventListener('DOMContentLoaded', async () => {
    const supabase = window.supabase;
    if (!supabase) return;

    // 1. Verifica se há um usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return; // Se não estiver logado, mantém o ícone padrão

    // 2. Busca a foto_url na tabela 'perfis'
    const { data: profile } = await supabase
        .from('perfis')
        .select('foto_url')
        .eq('id', user.id)
        .single();

    // 3. Se houver foto salva, atualiza a imagem do header em qualquer página
    if (profile && profile.foto_url) {
        const fotoHeader = document.getElementById('fotoHeader');
        if (fotoHeader) {
            fotoHeader.src = profile.foto_url;
        }
    }
});