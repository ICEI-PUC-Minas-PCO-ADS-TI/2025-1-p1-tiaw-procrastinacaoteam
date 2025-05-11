const dados = {
    usuarios: [
        {id: 1, login: "Daniel", email: "danielzin007@gmail,com", senha: "123456"},
        {id: 2, login: "Lucas", email: "lucas556@gmail,com", senha: "123456"}
    ]
}

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


