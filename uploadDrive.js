module.exports = (google) => {
  const nomeArquivo = 'meu-arquivo.txt'; // Nome do arquivo (pode ser gerado dinamicamente)
  const conteudoArquivo = 'Conteúdo do meu arquivo de texto'; // Conteúdo do arquivo de texto

  // IDs das subpastas no Google Drive
  const subpastaTextId = '19srQ_L1Z2RRl9SUErymV_spZn0WJ8y3o'; // ID da subpasta "text" no Google Drive
  const subpastaImagesId = '13bnECuYzifyM3wHyyQEzjG_O4rttw7kD'; // ID da subpasta "images" no Google Drive
  const subpastaVideosId = '1roDbUKgmLo5cBn0wVn6sd6y56fopSlqJ'; // ID da subpasta "videos" no Google Drive

  // Configuração de autenticação com a chave de API
  const auth = new google.auth.GoogleAuth({
    keyFile: './json/googleApi.json', // Substitua pelo caminho da sua chave de API
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  // Fazer upload de um arquivo para a pasta adequada com base na extensão do arquivo
  async function uploadArquivo(arquivo) {
    let fileMetadata;

    // Verifique o tipo de arquivo e defina a subpasta de destino correta
    if (arquivo.name.endsWith('.txt')) {
      fileMetadata = {
        name: arquivo.name,
        parents: [subpastaTextId],
      };
    } else if (arquivo.name.endsWith('.jpg') || arquivo.name.endsWith('.png')) {
      fileMetadata = {
        name: arquivo.name,
        parents: [subpastaImagesId],
      };
    } else if (arquivo.name.endsWith('.mp4')) {
      fileMetadata = {
        name: arquivo.name,
        parents: [subpastaVideosId],
      };
    } else {
      console.error('Tipo de arquivo não suportado');
      return;
    }

    const media = {
      mimeType: arquivo.mimeType, // Tipo de mídia do arquivo
      body: arquivo.buffer, // Conteúdo do arquivo
    };

    const driveResponse = await google.drive('v3').files.create({
      resource: fileMetadata,
      media: media,
      auth: auth,
    });

    console.log('Arquivo enviado com sucesso. ID:', driveResponse.data.id);
  }

  // Exporte a função 'uploadArquivo'
  return {
    uploadArquivo
  };
};
