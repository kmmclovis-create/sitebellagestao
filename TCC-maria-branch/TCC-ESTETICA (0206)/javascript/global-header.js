/* =========================================================
   GLOBAL-HEADER.JS - Atualiza a foto no topo de todas as páginas
========================================================= */

/* =========================================================
   DOM
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        // ... (todo o código que já existe de pesquisa, selects e botões) ...

        /* =================================================
           ATUALIZAR CONTADOR DO CARRINHO AO CARREGAR
        ================================================== */
        atualizarContadorCarrinho();

        // Ouve eventos caso o carrinho seja atualizado noutras abas/ações
        window.addEventListener("carrinhoAtualizado", atualizarContadorCarrinho);

        /*
         * Executa a pesquisa uma vez ao
         * carregar a página.
         */
        pesquisar();

    }
);

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

async function atualizarContadorCarrinho() {
    const contador = document.getElementById("cartCount");
    if (!contador) return;

    const supabase = window.supabase;
    let quantidadeTotal = 0;

    if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: itens } = await supabase
                .from("carrinho_itens")
                .select("quantidade")
                .eq("perfil_id", user.id);

            if (itens) {
                itens.forEach(item => {
                    quantidadeTotal += Number(item.quantidade) || 0;
                });
                contador.textContent = quantidadeTotal;
                return;
            }
        }
    }

    // Fallback para visitante (sessionStorage)
    const carrinho = JSON.parse(sessionStorage.getItem("carrinho")) || [];
    carrinho.forEach(function(produto) {
        quantidadeTotal += Number(produto.quantidade) || 0;
    });

    contador.textContent = quantidadeTotal;
}
