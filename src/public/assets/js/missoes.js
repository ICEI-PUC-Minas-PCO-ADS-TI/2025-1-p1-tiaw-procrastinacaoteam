document.addEventListener('DOMContentLoaded', () => {

    const API_BASE_URL = 'https://procrastinacao.glitch.me';

    const usuarioLogadoString = sessionStorage.getItem('usuario');
    if (!usuarioLogadoString) {
        alert('Sessão não encontrada. Por favor, faça o login.');
        window.location.href = "login.html";
        return;
    }
    const usuarioLogado = JSON.parse(usuarioLogadoString);
    const usuarioId = usuarioLogado.id; 



    const caminhoDasMissoes = document.getElementById('missao-caminho');
    const cabecalhoMesAno = document.getElementById('currentMonthYear');
    const caixaDetalhes = document.getElementById('detalhes-tarefas-dia');
    const textoDataSelecionada = document.getElementById('data-selecionada');
    const listaDeTarefas = document.getElementById('lista-tarefas-dia');
    const caminhoSvg = document.getElementById('caminho-svg');
    let tarefasSalvas = [];
    let dataAtual = new Date();
    let ultimoDiaClicado = null;
    const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const mesesDoAno = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];



    async function fetchTarefas() {
        if (!usuarioId) return;
        try {
            // Usa a URL base e o ID correto
            const resposta = await fetch(`${API_BASE_URL}/tarefas?usuarioId=${usuarioId}`);
            tarefasSalvas = await resposta.json();
        } catch (erro) {
            console.error("Erro ao buscar tarefas do usuário:", erro);
            tarefasSalvas = [];
        }
    }

    async function atualizarPontosDoUsuario(id, pontuacao) {
        try {
            let respostaUsuario = await fetch(`${API_BASE_URL}/usuarios/${id}`);
            if(!respostaUsuario.ok) return;
            const usuario = await respostaUsuario.json();
            
            usuario.pontuacao = pontuacao;

            await fetch(`${API_BASE_URL}/usuarios/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuario),
            });
            sessionStorage.setItem('usuario', JSON.stringify(usuario));
        } catch (erro) {
            console.error("Erro ao atualizar a pontuação do usuário:", erro);
        }
    }

    async function atualizarTarefaNoServidor(itemDia) {
        try {
            // Usa a URL base e o ID correto
            await fetch(`${API_BASE_URL}/tarefas/${itemDia.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemDia),
            });
        } catch (erro) {
            console.error("Erro ao atualizar tarefa:", erro);
        }
    }

    async function calcularEMostrarPontos() {
        if (!usuarioId) return;
        let pontuacao = 0;
        const sistemaDePontos = { 'baixa': 3, 'media': 5, 'alta': 8 };

        const res = await fetch(`${API_BASE_URL}/tarefas?usuarioId=${usuarioId}`);
        const tarefasAtuais = await res.json();
        tarefasSalvas = tarefasAtuais;

        tarefasAtuais.forEach(itemDia => {
            if (itemDia.itens) {
                itemDia.itens.forEach(tarefa => {
                    if (tarefa.concluida) {
                        const importancia = tarefa.nivelImportancia ? tarefa.nivelImportancia.toLowerCase() : '';
                        pontuacao += sistemaDePontos[importancia] || 0;
                    }
                });
            }
        });
        document.querySelector('.pontos').textContent = `🔥 ${pontuacao}`;
        await atualizarPontosDoUsuario(usuarioId, pontuacao);
    }
    


    fetchTarefas().then(() => {
        setTimeout(() => {
            calcularEMostrarPontos();
        }, 100);
    });
});
