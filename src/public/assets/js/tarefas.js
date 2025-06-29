document.addEventListener('DOMContentLoaded', () => {

    const usuarioLogadoString = sessionStorage.getItem('usuario');
    if (!usuarioLogadoString) {
        alert('Sessão não encontrada. Por favor, faça o login.');
        window.location.href = "/login.html"; 
        return;
    }
    const usuarioLogado = JSON.parse(usuarioLogadoString);
    const usuarioId = usuarioLogado.id;

    const tela = document.getElementById('tela');


    async function buscarDadosDoUsuario() {
        try {
            return Promise.resolve(usuarioLogado);
        } catch (error) {
            console.error("Erro ao ler dados do usuário da sessão:", error);
            return null;
        }
    }

    async function buscarTarefas() {
        try {
            const resposta = await fetch(`http://localhost:3000/tarefas?usuarioId=${usuarioId}`);
            return resposta.ok ? await resposta.json() : [];
        } catch (error) {
            console.error("Erro ao buscar tarefas:", error);
            return [];
        }
    }


    async function montarPagina() {
        const [usuario, todasAsTarefas] = await Promise.all([
            buscarDadosDoUsuario(),
            buscarTarefas()
        ]);

        if (!usuario || !tela) {
            tela.innerHTML = "<h1>Erro ao carregar dados.</h1>";
            return;
        }

        const tarefasConcluidas = [];
        const tarefasPendentes = [];

        todasAsTarefas.forEach(dia => {
            if (dia.itens) {
                dia.itens.forEach(tarefa => {
                    if (tarefa.concluida) {
                        tarefasConcluidas.push(tarefa);
                    } else {
                        tarefasPendentes.push(tarefa);
                    }
                });
            }
        });

        tela.innerHTML = `
            <div id="dados" style="text-align:center;">
                <div class="dadosjs">PONTOS: ${usuario.pontuacao || 0}</div><br><br>
                
                <button class="btn-tarefa" onclick="location.href='detalhes.html?tipo=concluidas'">
                    TAREFAS CONCLUÍDAS: ${tarefasConcluidas.length}
                </button><br><br>

                <button class="btn-tarefa" onclick="location.href='detalhes.html?tipo=pendentes'">
                    TAREFAS PENDENTES: ${tarefasPendentes.length}
                </button><br><br>
            </div>
        `;

        const totalTarefas = tarefasConcluidas.length + tarefasPendentes.length;
        const percentualConcluido = totalTarefas > 0 ? (tarefasConcluidas.length / totalTarefas) * 100 : 0;

        tela.innerHTML += `
            <p id="p-grafico">Porcentagem: ${percentualConcluido.toFixed(1)}% das tarefas concluídas</p>
            <div id="grafico" style="max-width: 600px; height: 400px; margin: 40px auto;">
                <canvas id="myChart"></canvas>
            </div>
        `;

        renderizarGrafico(percentualConcluido);
    }

    function renderizarGrafico(percentualAtual) {
        const ctx = document.getElementById('myChart');
        if (!ctx) return;
        
        const dadosDoGrafico = [12, 18, 35, 25, percentualAtual]; 

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Sua Semana Atual'],
                datasets: [{
                    label: 'Produtividade - % de Tarefas Concluídas por Semana',
                    data: dadosDoGrafico,
                    backgroundColor: ['#129745'],
                    borderColor: ['#0e6f32'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { color: 'black' } },
                    x: { ticks: { color: 'black' } }
                }
            }
        });
    }

    montarPagina();
});