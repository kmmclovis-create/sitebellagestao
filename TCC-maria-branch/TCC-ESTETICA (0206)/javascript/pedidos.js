/* =========================================================
   PEDIDOS.JS

   - Alterna entre as abas "A caminho" e "Entregues".
   - Minimiza / maximiza as informações de cada pedido.
========================================================= */

document.addEventListener('DOMContentLoaded', function () {

    // ---------------------------------------------------
    // ABAS
    // ---------------------------------------------------

    const tabs = document.querySelectorAll('.orders-tabs .tab');

    const abas = {
        andamento: document.getElementById('abaAndamento'),
        entregues: document.getElementById('abaEntregues')
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            Object.keys(abas).forEach(chave => {
                abas[chave].hidden = chave !== tab.dataset.aba;
            });

        });
    });

    // ---------------------------------------------------
    // MINIMIZAR / MAXIMIZAR PEDIDO
    // Clicar em qualquer parte do cabeçalho do pedido
    // abre ou fecha as informações.
    // ---------------------------------------------------

    document.querySelectorAll('.order-card').forEach(card => {

        const cabecalho = card.querySelector('.order-head');
        const botao = card.querySelector('.toggle-button');
        const icone = botao.querySelector('i');

        cabecalho.addEventListener('click', () => {

            const fechado = card.classList.toggle('collapsed');

            botao.setAttribute('aria-expanded', String(!fechado));

            icone.classList.toggle('fa-chevron-up', !fechado);
            icone.classList.toggle('fa-chevron-down', fechado);

        });

    });

});
