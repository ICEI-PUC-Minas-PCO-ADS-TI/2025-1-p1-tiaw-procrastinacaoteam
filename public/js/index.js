
let usuarios = null;

function CheckLoggerUser(){
    const usuariostr = sessionStorage.getItem(`usuario`);
    if(usuariostr){
        location.href ='login.htm';
    }

    usuario = JSON.parse(usuariostr)
    return true;

}

function loginUser (login, password){
    const usuarioObj = dados.usuarios.find(elem => (elem.login === login) && (elem.senha === password))

    if(!usuarioObj)
        return false;
    else{
        sessionStorage.setItem(`usuario`, JSON.stringify(usuarioObj))
        return true;
    }
} 

function logoutUser(){
    sessionStorage.clear()
    location.href = "login.html"
}

document.addEventListener('DOMContentLoaded', () => {
    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuario'));
    if (usuarioLogado) {
    nomeUsuario.textContent = `Olá, ${usuarioLogado.login}`;
  }
    });


const informacoes = {
  "Carrossel": [
    {
      "id": 1,
      "pagina": "Missões",
      "imagem": "/img/missoes.png",
      "detalhes": "Aqui você acessa suas missões diárias sendo necessário conclui-las para receber pontos",
      "link": "missoes.html"
    },
    {
      "id": 2,
      "pagina": "Calendario",
      "imagem": "/img/calendario.png",
      "detalhes": "Aqui no calendário você poderá acompanhar quais dias você interagiu e completou as tarefas do site, além de marcar datas, compromissos, ou relatar algo que ocorreu no dia, dentre outros...",
      "link": "metas.html"
    },
    {
      "id": 3,
      "pagina": "Progresso",
      "imagem": "/img/progresso.png",
      "detalhes": "Aqui você pode avaliar como tem percorrido os dias dentro do desafio e as estátisticas acerca desse progresso.",
      "link": "progresso.html"
    },
    {
      "id": 4,
      "pagina": "Configurações",
      "imagem": "/img/configuracoes.jpg",
      "detalhes": "Aqui você acessa as configurações do site, para deixar sua experiência a melhor possível.",
      "link": "configuracoes.html"
    },
    {
      "id": 5,
      "pagina": "Saiba mais",
      "imagem": "/img/SaibaMais.png",
      "detalhes": "Aqui você fica informado sobre como funciona a procastinação e como ela afeta diretamente a sua vida",
      "link": "about.html"
    }
  ]
};

const carrossel = document.getElementById("carrossel");

informacoes.Carrossel.forEach(item => {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img src="${item.imagem}" alt="${item.pagina}" />
    <h2>${item.pagina}</h2>
    <p>${item.detalhes}</p>
    ${item.link ? `<a href="${item.link}">Acessar</a>` : ""}
  `;
  carrossel.appendChild(card);
});

let index = 0;

const updateCarousel = () => {
  carrossel.style.transform = `translateX(-${index * 100}%)`;
};

document.getElementById("nextBtn").addEventListener("click", () => {
  if (index < informacoes.Carrossel.length - 1) {
    index++;
    updateCarousel();
  }
});

document.getElementById("prevBtn").addEventListener("click", () => {
  if (index > 0) {
    index--;
    updateCarousel();
  }
});


setInterval(() => {
  index = (index + 1) % informacoes.Carrossel.length;
  updateCarousel();
}, 5000); 


