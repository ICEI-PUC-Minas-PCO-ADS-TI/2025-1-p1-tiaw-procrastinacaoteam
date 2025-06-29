// Evento principal ao enviar o questionário
document.addEventListener('DOMContentLoaded', function () {
    const formulario = document.getElementById('formulario');

    if (formulario) {
        formulario.addEventListener('submit', function (event) {
            event.preventDefault();

            const idade = formulario.idade.value.trim();
            const qnttarefas = formulario.qnttarefas.value;
            const perfil = document.querySelector('input[name="perfil"]:checked');
            const objetivo = document.querySelector('input[name="objetivo"]:checked');
            const distracao = document.querySelector('input[name="distracao"]:checked');

            if (!idade || !qnttarefas || !perfil || !objetivo || !distracao) {
                alert("Dados incompletos. Certifique-se de responder completamente o questionário.");
                return;
            }

            if (idade > 100 || idade <= 0) {
                alert("Sua idade não parece certa... Tente novamente!");
                return;
            }

            const onboarding = {
                idade: idade,
                qnttarefas: qnttarefas,
                perfil: perfil.value,
                objetivo: objetivo.value,
                distracao: distracao.value
            };

            const usuarioSalvo = JSON.parse(sessionStorage.getItem('usuario'));
            if (!usuarioSalvo || !usuarioSalvo.id) {
                alert("Erro: Usuário não está logado.");
                return;
            }

            const usuarioLogadoId = usuarioSalvo.id;

            // Geração de tarefas conforme o perfil
            const tarefasPorPerfil = {
                produtivo: [
                    "Planejar a semana no domingo",
                    "Fazer 30 minutos de leitura por dia",
                    "Organizar sua mesa de trabalho",
                    "Fazer uma pausa a cada 90 minutos de trabalho",
                    "Estudar um novo tema por 1 hora",
                    "Praticar exercício físico pela manhã",
                    "Limitar redes sociais a 30 minutos por dia",
                    "Definir 3 metas diárias",
                    "Fazer revisão semanal das tarefas concluídas",
                    "Meditar por 10 minutos",
                    "Responder e-mails apenas duas vezes ao dia",
                    "Fazer um curso online",
                    "Criar um quadro de metas visível",
                    "Dormir 8 horas por noite",
                    "Evitar multitarefa"
                ],
                procrastinador: [
                    "Começar o dia com a tarefa mais difícil",
                    "Eliminar distrações por 1 hora",
                    "Fazer uma lista de tarefas curtas",
                    "Dividir tarefas grandes em partes pequenas",
                    "Usar técnica Pomodoro por 2 horas",
                    "Colocar o celular em modo avião por 1 hora",
                    "Trabalhar por blocos de 25 minutos",
                    "Fazer check-in diário com um amigo sobre tarefas",
                    "Definir um tempo limite para cada tarefa",
                    "Organizar o ambiente de trabalho",
                    "Assistir a um vídeo sobre produtividade",
                    "Escrever suas metas do dia em um post-it",
                    "Recompensar-se ao concluir uma tarefa",
                    "Colocar música ambiente de foco",
                    "Evitar redes sociais pela manhã"
                ],
                indefinido: [
                    "Fazer uma caminhada ao ar livre",
                    "Organizar seu dia em um planner",
                    "Tomar bastante água durante o dia",
                    "Escrever 3 coisas pelas quais é grato",
                    "Separar roupas para doação",
                    "Cuidar de uma planta ou pet",
                    "Assistir a um documentário inspirador",
                    "Planejar uma refeição saudável",
                    "Evitar telas 1h antes de dormir",
                    "Criar uma playlist para relaxar",
                    "Limpar sua caixa de e-mails",
                    "Fazer backup de arquivos importantes",
                    "Enviar uma mensagem para alguém importante",
                    "Praticar respiração profunda por 5 minutos",
                    "Evitar café após as 18h"
                ]
            };

            const perfilEscolhido = perfil.value.toLowerCase();
            const lista = tarefasPorPerfil[perfilEscolhido] || tarefasPorPerfil.indefinido;

            const tarefasGeradas = [];
            while (tarefasGeradas.length < 15) {
                const tarefaAleatoria = lista[Math.floor(Math.random() * lista.length)];
                if (!tarefasGeradas.some(t => t.titulo === tarefaAleatoria)) {
                    tarefasGeradas.push({
                        titulo: tarefaAleatoria,
                        concluida: false
                    });
                }
            }

            // Envia PATCH com onboarding e tarefas
            fetch(`http://localhost:3000/usuarios/${usuarioLogadoId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    onboarding,
                    tarefas: tarefasGeradas
                })
            })
            .then(res => {
                if (res.ok) {
                    alert('Respostas salvas com sucesso!');
                    window.location.href = 'onboarding.html';
                } else {
                    throw new Error('Erro ao salvar respostas');
                }
            })
            .catch(error => {
                console.error('Erro ao salvar onboarding:', error);
                alert('Erro ao salvar as respostas.');
            });
        });
    }
});

// Carrega respostas do usuário logado e exibe na tela
function carrega() {
    const usuarioSalvo = JSON.parse(sessionStorage.getItem('usuario'));
    if (!usuarioSalvo || !usuarioSalvo.id) {
        alert("Erro: Usuário não está logado.");
        return;
    }

    const usuarioLogadoId = usuarioSalvo.id;

    fetch(`http://localhost:3000/usuarios/${usuarioLogadoId}`)
        .then(res => {
            if (!res.ok) throw new Error('Erro ao buscar dados do usuário');
            return res.json();
        })
        .then(usuario => {
            const onboarding = usuario.onboarding;
            if (!onboarding) {
                alert("Nenhum dado de onboarding encontrado.");
                return;
            }

            const tela = document.getElementById('tela');
            if (!tela) return;

            tela.innerHTML += `
                <div class="bloco">
                    <h2>Questão 01</h2>
                    <p><strong>Sua idade:</strong> ${onboarding.idade}</p>
                </div>
                <div class="bloco">
                    <h2>Questão 02</h2>
                    <p><strong>Quantas tarefas por dia:</strong> ${onboarding.qnttarefas}</p>
                </div>
                <div class="bloco">
                    <h2>Questão 03</h2>
                    <p><strong>Perfil mais identificado:</strong> ${onboarding.perfil}</p>
                </div>
                <div class="bloco">
                    <h2>Questão 04</h2>
                    <p><strong>Principal objetivo:</strong> ${onboarding.objetivo}</p>
                </div>
                <div class="bloco">
                    <h2>Questão 05</h2>
                    <p><strong>Você se distrai facilmente?</strong> ${onboarding.distracao}</p>
                </div>

                <button id="salvarFinal" onclick="finalizarOnboarding()">Salvar</button>
            `;
        })
        .catch(error => {
            console.error("Erro ao carregar dados do usuário:", error);
            alert("Erro ao carregar as respostas.");
        });
}

// Redireciona para editar o questionário
function editarDados() {
    alert("Você escolheu editar as informações...");
    window.location.href = '/questionario.html';
}

// Finaliza e leva à página inicial
function finalizarOnboarding() {
    window.location.href = '/index.html';
}
