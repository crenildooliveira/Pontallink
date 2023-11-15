document.addEventListener('DOMContentLoaded', function () {
    // Função para redirecionar para perfil
    function redirecionarParaPerfil() {
        window.parent.location.href = '/perfil/perfil.html'; // Substitua pelo caminho correto
    }

    // Adiciona um evento de clique à imagem
    var fotoElement = document.getElementById("foto");
    if (fotoElement) {
        fotoElement.addEventListener("click", redirecionarParaPerfil);
    }
});