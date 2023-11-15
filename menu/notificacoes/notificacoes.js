document.addEventListener('DOMContentLoaded', function () {
  const notificacoesLista = document.getElementById('notificacoes-lista');

  // Função para carregar e exibir notificações de amizade
  function carregarNotificacoes() {
    // Faça uma solicitação AJAX ou fetch para o backend para obter as notificações de amizade
    fetch('/obter-solicitacoes-amizade') // Certifique-se de que a rota corresponda à sua configuração no servidor
      .then((response) => response.json())
      .then((notificacoes) => {
        notificacoesLista.innerHTML = ''; // Limpe a lista de notificações
  
        if (notificacoes.length === 0) {
          notificacoesLista.innerHTML = '<li>Nenhuma notificação de amizade pendente.</li>';
        } else {
          notificacoes.forEach((notificacao) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
              Solicitação de amizade de ${notificacao.nome_remetente}
              <button class="aceitar" data-id-sa="${notificacao.id_sa}">Aceitar</button>
              <button class="recusar" data-id-sa="${notificacao.id_sa}">Recusar</button>
            `;
  
            // Adicione um ouvinte de evento aos botões de aceitar e recusar
            const aceitarBtn = listItem.querySelector('.aceitar');
            const recusarBtn = listItem.querySelector('.recusar');
  
            aceitarBtn.addEventListener('click', () => responderSolicitacao(notificacao.id_sa, 'aceitar'));
            recusarBtn.addEventListener('click', () => responderSolicitacao(notificacao.id_sa, 'recusar'));
  
            notificacoesLista.appendChild(listItem);
          });
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar notificações:', error);
      });
  }
  

  // Função para responder a uma solicitação de amizade
  function responderSolicitacao(id_sa, acao) {
    // Faça uma solicitação AJAX ou fetch para o backend para responder à solicitação
    fetch('/responder-solicitacao-amizade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id_sa, acao }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Resposta da solicitação:', data);
        carregarNotificacoes(); // Recarregue as notificações após responder
      })
      .catch((error) => {
        console.error('Erro ao responder à solicitação:', error);
      });
  }


    // Carregue as notificações quando a página for carregada
    carregarNotificacoes();
  });
