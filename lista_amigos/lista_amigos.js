console.log('Script lista_amigos.js carregado');
document.addEventListener('DOMContentLoaded', function () {
  const amigosLista = document.getElementById('amigos-lista');

  // Faz a solicitação à rota /lista-amigos no servidor
  fetch('/lista-amigos')
    .then(response => response.json())
    .then(data => {
      const nomesDosAmigos = data.nomesDosAmigos;
      const idsDosAmigos = data.idsDosAmigos; // Corrigido para acessar idsDosAmigos
      const idUsuario = data.idUsuario;

      // Adiciona amigos à lista
      nomesDosAmigos.forEach((nomeAmigo, index) => {
        const amigoItem = document.createElement('li');
        amigoItem.innerHTML = `<button class="iniciar-conversa" data-id="${idsDosAmigos[index]}">${nomeAmigo}</button>`;
        amigosLista.appendChild(amigoItem);
      });

      // Adiciona evento de clique aos botões para iniciar a conversa
      const iniciarConversaButtons = document.querySelectorAll('.iniciar-conversa');
      iniciarConversaButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const idAmigo = button.getAttribute('data-id'); // Obtém o ID do atributo data-id
          iniciarConversa(idUsuario, idAmigo, button.textContent);
        });
      });
    })
    .catch(error => console.error('Erro ao obter lista de amigos:', error));
});

// Função para iniciar a conversa (substitua com sua lógica)
function iniciarConversa(idUsuario, idAmigo, nomeAmigo) {
  // Redireciona para a página de conversa ou faça o que for necessário
  console.log(`Usuario ${idUsuario}, iniciando conversa com o amigo ${nomeAmigo} (IDamigo: ${idAmigo})`);
  // Redireciona para a página de conversa incluindo os IDs como parâmetros na URL
  window.location.href = `/conversa/conversa.html?idUsuario=${idUsuario}&idAmigo=${idAmigo}`;

}
