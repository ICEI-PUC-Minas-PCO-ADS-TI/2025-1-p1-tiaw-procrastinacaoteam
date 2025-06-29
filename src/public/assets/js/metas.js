document.addEventListener('DOMContentLoaded', () => {

    const usuarioLogadoString = sessionStorage.getItem('usuario');

    if (!usuarioLogadoString) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = "/modulos/login/login.html";
        return;
    }

    const usuarioLogado = JSON.parse(usuarioLogadoString);
    const usuarioId = usuarioLogado.id;


    let mesAtual = new Date().getMonth();
    let anoAtual = new Date().getFullYear();
    let tarefasSalvas = []; 

    const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];



    async function buscarTarefas() {
        try {
            const resposta = await fetch(`http://localhost:3000/tarefas?usuarioId=${usuarioId}`);
            tarefasSalvas = resposta.ok ? await resposta.json() : [];
        } catch (erro) {
            console.error("Falha ao buscar tarefas:", erro);
            tarefasSalvas = [];
        }
    }

    async function buscarUsuario() {
        try {
            const resposta = await fetch(`http://localhost:3000/usuarios/${usuarioId}`);
            return resposta.ok ? await resposta.json() : null;
        } catch (erro) {
            console.error("Falha ao buscar usuário:", erro);
            return null;
        }
    }

    function criarCalendario() {
        const container = document.getElementById("calendario");
        container.innerHTML = "";
        const data = new Date(anoAtual, mesAtual, 1);
        const ultimoDia = new Date(anoAtual, mesAtual + 1, 0).getDate();
        const primeiroDiaSemana = data.getDay();

        const mesDiv = document.createElement("div");
        mesDiv.className = "calendario-mes";
        mesDiv.innerHTML = `<h3>${nomesMeses[mesAtual]} de ${anoAtual}</h3>`;

        const gridSemana = document.createElement("div");
        gridSemana.className = "grid-semana";
        diasSemana.forEach(dia => {
            const cell = document.createElement("div");
            cell.textContent = dia;
            gridSemana.appendChild(cell);
        });

        const gridDias = document.createElement("div");
        gridDias.className = "grid-dias";

        for (let i = 0; i < primeiroDiaSemana; i++) {
            gridDias.appendChild(document.createElement("div"));
        }

        for (let dia = 1; dia <= ultimoDia; dia++) {
            const diaDiv = document.createElement("div");
            diaDiv.className = "dia";
            const dataStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const tarefasDoDia = tarefasSalvas.filter(t => t.DataListada === dataStr);
            if (tarefasDoDia.length > 0) {
                diaDiv.classList.add("meta-dia");
                diaDiv.innerHTML = "✔";
                diaDiv.title = tarefasDoDia.flatMap(t => t.itens.map(item => item.TarefasListada)).join(', ');
            } else {
                diaDiv.textContent = dia;
            }
            const hoje = new Date();
            if (dia === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear()) {
                diaDiv.style.border = "2px solid #2e7d32";
            }
            gridDias.appendChild(diaDiv);
        }
        mesDiv.appendChild(gridSemana);
        mesDiv.appendChild(gridDias);
        container.appendChild(mesDiv);
        renderizarListaDeMetas();
    }

    function renderizarListaDeMetas() {
        const lista = document.getElementById("lista-de-atividades");
        lista.innerHTML = "";
        const metasFiltradas = tarefasSalvas.filter(t => {
            const [ano, mes] = t.DataListada.split("-").map(Number);
            return ano === anoAtual && mes === mesAtual + 1;
        }).sort((a, b) => new Date(a.DataListada) - new Date(b.DataListada));

        if (metasFiltradas.length === 0) {
            lista.innerHTML = "<li>Nenhuma atividade cadastrada neste mês.</li>";
            return;
        }

        metasFiltradas.forEach(tarefa => {
            if (tarefa.itens) {
                tarefa.itens.forEach(item => {
                    const li = document.createElement("li");
                    li.innerHTML = `<strong>${tarefa.DataListada}</strong><span>${item.TarefasListada}</span>`;
                    lista.appendChild(li);
                });
            }
        });
    }

    function irParaProximoMes() {
        mesAtual = (mesAtual === 11) ? 0 : mesAtual + 1;
        if (mesAtual === 0) anoAtual++;
        criarCalendario();
    }

    function irParaMesAnterior() {
        mesAtual = (mesAtual === 0) ? 11 : mesAtual - 1;
        if (mesAtual === 11) anoAtual--;
        criarCalendario();
    }
    
    function atualizarHeader(usuario) {
        if (!usuario) return;
        const fotoPerfil = document.getElementById('fotoPerfilHeader');
        if (usuario.foto && fotoPerfil) {
            fotoPerfil.src = usuario.foto;
        }
        const pontosSpan = document.querySelector('.pontos');
        if (pontosSpan) {
            pontosSpan.textContent = `🔥 ${usuario.pontuacao || 0}`;
        }
    }

    
    Promise.all([
        buscarTarefas(),
        buscarUsuario()
    ]).then(([_, usuarioAtualizado]) => { 
        if (usuarioAtualizado) {
            atualizarHeader(usuarioAtualizado);
            sessionStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
        } else {
            atualizarHeader(usuarioLogado);
        }

        criarCalendario();

        document.getElementById("proximo-mes").addEventListener("click", irParaProximoMes);
        document.getElementById("voltar-mes").addEventListener("click", irParaMesAnterior);
        document.getElementById("btn-sair").addEventListener("click", function (event) {
            event.preventDefault();
            sessionStorage.clear();
            window.location.href = 'login.html';
        });
    });
});