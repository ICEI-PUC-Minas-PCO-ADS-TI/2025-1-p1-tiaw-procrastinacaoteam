document.addEventListener('DOMContentLoaded', () => {

    const API_BASE_URL = 'https://procrastinacao.glitch.me';

    const conteudos = document.getElementById('conteudos');
    const caminhoDasMissoes = document.getElementById('missao-caminho');
    const cabecalhoMesAno = document.getElementById('currentMonthYear');
    const botaoMesAnterior = document.getElementById('prevMonth');
    const botaoProximoMes = document.getElementById('nextMonth');
    const caixaDetalhes = document.getElementById('detalhes-tarefas-dia');
    const textoDataSelecionada = document.getElementById('data-selecionada');
    const listaDeTarefas = document.getElementById('lista-tarefas-dia');
    const caminhoSvg = document.getElementById('caminho-svg');
    const pontosSpan = document.querySelector('.pontos');
    
    let dataAtual = new Date();
    let ultimoDiaClicado = null;
    const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const mesesDoAno = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const usuarioLogadoString = sessionStorage.getItem('usuario');
    if (!usuarioLogadoString) {
        alert('Sessão não encontrada. Por favor, faça o login.');
        window.location.href = "/modulos/login/login.html"; 
        return;
    }
    const usuarioLogado = JSON.parse(usuarioLogadoString);
    const usuarioId = usuarioLogado.id;

    if (!usuarioId) {
        alert('Dados de usuário inválidos. Por favor, faça o login novamente.');
        return;
    }

    document.getElementById("btn-sair")?.addEventListener("click", function (event) {
        event.preventDefault();
        alert("Você foi desconectado com sucesso!");
        sessionStorage.clear();
        window.location.href = '/index.html'; 
    });

function desenharCalendario(tarefas, dataParaDesenhar) {
    caminhoDasMissoes.innerHTML = '';
    esconderDetalhes();
    const ano = dataParaDesenhar.getFullYear();
    const mes = dataParaDesenhar.getMonth();
    cabecalhoMesAno.textContent = `${mesesDoAno[mes]} de ${ano}`;
    const hojeFormatado = formatarData(new Date());
    const totalDiasNoMes = new Date(ano, mes + 1, 0).getDate();
    
    const containerLargura = caminhoDasMissoes.offsetWidth;
    if (containerLargura === 0) return;
    const posicoesX = [0.2, 0.5, 0.8];
    let y = 80;

    const datasComTarefas = new Set(tarefas.map(t => t.DataListada));

    for (let i = 1; i <= totalDiasNoMes; i++) {
        const dataDoLoop = new Date(ano, mes, i);
        const dataNoFormatoTexto = formatarData(dataDoLoop);


        const circuloDoDia = document.createElement('div');
        circuloDoDia.className = 'circulo-dia'; 
        circuloDoDia.dataset.fullDate = dataNoFormatoTexto;

        const x = containerLargura * posicoesX[(i - 1) % posicoesX.length];
        circuloDoDia.style.left = `${x - 40}px`;
        circuloDoDia.style.top = `${y - 40}px`;
        y += 120;

        circuloDoDia.innerHTML = `
            <span class="dia-semana-label">${diasDaSemana[dataDoLoop.getDay()]}</span>
            <span class="dia-numero-label">${i}</span>
        `;
        

        if (datasComTarefas.has(dataNoFormatoTexto)) {
            circuloDoDia.classList.add('com-tarefas');
        }

        if (dataNoFormatoTexto === hojeFormatado) {
            circuloDoDia.classList.add('dia-atual');
        }

        circuloDoDia.addEventListener('click', (evento) => {
            evento.stopPropagation();
            if (ultimoDiaClicado) ultimoDiaClicado.classList.remove('selecionado');
            circuloDoDia.classList.add('selecionado');
            ultimoDiaClicado = circuloDoDia;
            mostrarTarefasDoDia(dataNoFormatoTexto, tarefas, circuloDoDia);
        });
        
        caminhoDasMissoes.appendChild(circuloDoDia);
    }
    
    caminhoDasMissoes.parentElement.style.height = `${y}px`;
    desenharLinhasDoCaminho();
}

    function desenharLinhasDoCaminho() {
        const circulos = Array.from(document.querySelectorAll('.circulo-dia'));
        caminhoSvg.innerHTML = '';
        if (circulos.length < 2) return;
        
        let pathData = `M ${circulos[0].offsetLeft + 40} ${circulos[0].offsetTop + 40}`; 
        
        for (let i = 0; i < circulos.length - 1; i++) {
            const start = circulos[i], end = circulos[i+1];
            const x1 = start.offsetLeft + 40, y1 = start.offsetTop + 40;
            const x2 = end.offsetLeft + 40, y2 = end.offsetTop + 40;
            const cx1 = x1, cy1 = y1 + 60, cx2 = x2, cy2 = y2 - 60;
            pathData += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
        }
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', 'rgba(255, 255, 255, 0.5)');
        path.setAttribute('stroke-width', '6');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-dasharray', '10, 10');
        caminhoSvg.appendChild(path);
    }

    function mostrarTarefasDoDia(dataNoFormatoTexto, todasAsTarefas, elementoCirculo) {
        textoDataSelecionada.textContent = new Date(dataNoFormatoTexto + "T00:00:00").toLocaleDateString('pt-BR');
        listaDeTarefas.innerHTML = '';
        const tarefasDoDia = todasAsTarefas.filter(t => t.DataListada === dataNoFormatoTexto);

        if (tarefasDoDia.length === 0) {
            listaDeTarefas.innerHTML = '<li>Dia de descansar! ( ˶ˆ ᗜ ˆ˵ )</li>';
        } else {
            tarefasDoDia.forEach(itemDia => {
                if(itemDia.itens) {
                    itemDia.itens.forEach((tarefa, index) => {
                        const li = document.createElement('li');
                        if (tarefa.nivelImportancia) {
                            li.className = `imp-${tarefa.nivelImportancia.toLowerCase()}`; 
                        }
                        li.innerHTML = `
                            <input type="checkbox" id="task-${itemDia.id}-${index}" ${tarefa.concluida ? 'checked' : ''}>
                            <label for="task-${itemDia.id}-${index}">${tarefa.TarefasListada}</label>
                        `;
                        li.querySelector('input').addEventListener('change', async function() {
                            await marcarTarefaCompleta(itemDia, tarefa, this.checked);
                        });
                        listaDeTarefas.appendChild(li);
                    });
                }
            });
        }
        
        caixaDetalhes.style.display = 'block';
        const containerDoCaminho = document.getElementById('missao-caminho-container');
        const posCirculo = elementoCirculo.getBoundingClientRect();
        const posContainer = containerDoCaminho.getBoundingClientRect();
        const larguraCard = caixaDetalhes.offsetWidth;
        const alturaCard = caixaDetalhes.offsetHeight;
        let top = posCirculo.top - posContainer.top + (posCirculo.height / 2) - (alturaCard / 2);
        let left;
        
        if ((posCirculo.right + larguraCard + 20) < window.innerWidth) {
            left = posCirculo.right - posContainer.left + 20;
        } else {
            left = posCirculo.left - posContainer.left - larguraCard - 20;
        }
        if (top < 10) {
            top = 10;
        }
        if (top + alturaCard > containerDoCaminho.scrollHeight - 10) {
            top = containerDoCaminho.scrollHeight - alturaCard - 10;
        }
        caixaDetalhes.style.top = `${top}px`;     
        caixaDetalhes.style.left = `${left}px`;   
        caixaDetalhes.style.opacity = 1;
    }

    async function marcarTarefaCompleta(itemDia, tarefa, novoStatus) {
        const tarefaOriginal = itemDia.itens.find(t => t.TarefasListada === tarefa.TarefasListada);
        if(tarefaOriginal) {
            tarefaOriginal.concluida = novoStatus;
            await atualizarTarefaNoServidor(itemDia);
            await calcularEMostrarPontos();
        }
    }

    function esconderDetalhes() {
        if (caixaDetalhes.style.display === 'block') {
            caixaDetalhes.style.opacity = 0;
            setTimeout(() => {
                caixaDetalhes.style.display = 'none';
                if (ultimoDiaClicado) {
                    ultimoDiaClicado.classList.remove('selecionado');
                    ultimoDiaClicado = null;
                }
            }, 300);
        }
    }

    function formatarData(data) {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`; 
    }

    async function fetchTarefas() {
        try {
            const resposta = await fetch(`${API_BASE_URL}/tarefas?usuarioId=${usuarioId}`); 
            if (!resposta.ok) throw new Error('Falha ao buscar tarefas');
            return await resposta.json();
        } catch (erro) {
            console.error("Erro ao buscar tarefas do usuário:", erro);
            return [];
        }
    }

    async function atualizarTarefaNoServidor(itemDia) {
        try {
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

        let pontuacao = 0;
        const sistemaDePontos = { 'baixa': 3, 'media': 5, 'alta': 8 };

        const resposta = await fetch(`${API_BASE_URL}/tarefas?usuarioId=${usuarioId}`); 
        const tarefasAtuais = await resposta.json();

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
        await atualizarPontosDoUsuario(pontuacao);
    }

    async function atualizarPontosDoUsuario(pontuacao) {
        usuarioLogado.pontuacao = pontuacao;
        try {
            await fetch(`${API_BASE_URL}/usuarios/${usuarioId}`, { 
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuarioLogado),
            });
            sessionStorage.setItem('usuario', JSON.stringify(usuarioLogado));
        } catch (erro) {
            console.error("Erro ao atualizar a pontuação do usuário:", erro);
        }
    }

    function atualizarHeader() {
        if (pontosSpan && usuarioLogado) {
            pontosSpan.textContent = `🔥 ${usuarioLogado.pontuacao || 0}`; 
        }
    }
    
    async function iniciarPagina() {
        atualizarHeader();
        const tarefasIniciais = await fetchTarefas();
        desenharCalendario(tarefasIniciais, dataAtual);
        await calcularEMostrarPontos();
    }

    botaoMesAnterior.addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() - 1);
        iniciarPagina(); 
    });
    botaoProximoMes.addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() + 1);
        iniciarPagina();
    });
    document.addEventListener('click', (e) => {
        if (!caixaDetalhes.contains(e.target) && !e.target.closest('.circulo-dia')) {
            esconderDetalhes();
        }
    });
    window.addEventListener('resize', () => {
        esconderDetalhes();
        iniciarPagina(); 
    });

    iniciarPagina(); 
});
