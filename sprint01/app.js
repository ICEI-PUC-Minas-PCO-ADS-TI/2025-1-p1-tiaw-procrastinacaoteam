
const informacoes = [
    {
        pontos: 500,
        semanas: 3,

        tarefas: [
            {
                id: 20,
                tipo:'concluídas',
                itens: [
                    {"id": 1, "tarefa": "Arrumar o carro"},
                    {"id": 2, "tarefa": "Lavar vasilhas"},
                    {"id": 3, "tarefa": "Estudar DIW"},
                    {"id": 4, "tarefa": "Consertar geladeira"},
                    {"id": 5, "tarefa": "Ir para a academia"}
                ]
            },
            {
                id: 30,
                tipo:'pendentes',
                itens: [
                    {"id": 6, "tarefa": "Lavar o banheiro"},
                    {"id": 7, "tarefa": "Enviar relatório mensal"},
                    {"id": 8, "tarefa": "Comprar ingredientes"},
                    {"id": 9, "tarefa": "Organizar gavetas"},
                    {"id": 10, "tarefa": "Remarcar consulta"}
                    

                ]
            }
        ]
    }
]

        //Interação de RETROSPECTO.HTML

        window.onload = function () {
            let tela = document.getElementById('tela')

        for(let i = 0; i < informacoes.length; i++) {
            dado = informacoes[i]  //se refere ao meu JSON 

            tela.innerHTML += `<div id='dados'> <div class='dadosjs'>PONTOS: ${dado.pontos} </div><br>
            <br>
            <div class='dadosjs'>SEMANA ${dado.semanas} </div> <br>
            <br>
            <div class='dadosjs'><a href="detalhes.html?id=${dado.tarefas[0].id}">TAREFAS CONCLUÍDAS: ${dado.tarefas[0].itens.length}</a> </div> <br>  
            <br>
            <div class='dadosjs'><a href="detalhes.html?id=${dado.tarefas[1].id}">TAREFAS PENDENTES: ${dado.tarefas[1].itens.length}</a> </div> <br>
            <br> </div>`
             //os dois arrays do meu json
            
        }

        let ultimo = informacoes[informacoes.length - 1];
        let total = ultimo.tarefas[0].itens.length + ultimo.tarefas[1].itens.length;
        let percentual = (ultimo.tarefas[0].itens.length / total) * 100;


        tela.innerHTML += "<p id='p-grafico'>Porcentagem: " + percentual + "% das tarefas concluídas</p>"
        }
        


        
        
        //Interação da página DETALHES.HTML
        let params = new URLSearchParams(location.search) 
        let id = params.get('id')
        let exibicao1 = document.getElementById('exibicao')

        const tarefas = informacoes[0].tarefas  //acessa o array tarefas do meu JSON

        const exibicao = tarefas.find(function (t) {return t.id == id})
        

        if (exibicao) {
            exibicao1.innerHTML += `<header class='cabecalho'><h1>Tarefas ${exibicao.tipo}</h1></header>`;
            exibicao.itens.forEach(item => {  //foreach vai passar pelo meus itens
                exibicao1.innerHTML += `<div id='tarefas-exibidas'><li>${item.tarefa}</li></div> <br>`
            });

        }
        else {
            exibicao1.innerHTML = "URL inválida. Tente novamente..."
        }
        
        
  


 






