/* =========================================================
   AGENDAMENTO.JS - Versão Final Unificada
========================================================= */

// 1. Preenche dados do usuário logado (Nome, E-mail e Telefone) ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
    const supabase = window.supabase;
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const inputEmail = document.getElementById('email');
        if (inputEmail && !inputEmail.value) {
            inputEmail.value = user.email;
        }

        const { data: perfil } = await supabase
            .from('perfis')
            .select('nome, telefone')
            .eq('id', user.id)
            .single();

        if (perfil) {
            if (perfil.nome) {
                const inputNome = document.getElementById('nome');
                if (inputNome && !inputNome.value) {
                    inputNome.value = perfil.nome;
                }
            }

            if (perfil.telefone) {
                const inputPhone = document.getElementById('phone');
                if (inputPhone && !inputPhone.value) {
                    inputPhone.value = perfil.telefone;
                }
            }
        }
    }
});

// 2. Seleção de dia (Calendário)
let dataExibida = new Date();

// Verificar se o dia já passou
function diaJaPassou(ano, mes, dia) {
    const hoje = new Date();
    const dataHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const dataCalendario = new Date(ano, mes, dia);
    return dataCalendario < dataHoje;
}

function renderizarCalendario() {
    const mesAtual = dataExibida.getMonth();
    const anoAtual = dataExibida.getFullYear();
    const hoje = new Date();
    const nomeMes = dataExibida.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    const primeiroDia = new Date(anoAtual, mesAtual, 1);
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
    const totalDias = ultimoDia.getDate();
    const inicioSemana = primeiroDia.getDay();

    const mesEl = document.getElementById('mesAtual');
    const diasEl = document.getElementById('diasCalendario');

    if (mesEl) {
        mesEl.textContent = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
    }

    if (!diasEl) return;

    diasEl.innerHTML = '';

    for (let i = 0; i < inicioSemana; i++) {
        const vazio = document.createElement('div');
        vazio.className = 'day empty';
        diasEl.appendChild(vazio);
    }

    for (let dia = 1; dia <= totalDias; dia++) {
        const botao = document.createElement('button');
        botao.className = 'day';
        botao.textContent = dia;
        botao.type = 'button';
        botao.dataset.ano = anoAtual;
        botao.dataset.mes = mesAtual;
        botao.dataset.dia = dia;

        const passado = diaJaPassou(anoAtual, mesAtual, dia);

        if (passado) {
            botao.classList.add('disabled');
            botao.disabled = true;
        }

        const ehHoje = dia === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear();

        if (ehHoje && !passado) {
            botao.classList.add('selected');
        }

        botao.addEventListener('click', () => {
            document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
            botao.classList.add('selected');
        });

        diasEl.appendChild(botao);
    }
}

function mudarMes(delta) {
    dataExibida = new Date(dataExibida.getFullYear(), dataExibida.getMonth() + delta, 1);
    renderizarCalendario();
}

document.getElementById('btnMesAnterior')?.addEventListener('click', () => mudarMes(-1));
document.getElementById('btnMesProximo')?.addEventListener('click', () => mudarMes(1));

renderizarCalendario();

// 3. Seleção de horário
const hours = document.querySelectorAll(".hour");
hours.forEach(hour => {
    hour.addEventListener("click", () => {
        hours.forEach(h => h.classList.remove("selected"));
        hour.classList.add("selected");
    });
});

// 4. Validação de campos
function validarCampos() {
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!nome) {
        alert('Por favor, informe seu nome.');
        return false;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!email || !emailValido) {
        alert('Por favor, informe um e-mail válido.');
        return false;
    }

    const telefoneValido = /^\(\d{2}\) \d{4,5}-\d{4}$/.test(phone);
    if (!phone || !telefoneValido) {
        alert('Por favor, informe um telefone no formato (11) 99999-9999.');
        return false;
    }

    return true;
}

// 5. Salva o agendamento no Supabase e atualiza o telefone do perfil se estiver vazio
async function salvarAgendamentoNoSupabase(agendamento) {
    const supabase = window.supabase;
    if (!supabase) {
        alert("Erro de conexão.");
        return false;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        await supabase
            .from('perfis')
            .update({ telefone: agendamento.phone })
            .eq('id', user.id)
            .is('telefone', null);
    }

    const { error } = await supabase.from('agendamentos').insert([
        {
            perfil_id: user ? user.id : null, 
            nome_cliente: agendamento.nome,   
            email: agendamento.email,
            procedimento: agendamento.procedimento,
            data: agendamento.data,
            horario: agendamento.horario
        }
    ]);

    if (error) {
        console.error("Erro ao salvar:", error.message);
        alert("Erro ao realizar o agendamento: " + error.message);
        return false;
    }

    return true;
}

// 6. Confirmação e Envio
const btnConfirmar = document.getElementById('btnConfirmar');
if (btnConfirmar) {
    btnConfirmar.addEventListener('click', async () => {
        if (!validarCampos()) {
            return;
        }

        const diaSelecionado = document.querySelector('.day.selected');
        const horaSelecionada = document.querySelector('.hour.selected');

        if (!diaSelecionado) {
            alert('Por favor, selecione uma data no calendário.');
            return;
        }

        if (!horaSelecionada) {
            alert('Por favor, selecione um horário.');
            return;
        }

        const procedimentoEl = document.getElementById('procedimento');
        const duracaoEl = document.getElementById('duracao');
        const valorEl = document.getElementById('valor');
        const retoqueEl = document.getElementById('retoque');
        const profissionalEl = document.getElementById('profissional');

        const ano = Number(diaSelecionado.dataset.ano);
        const mes = Number(diaSelecionado.dataset.mes);
        const dia = Number(diaSelecionado.dataset.dia);

        const dataISO = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const dataFormatada = `${String(dia).padStart(2, '0')}/${String(mes + 1).padStart(2, '0')}/${ano}`;

        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();

        const novoAgendamento = {
            procedimento: procedimentoEl ? procedimentoEl.textContent : 'Não selecionado',
            duracao: duracaoEl ? duracaoEl.textContent : 'A confirmar',
            valor: valorEl ? valorEl.textContent : 'Não informado',
            retoque: retoqueEl ? retoqueEl.textContent : 'A confirmar',
            profissional: profissionalEl ? profissionalEl.textContent : 'Não informado',
            data: dataISO,
            horario: horaSelecionada.textContent,
            nome,
            email,
            phone,
            status: 'confirmed'
        };

        const sucesso = await salvarAgendamentoNoSupabase(novoAgendamento);

        if (sucesso) {
            alert(
                `Agendamento confirmado!\n\n` +
                `Procedimento: ${novoAgendamento.procedimento}\n` +
                `Dia: ${dataFormatada}\n` +
                `Horário: ${novoAgendamento.horario}\n` +
                `Nome: ${nome}\n` +
                `Email: ${email}\n` +
                `Telefone: ${phone}`
            );

            window.location.href = 'perfil.html';
        }
    });
}

// 7. Leitura dos parâmetros da URL para preencher os detalhes
function atualizarDetalhesAgendamento() {
    const params = new URLSearchParams(window.location.search);
    let procedimento = params.get('procedimento');
    let duracao = params.get('duracao');
    let valor = params.get('valor');
    let variante = params.get('variante');
    let retoque = params.get('retoque');
    let profissional = params.get('profissional');

    if (procedimento) {
        const el = document.getElementById('procedimento');
        if (el) {
            el.textContent = variante && variante !== 'undefined' ? `${procedimento} (${variante})` : procedimento;
        }
    }
    if (duracao) {
        const el = document.getElementById('duracao');
        if (el) el.textContent = duracao;
    }
    if (valor) {
        const el = document.getElementById('valor');
        if (el) el.textContent = valor;
    }
    if (retoque) {
        const el = document.getElementById('retoque');
        if (el) el.textContent = retoque;
    }
    if (profissional) {
        const el = document.getElementById('profissional');
        if (el) el.textContent = profissional;
    }
}

// 8. Máscara de Telefone
function formatarTelefone(event) {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length > 11) {
        valor = valor.slice(0, 11);
    }
    if (valor.length <= 2) {
        event.target.value = valor;
        return;
    }
    if (valor.length <= 6) {
        event.target.value = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
        return;
    }
    event.target.value = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`;
}

const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', formatarTelefone);
}

atualizarDetalhesAgendamento();