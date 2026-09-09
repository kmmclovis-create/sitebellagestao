/* =========================================================
   PESQUISA
========================================================= */

function pesquisar() {

    const input =
        document.getElementById("query");


    if (!input) {

        return;

    }


    const pesquisa =
        input.value
            .trim()
            .toLowerCase();


    /*
     * Todos os cards de produtos.
     */

    const produtos =
        document.querySelectorAll(
            ".produto"
        );


    /*
     * Mensagem exibida quando
     * nenhum produto for encontrado.
     */

    const mensagem =
        document.getElementById(
            "mensagem-sem-resultados"
        );


    let encontrou = false;


    /*
     * Percorre todos os produtos.
     */

    produtos.forEach(
        function(produto) {


            /*
             * Procura o título do produto.
             */

            const tituloProduto =
                produto.querySelector(
                    "h3"
                );


            if (!tituloProduto) {

                return;

            }


            /*
             * Nome do produto.
             */

            const nome =
                tituloProduto
                    .textContent
                    .trim()
                    .toLowerCase();


            /*
             * Todo o conteúdo do card.
             *
             * Isso permite pesquisar por:
             *
             * - nome
             * - categoria
             * - descrição
             * - preço
             */

            const textoCard =
                produto
                    .textContent
                    .toLowerCase();


            /*
             * Verifica se o produto
             * corresponde à pesquisa.
             */

            const corresponde =
                pesquisa === "" ||
                nome.includes(pesquisa) ||
                textoCard.includes(pesquisa);


            /*
             * MOSTRAR PRODUTO
             */

            if (corresponde) {

                produto.style.display =
                    "block";


                encontrou = true;

            }


            /*
             * ESCONDER PRODUTO
             */

            else {

                produto.style.display =
                    "none";

            }

        }
    );


    /*
     * Mostra a mensagem somente
     * quando nenhum produto foi encontrado.
     */

    if (mensagem) {

        mensagem.style.display =
            encontrou
                ? "none"
                : "block";

    }

}



/* =========================================================
   DOM
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {


        /* =================================================
           ELEMENTOS DA PESQUISA
        ================================================== */

        const input =
            document.getElementById(
                "query"
            );


        const clearBtn =
            document.getElementById(
                "clearBtn"
            );


        /* =================================================
           BOTÃO LIMPAR
        ================================================== */

        if (input && clearBtn) {


            function atualizarBotaoLimpar() {

                if (
                    input.value.trim()
                ) {

                    clearBtn.style.display =
                        "flex";

                }

                else {

                    clearBtn.style.display =
                        "none";

                }

            }


            /*
             * Pesquisa automaticamente
             * enquanto digita.
             */

            input.addEventListener(
                "input",
                function() {

                    atualizarBotaoLimpar();

                    pesquisar();

                }
            );


            /*
             * Limpa a pesquisa.
             */

            clearBtn.addEventListener(
                "click",
                function() {

                    input.value = "";

                    atualizarBotaoLimpar();

                    pesquisar();

                    input.focus();

                }
            );

        }


        /* =================================================
           BOTÕES DE CARRINHO
        ================================================== */

        const botoesCarrinho =
            document.querySelectorAll(
                ".btn-carrinho"
            );


        botoesCarrinho.forEach(
            function(botao) {


                botao.addEventListener(
                    "click",
                    function() {


                        /*
                         * Nome do produto.
                         */

                        const nome =
                            botao.dataset.name;


                        /*
                         * Preço do produto.
                         */

                        const preco =
                            botao.dataset.price;


                        /*
                         * Recupera o carrinho
                         * atual do sessionStorage.
                         */

                        let carrinho =
                            JSON.parse(
                                sessionStorage.getItem(
                                    "carrinho"
                                )
                            ) || [];


                        /*
                         * Verifica se o produto
                         * já está no carrinho.
                         */

                        const produtoExistente =
                            carrinho.find(
                                function(produto) {

                                    return produto.nome === nome;

                                }
                            );


                        /*
                         * Se já existe,
                         * aumenta a quantidade.
                         */

                        if (produtoExistente) {

                            produtoExistente.quantidade++;

                        }


                        /*
                         * Caso não exista,
                         * adiciona ao carrinho.
                         */

                        else {

                            carrinho.push({

                                nome:
                                    nome,

                                preco:
                                    Number(preco),

                                quantidade:
                                    1

                            });

                        }


                        /*
                         * Salva novamente.
                         */

                        sessionStorage.setItem(

                            "carrinho",

                            JSON.stringify(
                                carrinho
                            )

                        );


                        /*
                         * Atualiza o contador.
                         */

                        atualizarContadorCarrinho();


                        /*
                         * Feedback.
                         */

                        alert(
                            nome +
                            " foi adicionado ao carrinho!"
                        );

                    }
                );

            }
        );


        /* =================================================
           EXECUTA AO CARREGAR
        ================================================== */

        pesquisar();

        atualizarContadorCarrinho();

    }
);



/* =========================================================
   CONTADOR DO CARRINHO
========================================================= */

function atualizarContadorCarrinho() {

    const contador =
        document.getElementById(
            "cartCount"
        );


    if (!contador) {

        return;

    }


    /*
     * Recupera carrinho.
     */

    const carrinho =
        JSON.parse(
            sessionStorage.getItem(
                "carrinho"
            )
        ) || [];


    /*
     * Soma todas as quantidades.
     */

    let quantidade = 0;


    carrinho.forEach(
        function(produto) {

            quantidade +=
                Number(
                    produto.quantidade
                );

        }
    );


    /*
     * Atualiza o número.
     */

    contador.textContent =
        quantidade;

}