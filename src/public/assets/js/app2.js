 
       document.addEventListener('DOMContentLoaded', function () {
    const formulario = document.getElementById('formulario');

    // Só adiciona o event listener se o formulário existir na página
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

            localStorage.setItem('respostas', JSON.stringify(onboarding));
            window.location.href = "onboarding.html";
        });
    }
});

// Função para carregar e mostrar as respostas na tela — disponível globalmente
function carrega() {
    const dados = localStorage.getItem('respostas');
    if (!dados) return;

    const tela = document.getElementById('tela');
    if (!tela) return;

    const r = JSON.parse(dados);

    tela.innerHTML += `
        <h2>Questão 01</h2>
        <p><strong>Sua idade</strong></p>
        <p>Resposta: ${r.idade}</p>

        <h2>Questão 02</h2>
        <p><strong>Quantas tarefas você deseja realizar por dia?</strong></p>
        <p>Resposta: ${r.qnttarefas}</p>

        <h2>Questão 03</h2>
        <p><strong>Qual perfil você acha que mais se identifica?</strong></p>
        <p>Resposta: ${r.perfil}</p>

        <h2>Questão 04</h2>
        <p><strong>Ao usar o Action Mode, você pretende, principalmente...</strong></p>
        <p>Resposta: ${r.objetivo}</p>

        <h2>Questão 05</h2>
        <p><strong>Você se distraí facilmente na realização de suas tarefas?</strong></p>
        <p>Resposta: ${r.distracao}</p>
    `;

    console.log("Suas respostas");
    console.log("Idade: ", r.idade);
    console.log("Quantas tarefas você deseja realizar por dia? ", r.qnttarefas);
    console.log("Qual perfil você acha que mais se identifica? ", r.perfil);
    console.log("Ao usar o Action Mode, você pretende, principalmente... ", r.objetivo);
    console.log("Você se distraí facilmente na realização de suas tarefas? ", r.distracao);
}

// Função para redirecionar à edição dos dados — disponível globalmente
function editarDados() {
    alert("Você escolheu editar as informações...");
    window.location.href = 'index2.html';
}