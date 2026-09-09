
// filtrar os procedimentos enquanto o usuário digita no campo de pesquisa
function pesquisar() {
    const pesquisa = document.getElementById("query").value.toLowerCase();
    const categorias = document.querySelectorAll(".categoria");
    const mensagem = document.getElementById("mensagem-sem-resultados");
    let encontrou = false;

    categorias.forEach(function(categoria) {
        let categoriaTemResultado = false;
        const cards = categoria.querySelectorAll(".procedimento");
        const titulo = categoria.querySelector(".titulo-categoria");

        cards.forEach(function(procedimento) {
            const nome = procedimento.querySelector("h3").textContent.toLowerCase();
            const textoCard = procedimento.textContent.toLowerCase();
            const corresponde = nome.includes(pesquisa) || textoCard.includes(pesquisa);

            if (corresponde) {
                procedimento.style.display = "flex";
                categoriaTemResultado = true;
                encontrou = true;
            } else {
                procedimento.style.display = "none";
            }
        });

        if (titulo) {
            if (pesquisa === "") {
                titulo.removeAttribute("style");
            } else if (categoriaTemResultado) {
                titulo.style.display = "inline-block";
                titulo.style.padding = "10px 20px";
                titulo.style.borderRadius = "0 80px 80px 0";
            } else {
                titulo.style.display = "none";
            }
        }
    });

    mensagem.style.display = encontrou || pesquisa === "" ? "none" : "block";
}

const detalhesProcedimentos = {
    "sobrancelhas": { duracao: "45 minutos", retoque: "Não", valor: "R$ 80,00", profissional: "Mailza N. Rufatto" },
    "depilação feminina": { duracao: "30 minutos", retoque: "Não", valor: "R$ 60,00", profissional: "Mailza N. Rufatto" },
    "estética facial": { duracao: "1 hora", retoque: "Não", valor: "R$ 140,00", profissional: "Mailza N. Rufatto" },
    "corte": { duracao: "40 minutos", retoque: "Não", valor: "R$ 90,00", profissional: "Beatriz Bastos" },
    "finalização": { duracao: "1 hora", retoque: "Não", valor: "R$ 120,00", profissional: "Beatriz Bastos" },
    "tratamentos": { duracao: "35 minutos", retoque: "Não", valor: "R$ 55,00", profissional: "Beatriz Bastos" },
    "coloração": { duracao: "50 minutos", retoque: "Não", valor: "R$ 85,00", profissional: "Beatriz Bastos" },
    "mechas": { duracao: "30 minutos", retoque: "Não", valor: "R$ 65,00", profissional: "Beatriz Bastos" },
    "alisamentos": { duracao: "45 minutos", retoque: "Não", valor: "R$ 95,00", profissional: "Beatriz Bastos" },
    "maquiagem social": { duracao: "40 minutos", retoque: "Não", valor: "R$ 75,00", profissional: "Beatriz Bastos" },
    "maquiagem infantil": { duracao: "55 minutos", retoque: "Não", valor: "R$ 100,00", profissional: "Beatriz Bastos" },
    "noivas": { duracao: "55 minutos", retoque: "Não", valor: "R$ 100,00", profissional: "Beatriz Bastos" },
};

document.querySelectorAll('.procedimento button').forEach(function(botao) {
    if (botao.textContent.trim() === 'Agende já') {
        botao.addEventListener('click', function() {
            const card = botao.closest('.procedimento');
            const nome = card.querySelector('h3').textContent.trim();
            const detalhes = detalhesProcedimentos[nome.toLowerCase()] || { duracao: '--', valor: '--', retoque: '--', profissional: '--' };
            const variantSelect = card.querySelector('.variant-select');
            let selecionada = '';
            let precoSelecionado = detalhes.valor;
            let duracaoSelecionada = detalhes.duracao;
            let retoqueSelecionado = detalhes.retoque;
            let profissionalSelecionado = detalhes.profissional;

            if (variantSelect) {
                const opcaoSelecionada = variantSelect.options[variantSelect.selectedIndex];
                selecionada = opcaoSelecionada.text;
                precoSelecionado = opcaoSelecionada.dataset.price || variantSelect.value || detalhes.valor;
                duracaoSelecionada = opcaoSelecionada.dataset.duration || detalhes.duracao;
                retoqueSelecionado = opcaoSelecionada.dataset.retoque || detalhes.retoque;
                profissionalSelecionado = opcaoSelecionada.dataset.profissional || detalhes.profissional;
            }

            const data = {
                procedimento: nome,
                duracao: duracaoSelecionada,
                valor: precoSelecionado,
                variante: selecionada,
                retoque: retoqueSelecionado,
                profissional: profissionalSelecionado
            };

            sessionStorage.setItem('agendamentoDetalhes', JSON.stringify(data));
            window.location.href = `agendamento.html?${new URLSearchParams(data).toString()}`;
        });
    }
});

document.querySelectorAll('.variant-select').forEach(function(select) {
    select.addEventListener('change', function() {
        const card = select.closest('.procedimento');
        const priceEl = card.querySelector('.price');
        const newPrice = select.options[select.selectedIndex].dataset.price || select.value;
        if (priceEl) priceEl.textContent = newPrice;
    });
});