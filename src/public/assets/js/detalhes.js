document.addEventListener('DOMContentLoaded', () => {

    const usuarioLogadoString = sessionStorage.getItem('usuario');
    if (!usuarioLogadoString) {
        alert('Sessão não encontrada. Por favor, faça o login.');
        window.location.href = "/login.html"; 
        return;
    }
    const usuarioLogado = JSON.parse(usuarioLogadoString);
    const usuarioId = usuarioLogado.id;

    const params = new URLSearchParams(location.search);
    const tipo = params.get('tipo'); 

    const exibicaoContainer = document.getElementById('exibicao');
    const pontosSpan = document.querySelector('.pontos');
    
    if (pontosSpan) {
        pontosSpan.textContent = `🔥 ${usuarioLogado.pontuacao || 0}`;
    }

    
    async function mostrarDetalhes() {
        if (!tipo || !exibicaoContainer) {
            exibicaoContainer.innerHTML = "<h1>Erro: Parâmetro 'tipo' não encontrado na URL.</h1>";
            return;
        }

        try {
            const resposta = await fetch(`http://localhost:3000/tarefas?usuarioId=${usuarioId}`);
            const todasAsTarefas = await resposta.json();

            let tarefasFiltradas = [];
            let titulo = '';

            if (tipo === 'concluidas') {
                titulo = 'Tarefas Concluídas';
                todasAsTarefas.forEach(dia => {
                    if (dia.itens) {
                        tarefasFiltradas.push(...dia.itens.filter(t => t.concluida));
                    }
                });
            } else if (tipo === 'pendentes') {
                titulo = 'Tarefas Pendentes';
                 todasAsTarefas.forEach(dia => {
                    if (dia.itens) {
                        tarefasFiltradas.push(...dia.itens.filter(t => !t.concluida));
                    }
                });
            } else {
                exibicaoContainer.innerHTML = "<h1>Tipo de tarefa inválido.</h1>";
                return;
            }

            exibicaoContainer.innerHTML = `<header class="cabecalho"><h1>${titulo}</h1></header>`;

            if (tarefasFiltradas.length === 0) {
                exibicaoContainer.innerHTML += `<p class="aviso-sem-tarefas">Nenhuma tarefa encontrada nesta categoria.</p>`;
            } else {
                tarefasFiltradas.forEach(item => {
                    exibicaoContainer.innerHTML += `<div class="tarefas-exibidas"><li>${item.TarefasListada}</li></div>`;
                });
            }

        } catch (error) {
            console.error("Erro ao carregar detalhes das tarefas:", error);
            exibicaoContainer.innerHTML = "<h1>Não foi possível carregar as tarefas. Verifique o servidor.</h1>";
        }
    }

    mostrarDetalhes();
});