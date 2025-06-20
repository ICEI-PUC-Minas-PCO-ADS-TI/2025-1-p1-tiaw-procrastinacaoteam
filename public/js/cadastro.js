
//Cadastro de usuário
document.querySelector('.btn').addEventListener('click', async () => {
            const inputs = document.querySelectorAll('.lista');
            const nome = inputs[0].value.trim();
            const email = inputs[1].value.trim();
            const senha = inputs[2].value;
            const confirmarSenha = inputs[3].value;

            if (!nome || !email || !senha || !confirmarSenha) {
                alert('Por favor, preencha todos os campos.');
                return;
            }

            if (senha !== confirmarSenha) {
                alert('As senhas não coincidem. Tente novamente.');
                return;
            }

            try {
                const checar = await fetch(`http://localhost:3000/usuarios?login=${nome}`);
                const existentes = await checar.json();

                if (existentes.length > 0) {
                    alert('Usuário já cadastrado. Escolha outro nome de usuário.');
                    return;
                }

                const responseTodos = await fetch('http://localhost:3000/usuarios');
                const todosUsuarios = await responseTodos.json();

                const idsNumericos = todosUsuarios
                    .map(u => parseInt(u.id))
                    .filter(id => !isNaN(id));

                const maiorId = idsNumericos.length > 0 ? Math.max(...idsNumericos) : 0;
                const novoId = maiorId + 1;

                const novoUsuario = {
                    id: String(novoId),
                    login: nome,
                    email: email,
                    senha: senha
                };

                if (senha.length < 6) {
                    alert('A senha deve ter pelo menos 6 caracteres.');
                    return;
                }

                const resposta = await fetch('http://localhost:3000/usuarios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(novoUsuario)
                });

                if (resposta.ok) {
                    const usuarioCriado = await resposta.json();
                    sessionStorage.setItem('usuario', JSON.stringify(usuarioCriado));
                    alert('Conta criada com sucesso!');
                    window.location.href = 'index.html';
                } else {
                    alert('Erro ao criar a conta. Tente novamente.');
                }
            } catch (erro) {
                console.error('Erro:', erro);
                alert('Erro ao conectar com o servidor.');
            }
        });

        document.getElementById('btn3').addEventListener('click', () => {
            window.location.href = 'login.html';
        });
