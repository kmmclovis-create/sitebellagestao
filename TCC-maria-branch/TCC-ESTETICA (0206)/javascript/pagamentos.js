document.addEventListener("DOMContentLoaded", function() {
    const itensSelecionados = JSON.parse(
        sessionStorage.getItem("itensSelecionados") || "[]"
    );
    const lista = document.getElementById("orderItems");
    const placeholder = document.getElementById("orderPlaceholder");
    const subtotalEl = document.getElementById("paymentSubtotal");
    const totalEl = document.getElementById("paymentTotal");

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
});
