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
    const botaoRegenerar = document.getElementById('regenerarTarefas');

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

    async function gerarTarefasParaMesAtual(usuarioId, tarefasBase) {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = hoje.getMonth();
        const totalDias = new Date(ano, mes + 1, 0).getDate();

        const tarefasDistribuidas = [];
        const diasUsados = new Set();

        const tarefasEmbaralhadas = [...tarefasBase].sort(() => Math.random() - 0.5);

        for (let i = 0; i < tarefasEmbaralhadas.length; i++) {
            let diaAleatorio;
            let tentativas = 0;
            // Garante que o loop não seja infinito se todos os dias já estiverem em uso
            do {
                diaAleatorio = Math.floor(Math.random() * totalDias) + 1;
                tentativas++;
                if (tentativas > totalDias * 2) { // Adiciona um limite de tentativas
                    console.warn('Não foi possível encontrar um dia único para atribuir a tarefa. Redistribuindo tarefas.');
                    // Poderíamos adicionar lógica para reatribuir ou parar aqui
                    break; 
                }
            } while (diasUsados.has(diaAleatorio) && diasUsados.size < totalDias);

            if (tentativas > totalDias * 2) break; // Sai do loop externo se não encontrar dia

            diasUsados.add(diaAleatorio);

            const dataListada = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(diaAleatorio).padStart(2, '0')}`;
            const tarefaObj = {
                usuarioId: usuarioId,
                DataListada: dataListada,
                itens: [{
                    TarefasListada: tarefasEmbaralhadas[i].titulo,
                    nivelImportancia: ['Baixa', 'Media', 'Alta'][Math.floor(Math.random() * 3)],
                    concluida: false
                }]
            };

            tarefasDistribuidas.push(tarefaObj);
        }

        for (const tarefa of tarefasDistribuidas) {
            try {
                await fetch('http://localhost:3000/tarefas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(tarefa)
                });
            } catch (error) {
                console.error("Erro ao salvar tarefa no servidor:", tarefa, error);
            }
        }

        console.log("Tarefas geradas para o mês atual.");
    }

    async function verificarOuGerarTarefasMensais() {
        try {
            const resposta = await fetch(`http://localhost:3000/tarefas?usuarioId=${usuarioId}`);
            if (!resposta.ok) throw new Error('Falha ao buscar tarefas existentes.');
            const tarefasExistentes = await resposta.json();
            const mesAtual = new Date().toISOString().slice(0, 7); 

            const possuiTarefaNoMesAtual = tarefasExistentes.some(tarefa =>
                tarefa.DataListada && tarefa.DataListada.startsWith(mesAtual)
            );

            if (!possuiTarefaNoMesAtual) {
                console.log("Nenhuma tarefa encontrada para o mês atual, gerando novas tarefas...");
                await gerarTarefasParaMesAtual(usuarioId, usuarioLogado.tarefas || []);
                await fetchTarefas(); 
                desenharCalendario(dataAtual); 
                calcularEMostrarPontos();
            } else {
                console.log("Tarefas já existem para o mês atual.");
            }
        } catch (erro) {
            console.error("Erro ao verificar ou gerar tarefas:", erro);
        }
    }

    botaoRegenerar?.addEventListener('click', async () => {
        if (!confirm('Tem certeza que deseja regenerar as tarefas do mês atual? Isso apagará as tarefas existentes para este mês.')) {
            return;
        }

        try {
            const mesAtual = new Date().toISOString().slice(0, 7);
            const resposta = await fetch(`http://localhost:3000/tarefas?usuarioId=${usuarioId}`);
            if (!resposta.ok) throw new Error('Falha ao buscar tarefas para regeneração.');
            const tarefas = await resposta.json();
            const tarefasDoMes = tarefas.filter(t => t.DataListada?.startsWith(mesAtual));

            // Deleta todas as tarefas do mês atual
            for (const tarefa of tarefasDoMes) {
                await fetch(`http://localhost:3000/tarefas/${tarefa.id}`, {
                    method: 'DELETE'
                });
            }

            // Gera novas tarefas
            await gerarTarefasParaMesAtual(usuarioId, usuarioLogado.tarefas || []);
            await fetchTarefas(); // Atualiza tarefasSalvas localmente
            desenharCalendario(dataAtual); // Redesenha o calendário com as novas tarefas
            calcularEMostrarPontos(); // Recalcula e mostra os pontos

            alert('Tarefas regeneradas com sucesso!');

        } catch (erro) {
            console.error("Erro ao regenerar tarefas:", erro);
            alert('Erro ao regenerar tarefas. Verifique o console.');
        }
    });

    function desenharCalendario(dataParaDesenhar) {
        caminhoDasMissoes.innerHTML = '';
        esconderDetalhes();
        const ano = dataParaDesenhar.getFullYear();
        const mes = dataParaDesenhar.getMonth();
        cabecalhoMesAno.textContent = `${mesesDoAno[mes]} de ${ano}`;
        const hojeFormatado = formatarData(new Date());
        const totalDiasNoMes = new Date(ano, mes + 1, 0).getDate();
        
        // Verifica a largura do contêiner para posicionamento, aguarda se for 0
        const containerLargura = caminhoDasMissoes.offsetWidth;
        if (containerLargura === 0) {
            // Se a largura for 0, tenta redesenhar após um pequeno atraso
            setTimeout(() => desenharCalendario(dataParaDesenhar), 50);
            return; 
        }

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
            // Adiciona classe 'com-tarefas' se o dia tiver alguma tarefa (mesmo que não concluída)
            if (tarefasSalvas.some(t => t.DataListada === dataNoFormatoTexto && t.itens && t.itens.length > 0)) {
                circuloDoDia.classList.add('com-tarefas');
            }
            // Adiciona classe 'concluido' se todas as tarefas do dia estiverem concluídas
            const tarefasDesseDia = tarefasSalvas.filter(t => t.DataListada === dataNoFormatoTexto);
            const todasConcluidas = tarefasDesseDia.length > 0 && tarefasDesseDia.every(t => t.itens && t.itens.every(item => item.concluida));
            if (todasConcluidas) {
                circuloDoDia.classList.add('todas-concluidas');
            } else {
                circuloDoDia.classList.remove('todas-concluidas'); // Garante que a classe seja removida se não for o caso
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
                            // Atualiza o estado visual do círculo do dia após a conclusão de uma tarefa
                            desenharCalendario(dataAtual); // Redesenha para atualizar as classes 'todas-concluidas'
                            // Reabre os detalhes para manter o contexto, se ainda for o dia selecionado
                            if (ultimoDiaClicado && ultimoDiaClicado.dataset.fullDate === dataNoFormatoTexto) {
                                mostrarTarefasDoDia(dataNoFormatoTexto, ultimoDiaClicado);
                            }
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
            const resposta = await fetch(`http://localhost:3000/tarefas?usuarioId=${usuarioId}`);
            if (!resposta.ok) throw new Error('Falha ao buscar tarefas do usuário.');
            tarefasSalvas = await resposta.json();
        } catch (erro) {
            console.error("Erro ao buscar tarefas do usuário:", erro);
            tarefasSalvas = [];
        }
    }

    async function atualizarTarefaNoServidor(itemDia) {
        try {
            const resposta = await fetch(`http://localhost:3000/tarefas/${itemDia.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemDia),
            });
            if (!resposta.ok) throw new Error('Falha ao atualizar tarefa no servidor.');
        } catch (erro) {
            console.error("Erro ao atualizar tarefa:", erro);
        }
    }

    async function calcularEMostrarPontos() {
        if (!usuarioId) return;

        let pontuacao = 0;
        const sistemaDePontos = { 'baixa': 3, 'media': 5, 'alta': 8 };

        try {
            const resposta = await fetch(`http://localhost:3000/tarefas?usuarioId=${usuarioId}`);
            if (!resposta.ok) throw new Error('Falha ao buscar tarefas para calcular pontos.');
            const tarefasAtuais = await resposta.json();
            
            tarefasSalvas = tarefasAtuais; // Garante que tarefasSalvas esteja sempre atualizado
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
            const respostaUsuario = await fetch(`http://localhost:3000/usuarios/${usuarioId}`);
            if(!respostaUsuario.ok) throw new Error('Falha ao buscar dados do usuário.');
            const usuario = await respostaUsuario.json();
            
            usuario.pontuacao = pontuacao;
            const respostaPut = await fetch(`http://localhost:3000/usuarios/${usuarioId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuario),
            });
            if (!respostaPut.ok) throw new Error('Falha ao atualizar pontuação do usuário.');
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

    // Inicialização
    fetchTarefas().then(() => {
        verificarOuGerarTarefasMensais().then(() => {
            desenharCalendario(dataAtual);
            calcularEMostrarPontos();
        });
    });
});