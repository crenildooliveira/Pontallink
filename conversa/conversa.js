document.addEventListener('DOMContentLoaded', function () {
  const mensagensContainer = document.getElementById('mensagens');
  const mensagemInput = document.getElementById('mensagem-input');
  const enviarMensagemButton = document.getElementById('enviar-mensagem');

  const urlParams = new URLSearchParams(window.location.search);
  const idUsuario = urlParams.get('idUsuario');
  const idAmigo = urlParams.get('idAmigo');

  console.log("idUsuario: " + idUsuario + " idAmigo: " + idAmigo)

  // Inicialize o Socket.IO com parâmetros dinâmicos
  const socket = io('https://fee6-179-55-249-205.ngrok-free.app');


  // Adiciona evento para receber mensagens do servidor
  socket.on('mensagemRecebida', (mensagem) => {
    console.log('Mensagem recebida do servidor:', mensagem);
    exibirMensagem(mensagem);
  });

  // Simulação de mensagens (substitua com sua lógica)
  const mensagens = [];

  // Exibe as mensagens existentes
  mensagens.forEach((mensagem) => exibirMensagem(mensagem));

  // Adiciona evento de clique para enviar mensagem
  enviarMensagemButton.addEventListener('click', () => {
    const conteudoMensagem = mensagemInput.value.trim();
    if (conteudoMensagem !== '') {
      const novaMensagem = {
        remetente: idUsuario,
        destinatario: idAmigo,
        conteudo: conteudoMensagem
      };

      // Envia a mensagem para o servidor
      enviarMensagemParaServidor(novaMensagem);

      // Envia a mensagem para o servidor usando Socket.IO
      socket.emit('enviarMensagem', novaMensagem);

      // Exibe a mensagem localmente
      exibirMensagem(novaMensagem);

      // Limpa o campo de entrada
      mensagemInput.value = '';
    }
  });

  // Função para exibir uma mensagem na conversa
  function exibirMensagem(mensagem) {
    console.log('Mensagem recebida para exibição:', mensagem);

    const mensagemElement = document.createElement('div');
    mensagemElement.className = mensagem.remetente === idUsuario ? 'minha-mensagem' : 'outra-mensagem';
    mensagemElement.innerHTML = `<strong>${mensagem.remetente === idUsuario ? 'Eu' : 'Amigo'}:</strong> ${mensagem.conteudo}`;
    mensagensContainer.appendChild(mensagemElement);

    // Rola para baixo para mostrar a última mensagem
    mensagensContainer.scrollTop = mensagensContainer.scrollHeight;
  }

  // Função para enviar a mensagem para o servidor
  function enviarMensagemParaServidor(mensagem) {
    // Faz a solicitação ao servidor para salvar a mensagem
    fetch('/enviar-mensagem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mensagem)
    })
      .then(response => response.json())
      .then(data => {
        // Lida com a resposta do servidor, se necessário
        console.log('Resposta do servidor:', data);
      })
      .catch(error => console.error('Erro ao enviar mensagem:', error));
  }
});
