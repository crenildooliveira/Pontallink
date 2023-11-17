console.log('Script lista_amigos.js carregado');
document.addEventListener('DOMContentLoaded', function () {
    const amigosLista = document.getElementById('amigos-lista');
    
    // Faz a solicitação à rota /lista-amigos no servidor
    fetch('/lista-amigos')
      .then(response => response.json())
      .then(data => {
        const nomesDosAmigos = data.nomesDosAmigos;
  
        // Adiciona amigos à lista
        nomesDosAmigos.forEach((nomeAmigo) => {
          const amigoItem = document.createElement('li');
          amigoItem.innerHTML = `<button class="iniciar-conversa">${nomeAmigo}</button>`;
          amigosLista.appendChild(amigoItem);
        });
    
        // Adiciona evento de clique aos botões para iniciar a conversa
        const iniciarConversaButtons = document.querySelectorAll('.iniciar-conversa');
        iniciarConversaButtons.forEach((button) => {
          button.addEventListener('click', () => {
            // Aqui você pode implementar a lógica para iniciar a conversa com base no nome do amigo, se necessário
            iniciarConversa(button.textContent);
          });
        });
      })
      .catch(error => console.error('Erro ao obter lista de amigos:', error));
  });
    
  // Função para iniciar a conversa (substitua com sua lógica)
  function iniciarConversa(nomeAmigo) {
    // Redireciona para a página de conversa ou faça o que for necessário
    console.log('Iniciando conversa com o amigo:', nomeAmigo);
    window.location.href = `/conversa/conversa.html?nome=${nomeAmigo}`;
    // Implemente a lógica apropriada para iniciar a conversa com base no nome do amigo
  }
  