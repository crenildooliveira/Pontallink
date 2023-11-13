// Função para iniciar a pesquisa com o ID do usuário
function iniciarPesquisa(idUsuario) {
  console.log('ID do usuário na pesquisa.js:', idUsuario);

  const inputSearch = document.getElementById('searchInput');
  const searchResults = document.getElementById('results');

  inputSearch.addEventListener('input', async (event) => {
    const searchTerm = event.target.value;
    searchResults.innerHTML = '';

    if (searchTerm.trim() === '') {
      return;
    }

    try {
      const response = await fetch(`/menu/pesquisa?q=${searchTerm}&idUsuario=${idUsuario}`);
      const data = await response.json();
      console.log('Dados recebidos:', data);

      if (data.resultsWithId && Array.isArray(data.resultsWithId)) {
        const resultsWithId = data.resultsWithId;

        resultsWithId.forEach((user) => {
          const userElement = document.createElement('li');
          userElement.innerHTML = `
            <span>${user.nome}</span>
            <button class="enviar-amizade-btn" data-id-usuario="${user.idusuarios}">Enviar Solicitação de Amizade</button>
          `;
          searchResults.appendChild(userElement);
        });
      } else {
        console.error('Erro ao processar os dados recebidos. Formato inválido.');
      }
    } catch (error) {
      console.error('Erro ao realizar a pesquisa:', error);
    }
  });

  searchResults.addEventListener('click', async (event) => {
    if (!event.target.classList.contains('enviar-amizade-btn')) {
      return;
    }

    
    const button = event.target;
    const idUsuarioDestinatario = button.getAttribute('data-id-usuario');

    if (!idUsuarioDestinatario) {
      console.error('Erro: idUsuarioDestinatario está vazio ou nulo.');
      return;
    }

     // Adicionando console.log aqui
    console.log('Conteúdo da Solicitação:', { idUsuario, idUsuarioDestinatario });

    try {
      const data = {
        id_destinatario: idUsuarioDestinatario,
        id_remetente: idUsuario
      };

      const response = await fetch('/enviar-solicitacao-amizade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erro na solicitação de amizade: ' + response.statusText);
      }

      const responseData = await response.json();
      console.log('Resposta do servidor:', responseData);
    } catch (error) {
      console.error('Erro ao enviar solicitação de amizade:', error);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('/menu/registro-id-usuario')
    .then(response => response.json())
    .then(data => {
      const idUsuarioElement = document.getElementById('idUsuario');
      let idUsuario = idUsuarioElement ? parseInt(idUsuarioElement.value, 10) || 0 : 0;

      if (data.idUsuario) {
        idUsuario = data.idUsuario;
        console.log('ID do usuário após o carregamento da pesquisa.html:', idUsuario);
        iniciarPesquisa(idUsuario);
      } else {
        console.error('Erro: ID do usuário não encontrado após o carregamento da pesquisa.html');
      }
    })
    .catch(error => {
      console.error('Erro ao obter o ID do usuário:', error);
    });
});
