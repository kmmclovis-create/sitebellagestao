/* =========================================================
   PROCEDIMENTOS.JS

   Funcionalidades:

   - Pesquisa de procedimentos
   - Pesquisa também pelos subprocedimentos
   - Botão de limpar pesquisa
   - Seleção de subprocedimentos
   - Atualização do preço
   - Agendamento
   - SessionStorage
   - Envio para agendamento.html
========================================================= */


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


    const categorias =
        document.querySelectorAll(
            ".categoria"
        );


    const mensagem =
        document.getElementById(
            "mensagem-sem-resultados"
        );


    let encontrou = false;


    categorias.forEach(
        function(categoria) {

            let categoriaTemResultado =
                false;


            const cards =
                categoria.querySelectorAll(
                    ".procedimento"
                );


            const titulo =
                categoria.querySelector(
                    ".titulo-categoria"
                );


            cards.forEach(
                function(procedimento) {

                    const tituloProcedimento =
                        procedimento.querySelector(
                            "h3"
                        );


                    if (!tituloProcedimento) {
                        return;
                    }


                    /*
                     * Nome principal do card.
                     */

                    const nome =
                        tituloProcedimento
                            .textContent
                            .toLowerCase();


                    /*
                     * Todo o conteúdo do card.
                     *
                     * Isso permite pesquisar também
                     * pelos subprocedimentos.
                     */

                    const textoCard =
                        procedimento
                            .textContent
                            .toLowerCase();


                    const corresponde =
                        pesquisa === "" ||
                        nome.includes(pesquisa) ||
                        textoCard.includes(pesquisa);


                    if (corresponde) {

                        procedimento.style.display =
                            "flex";


                        categoriaTemResultado =
                            true;


                        encontrou = true;

                    }

                    else {

                        procedimento.style.display =
                            "none";

                    }

                }
            );


            /*
             * Mostra ou esconde o título
             * da categoria.
             */

            if (titulo) {

                titulo.style.display =
                    categoriaTemResultado
                        ? "flex"
                        : "none";

            }

        }
    );


    /*
     * Mensagem caso nenhum procedimento
     * tenha sido encontrado.
     */

    if (mensagem) {

        mensagem.style.display =
            encontrou
                ? "none"
                : "block";

    }

}



/* =========================================================
   ATUALIZAR PREÇO DO CARD
========================================================= */

function atualizarPreco(card) {

    if (!card) {
        return;
    }


    const select =
        card.querySelector(
            ".variant-select"
        );


    if (!select) {
        return;
    }


    const opcao =
        select.options[
            select.selectedIndex
        ];


    if (!opcao) {
        return;
    }


    /*
     * Procura um elemento .price caso
     * exista no futuro.
     */

    const price =
        card.querySelector(
            ".price"
        );


    if (price) {

        price.textContent =
            opcao.dataset.price ||
            opcao.value;

    }

}



/* =========================================================
   DOM
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {


        /* =================================================
           PESQUISA
        ================================================== */

        const input =
            document.getElementById(
                "query"
            );


        const clearBtn =
            document.getElementById(
                "clearBtn"
            );


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


            input.addEventListener(
                "input",
                function() {

                    atualizarBotaoLimpar();

                    pesquisar();

                }
            );


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
           SELECTS
        ================================================== */

        const selects =
            document.querySelectorAll(
                ".variant-select"
            );


        selects.forEach(
            function(select) {

                /*
                 * Atualiza o preço caso exista
                 * um elemento .price.
                 */

                select.addEventListener(
                    "change",
                    function() {

                        const card =
                            select.closest(
                                ".procedimento"
                            );


                        atualizarPreco(card);

                    }
                );

            }
        );



        /* =================================================
           BOTÕES DE AGENDAMENTO
        ================================================== */

        const botoes =
            document.querySelectorAll(
                ".btn-agendar"
            );


        botoes.forEach(
            function(botao) {


                botao.addEventListener(
                    "click",
                    function() {


                        const card =
                            botao.closest(
                                ".procedimento"
                            );


                        if (!card) {
                            return;
                        }



                        /* =================================
                           PROCEDIMENTO PRINCIPAL
                        ================================= */

                        const titulo =
                            card.querySelector(
                                "h3"
                            );


                        const nome =
                            titulo
                                ? titulo.textContent.trim()
                                : "Procedimento";


                        /* =================================
                           CATEGORIA
                        ================================= */

                        const categoriaSection =
                            card.closest(
                                ".categoria"
                            );


                        const tituloCategoria =
                            categoriaSection
                                ? categoriaSection.querySelector(".titulo-categoria")
                                : null;


                        const categoria =
                            tituloCategoria
                                ? tituloCategoria.textContent.trim()
                                : "";



                        /* =================================
                           SELECT
                        ================================= */

                        const variantSelect =
                            card.querySelector(
                                ".variant-select"
                            );


                        let variante =
                            "Não informado";


                        let valor =
                            "Não informado";


                        let duracao =
                            "A confirmar";


                        let retoque =
                            "A confirmar";


                        let profissional =
                            "Não informado";



                        /* =================================
                           OPÇÃO SELECIONADA
                        ================================= */

                        if (variantSelect) {


                            const opcao =
                                variantSelect.options[
                                    variantSelect.selectedIndex
                                ];


                            if (opcao) {


                                /*
                                 * Nome completo do
                                 * subprocedimento.
                                 */

                                variante =
                                    opcao.textContent
                                        .trim();


                                /*
                                 * Preço.
                                 */

                                valor =
                                    opcao.dataset.price ||
                                    opcao.value ||
                                    "Não informado";


                                /*
                                 * Duração.
                                 */

                                duracao =
                                    opcao.dataset.duration ||
                                    "A confirmar";


                                /*
                                 * Retoque.
                                 */

                                retoque =
                                    opcao.dataset.retoque ||
                                    "A confirmar";


                                /*
                                 * Profissional.
                                 */

                                profissional =
                                    opcao.dataset.profissional ||
                                    "Não informado";

                            }

                        }



                        /* =================================
                           DADOS DO AGENDAMENTO
                        ================================= */

                        const data = {

                            procedimento:
                                nome,

                            categoria:
                                categoria,

                            variante:
                                variante,

                            valor:
                                valor,

                            duracao:
                                duracao,

                            retoque:
                                retoque,

                            profissional:
                                profissional

                        };



                        /* =================================
                           SALVAR NO SESSION STORAGE
                        ================================= */

                        sessionStorage.setItem(

                            "agendamentoDetalhes",

                            JSON.stringify(data)

                        );



                        /* =================================
                           URL
                        ================================= */

                        const parametros =
                            new URLSearchParams(
                                data
                            );



                        /* =================================
                           IR PARA AGENDAMENTO
                        ================================= */

                        window.location.href =
                            "agendamento.html?" +
                            parametros.toString();

                    }
                );

            }

        );


        /*
         * Executa a pesquisa uma vez ao
         * carregar a página.
         */

        pesquisar();

    }
);