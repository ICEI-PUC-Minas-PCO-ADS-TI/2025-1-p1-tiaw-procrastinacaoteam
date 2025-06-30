document.addEventListener('DOMContentLoaded', () => {

    const API_BASE_URL = 'https://procrastinacao.glitch.me';

    const usuarioLogadoString = sessionStorage.getItem('usuario');
    if (!usuarioLogadoString) {
        alert("Você precisa estar logado para acessar esta página.");
        window.location.href = "/login.html"; 
        return;
    }
    const usuarioLogado = JSON.parse(usuarioLogadoString);
    const usuarioId = usuarioLogado.id;


    const form = document.getElementById('formMudaPerfil'); 
    const loginInput = document.getElementById("login");
    const emailInput = document.getElementById("email");
    const senhaInput = document.getElementById("senha");
    const fotoInput = document.getElementById("inputFoto");
    const fotoPerfilHeader = document.getElementById("fotoPerfilHeader");
    const fotoPerfilMain = document.getElementById("fotoPerfilMain");
    const pontosUsuarioSpan = document.getElementById("pontosUsuario"); 
    const btnSalvar = document.getElementById("btn-salvar"); 
    const btnSair = document.getElementById("btn-sair");


    let novaImagemBase64 = ""; 



    function preencherDadosIniciais() {
        if (!usuarioLogado) return;

        loginInput.value = usuarioLogado.login || "";
        emailInput.value = usuarioLogado.email || "";
        senhaInput.value = usuarioLogado.senha || "";

        const fotoAtual = usuarioLogado.foto || "/assets/images/usuario.png";
        fotoPerfilHeader.src = fotoAtual;
        fotoPerfilMain.src = fotoAtual;

        if (pontosUsuarioSpan) {
            pontosUsuarioSpan.textContent = `🔥 ${usuarioLogado.pontuacao || 0}`;
        }
    }


    function handleSelecaoDeFoto() {
        const file = fotoInput.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert("Por favor, selecione um arquivo de imagem válido.");
            fotoInput.value = ''; 
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            novaImagemBase64 = e.target.result;
            fotoPerfilHeader.src = novaImagemBase64;
            fotoPerfilMain.src = novaImagemBase64;
        };
        reader.readAsDataURL(file);
    }


    async function salvarPerfil(event) {
        event.preventDefault(); 

        const login = loginInput.value.trim();
        const email = emailInput.value.trim();
        const senha = senhaInput.value;

        if (!login || !email || !senha) {
            alert("Por favor, preencha todos os campos: Nome, Email e Senha.");
            return;
        }
        
        const fotoParaSalvar = novaImagemBase64 || usuarioLogado.foto;

        const dadosParaAtualizar = {
            login,
            email,
            senha,
            foto: fotoParaSalvar
        };

        try {
            const resposta = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}`, {
                method: "PATCH", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosParaAtualizar)
            });

            if (!resposta.ok) {
                throw new Error("Erro ao atualizar o perfil no servidor.");
            }

            const usuarioAtualizado = await resposta.json();


            sessionStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));

            alert("Perfil atualizado com sucesso!");
            novaImagemBase64 = ""; 

        } catch (err) {
            console.error("Erro ao salvar perfil:", err);
            alert("Erro ao salvar perfil: " + err.message);
        }
    }



    document.getElementById("btnEditarFoto")?.addEventListener("click", () => fotoInput.click()); 

    fotoInput.addEventListener("change", handleSelecaoDeFoto);

    form?.addEventListener('submit', salvarPerfil);
    
    if (btnSair) {
        btnSair.addEventListener("click", function (event) {
            event.preventDefault();
            alert("Você foi desconectado com sucesso!");
            sessionStorage.clear();
            window.location.href = '/index.html'; 
        });
    }


    preencherDadosIniciais();

});
