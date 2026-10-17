/* =========================================================
   PEDIDOS.JS - Dinâmico com Supabase e Simulação de Rastreio
========================================================= */

document.addEventListener('DOMContentLoaded', async () => {
    const supabase = window.supabase;
    if (!supabase) {
        console.error("Erro: Supabase não inicializado.");
        return;
    }

    // 1. Verificar autenticação do utilizador
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("Por favor, faça login para ver seus pedidos.");
        window.location.href = "login.html";
        return;
    }

    const containerAndamento = document.getElementById('abaAndamento');
    const containerEntregues = document.getElementById('abaEntregues');

    // Função auxiliar para formatar preço em Reais
    const formatarPreco = (valor) => {
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    };

    // Função auxiliar para formatar data legível (ex: 12 de outubro de 2026)
    const formatarData = (dataStr) => {
        const data = new Date(dataStr);
        return data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Função para calcular a etapa atual com base nos dias passados desde a compra
    function calcularStatusEntrega(criadoEm) {
        const dataCriacao = new Date(criadoEm);
        const agora = new Date();
        const diffDias = Math.floor((agora - dataCriacao) / (1000 * 60 * 60 * 24));

        if (diffDias >= 6) {
            return { etapa: 6, progresso: 100, statusTexto: "Entregue", statusClasse: "delivered", entregue: true };
        } else if (diffDias === 5) {
            return { etapa: 5, progresso: 83, statusTexto: "Em trânsito", statusClasse: "transit", entregue: false };
        } else if (diffDias >= 3) {
            return { etapa: 4, progresso: 67, statusTexto: "Em trânsito", statusClasse: "transit", entregue: false };
        } else if (diffDias === 2) {
            return { etapa: 3, progresso: 50, statusTexto: "Em trânsito", statusClasse: "transit", entregue: false };
        } else if (diffDias === 1) {
            return { etapa: 2, progresso: 33, statusTexto: "Em trânsito", statusClasse: "transit", entregue: false };
        } else {
            return { etapa: 1, progresso: 15, statusTexto: "Preparando", statusClasse: "transit", entregue: false };
        }
    }

    try {
        // 2. Buscar pedidos do utilizador com os itens e detalhes dos produtos
        const { data: pedidos, error } = await supabase
            .from('pedidos')
            .select(`
                id,
                valor_total,
                forma_pagamento,
                criado_em,
                itens_pedido (
                    quantidade,
                    preco_unitario,
                    produtos (
                        nome,
                        imagem_url
                    )
                )
            `)
            .eq('perfil_id', user.id)
            .order('criado_em', { ascending: false });

        if (error) throw error;

        // Limpar conteúdos estáticos/exemplos do HTML
        containerAndamento.innerHTML = '';
        containerEntregues.innerHTML = '';

        if (!pedidos || pedidos.length === 0) {
            containerAndamento.innerHTML = `
                <div class="empty-orders" style="display: flex;">
                    <div class="empty-icon"><i class="fa-solid fa-box-open"></i></div>
                    <h2>Nenhum pedido encontrado</h2>
                    <p>Você ainda não realizou nenhuma compra na nossa loja.</p>
                    <a href="loja.html" class="shop-button"><i class="fa-solid fa-store"></i> Ir para a loja</a>
                </div>
            `;
            return;
        }

        // 3. Renderizar cada pedido dinamicamente
        pedidos.forEach((pedido, index) => {
            const numeroPedido = `#${pedido.id.toString().slice(0, 6)}`.toUpperCase();
            const dataFormatada = formatarData(pedido.criado_em);
            const totalItens = pedido.itens_pedido.reduce((acc, item) => acc + item.quantidade, 0);
            
            const infoEntrega = calcularStatusEntrega(pedido.criado_em);

            // Gerar HTML dos produtos do pedido
            let produtosHTML = '';
            pedido.itens_pedido.forEach(item => {
                const p = item.produtos || {};
                produtosHTML += `
                    <div class="order-product">
                        <img src="${p.imagem_url || 'fotos/default.webp'}" alt="${p.nome || 'Produto'}">
                        <div class="order-product-info">
                            <h3>${p.nome || 'Produto'}</h3>
                            <span>Quantidade: ${item.quantidade}</span>
                        </div>
                        <strong>${formatarPreco(item.preco_unitario * item.quantidade)}</strong>
                    </div>
                `;
            });

            // Linha do tempo estruturada por passos
            const etapasTimeline = [
                { icone: "fa-receipt", titulo: "Pedido realizado", desc: `Recebemos o seu pedido.` },
                { icone: "fa-circle-check", titulo: "Pagamento aprovado", desc: `Pagamento confirmado com sucesso.` },
                { icone: "fa-box", titulo: "Preparando o pedido", desc: `Seus produtos estão sendo separados.` },
                { icone: "fa-dolly", titulo: "Pedido enviado", desc: `Entregue à transportadora.` },
                { icone: "fa-truck-fast", titulo: "Em trânsito", desc: `A caminho da sua cidade.` },
                { icone: "fa-location-dot", titulo: "Saiu para entrega", desc: `O entregador está a caminho.` },
                { icone: "fa-house-circle-check", titulo: "Entregue", desc: `Pedido entregue com sucesso!` }
            ];

            let timelineHTML = '';
            etapasTimeline.forEach((etapa, idx) => {
                const passoNum = idx + 1;
                let classeEstado = '';
                if (passoNum < infoEntrega.etapa) classeEstado = 'done';
                else if (passoNum === infoEntrega.etapa) classeEstado = infoEntrega.entregue ? 'done' : 'current';

                timelineHTML += `
                    <li class="step ${classeEstado}">
                        <div class="step-icon"><i class="fa-solid ${etapa.icone}"></i></div>
                        <div class="step-text">
                            <h4>${etapa.titulo}</h4>
                            <p>${etapa.desc}</p>
                        </div>
                    </li>
                `;
            });

            // Montar o card do pedido completo
            const cardHTML = `
                <article class="order-card ${index > 0 ? 'collapsed' : ''}">
                    <div class="order-head">
                        <div>
                            <span class="order-number">Pedido ${numeroPedido}</span>
                            <h2>${totalItens} ${totalItens === 1 ? 'produto' : 'produtos'}</h2>
                            <p class="order-date">Comprado em ${dataFormatada}</p>
                        </div>
                        <div class="order-head-right">
                            <span class="status ${infoEntrega.statusClasse}">${infoEntrega.statusTexto}</span>
                            <button class="toggle-button" type="button" aria-expanded="${index === 0}">
                                <i class="fa-solid ${index === 0 ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
                            </button>
                        </div>
                    </div>

                    <div class="order-body" ${index > 0 ? 'style="display: none;"' : ''}>
                        <div class="order-products">
                            ${produtosHTML}
                        </div>

                        <div class="tracking">
                            <div class="tracking-title">
                                <h3><i class="fa-solid fa-route"></i> Percurso do pedido</h3>
                                <span class="estimate">${infoEntrega.entregue ? 'Entregue com sucesso' : 'Previsão em breve'}</span>
                            </div>

                            <div class="progress-bar"><span style="width: ${infoEntrega.progresso}%"></span></div>

                            <ol class="timeline">
                                ${timelineHTML}
                            </ol>
                        </div>

                        <div class="order-footer">
                            <p class="order-total">Total <strong>${formatarPreco(pedido.valor_total)}</strong></p>
                        </div>
                    </div>
                </article>
            `;

            // Direcionar para a aba correta baseada no status simulado
            if (infoEntrega.entregue) {
                containerEntregues.innerHTML += cardHTML;
            } else {
                containerAndamento.innerHTML += cardHTML;
            }
        });

        // Caso alguma das abas fique vazia após a distribuição
        if (containerAndamento.innerHTML.trim() === '') {
            containerAndamento.innerHTML = `<p style="text-align:center; padding: 3rem; color: var(--gray);">Nenhum pedido a caminho no momento.</p>`;
        }
        if (containerEntregues.innerHTML.trim() === '') {
            containerEntregues.innerHTML = `<p style="text-align:center; padding: 3rem; color: var(--gray);">Nenhum pedido entregue ainda.</p>`;
        }

    } catch (err) {
        console.error("Erro ao carregar pedidos:", err);
        containerAndamento.innerHTML = `<p style="text-align:center; color: var(--dark-pink);">Erro ao carregar os seus pedidos. Tente novamente mais tarde.</p>`;
    }

    // ---------------------------------------------------
    // CONTROLO DE ABAS (A Caminho / Entregues)
    // ---------------------------------------------------
    const tabs = document.querySelectorAll('.orders-tabs .tab');
    const abas = {
        andamento: containerAndamento,
        entregues: containerEntregues
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
    // MINIMIZAR / MAXIMIZAR PEDIDO (Dinâmico)
    // ---------------------------------------------------
    document.addEventListener('click', function (e) {
        const head = e.target.closest('.order-head');
        if (!head) return;

        const card = head.closest('.order-card');
        const body = card.querySelector('.order-body');
        const botao = card.querySelector('.toggle-button');
        const icone = botao.querySelector('i');

        const fechado = card.classList.toggle('collapsed');
        body.style.display = fechado ? 'none' : 'block';
        botao.setAttribute('aria-expanded', String(!fechado));

        icone.classList.toggle('fa-chevron-up', !fechado);
        icone.classList.toggle('fa-chevron-down', fechado);
    });
});
