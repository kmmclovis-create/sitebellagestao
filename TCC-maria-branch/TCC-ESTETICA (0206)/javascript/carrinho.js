/* =========================================================
   CARRINHO INTEGRADO COM SUPABASE E SESSIONSTORAGE
========================================================= */

async function obterCarrinhoDoBanco() {
    const supabase = window.supabase;
    if (!supabase) return JSON.parse(sessionStorage.getItem("carrinho")) || [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        // Se não estiver logado, lê do sessionStorage
        return JSON.parse(sessionStorage.getItem("carrinho")) || [];
    }

    // Se estiver logado, busca da tabela carrinho_itens juntamente com os dados do produto
    const { data, error } = await supabase
        .from("carrinho_itens")
        .select(`
            id,
            quantidade,
            selecionado,
            produto_id,
            produtos (
                nome,
                preco,
                descricao,
                categoria,
                imagem_url
            )
        `)
        .eq("perfil_id", user.id);

    if (error) {
        console.error("Erro ao carregar carrinho:", error.message);
        return [];
    }

    // Formata para o formato padrão usado no carrinho
    return data.map(item => ({
        idCarrinho: item.id,
        id: item.produto_id,
        nome: item.produtos.nome,
        preco: Number(item.produtos.preco),
        descricao: item.produtos.descricao,
        categoria: item.produtos.categoria,
        imagem: item.produtos.imagem_url,
        quantidade: item.quantidade,
        selecionado: item.selecionado
    }));
}

async function salvarAlteracaoItem(item, carrinhoCompleto) {
    const supabase = window.supabase;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Atualiza o sessionStorage se for visitante
        sessionStorage.setItem("carrinho", JSON.stringify(carrinhoCompleto));
        return;
    }

    if (item.idCarrinho) {
        await supabase
            .from("carrinho_itens")
            .update({
                quantidade: item.quantidade,
                selecionado: item.selecionado
            })
            .eq("id", item.idCarrinho);
    }
}

async function removerItemDoBanco(item, carrinhoCompleto) {
    const supabase = window.supabase;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Atualiza o sessionStorage se for visitante
        sessionStorage.setItem("carrinho", JSON.stringify(carrinhoCompleto));
        return;
    }

    if (item.idCarrinho) {
        await supabase
            .from("carrinho_itens")
            .delete()
            .eq("id", item.idCarrinho);
    }
}

/* =========================================================
   RENDERIZAR CARRINHO
========================================================= */
async function renderizarCarrinho() {
    const lista = document.getElementById("cartList");
    const vazio = document.getElementById("emptyCart");
    const totalProdutos = document.getElementById("total-products");
    const total = document.getElementById("total");
    const contador = document.getElementById("cartCount");
    const labelItens = document.getElementById("cartItemsLabel");
    const checkout = document.getElementById("checkoutButton");

    if (!lista) return;

    const carrinho = await obterCarrinhoDoBanco();
    lista.innerHTML = "";

    let valorTotalSelecionado = 0;
    let quantidadeTotal = 0;
    let quantidadeSelecionada = 0;

    carrinho.forEach(function(produto, indice) {
        const quantidade = Math.max(1, Number(produto.quantidade) || 1);
        const preco = Number(produto.preco) || 0;
        const subtotal = preco * quantidade;

        quantidadeTotal += quantidade;
        if (produto.selecionado !== false) {
            valorTotalSelecionado += subtotal;
            quantidadeSelecionada += quantidade;
        }

        const item = document.createElement("article");
        item.className = "item";

        item.innerHTML = `
            <input
                type="checkbox"
                class="item-selection"
                data-index="${indice}"
                ${produto.selecionado !== false ? "checked" : ""}
            >
            <img
                class="item-image"
                src="${produto.imagem || ''}"
                alt="${produto.nome}"
            >
            <div class="item-info">
                <span class="item-category">${produto.categoria || 'Produto'}</span>
                <h3>${produto.nome}</h3>
                <p>${produto.descricao || ''}</p>
            </div>
            <strong class="item-price">${formatarPreco(subtotal)}</strong>
            <div class="quantity-wrap">
                <button type="button" class="quantity-btn decrease" data-index="${indice}">
                    <i class="fa-solid fa-minus"></i>
                </button>
                <input type="number" class="quantity" value="${quantidade}" min="1" data-index="${indice}">
                <button type="button" class="quantity-btn increase" data-index="${indice}">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
            <button type="button" class="remove-item" data-index="${indice}" title="Remover produto">
                <i class="fa-regular fa-trash-can"></i>
            </button>
        `;

        lista.appendChild(item);
    });

    if (carrinho.length === 0) {
        vazio.style.display = "block";
        checkout.disabled = true;
    } else {
        vazio.style.display = "none";
        checkout.disabled = !carrinho.some(p => p.selecionado !== false);
    }

    totalProdutos.textContent = formatarPreco(valorTotalSelecionado);
    total.textContent = formatarPreco(valorTotalSelecionado);
    contador.textContent = quantidadeTotal;
    labelItens.textContent = `${quantidadeTotal} itens`;

    adicionarEventosItens(carrinho);
}

function formatarPreco(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* =========================================================
   EVENTOS DOS ITENS
========================================================= */
function adicionarEventosItens(carrinho) {
    // Checkbox de seleção
    document.querySelectorAll(".item-selection").forEach(function(input) {
        input.addEventListener("change", async function() {
            const index = Number(input.dataset.index);
            carrinho[index].selecionado = input.checked;
            await salvarAlteracaoItem(carrinho[index], carrinho);
            renderizarCarrinho();
        });
    });

    // Aumentar quantidade
    document.querySelectorAll(".increase").forEach(function(botao) {
        botao.addEventListener("click", async function() {
            const index = Number(botao.dataset.index);
            carrinho[index].quantidade++;
            await salvarAlteracaoItem(carrinho[index], carrinho);
            renderizarCarrinho();
        });
    });

    // Diminuir quantidade
    document.querySelectorAll(".decrease").forEach(function(botao) {
        botao.addEventListener("click", async function() {
            const index = Number(botao.dataset.index);
            if (carrinho[index].quantidade > 1) {
                carrinho[index].quantidade--;
                await salvarAlteracaoItem(carrinho[index], carrinho);
                renderizarCarrinho();
            }
        });
    });

    // Remover produto
    document.querySelectorAll(".remove-item").forEach(function(botao) {
        botao.addEventListener("click", async function() {
            const index = Number(botao.dataset.index);
            const removido = carrinho.splice(index, 1)[0];
            await removerItemDoBanco(removido, carrinho);
            renderizarCarrinho();
        });
    });
}

// Inicialização ao carregar a página
document.addEventListener("DOMContentLoaded", function() {
    renderizarCarrinho();

    const checkout = document.getElementById("checkoutButton");
    if (checkout) {
        checkout.addEventListener("click", async function() {
            const carrinho = await obterCarrinhoDoBanco();
            const itensSelecionados = carrinho.filter(p => p.selecionado !== false);

            if (itensSelecionados.length === 0) return;

            sessionStorage.setItem("itensSelecionados", JSON.stringify(itensSelecionados));
            window.location.href = "pagamentos.html";
        });
    }
});
