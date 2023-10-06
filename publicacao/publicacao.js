// Função para redirecionar para Publicacao
function redirecionarParaPublicacao() {
    window.location.href = '/publicacao/publicacao.html'; // Substitua pelo caminho correto
  }

// Função para exibir a pré-visualização da imagem
document.getElementById('imagem').addEventListener('change', function () {
  const preview = document.getElementById('preview-imagem');
  preview.innerHTML = ''; // Limpar a pré-visualização anterior
  const file = this.files[0];
  
  if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
          const img = new Image();
          img.src = e.target.result;
          preview.appendChild(img);
      };
      reader.readAsDataURL(file);
  }
});

// Adicione o evento de alteração para o input de vídeo
document.getElementById('video').addEventListener('change', function (event) {
  const videoInput = event.target;
  const previewVideo = document.getElementById('preview-video');

  if (videoInput.files && videoInput.files[0]) {
      const videoFile = videoInput.files[0];
      const videoURL = URL.createObjectURL(videoFile);

      // Crie um elemento de vídeo para a pré-visualização
      const videoElement = document.createElement('video');
      videoElement.src = videoURL;
      videoElement.controls = true;

      // Remova a pré-visualização anterior (se houver)
      while (previewVideo.firstChild) {
          previewVideo.removeChild(previewVideo.firstChild);
      }

      // Adicione o elemento de vídeo à pré-visualização
      previewVideo.appendChild(videoElement);
  }
});

// Modifique a função enviarMensagem() para lidar com o envio de arquivos usando Multipart
function enviarMensagem() {
  const texto = document.getElementById('texto').value;
  const imagem = document.getElementById('imagem').files[0];
  const video = document.getElementById('video').files[0];

  const formData = new FormData();
  formData.append('texto', texto);
  formData.append('imagem', imagem);
  formData.append('video', video);

  fetch('/enviar-mensagem', {
      method: 'POST',
      body: formData,
  })
  .then((response) => response.json())
  .then((data) => {
      console.log('Mensagem enviada com sucesso:', data);
      // Limpar o campo de texto e a seleção de arquivos após o envio
      document.getElementById('texto').value = '';
      document.getElementById('imagem').value = '';
      document.getElementById('video').value = '';
  })
  .catch((error) => {
      console.error('Erro ao enviar mensagem:', error);
  });
}


// Chamar a função de exibição de pré-visualização da imagem
exibirPreviewImagem();
