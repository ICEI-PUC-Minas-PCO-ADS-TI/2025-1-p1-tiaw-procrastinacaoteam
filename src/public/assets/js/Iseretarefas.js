let nivelImportancia = null;

function scrollCarrosselLeft() {
  document.getElementById('criaCard').scrollBy({ left: -270, behavior: 'smooth' });
}

function scrollCarrosselRight() {
  document.getElementById('criaCard').scrollBy({ left: 270, behavior: 'smooth' });
}

function handleDeleteClick() {
  const idData = this.getAttribute('data-id-data');
  const indexTarefa = parseInt(this.getAttribute('data-index-tarefa'));

  if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return;

  fetch(`http://localhost:3000/tarefas/${idData}`)
    .then(res => res.json())
    .then(dia => {
      if (dia && Array.isArray(dia.itens)) {
        dia.itens.splice(indexTarefa, 1);
        if (dia.itens.length === 0) {
          return fetch(`http://localhost:3000/tarefas/${idData}`, { method: 'DELETE' });
        } else {
          return fetch(`http://localhost:3000/tarefas/${idData}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dia)
          });
        }
      }
    })
    .then(() => {
      const usuario = JSON.parse(sessionStorage.getItem('usuario'));
      exibirTarefas(usuario.id);
      alert('Tarefa deletada com sucesso!');
    });
}

function exibirTarefas(usuarioId) {
  const container = document.getElementById('criaCard');
  container.innerHTML = '';

  fetch(`http://localhost:3000/tarefas?usuarioId=${usuarioId}`)
    .then(res => res.json())
    .then(dados => {
      dados.sort((a, b) => new Date(a.DataListada) - new Date(b.DataListada));
      dados.forEach(dia => {
        dia.itens.forEach((tarefa, index) => {
          const card = document.createElement('div');
          card.classList.add('card-tarefa');
          card.classList.add(`imp-${tarefa.nivelImportancia.toLowerCase()}`);

          const dataFormatada = new Date(dia.DataListada + "T00:00:00").toLocaleDateString('pt-BR');

          card.innerHTML = `
            <div class="CardCarrossel">
              <h3>${tarefa.TarefasListada}</h3>
              <p>Data: ${dataFormatada}</p>
              <p>Importância: ${tarefa.nivelImportancia}</p>
              <button class="btn-deletar" data-id-data="${dia.id}" data-index-tarefa="${index}">Deletar</button>
            </div>
          `;
          container.appendChild(card);
        });
      });

      document.getElementById('anterior').onclick = scrollCarrosselLeft;
      document.getElementById('proximo').onclick = scrollCarrosselRight;

      document.querySelectorAll('.btn-deletar').forEach(button => {
        button.onclick = handleDeleteClick;
      });
    })
    .catch(() => alert('Erro ao carregar tarefas. Verifique se o JSON Server está rodando.'));
}

document.addEventListener('DOMContentLoaded', () => {
  const usuario = JSON.parse(sessionStorage.getItem('usuario'));

  if (!usuario || !usuario.id) {
    alert('Sessão expirada. Faça login novamente.');
    window.location.href = "/login.html";
    return;
  }

  exibirTarefas(usuario.id);

  document.querySelector('.inputs-importancia').addEventListener('change', e => {
    if (e.target.checked) nivelImportancia = e.target.value;
  });

  document.getElementById('AddTarefas').addEventListener('submit', e => {
    e.preventDefault();

    const tarefa = document.getElementById("Entrada").value.trim();
    const data = document.getElementById("EntradaData").value;

    if (!tarefa || !data || !nivelImportancia) {
      alert('Por favor, preencha todos os campos e selecione a importância.');
      return;
    }

    // Aqui você pode querer verificar se já existe uma tarefa para esse usuário na mesma data
    // e então atualizar a lista (PUT) ao invés de criar um novo registro (POST).
    // Mas para simplificar, vamos criar sempre um novo registro:

    const dadosParaEnviar = {
      DataListada: data,
      itens: [{
        TarefasListada: tarefa,
        nivelImportancia,
        concluida: false
      }],
      usuarioId: parseInt(usuario.id)
    };

    fetch('http://localhost:3000/tarefas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosParaEnviar)
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao salvar a tarefa');
        return res.json();
      })
      .then(() => {
        alert('Tarefa adicionada com sucesso!');
        document.getElementById('AddTarefas').reset();
        nivelImportancia = null;
        document.querySelectorAll('.inputs-importancia input[type="radio"]').forEach(r => r.checked = false);
        exibirTarefas(usuario.id);
      })
      .catch(erro => alert('Erro ao adicionar tarefa: ' + erro.message));
  });

  document.getElementById('btnCancelar').addEventListener('click', () => {
    document.getElementById('AddTarefas').reset();
    nivelImportancia = null;
    document.querySelectorAll('.inputs-importancia input[type="radio"]').forEach(r => r.checked = false);
  });
});
