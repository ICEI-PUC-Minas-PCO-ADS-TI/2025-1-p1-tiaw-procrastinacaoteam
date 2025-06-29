const apiUrl = "http://localhost:3000/usuarios";

// Variável global para armazenar a imagem em base64 temporariamente
let imagemBase64 = "";

// Verifica se há usuário logado
function verificarLogin() {
    const usuarioLogadoId = sessionStorage.getItem("usuarioLogadoId");
    if (!usuarioLogadoId) {
        alert("Você precisa estar logado para acessar esta página.");
        window.location.href = "/modulos/login/login.html";
        return false;
    }
    return true;
}

document.addEventListener('DOMContentLoaded', () => {
    if (!verificarLogin()) return;

    const usuarioLogadoId = sessionStorage.getItem("usuarioLogadoId");

    fetch(`${apiUrl}/${usuarioLogadoId}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(res.status === 404 ? "Usuário não encontrado." : "Erro ao buscar dados do usuário.");
            }
            return res.json();
        })
        .then(usuario => {
            // Preenche os campos com dados do usuário
            document.getElementById("login").value = usuario.login || "";
            document.getElementById("email").value = usuario.email || "";
            document.getElementById("senha").value = usuario.senha || "";

            // Foto de perfil
            const foto = usuario.foto || "/assets/images/usuario.png";
            document.getElementById("fotoPerfilHeader").src = foto;
            document.getElementById("fotoPerfilMain").src = foto;

            // Pontuação
            document.getElementById("pontosUsuario").textContent = `🔥 ${usuario.pontuacao || 0}`;
        })
        .catch(err => {
            console.error("Erro ao carregar dados do usuário:", err);
            alert("Erro ao carregar dados do usuário: " + err.message);
        });
});

// Lógica de seleção e visualização da nova imagem
document.getElementById("inputFoto").addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert("Por favor, selecione um arquivo de imagem válido.");
            this.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            imagemBase64 = e.target.result;
            document.getElementById("fotoPerfilHeader").src = imagemBase64;
            document.getElementById("fotoPerfilMain").src = imagemBase64;
        };
        reader.readAsDataURL(file);
    }
});

// Ação ao clicar no botão "Edite sua foto"
function editarFoto() {
    document.getElementById("inputFoto").click();
}

// Salva as alterações do perfil
function salvarPerfil() {
    if (!verificarLogin()) return;

    const usuarioLogadoId = sessionStorage.getItem("usuarioLogadoId");

    const login = document.getElementById("login").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    if (!login || !email || !senha) {
        alert("Por favor, preencha todos os campos: Nome, Email e Senha.");
        return;
    }

    // Validação de email simples
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Por favor, insira um email válido.");
        return;
    }

    const fotoParaSalvar = imagemBase64 || document.getElementById("fotoPerfilMain").src;

    const dadosAtualizados = {
        login,
        email,
        senha,
        foto: fotoParaSalvar
    };

    fetch(`${apiUrl}/${usuarioLogadoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAtualizados)
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(res.status === 404 ? "Usuário não encontrado para atualização." : "Erro ao atualizar perfil.");
            }
            return res.json();
        })
        .then(() => {
            alert("Perfil atualizado com sucesso!");
        })
        .catch(err => {
            console.error("Erro ao salvar perfil:", err);
            alert("Erro ao salvar perfil: " + err.message);
        });

        const btnSair = document.getElementById("btn-sair");
    if (btnSair) {
        btnSair.addEventListener("click", function (event) {
            alert("Você foi desconectado com sucesso!");
            event.preventDefault(); 
            sessionStorage.clear(); 
            window.location.href = '/index.html'; 
        });
    } else {
        console.error("Botão 'btn-sair' não encontrado.");
    }
}
