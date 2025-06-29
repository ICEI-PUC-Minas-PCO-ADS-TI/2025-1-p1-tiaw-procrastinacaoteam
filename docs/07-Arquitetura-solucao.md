# Arquitetura da solução

## Funcionalidades


##### Funcionalidade 1 - Cadastro de Tarefas

Permite a entrada, retirada e edição de tarefas do usuário

* **Estrutura de dados:** [Tarefas](#estrutura-de-dados---tarefas)
* **Instruções de acesso:**
  * Abra o site e efetue o login;
  * Acesse a aba de Metas e vá em Inserir Tarefas;
  * Faça cadastro das tarefas a serem feitas.
* **Tela da funcionalidade**:

![Tela de funcionalidade](images/Captura%20de%20tela%20de%202025-05-11%2018-46-57.png)


##### Funcionalidade 2 - Onboarding do usuário

Questionário que permite ao usuário informar sua idade, a quantidade desejada de tarefas por dia, seu perfil, seu objetivo e se o mesmo sofre com distrações em suas atividades diárias.

* **Estrutura de dados:** [Tarefas](#estrutura-de-dados---tarefas)
  
* **Instruções de acesso:**
  * Abra o site e efetue o login;
  * Em seu primeiro login, a aba do questionário será exibida ao usuário, para o mesmo responder as perguntas.
    
 **Tela da funcionalidade**:

![Onboarding](https://github.com/user-attachments/assets/adec34bb-2dfa-45d2-a227-01400f188bcd)

 


### Estruturas de dados

##### Estrutura de dados - Entrada de Tarefas

Para a solução de um site de lista de tarefas gamificado como o ACTION MODE, a estrutura de dados centralizada no db.json precisa ser capaz de armazenar as tarefas diárias e seus atributos, incluindo o estado de conclusão.

A estrutura de dados principal é uma coleção de "dias", onde cada dia contém uma lista de "itens" (tarefas).

```json
{
  "dados": [
    {
      "id": "3d65",
      "DataListada": "2025-05-22",
      "itens": [
        {
          "TarefasListada": "assasll",
          "nivelImportancia": "Alta",
          "concluida": false
        }
      ]
    }
  ]
}
  
```

##### Estrutura de dados - Tarefas cadastradas

Estrutura que armazena a quantidade de pontos e semanas concluídas do usuário, além da quantidade e detalhes das tarefas pendentes ou concluídas.

```json
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
```

##### Estrutura de dados - Dados de Cadastro

O cadastro é de importância fundamental para o ACTION MODE, servindo como a espinha dorsal para a personalização e a experiência gamificada do usuário.

```json
const dados = {
    usuarios: [
        {id: 1, login: "Daniel", email: "danielzin007@gmail,com", senha: "123456"},
        {id: 2, login: "Lucas", email: "lucas556@gmail,com", senha: "123456"}
    ]
}

##### Estrutura de dados - Onboarding

Estrutura localizada na parte de onboarding do usuário, onde é informado sua idade, a quantidade de tarefas desejadas por dia, seu perfil, seu objetivo com o uso do nosso projeto e se sofre com distrações na realização de suas tarefas. 

```json
const onboarding = {  
    idade: idade,
    qnttarefas: qnttarefas,
    perfil: perfil.value,
    objetivo: objetivo.value,
    distracao: distracao.value
};
```
```

### Módulos e APIs

Esta seção apresenta os módulos e APIs utilizados na solução.

**Images**:

* Unsplash - [https://unsplash.com/](https://unsplash.com/) ⚠️ EXEMPLO ⚠️

**Fonts:**

* Icons Font Face - [https://fontawesome.com/](https://fontawesome.com/) ⚠️ EXEMPLO ⚠️

**Scripts:**

* jQuery - [http://www.jquery.com/](http://www.jquery.com/) ⚠️ EXEMPLO ⚠️
* Bootstrap 4 - [http://getbootstrap.com/](http://getbootstrap.com/) ⚠️ EXEMPLO ⚠️

> ⚠️ **APAGUE ESTA PARTE ANTES DE ENTREGAR SEU TRABALHO**
>
> Apresente os módulos e APIs utilizados no desenvolvimento da solução. Inclua itens como: (1) frameworks, bibliotecas, módulos, etc. utilizados no desenvolvimento da solução; (2) APIs utilizadas para acesso a dados, serviços, etc.


## Hospedagem

Optamos por utilizar os serviços de hospedagem da HostGator, que dispõe de um painel de controle fácil e prático para exibição dos arquivos de nosso projeto, bem como um serviço de domínio que possibilita de nosso site estar disponível para acesso na internet.

> **Links úteis**:
> - [Website com GitHub Pages](https://pages.github.com/)
> - [Programação colaborativa com Repl.it](https://repl.it/)
> - [Getting started with Heroku](https://devcenter.heroku.com/start)
> - [Publicando seu site no Heroku](http://pythonclub.com.br/publicando-seu-hello-world-no-heroku.html)
