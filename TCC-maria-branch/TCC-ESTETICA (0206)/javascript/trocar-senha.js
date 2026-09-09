/* =========================================================
   SEGURANCA.JS - Gerenciamento Completo de Senha e E-mail
========================================================= */

// Função auxiliar para exibir o pop-up personalizado
function mostrarModalAviso(mensagem, tipo = "erro") {
    const modal = document.getElementById('modalAviso');
    const msgEl = document.getElementById('mensagemAviso');
    const iconeEl = document.getElementById('iconeAviso');
    const tituloEl = document.getElementById('tituloAviso');

    if (!modal || !msgEl || !iconeEl || !tituloEl) return;

    msgEl.textContent = mensagem;

    if (tipo === "sucesso") {
        iconeEl.className = "fa-solid fa-circle-check";
        iconeEl.style.color = "#5cb85c"; // Verde
        tituloEl.textContent = "Sucesso!";
    } else {
        iconeEl.className = "fa-solid fa-circle-exclamation";
        iconeEl.style.color = "#d9534f"; // Vermelho
        tituloEl.textContent = "Atenção";
    }

    modal.style.display = 'flex';
}

// Fechar o pop-up ao clicar no botão "OK"
document.addEventListener('DOMContentLoaded', () => {
    const btnFechar = document.getElementById('btnFecharAviso');
    const modal = document.getElementById('modalAviso');

    if (btnFechar && modal) {
        btnFechar.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
});

// 1. Lógica para Alterar a Senha (Com validação da senha atual)
const formTrocarSenha = document.getElementById('formTrocarSenha');

if (formTrocarSenha) {
    formTrocarSenha.addEventListener('submit', async (e) => {
        e.preventDefault();
        const supabase = window.supabase;
        if (!supabase) return;

        const senhaAtual = document.getElementById('senhaAtual').value;
        const novaSenha = document.getElementById('novaSenha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;

        if (novaSenha !== confirmarSenha) {
            mostrarModalAviso("As novas senhas não coincidem! Digite novamente nos dois campos.");
            return;
        }

        // Pega os dados do usuário logado
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user || !user.email) {
            mostrarModalAviso("Sessão expirada. Faça login novamente.");
            window.location.href = "login.html";
            return;
        }

        // Valida estritamente a senha atual antes de prosseguir
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: senhaAtual
        });

        if (signInError || !signInData.session) {
            mostrarModalAviso("Senha atual incorreta! A alteração de senha foi cancelada.");
            return; // Trava a execução e não altera nada
        }

        // Se a senha atual estiver correta, atualiza para a nova senha
        const { error: updateError } = await supabase.auth.updateUser({
            password: novaSenha
        });

        if (updateError) {
            mostrarModalAviso("Erro ao atualizar a senha: " + updateError.message);
        } else {
            mostrarModalAviso("Senha alterada com sucesso!", "sucesso");
            formTrocarSenha.reset();
        }
    });
}
