document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('AddTarefas');
    const inputDescricao = document.getElementById('Entrada');
    const inputData = document.getElementById('EntradaData');
    const carrosselContainer = document.getElementById('criaCard');
    const btnLimpar = document.getElementById('btnCancelar');
    const btnAnterior = document.getElementById('anterior');
    const btnProximo = document.getElementById('proximo');

    const usuarioLogadoString = sessionStorage.getItem('usuario');
    if (!usuarioLogadoString) {
        alert('Sessão não encontrada. Por favor, faça o login.');
        window.location.href = "../../modulos/login/login.html";
        return;
    }
    const usuarioLogado = JSON.parse(usuarioLogadoString);
    const usuarioId = usuarioLogado.id;



    async function exibirTarefas() {
        try {
            const resposta = await fetch(`http://localhost:3000/tarefas?usuarioId=${usuarioId}`);
            const tarefas = await resposta.json();

            carrosselContainer.innerHTML = ''; 

            if (tarefas.length === 0) {
                carrosselContainer.innerHTML = '<p class="aviso-sem-tarefas">Nenhuma tarefa cadastrada ainda.</p>';
                return;
            }

            tarefas.sort((a, b) => new Date(a.DataListada) - new Date(b.DataListada));

            tarefas.forEach(dia => {
                if (dia.itens) {
                    dia.itens.forEach((tarefa, index) => {
                        const card = document.createElement('div');
                        card.className = 'card-tarefa';
                        if (tarefa.nivelImportancia) {
                            card.classList.add(`imp-${tarefa.nivelImportancia.toLowerCase()}`);
                        }
                        
                        const dataFormatada = new Date(dia.DataListada + "T00:00:00").toLocaleDateString('pt-BR');
                        
                        card.innerHTML = `
                            <h4>${tarefa.TarefasListada}</h4>
                            <p>Data: ${dataFormatada}</p>
                            <p>Importância: ${tarefa.nivelImportancia}</p>
                            <button class="btn-deletar" data-id="${dia.id}" data-index="${index}">Deletar</button>
                        `;
                        carrosselContainer.appendChild(card);
                    });
                }
            });
        } catch (error) {
            console.error('Erro ao exibir tarefas:', error);
            alert('Não foi possível carregar as tarefas. Verifique o servidor.');
        }
    }


    async function adicionarTarefa(event) {
        event.preventDefault();

        const descricao = inputDescricao.value.trim();
        const data = inputData.value;
        const importanciaInput = document.querySelector('input[name="importancia"]:checked');

        if (!descricao || !data || !importanciaInput) {
            alert('Por favor, preencha todos os campos e selecione a importância.');
            return;
        }

        const novaTarefa = {
            DataListada: data,
            usuarioId: usuarioId,
            itens: [{
                TarefasListada: descricao,
                nivelImportancia: importanciaInput.value,
                concluida: false
            }]
        };

        try {
            const resposta = await fetch('http://localhost:3000/tarefas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novaTarefa)
            });

            if (resposta.ok) {
                alert('Tarefa adicionada com sucesso!');
                resetarFormulario();
                await exibirTarefas(); 
            } else {
                alert('Ocorreu um erro ao salvar a tarefa.');
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            alert('Não foi possível se conectar ao servidor.');
        }
    }

    async function deletarTarefa(tarefaId, index) {
        if (!confirm('Tem certeza que deseja deletar esta tarefa?')) {
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/tarefas/${tarefaId}`);
            if (!res.ok) throw new Error('Tarefa não encontrada no servidor.');
            
            const diaParaAtualizar = await res.json();

            diaParaAtualizar.itens.splice(index, 1);

            let acaoFinal;
            if (diaParaAtualizar.itens.length === 0) {
                acaoFinal = fetch(`http://localhost:3000/tarefas/${tarefaId}`, { method: 'DELETE' });
            } else {
                acaoFinal = fetch(`http://localhost:3000/tarefas/${tarefaId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(diaParaAtualizar)
                });
            }

            const respostaAcao = await acaoFinal;
            if (respostaAcao.ok) {
                alert('Tarefa deletada com sucesso!');
                await exibirTarefas(); 
            } else {
                alert('Erro ao processar a deleção da tarefa.');
            }
        } catch (error) {
            console.error('Erro ao deletar tarefa:', error);
        }
    }
    

    function resetarFormulario() {
        form.reset();
        document.querySelectorAll('input[name="importancia"]').forEach(radio => radio.checked = false);
    }


    form.addEventListener('submit', adicionarTarefa);

    btnLimpar.addEventListener('click', resetarFormulario);
    
    carrosselContainer.addEventListener('click', (event) => {
        if (event.target.matches('.btn-deletar')) {
            const tarefaId = event.target.dataset.id;
            const index = parseInt(event.target.dataset.index, 10);
            deletarTarefa(tarefaId, index);
        }
    });

    btnAnterior.addEventListener('click', () => {
        carrosselContainer.scrollBy({ left: -270, behavior: 'smooth' });
    });
    btnProximo.addEventListener('click', () => {
        carrosselContainer.scrollBy({ left: 270, behavior: 'smooth' });
    });


    exibirTarefas();
});