// =========================================================
    // MÁSCARAS E LIMITES DOS CAMPOS DO CARTÃO
    // =========================================================
    const inputValidade = document.getElementById("validade");
    const inputCvv = document.getElementById("cvv");
    const inputNumeroCartao = document.getElementById("numero-cartao");

    // Limitar CVV apenas a números
    if (inputCvv) {
        inputCvv.addEventListener("input", function() {
            this.value = this.value.replace(/\D/g, "").slice(0, 4);
        });
    }

    // Formatar validade automaticamente para MM/AA e limitar a 5 caracteres
    if (inputValidade) {
        inputValidade.addEventListener("input", function() {
            let valor = this.value.replace(/\D/g, ""); // Remove tudo que não for dígito
            if (valor.length > 4) valor = valor.slice(0, 4); // Limita a 4 números

            if (valor.length >= 3) {
                this.value = valor.slice(0, 2) + "/" + valor.slice(2);
            } else {
                this.value = valor;
            }
        });
    }

    // Limitar número do cartão apenas a números
    if (inputNumeroCartao) {
        inputNumeroCartao.addEventListener("input", function() {
            this.value = this.value.replace(/\D/g, "").slice(0, 16); // Máximo de 16 dígitos padrão de cartão
        });
    }

document.addEventListener("DOMContentLoaded", function() {
    const itensSelecionados = JSON.parse(
        sessionStorage.getItem("itensSelecionados") || "[]"
    );
    const lista = document.getElementById("orderItems");
    const placeholder = document.getElementById("orderPlaceholder");
    const subtotalEl = document.getElementById("paymentSubtotal");
    const totalEl = document.getElementById("paymentTotal");
    const form = document.querySelector(".payment-form");

    function formatarPreco(valor) {
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    let subtotal = 0;

    itensSelecionados.forEach(function(produto) {
        const quantidade = Math.max(1, Number(produto.quantidade) || 1);
        const preco = Math.max(0, Number(produto.preco) || 0);
        const valorItem = quantidade * preco;
        subtotal += valorItem;

        const item = document.createElement("div");
        item.className = "order-item";

        const nome = document.createElement("span");
        nome.textContent = produto.nome;

        const detalhes = document.createElement("small");
        detalhes.textContent = `${quantidade} × ${formatarPreco(preco)}`;

        const valor = document.createElement("strong");
        valor.textContent = formatarPreco(valorItem);

        const descricao = document.createElement("div");
        descricao.className = "order-item-description";
        descricao.append(nome, detalhes);
        item.append(descricao, valor);
        lista.appendChild(item);
    });

    placeholder.hidden = itensSelecionados.length > 0;
    subtotalEl.textContent = formatarPreco(subtotal);
    totalEl.textContent = formatarPreco(subtotal);

    // =========================================================
    // PROCESSAR O PAGAMENTO E SALVAR NO SUPABASE
    // =========================================================
    if (form) {
        form.addEventListener("submit", async function(e) {
            e.preventDefault();

            if (itensSelecionados.length === 0) {
                alert("Não há itens selecionados para finalizar o pedido.");
                return;
            }

            const supabase = window.supabase;
            if (!supabase) {
                alert("Erro: Supabase não inicializado.");
                return;
            }

            // Descobrir forma de pagamento selecionada
            const metodoSelecionado = document.querySelector('input[name="metodo"]:checked');
            const formaPagamento = metodoSelecionado ? metodoSelecionado.value : "cartao";

            try {
                // Verificar se o utilizador está logado
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    alert("Por favor, faça login para concluir o seu pedido.");
                    window.location.href = "login.html";
                    return;
                }

                // 1. Inserir na tabela 'pedidos'
                const { data: pedidoCriado, error: erroPedido } = await supabase
                    .from("pedidos")
                    .insert([{
                        perfil_id: user.id,
                        valor_total: subtotal,
                        forma_pagamento: formaPagamento,
                        status: "concluido"
                    }])
                    .select()
                    .single();

                if (erroPedido) throw erroPedido;

                const pedidoId = pedidoCriado.id;

                // 2. Inserir os itens na tabela 'itens_pedido'
                const itensParaInserir = itensSelecionados.map(produto => ({
                    pedido_id: pedidoId,
                    produto_id: produto.id || produto.produto_id,
                    quantidade: Number(produto.quantidade) || 1,
                    preco_unitario: Number(produto.preco) || 0
                }));

                const { error: erroItens } = await supabase
                    .from("itens_pedido")
                    .insert(itensParaInserir);

                if (erroItens) throw erroItens;

                // 3. Limpar os itens comprados do carrinho do utilizador (se estiverem na tabela 'carrinho_itens')
                const idsProdutosComprados = itensSelecionados.map(p => p.id || p.produto_id);
                await supabase
                    .from("carrinho_itens")
                    .delete()
                    .eq("perfil_id", user.id)
                    .in("produto_id", idsProdutosComprados);

                // 4. Limpar sessionStorage
                sessionStorage.removeItem("itensSelecionados");
                
                // Atualizar sessionStorage geral removendo os comprados
                let carrinhoSessao = JSON.parse(sessionStorage.getItem("carrinho")) || [];
                carrinhoSessao = carrinhoSessao.filter(p => !idsProdutosComprados.includes(p.id));
                sessionStorage.setItem("carrinho", JSON.stringify(carrinhoSessao));

                alert("Pedido realizado com sucesso! Obrigado pela preferência.");
                window.location.href = "index.html";

            } catch (erro) {
                console.error("Erro ao finalizar pedido:", erro);
                alert("Ocorreu um erro ao processar o seu pedido. Tente novamente.");
            }
        });
    }
});
