document.addEventListener('DOMContentLoaded', async () => {
    // Verifica a sessão do usuário ao carregar a página
    const usuario = JSON.parse(sessionStorage.getItem("usuario"));
    if (!usuario || !usuario.id) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "/login.html"; // Redireciona para login se não houver sessão
        return;
    }

    const usuarioId = usuario.id;
    let tarefasSalvas = [];
    let mesAtual = new Date().getMonth(); // Mês atual (0-11)
    let anoAtual = new Date().getFullYear(); // Ano atual

    const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    /**
     * Busca as tarefas do usuário logado na API.
     */
    async function buscarTarefas() {
        try {
            const resposta = await fetch(`http://localhost:3000/tarefas?usuarioId=${usuarioId}`);
            tarefasSalvas = resposta.ok ? await resposta.json() : [];
        } catch (erro) {
            console.error("Erro ao buscar tarefas:", erro);
        }
    }

    /**
     * Cria e renderiza o calendário com as tarefas marcadas.
     */
    function criarCalendario() {
        const container = document.getElementById("calendario");
        if (!container) {
            console.error("Elemento 'calendario' não encontrado.");
            return;
        }
        container.innerHTML = ""; // Limpa o conteúdo anterior do calendário

        const data = new Date(anoAtual, mesAtual, 1); // Primeiro dia do mês atual
        const ultimoDia = new Date(anoAtual, mesAtual + 1, 0).getDate(); // Último dia do mês
        const primeiroDiaSemana = data.getDay(); // Dia da semana do primeiro dia (0=Dom, 6=Sáb)

        // Cria o cabeçalho do mês e ano
        const mesDiv = document.createElement("div");
        mesDiv.className = "calendario-mes";
        mesDiv.innerHTML = `<h3>${nomesMeses[mesAtual]} de ${anoAtual}</h3>`;

        // Cria a grade dos dias da semana
        const gridSemana = document.createElement("div");
        gridSemana.className = "grid-semana";
        diasSemana.forEach(dia => {
            const cell = document.createElement("div");
            cell.textContent = dia;
            gridSemana.appendChild(cell);
        });

        // Cria a grade dos dias do mês
        const gridDias = document.createElement("div");
        gridDias.className = "grid-dias";

        // Adiciona células vazias para os dias antes do primeiro dia do mês
        for (let i = 0; i < primeiroDiaSemana; i++) {
            gridDias.appendChild(document.createElement("div"));
        }

        // Preenche os dias do mês
        for (let dia = 1; dia <= ultimoDia; dia++) {
            const diaDiv = document.createElement("div");
            diaDiv.className = "dia";
            // Formata a data para comparação com os dados da API (AAAA-MM-DD)
            const dataStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

            // Filtra as tarefas para o dia atual
            const tarefasDoDia = tarefasSalvas.filter(t => t.DataListada === dataStr);
            if (tarefasDoDia.length > 0) {
                diaDiv.classList.add("meta-dia"); // Adiciona classe para dias com meta
                diaDiv.innerHTML = "✔"; // Sinaliza com um visto
                // Cria um tooltip com as tarefas do dia
                diaDiv.title = tarefasDoDia.flatMap(t => t.itens.map(item => item.TarefasListada)).join(', ');
            } else {
                diaDiv.textContent = dia; // Exibe apenas o número do dia
            }

            // Destaca o dia atual
            const hoje = new Date();
            if (dia === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear()) {
                diaDiv.style.border = "2px solid #2e7d32"; // Borda verde para o dia de hoje
            }

            gridDias.appendChild(diaDiv);
        }

        // Adiciona as grades ao div do mês e o div do mês ao container principal
        mesDiv.appendChild(gridSemana);
        mesDiv.appendChild(gridDias);
        container.appendChild(mesDiv);

        renderizarListaDeMetas(); // Atualiza a lista de metas abaixo do calendário
    }

    /**
     * Renderiza a lista de metas cadastradas para o mês atual.
     */
    function renderizarListaDeMetas() {
        const lista = document.getElementById("lista-de-atividades");
        if (!lista) {
            console.error("Elemento 'lista-de-atividades' não encontrado.");
            return;
        }
        lista.innerHTML = ""; // Limpa a lista anterior

        // Filtra as metas para o mês e ano atualmente exibidos no calendário
        const metasFiltradas = tarefasSalvas.filter(t => {
            const [ano, mes] = t.DataListada.split("-").map(Number);
            // Compara o ano e o mês (mês no JS é 0-11, no JSON/data é 1-12)
            return ano === anoAtual && mes === mesAtual + 1;
        }).sort((a, b) => new Date(a.DataListada) - new Date(b.DataListada)); // Ordena por data

        if (metasFiltradas.length === 0) {
            lista.innerHTML = "<li>Nenhuma atividade cadastrada neste mês.</li>";
            return;
        }

        // Adiciona cada tarefa à lista
        metasFiltradas.forEach(tarefa => {
            if (tarefa.itens) { // Verifica se a tarefa tem itens (sub-tarefas)
                tarefa.itens.forEach(item => {
                    const li = document.createElement("li");
                    li.innerHTML = `<strong>${tarefa.DataListada}</strong> <span>${item.TarefasListada}</span>`;
                    lista.appendChild(li);
                });
            }
        });
    }

    /**
     * Avança o calendário para o próximo mês.
     */
    function irParaProximoMes() {
        mesAtual = (mesAtual + 1) % 12; // Incrementa o mês, voltando a 0 em dezembro
        if (mesAtual === 0) anoAtual++; // Se voltou a janeiro, avança o ano
        criarCalendario(); // Recria o calendário com o novo mês/ano
    }

    /**
     * Volta o calendário para o mês anterior.
     */
    function irParaMesAnterior() {
        mesAtual = (mesAtual - 1 + 12) % 12; // Decrementa o mês, garantindo que não seja negativo
        if (mesAtual === 11) anoAtual--; // Se voltou a dezembro, volta o ano
        criarCalendario(); // Recria o calendário com o novo mês/ano
    }

    // --- EVENT LISTENERS ---
    // Botão para avançar o mês
    const btnProximoMes = document.getElementById("proximo-mes");
    if (btnProximoMes) {
        btnProximoMes.addEventListener("click", irParaProximoMes);
    } else {
        console.error("Botão 'proximo-mes' não encontrado.");
    }

    // Botão para voltar o mês
    const btnVoltarMes = document.getElementById("voltar-mes");
    if (btnVoltarMes) {
        btnVoltarMes.addEventListener("click", irParaMesAnterior);
    } else {
        console.error("Botão 'voltar-mes' não encontrado.");
    }

    // Botão de sair (logout) - CORREÇÃO: REDIRECIONA PARA INDEX.HTML
    const btnSair = document.getElementById("btn-sair");
    if (btnSair) {
        btnSair.addEventListener("click", function (event) {
            alert("Você foi desconectado com sucesso!");
            event.preventDefault(); 
            sessionStorage.clear(); 
            window.location.href = '/index.html'; 
        });
    } else {
        console.error("Botão 'btn-sair' não encontrado.");
    }

    
    await buscarTarefas();
    criarCalendario();
});