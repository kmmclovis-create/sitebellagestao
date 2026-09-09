// ==================================================
// MÁSCARA DE SENHA (mostrar/ocultar)
// Adiciona um botão de "olho" em todos os campos
// type="password" da página, sem alterar mais nada.
// ==================================================

(function () {

    function injetarEstilo() {
        if (document.getElementById("mascara-senha-style")) return;

        const style = document.createElement("style");
        style.id = "mascara-senha-style";
        style.textContent = `
            .mascara-senha-wrapper {
            position: relative;
            width: 100%;
            }

            .mascara-senha-wrapper input {
            width: 100%;
            box-sizing: border-box;
            padding-right: 4.4rem !important;
            }

            .mascara-senha-btn {
                position: absolute;
                top: 50%;
                right: 1.2rem;
                transform: translateY(-50%);

                display: flex;
                align-items: center;
                justify-content: center;

                background: none;
                border: none;
                padding: 0;
                margin: 0;
                cursor: pointer;

                color: var(--gray, #888);
            }

            .mascara-senha-btn:hover {
                color: var(--dark, #333);
            }

            .mascara-senha-btn svg {
                width: 2rem;
                height: 2rem;
            }
        `;
        document.head.appendChild(style);
    }

    function iconeOlho() {
        return `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    }

    function iconeOlhoFechado() {
        return `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.86 19.86 0 0 1 5.06-6.06"></path>
                <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.86 19.86 0 0 1-3.22 4.44"></path>
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        `;
    }

    function aplicarMascara(input) {
        if (input.dataset.mascaraAplicada === "true") return;
        input.dataset.mascaraAplicada = "true";

        const wrapper = document.createElement("div");
        wrapper.className = "mascara-senha-wrapper";

        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "mascara-senha-btn";
        botao.setAttribute("aria-label", "Mostrar senha");
        botao.innerHTML = iconeOlho();

        botao.addEventListener("click", function () {
            const oculto = input.type === "password";
            input.type = oculto ? "text" : "password";
            botao.innerHTML = oculto ? iconeOlhoFechado() : iconeOlho();
            botao.setAttribute("aria-label", oculto ? "Ocultar senha" : "Mostrar senha");
        });

        wrapper.appendChild(botao);
    }

    function iniciar() {
        injetarEstilo();
        document
            .querySelectorAll('input[type="password"]')
            .forEach(aplicarMascara);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }

})();