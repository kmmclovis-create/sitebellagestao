/* =========================================================
   CONFIGURAÇÃO DOS PRODUTOS
========================================================= */

const produtosInfo = {

    "Shampoo Profissional": {

        categoria: "Cabelos",

        descricao:
            "Shampoo para limpeza e cuidado dos fios.",

        imagem:
            "fotos/shampoo.jpg"

    },


    "Máscara Capilar": {

        categoria: "Cabelos",

        descricao:
            "Tratamento para hidratação e nutrição dos cabelos.",

        imagem:
            "fotos/mascara.jpg"

    },


    "Óleo Capilar": {

        categoria: "Cabelos",

        descricao:
            "Óleo para proporcionar brilho, maciez e proteção.",

        imagem:
            "fotos/oleo.jpg"

    },


    "Creme Facial": {

        categoria: "Skincare",

        descricao:
            "Creme para hidratação e cuidado diário da pele.",

        imagem:
            "fotos/creme.jpg"

    },


    "Protetor Solar": {

        categoria: "Skincare",

        descricao:
            "Proteção diária para manter sua pele bem cuidada.",

        imagem:
            "fotos/protetor.jpg"

    },


    "Sérum Facial": {

        categoria: "Skincare",

        descricao:
            "Fórmula para complementar os cuidados com a pele.",

        imagem:
            "fotos/serum.jpg"

    }

};



/* =========================================================
   OBTER CARRINHO
========================================================= */

function obterCarrinho() {

    return JSON.parse(
        sessionStorage.getItem("carrinho")
    ) || [];

}



/* =========================================================
   SALVAR CARRINHO
========================================================= */

function salvarCarrinho(carrinho) {

    sessionStorage.setItem(
        "carrinho",
        JSON.stringify(carrinho)
    );

}



/* =========================================================
   FORMATAR PREÇO
========================================================= */

function formatarPreco(valor) {

    return valor.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}



/* =========================================================
   PROTEGER HTML
========================================================= */

function escaparHTML(texto) {

    return String(texto)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /\"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}



/* =========================================================
   RENDERIZAR CARRINHO
========================================================= */

function renderizarCarrinho() {

    const lista =
        document.getElementById("cartList");


    const vazio =
        document.getElementById("emptyCart");


    const totalProdutos =
        document.getElementById("total-products");


    const total =
        document.getElementById("total");


    const contador =
        document.getElementById("cartCount");


    const labelItens =
        document.getElementById("cartItemsLabel");


    const checkout =
        document.getElementById("checkoutButton");


    if (!lista) {

        return;

    }


    const carrinho =
        obterCarrinho();


    lista.innerHTML = "";


    let valorTotal = 0;

    let quantidadeTotal = 0;



    /* =====================================================
       PRODUTOS
    ====================================================== */

    carrinho.forEach(
        function(produto, indice) {


            const quantidade =
                Math.max(
                    1,
                    Number(produto.quantidade) || 1
                );


            const preco =
                Number(produto.preco) || 0;


            const subtotal =
                preco * quantidade;


            valorTotal += subtotal;

            quantidadeTotal += quantidade;



            /* =================================================
               INFORMAÇÕES DO PRODUTO
            ================================================== */

            const info = produtosInfo[produto.nome] || {
    categoria: "Produto",
    descricao: "Produto selecionado na loja.",
    imagem: produto.imagem || "fotos/mah_estetica.jpeg"
};
 
 /* =================================================
               imagens
            ================================================== */
const imagensProdutos = {

    "Kit Pantene Colageno 1 Sh 510ml + 1 Cond 510ml + Masc 550ml":
        "fotos/combopantene.webp",

    "Combo Siagé Nutri Acid.Complex":
        "fotos/Combosiage.webp",

    "Kit Glow Shine Completo":
        "fotos/comboglowshine.webp",

    "Kit Essencial Rn-0,3":
        "fotos/Kitprincipia.webp",

    "Serum Facial Nivea Luminous 630 Skin Glow 15Ml":
        "fotos/serumnivea.webp",

    "Kit Skin Care Ácido Hyalurônico + Vitamina C Soft Beauty":
        "fotos/acidosoftbeauty.webp"

};


            /* =================================================
               CRIAR ITEM
            ================================================== */

            const item =
                document.createElement("article");


            item.className =
                "item";


            item.innerHTML = `

             <img
    class="item-image"
    src="${imagensProdutos[produto.nome] || 'fotos/mah_estetica.jpeg'}"
    alt="${escaparHTML(produto.nome)}"
>
>


                <div class="item-info">

                    <span class="item-category">
                        ${escaparHTML(info.categoria)}
                    </span>

                    <h3>
                        ${escaparHTML(produto.nome)}
                    </h3>

                    <p>
                        ${escaparHTML(info.descricao)}
                    </p>

                </div>


                <strong class="item-price">

                    ${formatarPreco(subtotal)}

                </strong>


                <div class="quantity-wrap">


                    <button
                        type="button"
                        class="quantity-btn decrease"
                        data-index="${indice}"
                        aria-label="Diminuir quantidade"
                    >

                        <i class="fa-solid fa-minus"></i>

                    </button>


                    <input
                        type="number"
                        class="quantity"
                        value="${quantidade}"
                        min="1"
                        data-index="${indice}"
                        aria-label="Quantidade de ${escaparHTML(produto.nome)}"
                    >


                    <button
                        type="button"
                        class="quantity-btn increase"
                        data-index="${indice}"
                        aria-label="Aumentar quantidade"
                    >

                        <i class="fa-solid fa-plus"></i>

                    </button>


                </div>


                <button
                    type="button"
                    class="remove-item"
                    data-index="${indice}"
                    title="Remover produto"
                    aria-label="Remover ${escaparHTML(produto.nome)}"
                >

                    <i class="fa-regular fa-trash-can"></i>

                </button>

            `;


            lista.appendChild(item);

        }
    );



    /* =====================================================
       ESTADO DO CARRINHO
    ====================================================== */

    if (carrinho.length === 0) {

        vazio.style.display =
            "block";

        checkout.disabled =
            true;

    }

    else {

        vazio.style.display =
            "none";

        checkout.disabled =
            false;

    }



    /* =====================================================
       ATUALIZAR VALORES
    ====================================================== */

    totalProdutos.textContent =
        formatarPreco(valorTotal);


    total.textContent =
        formatarPreco(valorTotal);


    contador.textContent =
        quantidadeTotal;


    labelItens.textContent =
        quantidadeTotal === 1
            ? "1 item"
            : `${quantidadeTotal} itens`;



    adicionarEventosItens();

}



/* =========================================================
   EVENTOS DOS ITENS
========================================================= */

function adicionarEventosItens() {


    /* =====================================================
       AUMENTAR
    ====================================================== */

    document
        .querySelectorAll(".increase")
        .forEach(
            function(botao) {

                botao.addEventListener(
                    "click",
                    function() {

                        alterarQuantidade(
                            Number(
                                botao.dataset.index
                            ),
                            1
                        );

                    }
                );

            }
        );



    /* =====================================================
       DIMINUIR
    ====================================================== */

    document
        .querySelectorAll(".decrease")
        .forEach(
            function(botao) {

                botao.addEventListener(
                    "click",
                    function() {

                        alterarQuantidade(
                            Number(
                                botao.dataset.index
                            ),
                            -1
                        );

                    }
                );

            }
        );



    /* =====================================================
       INPUT DE QUANTIDADE
    ====================================================== */

    document
        .querySelectorAll(".quantity")
        .forEach(
            function(input) {

                input.addEventListener(
                    "change",
                    function() {

                        const indice =
                            Number(
                                input.dataset.index
                            );


                        const quantidade =
                            Math.max(
                                1,
                                Number(input.value) || 1
                            );


                        const carrinho =
                            obterCarrinho();


                        if (carrinho[indice]) {

                            carrinho[indice].quantidade =
                                quantidade;


                            salvarCarrinho(
                                carrinho
                            );


                            renderizarCarrinho();

                        }

                    }
                );

            }
        );



    /* =====================================================
       REMOVER PRODUTO
    ====================================================== */

    document
        .querySelectorAll(".remove-item")
        .forEach(
            function(botao) {

                botao.addEventListener(
                    "click",
                    function() {

                        const indice =
                            Number(
                                botao.dataset.index
                            );


                        const carrinho =
                            obterCarrinho();


                        carrinho.splice(
                            indice,
                            1
                        );


                        salvarCarrinho(
                            carrinho
                        );


                        renderizarCarrinho();

                    }
                );

            }
        );

}



/* =========================================================
   ALTERAR QUANTIDADE
========================================================= */

function alterarQuantidade(
    indice,
    alteracao
) {

    const carrinho =
        obterCarrinho();


    if (!carrinho[indice]) {

        return;

    }


    const novaQuantidade =
        Number(
            carrinho[indice].quantidade || 1
        ) + alteracao;


    carrinho[indice].quantidade =
        Math.max(
            1,
            novaQuantidade
        );


    salvarCarrinho(
        carrinho
    );


    renderizarCarrinho();

}



/* =========================================================
   FINALIZAR PEDIDO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {


        renderizarCarrinho();


        const checkout =
            document.getElementById(
                "checkoutButton"
            );


        if (checkout) {

            checkout.addEventListener(
                "click",
                function() {


                    const carrinho =
                        obterCarrinho();


                    if (
                        carrinho.length === 0
                    ) {

                        return;

                    }


                    alert(
                        "Pedido pronto para ser finalizado!\n\n" +
                        "A integração do pagamento pode ser adicionada posteriormente."
                    );

                }
            );

        }

    }
);