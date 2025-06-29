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
    const pontosSpan = document.querySelector('.pontos');

    let todasAsTarefas = [];
    let dataAtual = new Date();
    let ultimoDiaClicado = null;
    const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const mesesDoAno = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];



    async function iniciarPagina() {
        if (pontosSpan) {
            pontosSpan.textContent = `🔥 ${usuarioLogado.pontuacao || 0}`;
        }
        
        try {
            const resposta = await fetch(`${API_BASE_URL}/tarefas?usuarioId=${usuarioId}`);
            todasAsTarefas = await resposta.json();
            desenharCalendario(dataAtual);
        } catch (error) {
            console.error("Erro ao buscar tarefas:", error);
            alert("Não foi possível carregar as tarefas do servidor.");
        }
    }


    function desenharCalendario(dataParaDesenhar) {
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

        for (let i = 1; i <= totalDiasNoMes; i++) {
            const dataDoLoop = new Date(ano, mes, i);
            const dataNoFormatoTexto = formatarData(dataDoLoop);
            
            const temTarefas = todasAsTarefas.some(t => t.DataListada === dataNoFormatoTexto);

            if (temTarefas) {
                 const circuloDoDia = document.createElement('div');
                circuloDoDia.className = 'circulo-dia';
                circuloDoDia.dataset.fullDate = dataNoFormatoTexto;
                
                const x = containerLargura * posicoesX[(caminhoDasMissoes.childElementCount) % posicoesX.length];
                circuloDoDia.style.left = `${x - 40}px`;
                circuloDoDia.style.top = `${y - 40}px`;
                y += 120; 

                circuloDoDia.innerHTML = `
                    <span class="dia-semana-label">${diasDaSemana[dataDoLoop.getDay()]}</span>
                    <span class="dia-numero-label">${i}</span>
                `;

                circuloDoDia.classList.add('com-tarefas');
                if (dataNoFormatoTexto === hojeFormatado) circuloDoDia.classList.add('dia-atual');

                circuloDoDia.addEventListener('click', (evento) => {
                    evento.stopPropagation();
                    if (ultimoDiaClicado) ultimoDiaClicado.classList.remove('selecionado');
                    circuloDoDia.classList.add('selecionado');
                    ultimoDiaClicado = circuloDoDia;
                    mostrarTarefasDoDia(dataNoFormatoTexto, circuloDoDia);
                });
                caminhoDasMissoes.appendChild(circuloDoDia);
            }
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
            const [start, end] = [circulos[i], circulos[i+1]];
            const [x1, y1] = [start.offsetLeft + 40, start.offsetTop + 40];
            const [x2, y2] = [end.offsetLeft + 40, end.offsetTop + 40];
            pathData += ` C ${x1} ${y1 + 60}, ${x2} ${y2 - 60}, ${x2} ${y2}`;
        }
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', 'rgba(255, 255, 255, 0.5)');
        path.setAttribute('stroke-width', '6');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-dasharray', '10, 10');
        caminhoSvg.appendChild(path);
    }

    function mostrarTarefasDoDia(dataNoFormatoTexto, elementoCirculo) {
        textoDataSelecionada.textContent = new Date(dataNoFormatoTexto + "T00:00:00").toLocaleDateString('pt-BR');
        listaDeTarefas.innerHTML = '';
        const tarefasDoDia = todasAsTarefas.filter(t => t.DataListada === dataNoFormatoTexto);

        tarefasDoDia.forEach(itemDia => {
            if(itemDia.itens) {
                itemDia.itens.forEach((tarefa) => {
                    const li = document.createElement('li');
                    li.className = `imp-${tarefa.nivelImportancia.toLowerCase()}`;
                    li.innerHTML = `
                        <input type="checkbox" id="task-${itemDia.id}-${tarefa.TarefasListada}" ${tarefa.concluida ? 'checked' : ''}>
                        <label for="task-${itemDia.id}-${tarefa.TarefasListada}">${tarefa.TarefasListada}</label>
                    `;
                    li.querySelector('input').addEventListener('change', async function() {
                        await marcarTarefaCompleta(itemDia.id, tarefa, this.checked);
                    });
                    listaDeTarefas.appendChild(li);
                });
            }
        });
        
        posicionarCaixaDetalhes(elementoCirculo);
    }


    async function marcarTarefaCompleta(diaId, tarefa, novoStatus) {
        const diaParaAtualizar = todasAsTarefas.find(d => d.id === diaId);
        const tarefaParaAtualizar = diaParaAtualizar.itens.find(t => t.TarefasListada === tarefa.TarefasListada);
        
        if (tarefaParaAtualizar) {
            tarefaParaAtualizar.concluida = novoStatus;
            
            try {
                await fetch(`${API_BASE_URL}/tarefas/${diaId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(diaParaAtualizar)
                });
                await calcularEMostrarPontos();
            } catch (error) {
                console.error("Erro ao atualizar tarefa:", error);
            }
        }
    }


    async function calcularEMostrarPontos() {
        let pontuacao = 0;
        const sistemaDePontos = { 'baixa': 3, 'media': 5, 'alta': 8 };

        todasAsTarefas.forEach(itemDia => {
            itemDia.itens.forEach(tarefa => {
                if (tarefa.concluida) {
                    pontuacao += sistemaDePontos[tarefa.nivelImportancia.toLowerCase()] || 0;
                }
            });
        });
        
        if (pontosSpan) {
            pontosSpan.textContent = `🔥 ${pontuacao}`;
        }
        
        const usuarioAtualizado = { ...usuarioLogado, pontuacao: pontuacao };
        await fetch(`${API_BASE_URL}/usuarios/${usuarioId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuarioAtualizado)
        });
        sessionStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
    }



    function formatarData(data) {
        const [ano, mes, dia] = [data.getFullYear(), String(data.getMonth() + 1).padStart(2, '0'), String(data.getDate()).padStart(2, '0')];
        return `${ano}-${mes}-${dia}`;
    }

    function esconderDetalhes() {
        caixaDetalhes.style.opacity = 0;
        setTimeout(() => {
            caixaDetalhes.style.display = 'none';
            if (ultimoDiaClicado) {
                ultimoDiaClicado.classList.remove('selecionado');
                ultimoDiaClicado = null;
            }
        }, 300);
    }
    
    function posicionarCaixaDetalhes(elementoCirculo) {
        caixaDetalhes.style.display = 'block';
        const posCirculo = elementoCirculo.getBoundingClientRect();
        const posContainer = document.getElementById('missao-caminho-container').getBoundingClientRect();
        let top = posCirculo.top - posContainer.top + (posCirculo.height / 2) - (caixaDetalhes.offsetHeight / 2);
        let left;
        if ((posCirculo.right + caixaDetalhes.offsetWidth + 20) < window.innerWidth) {
            left = posCirculo.right - posContainer.left + 20;
        } else {
            left = posCirculo.left - posContainer.left - caixaDetalhes.offsetWidth - 20;
        }
        if (top < 0) top = 10;
        caixaDetalhes.style.top = `${top}px`;
        caixaDetalhes.style.left = `${left}px`;
        caixaDetalhes.style.opacity = 1;
    }

    document.querySelector('#prevMonth')?.addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() - 1);
        desenharCalendario(dataAtual);
    });

    document.querySelector('#nextMonth')?.addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() + 1);
        desenharCalendario(dataAtual);
    });
    
    document.addEventListener('click', (e) => {
        if (!caixaDetalhes.contains(e.target) && !e.target.closest('.circulo-dia')) {
            esconderDetalhes();
        }
    });

    iniciarPagina();
});
