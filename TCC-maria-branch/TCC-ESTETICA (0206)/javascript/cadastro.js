document.addEventListener("DOMContentLoaded", () => {

    const telefone = document.getElementById("phone");

    if (!telefone) return;

    telefone.addEventListener("input", function () {

        // Guarda apenas os números
        let valor = this.value.replace(/\D/g, "");

        // Limita a 11 números
        valor = valor.substring(0, 11);

        // Formata o telefone
        if (valor.length === 0) {
            this.value = "";
        }

        else if (valor.length <= 2) {
            this.value = "(" + valor;
        }

        else if (valor.length <= 7) {
            this.value =
                "(" +
                valor.substring(0, 2) +
                ") " +
                valor.substring(2);
        }

        else if (valor.length <= 10) {
            this.value =
                "(" +
                valor.substring(0, 2) +
                ") " +
                valor.substring(2, 6) +
                "-" +
                valor.substring(6);
        }

        else {
            this.value =
                "(" +
                valor.substring(0, 2) +
                ") " +
                valor.substring(2, 7) +
                "-" +
                valor.substring(7);
        }

    });

});