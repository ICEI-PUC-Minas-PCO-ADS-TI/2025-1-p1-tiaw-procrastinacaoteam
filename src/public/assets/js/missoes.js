document.addEventListener('DOMContentLoaded', () => {

    const conteudos = document.getElementById('conteudos');
    const caminhoDasMissoes = document.getElementById('missao-caminho');
    const cabecalhoMesAno = document.getElementById('currentMonthYear');
    const botaoMesAnterior = document.getElementById('prevMonth');
    const botaoProximoMes = document.getElementById('nextMonth');
    const caixaDetalhes = document.getElementById('detalhes-tarefas-dia');
    const textoDataSelecionada = document.getElementById('data-selecionada');
    const listaDeTarefas = document.getElementById('lista-tarefas-dia');
    const caminhoSvg = document.getElementById('caminho-svg');
    
    let tarefasSalvas = [];
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
            if (tarefasSalvas.some(t => t.DataListada === dataNoFormatoTexto && t.itens && t.itens.length > 0)) {
                circuloDoDia.classList.add('com-tarefas');
            }
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
        
        caminhoDasMissoes.parentElement.style.height = `${y}px`;
        desenharLinhasDoCaminho();
    }

    function desenharLinhasDoCaminho() {
        const circulos = Array.from(document.querySelectorAll('.circulo-dia'));
        if (circulos.length < 2) {
            caminhoSvg.innerHTML = '';
            return;
        }
        
        caminhoSvg.innerHTML = '';
        let pathData = `M ${circulos[0].offsetLeft + 40} ${circulos[0].offsetTop + 40}`;
        
        for (let i = 0; i < circulos.length - 1; i++) {
            const start = circulos[i];
            const end = circulos[i+1];
            
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

    function mostrarTarefasDoDia(dataNoFormatoTexto, elementoCirculo) {
        textoDataSelecionada.textContent = new Date(dataNoFormatoTexto + "T00:00:00").toLocaleDateString('pt-BR');
        listaDeTarefas.innerHTML = '';
        const tarefasDoDia = tarefasSalvas.filter(t => t.DataListada === dataNoFormatoTexto);

        if (tarefasDoDia.length === 0 || tarefasDoDia.every(t => !t.itens || t.itens.length === 0)) {
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
                            tarefa.concluida = this.checked;
                            await atualizarTarefaNoServidor(itemDia);
                            await calcularEMostrarPontos();
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
        if (!usuarioId) return; 

        try {
            const resposta = await fetch(`https://procrastinacao.glitch.me/tarefas?usuarioId=${usuarioId}`);
            tarefasSalvas = await resposta.json();
        } catch (erro) {
            console.error("Erro ao buscar tarefas do usuário:", erro);
            tarefasSalvas = [];
        }
    }

    async function atualizarTarefaNoServidor(itemDia) {
        try {
            await fetch(`https://procrastinacao.glitch.me/tarefas/${itemDia.id}`, {
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

    try {

      const resposta = await fetch(`https://procrastinacao.glitch.me/tarefas?usuarioId=${usuarioId}`);
      const tarefasAtuais = await resposta.json();
      
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

    } catch (erro) {
        console.error("Erro ao recalcular os pontos:", erro);
    }
  }

async function atualizarPontosDoUsuario(usuarioId, pontuacao) {
    try {
      const respostaUsuario = await fetch(`https://procrastinacao.glitch.me/usuarios/${usuarioId}`);
      if(!respostaUsuario.ok) return;
      const usuario = await respostaUsuario.json();
      
      usuario.pontuacao = pontuacao;
      await fetch(`https://procrastinacao.glitch.me/usuarios/${usuarioId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(usuario),
      });
      sessionStorage.setItem('usuario', JSON.stringify(usuario));

    } catch (erro) {
        console.error("Erro ao atualizar a pontuação do usuário:", erro);
    }
}
    
    
    botaoMesAnterior.addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() - 1);
        desenharCalendario(dataAtual);
    });
    botaoProximoMes.addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() + 1);
        desenharCalendario(dataAtual);
    });
    
    document.addEventListener('click', (e) => {
        if (!caixaDetalhes.contains(e.target) && !e.target.closest('.circulo-dia')) {
            esconderDetalhes();
        }
    });
    window.addEventListener('resize', () => {
        esconderDetalhes();
        desenharCalendario(dataAtual)
    });

    fetchTarefas().then(() => {
        setTimeout(() => {
            desenharCalendario(dataAtual);
            calcularEMostrarPontos();
        }, 100);
    });
});