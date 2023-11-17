document.addEventListener('DOMContentLoaded', function () {
    const mensagensContainer = document.getElementById('mensagens');
    const mensagemInput = document.getElementById('mensagem-input');
    const enviarMensagemButton = document.getElementById('enviar-mensagem');
  
    // Obtenha o ID do amigo da URL ou de onde quer que você o tenha
    const urlParams = new URLSearchParams(window.location.search);
    const idAmigo = urlParams.get('id');
  
    // Exemplo de ID de usuário logado (substitua com sua lógica)
    const idUsuarioLogado = 1;
  
    // Simulação de mensagens (substitua com sua lógica)
    const mensagens = [
      { remetente: idUsuarioLogado, conteudo: 'Oi, como vai?' },
      { remetente: idAmigo, conteudo: 'Olá! Estou bem, e você?' },
      // Adicione mais mensagens conforme necessário
    ];
  
    // Exiba as mensagens existentes
    mensagens.forEach((mensagem) => exibirMensagem(mensagem));
  
    // Adicione evento de clique para enviar mensagem
    enviarMensagemButton.addEventListener('click', () => {
      const conteudoMensagem = mensagemInput.value.trim();
      if (conteudoMensagem !== '') {
        const novaMensagem = { remetente: idUsuarioLogado, conteudo: conteudoMensagem };
        exibirMensagem(novaMensagem);
  
        // Aqui você pode enviar a mensagem para o servidor ou fazer o que for necessário
        // Exemplo: enviarMensagemParaServidor(idAmigo, conteudoMensagem);
  
        // Limpar o campo de entrada
        mensagemInput.value = '';
      }
    });
  });
  
  // Função para exibir uma mensagem na conversa
  function exibirMensagem(mensagem) {
    const mensagensContainer = document.getElementById('mensagens');
    const mensagemElement = document.createElement('div');
    mensagemElement.className = mensagem.remetente === idUsuarioLogado ? 'minha-mensagem' : 'outra-mensagem';
    mensagemElement.innerHTML = `<strong>${mensagem.remetente === idUsuarioLogado ? 'Eu' : 'Amigo'}:</strong> ${mensagem.conteudo}`;
    mensagensContainer.appendChild(mensagemElement);
  
    // Rolar para baixo para mostrar a última mensagem
    mensagensContainer.scrollTop = mensagensContainer.scrollHeight;
  }
  