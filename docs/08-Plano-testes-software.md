# Plano de testes de software

<span style="color:red">Pré-requisitos: <a href="03-Product-design.md"> Especificação do projeto</a></span>, <a href="05-Projeto-interface.md"> Projeto de interface</a>

O plano de testes de software é gerado a partir da especificação do sistema e consiste em casos de teste que deverão ser executados quando a implementação estiver parcial ou totalmente pronta. Apresente os cenários de teste utilizados na realização dos testes da sua aplicação. Escolha cenários de teste que demonstrem os requisitos sendo satisfeitos.

Enumere quais cenários de testes foram selecionados para teste. Neste tópico, o grupo deve detalhar quais funcionalidades foram avaliadas, o grupo de usuários que foi escolhido para participar do teste e as ferramentas utilizadas.

Não deixe de enumerar os casos de teste de forma sequencial e garantir que o(s) requisito(s) associado(s) a cada um deles esteja(m) correto(s) — de acordo com o que foi definido na <a href="03-Product-design.md">Especificação do projeto</a>.

Por exemplo:

| **Caso de teste**  | **CT-001 – Login de usuário** |
|:---: |:---: |
| Requisito associado | RF-00X - A página inicial do site deverá conter, no canto superior direito, a aba "Login". |
| Objetivo do teste | Verificar se o login funciona de acordo com o necessário. |
| Passos | - Acessar o navegador <br> - Informar a URL do projeto https://actionmode.online/index.html <br> - Ir em "Login" <br> - Preencher os campos "usuário" e "senha" <br> - Clicar em "Login" <br>  |
| Critério de êxito | - Alerta com a mensagem "Login bem sucedido!" e acesso disponível ao site |
| Responsável pela elaboração do caso de teste | Vinicius Muniz |

<br>

| **Caso de teste**  | **CT-002 – Inserir tarefas**   |
|:---: |:---: |
| Requisito associado | RF-00Y - Necessário acesso ao site, com login e senha já cadastrados. |
| Objetivo do teste | Verificar se a funcionalidade de inserir tarefas está funcionando normalmente. |
| Passos | - Acessar o navegador <br> - Informar o endereço do site https://actionmode.online/index.html <br> - Fazer Login <br> - Acessar a aba "Calendário", na aba lateral <br> - Ir em "Inserir tarefas" <br> - Preencher os campos necessários <br> - Clicar em "Adicionar" |
| Critério de êxito | - Alerta de "Tarefa salva com sucesso!" e tarefa sendo constada nas abas "Calendário" e "Progresso" |
| Responsável pela elaboração do caso de teste | Vinicius Muniz |

<br>

| **Caso de teste**  | **CT-003 – Assinalar tarefas concluídas **  |
|:---: |:---: |
| Requisito associado | RF-00Z - Necessário acesso ao site e inclusão de tarefas pela aba "Calendário"  |
| Objetivo do teste | Verificar sistema de pontos e alteração de tarefas pendentes para concluídas |
| Passos | - Acessar o navegador <br> - Informar o endereço do site https://actionmode.online/index.html <br> - Fazer Login <br> - Acessar a aba "Missões" <br> - Selecionar data informada anteriormente no cadastro de tarefas <br> - Marcar o checkbox da tarefa |
| Critério de êxito | - Alteração de campo da tarefa de "Pendente" para "Concluída" na aba "Progresso" do site |
| Responsável pela elaboração do caso de teste | Vinicius Muniz |

<br>

| **Caso de teste**  | **CT-004 – Edição de perfil **  |
|:---: |:---: |
| Requisito associado | RF-00A - Login previamente cadastrado no site  |
| Objetivo do teste | Verificar edição de dados e novo login com o novo acesso informado |
| Passos | - Acessar o navegador <br> - Informar o endereço do site https://actionmode.online/index.html <br> - Fazer Login <br> - Acessar a aba "Configurações" <br> - Preencher os campos de nome, e-mail e senha com novos dados  <br> - Ir em "Salvar Alterações" |
| Critério de êxito | - Alerta com mensagem "Perfil atualizado com sucesso!" e login disponível com novas informações inseridas |
| Responsável pela elaboração do caso de teste | Vinicius Muniz |


## Ferramentas de testes (opcional)

Para testar as funcionalidades do nosso site, utilizamos os navegadores Google Chrome e Microsoft Edge, além da plataforma HostGator para visualizarmos os resultados.
 
