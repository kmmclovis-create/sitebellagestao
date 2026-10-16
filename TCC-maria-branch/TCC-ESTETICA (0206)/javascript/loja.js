/* =========================================================
   PESQUISA
========================================================= */
function pesquisar() {
    const input = document.getElementById("query");
    if (!input) return;

    const pesquisa = input.value.trim().toLowerCase();
    const produtos = document.querySelectorAll(".produto");
    const mensagem = document.getElementById("mensagem-sem-resultados");

    let encontrou = false;

    produtos.forEach(function(produto) {
        const tituloProduto = produto.querySelector("h3");
        if (!tituloProduto) return;

        const nome = tituloProduto.textContent.trim().toLowerCase();
        const textoCard = produto.textContent.toLowerCase();

        const corresponde =
            pesquisa === "" ||
            nome.includes(pesquisa) ||
            textoCard.includes(pesquisa);

        if (corresponde) {
            produto.style.display = "block";
            encontrou = true;
        } else {
            produto.style.display = "none";
        }
    });

    if (mensagem) {
        mensagem.style.display = encontrou ? "none" : "block";
    }
}

/* =========================================================
   CARREGAR PRODUTOS DO SUPABASE
========================================================= */
async function carregarProdutosDoBanco() {
    const container = document.getElementById("productsContainer");
    if (!container) return;

    const supabase = window.supabase;
    if (!supabase) {
        console.error("Supabase não inicializado.");
        return;
    }

    const { data: produtos, error } = await supabase
        .from("produtos")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error("Erro ao carregar produtos:", error.message);
        container.innerHTML = "<p style='text-align:center; color:#b94b65;'>Erro ao carregar produtos do banco.</p>";
        return;
    }

    if (!produtos || produtos.length === 0) {
        container.innerHTML = "<p style='text-align:center;'>Nenhum produto cadastrado.</p>";
        return;
    }

    let htmlProdutos = "";

    produtos.forEach(produto => {
        const precoFormatado = Number(produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        htmlProdutos += `
            <article class="produto">
                <div class="imagem-produto">
                    <img src="${produto.imagem_url || 'fotos/placeholder.webp'}" alt="${produto.nome}">
                    ${produto.destaque ? '<span class="produto-tag">Destaque</span>' : ''}
                </div>
                <div class="conteudo-produto">
                    <span class="categoria-produto">${produto.categoria || 'Geral'}</span>
                    <h3>${produto.nome}</h3>
                    <p>${produto.descricao || ''}</p>
                    <div class="produto-bottom">
                        <strong>${precoFormatado}</strong>
                        <button
                            type="button"
                            class="btn-carrinho"
                            data-name="${produto.nome}"
                            data-price="${produto.preco}"
                        >
                            <i class="fa-solid fa-cart-plus"></i>
                            Comprar
                        </button>
                    </div>
                </div>
            </article>
        `;
    });

    container.innerHTML = htmlProdutos;

    // Executa a pesquisa e contador após renderizar
    pesquisar();
    atualizarContadorCarrinho();
}

/* =========================================================
   DOM
========================================================= */
document.addEventListener("DOMContentLoaded", async function() {

    // Carrega os produtos do Supabase ao abrir a página
    await carregarProdutosDoBanco();

    /* =================================================
       ELEMENTOS DA PESQUISA
    ================================================== */
    const input = document.getElementById("query");
    const clearBtn = document.getElementById("clearBtn");

    if (input && clearBtn) {
        function atualizarBotaoLimpar() {
            if (input.value.trim()) {
                clearBtn.style.display = "flex";
            } else {
                clearBtn.style.display = "none";
            }
        }

        input.addEventListener("input", function() {
            atualizarBotaoLimpar();
            pesquisar();
        });

        clearBtn.addEventListener("click", function() {
            input.value = "";
            atualizarBotaoLimpar();
            pesquisar();
            input.focus();
        });
    }

    /* =================================================
   BOTÕES DE CARRINHO (Com suporte ao Supabase)
================================================== */
const container = document.getElementById("productsContainer");
if (container) {
    container.addEventListener("click", async function(e) {
        const botao = e.target.closest(".btn-carrinho");
        if (!botao) return;

        const produtoId = Number(botao.dataset.id); // Certifique-se de que o botão tem o id do produto no banco
        const nome = botao.dataset.name;
        const preco = botao.dataset.price;

        const supabase = window.supabase;
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Se o utilizador estiver logado, salva na base de dados
            // Verifica se o item já existe no carrinho dele
            const { data: itemExistente } = await supabase
                .from("carrinho_itens")
                .select("id, quantidade")
                .eq("perfil_id", user.id)
                .eq("produto_id", produtoId)
                .single();

            if (itemExistente) {
                // Se já existe, incrementa a quantidade
                await supabase
                    .from("carrinho_itens")
                    .update({ quantidade: itemExistente.quantidade + 1 })
                    .eq("id", itemExistente.id);
            } else {
                // Se não existe, insere um novo
                await supabase
                    .from("carrinho_itens")
                    .insert([{
                        perfil_id: user.id,
                        produto_id: produtoId,
                        quantidade: 1,
                        selecionado: true
                    }]);
            }
        } else {
            // Fallback para visitante (sessionStorage)
            let carrinho = JSON.parse(sessionStorage.getItem("carrinho")) || [];
            const produtoExistente = carrinho.find(p => p.nome === nome);

            if (produtoExistente) {
                produtoExistente.quantidade++;
            } else {
                carrinho.push({ id: produtoId, nome, preco: Number(preco), quantidade: 1, selecionado: true });
            }
            sessionStorage.setItem("carrinho", JSON.stringify(carrinho));
        }

        atualizarContadorCarrinho();
        alert(nome + " foi adicionado ao carrinho!");
    });
}

/* =========================================================
   CONTADOR DO CARRINHO
========================================================= */
function atualizarContadorCarrinho() {
    const contador = document.getElementById("cartCount");
    if (!contador) return;

    const carrinho = JSON.parse(sessionStorage.getItem("carrinho")) || [];
    let quantidade = 0;

    carrinho.forEach(function(produto) {
        quantidade += Number(produto.quantidade);
    });

    contador.textContent = quantidade;
}
