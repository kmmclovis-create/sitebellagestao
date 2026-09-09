import { signup, signin, agendarServico, signInWithGoogle } from "./auth.js";

// Configuração do Supabase
const supabaseUrl = 'https://sfeyadawliakzyjtllpb.supabase.co';
const supabaseAnonKey = 'sb_publishable_kXJ1yBHM8aECG_13u2u3vA_2N7F0Weo';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// Mapeamento dos formulários das páginas
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const agendamentoForm = document.getElementById('agendamentoForm');

// ----------------------------------------------------
// 1. CADASTRO DE CLIENTE (cadastro.html)
// ----------------------------------------------------
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Buscando pelo ID 'username' conforme solicitado
        const name = document.getElementById('username').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        const result = await signup(name, phone, email, password);
        if (result.success) {
            // Redireciona para a nova tela bonita de sucesso
            window.location.href = 'sucesso.html';
        } else {
            alert("Erro no cadastro: " + result.error);
        }
    });
}

// ----------------------------------------------------
// 2. LOGIN DE CLIENTE (login.html)
// ----------------------------------------------------
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                // Personaliza a mensagem se as credenciais estiverem incorretas
                if (error.message.includes("Invalid login credentials")) {
                    throw new Error("E-mail ou senha incorretos. Verifique seus dados e tente novamente.");
                } else {
                    throw new Error(error.message);
                }
            }

            // Redireciona após o login com sucesso
            window.location.href = 'index.html'; 
        } catch (error) {
            alert(error.message); // Exibirá o alerta amigável
        }
    });
}

// NOVO: Adicione este bloco para o login com Google
const btnGoogle = document.getElementById('btnGoogle');
if (btnGoogle) {
    btnGoogle.addEventListener('click', async () => {
        await signInWithGoogle();
    });
}

// ----------------------------------------------------
// 3. FLUXO DE AGENDAMENTO (agendamentos.html)
// ----------------------------------------------------

// Verifica a sessão do usuário e preenche o formulário automaticamente
async function verificarSessaoEPreencher() {
    if (!agendamentoForm) return;

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        alert("Você precisa estar logado para realizar um agendamento!");
        window.location.href = 'login.html';
        return;
    }

    // CORREÇÃO: Alterado de 'profiles' para 'perfis' para bater com o auth.js
    const { data: profile } = await supabase
        .from('perfis') 
        .select('*')
        .eq('id', user.id)
        .single();

    if (profile) {
        if (document.getElementById('nome')) document.getElementById('nome').value = profile.nome || '';
        if (document.getElementById('email')) document.getElementById('email').value = user.email || '';
        if (document.getElementById('phone')) document.getElementById('phone').value = profile.telefone || '';
    }
}


// Submissão do formulário de Agendamento
if (agendamentoForm) {
    // Inicializa a sessão e os botões assim que carrega
    verificarSessaoEPreencher();
    inicializarBotoesAgendamento();

    agendamentoForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o envio via URL (GET)

        const nomeCliente = document.getElementById('nome').value;
        const procedimento = document.getElementById('servico').value;
        const dataAgendamento = document.getElementById('data_selecionada').value;
        const horario = document.getElementById('horario_selecionado').value;

        const result = await agendarServico(nomeCliente, procedimento, horario, dataAgendamento);

        if (result.success) {
            alert(`✨ Agendamento realizado com sucesso!\n\nSeu horário para ${procedimento} foi gravado.`);
            window.location.href = 'index.html';
        } else {
            alert("Erro ao realizar agendamento: " + result.error);
        }
    });
}