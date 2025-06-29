const apiUrl = "http://localhost:3000/usuarios"; 

async function loginUser(login, password) {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Erro ao buscar usuários');

        const usuarios = await response.json();
        const usuarioEncontrado = usuarios.find(u => u.login === login && u.senha === password);

        if (usuarioEncontrado) {
            sessionStorage.setItem('usuario', JSON.stringify(usuarioEncontrado));
            sessionStorage.setItem('usuarioLogadoId', usuarioEncontrado.id);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Erro durante o login:', error);
        return false;
    }
}

document.getElementById('formlogin').addEventListener('submit', async (event) => {
    event.preventDefault();

    const login = document.getElementById('loginInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();

    try {
        const response = await fetch(apiUrl);
        const usuarios = await response.json();
        const usuarioExiste = usuarios.find(u => u.login === login);

        if (usuarioExiste) {
            const sucesso = await loginUser(login, password);
            if (sucesso) {
                alert('Login bem-sucedido!');
                window.location.href = '/index.html';
            } else {
                alert('Senha incorreta!');
            }
        } else {
            alert('Usuário não encontrado! Redirecionando para cadastro...');
            window.location.href = 'cadastro.html';
        }
    } catch (erro) {
        console.error('Erro ao tentar login:', erro);
        alert('Erro ao tentar login. Tente novamente.');
    }
});

document.getElementById('btn2').addEventListener('click', () => {
    window.location.href = 'cadastro.html';
});
