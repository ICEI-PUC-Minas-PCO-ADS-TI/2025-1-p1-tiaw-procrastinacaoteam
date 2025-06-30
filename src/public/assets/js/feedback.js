const url = "http://localhost:3000/avaliacoes";

// Contar notas para o gráfico
async function contarNotas() {
  const resposta = await fetch(url);
  const avaliacoes = await resposta.json();
  const contagem = [0, 0, 0, 0, 0];
  avaliacoes.forEach(avaliacao => {
    if (avaliacao.nota >= 1 && avaliacao.nota <= 5) {
      contagem[avaliacao.nota - 1]++;
    }
  });
  return contagem;
}

// Atualizar gráfico
async function atualizarGraficoPizza() {
  const ctx = document.getElementById("graficoNotas").getContext("2d");
  const dados = await contarNotas();

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Nota 1', 'Nota 2', 'Nota 3', 'Nota 4', 'Nota 5'],
      datasets: [{
        label: 'Distribuição de Notas',
        data: dados,
        backgroundColor: ['#ff4d4d', '#ff9933', '#ffff66', '#66ff66', '#3399ff'],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

// Exibir comentários
async function exibirComentarios() {
  const resposta = await fetch(url);
  const comentarios = await resposta.json();
  const lista = document.getElementById('comentarios-lista');
  lista.innerHTML = '';

  comentarios.forEach(comentario => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><img src="img/preguica.png" class="icon" alt="ícone" /></td>
      <td>${comentario.comentario}</td>
      <td class="data">${comentario.data}</td>
      <td><button onclick="excluirComentario(${comentario.id})">Excluir</button></td>
    `;
    lista.appendChild(row);
  });
}

// Adicionar comentário
async function adicionarComentario() {
  const comentario = document.getElementById("comentario").value.trim();
  if (nota === 0) {
    mensagem.textContent = 'Por favor, selecione uma nota.';
    return;
  }
  if (comentario === '') {
    mensagem.textContent = 'Por favor, escreva um comentário.';
    return;
  }

  const hoje = new Date();
  const data = hoje.toLocaleDateString("pt-BR");

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nota, comentario, data })
  });

  document.getElementById("comentario").value = "";
  nota = 0;
  atualizarEstrelas(nota);
  mensagem.textContent = 'Obrigado pelo seu feedback!';

  await exibirComentarios();
  await atualizarGraficoPizza();
}

// Excluir comentário
async function excluirComentario(id) {
  await fetch(`${url}/${id}`, { method: "DELETE" });
  await exibirComentarios();
  await atualizarGraficoPizza();
}

// Estrelas interativas
let nota = 0;
const estrelas = document.querySelectorAll('.star');
const botaoEnviar = document.getElementById('enviar');
const campoComentario = document.getElementById('comentario');
const mensagem = document.getElementById('mensagem');

estrelas.forEach((estrela) => {
  estrela.addEventListener('click', () => {
    nota = parseInt(estrela.getAttribute('data-value'));
    atualizarEstrelas(nota);
  });
});

function atualizarEstrelas(notaSelecionada) {
  estrelas.forEach((estrela) => {
    if (parseInt(estrela.getAttribute('data-value')) <= notaSelecionada) {
      estrela.classList.add('selecionada');
    } else {
      estrela.classList.remove('selecionada');
    }
  });
}

botaoEnviar.addEventListener('click', adicionarComentario);

document.addEventListener("DOMContentLoaded", async () => {
  await atualizarGraficoPizza();
  await exibirComentarios();

  document.getElementById("btn-sair")?.addEventListener("click", function (event) {
        event.preventDefault();
        alert("Você foi desconectado com sucesso!");
        sessionStorage.clear();
        window.location.href = '/index.html'; 
    });
});
