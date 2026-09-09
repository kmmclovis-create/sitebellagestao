/* =========================================================
   AGENDA.JS - Versão Final (Listagem e Exclusão no Supabase)
========================================================= */

document.addEventListener('DOMContentLoaded', async () => {
    const supabase = window.supabase;
    const listaEl = document.getElementById('listaAgendamentos');
    const emptyEl = document.querySelector('.empty-agenda');
    const tabs = document.querySelectorAll('.agenda-tabs .tab');

    const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

    let abaAtual = 'proximos';

    // Função para formatar a data do banco
    function formatarData(dataISO) {
        const [ano, mes, dia] = dataISO.split('-').map(Number);
        const dataObj = new Date(ano, mes - 1, dia);
        return {
            mes: MESES[dataObj.getMonth()],
            dia: String(dia).padStart(2, '0'),
            diaSemana: DIAS_SEMANA[dataObj.getDay()]
        };
    }

    // Função principal de renderização
    async function renderizar() {
        if (!listaEl) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Busca dados no Supabase filtrando pelo perfil_id
        const { data: agendamentos, error } = await supabase
            .from('agendamentos')
            .select('*')
            .eq('perfil_id', user.id)
            .order('data', { ascending: true });

        if (error) {
            console.error("Erro ao buscar:", error.message);
            return;
        }

        const hojeISO = new Date().toISOString().split('T')[0];
        listaEl.innerHTML = '';
        let visiveis = 0;

        agendamentos.forEach(item => {
            const futuro = item.data >= hojeISO;
            const pertenceAba = abaAtual === 'proximos' ? futuro : !futuro;

            if (pertenceAba) {
                visiveis++;
                const { mes, dia, diaSemana } = formatarData(item.data);
                
                const article = document.createElement('article');
                article.className = 'appointment-card';
                article.innerHTML = `
                    <div class="appointment-date">
                        <span class="month">${mes}</span>
                        <strong>${dia}</strong>
                        <span class="day">${diaSemana}</span>
                    </div>
                    <div class="appointment-info">
                        <h2>${item.procedimento}</h2>
                        <p><i class="fa-regular fa-clock"></i> ${item.horario}</p>
                        <button class="cancel-button" type="button">Cancelar</button>
                    </div>
                `;

                // Botão Cancelar (Exclusão no Banco)
                article.querySelector('.cancel-button').addEventListener('click', async () => {
                    if (!confirm('Deseja realmente cancelar este agendamento?')) return;

                    const { error } = await supabase
                        .from('agendamentos')
                        .delete()
                        .eq('id', item.id);

                    if (error) {
                        alert("Erro ao cancelar: " + error.message);
                    } else {
                        alert("Agendamento cancelado com sucesso!");
                        renderizar(); // Atualiza a lista após excluir
                    }
                });

                listaEl.appendChild(article);
            }
        });

        listaEl.style.display = visiveis > 0 ? 'flex' : 'none';
        if (emptyEl) emptyEl.style.display = visiveis > 0 ? 'none' : 'flex';
    }

    // Lógica das Abas
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            abaAtual = tab.textContent.trim().toLowerCase() === 'anteriores' ? 'anteriores' : 'proximos';
            renderizar();
        });
    });

    renderizar();
});