module.exports = (google) => {
  const subpastaTextId = '19srQ_L1Z2RRl9SUErymV_spZn0WJ8y3o'; // ID da subpasta "text" no Google Drive
  const subpastaImagesId = '13bnECuYzifyM3wHyyQEzjG_O4rttw7kD'; // ID da subpasta "images" no Google Drive
  const subpastaVideosId = '1roDbUKgmLo5cBn0wVn6sd6y56fopSlqJ'; // ID da subpasta "videos" no Google Drive

  // Resto do código...

  // Função para enviar e armazenar múltiplos arquivos no Google Drive
  async function enviarEMarcarArquivos(arquivos) {
    const idsArquivos = [];

    for (const arquivo of arquivos) {
      if (!arquivo) {
        // Verifique se o arquivo está definido
        continue; // Pule para o próximo arquivo
      }

      let subpastaId;

      if (arquivo.name && arquivo.name.endsWith('.txt')) {
        subpastaId = subpastaTextId;
      } else if (arquivo.name && (arquivo.name.endsWith('.jpg') || arquivo.name.endsWith('.png'))) {
        subpastaId = subpastaImagesId;
      } else if (arquivo.name && arquivo.name.endsWith('.mp4')) {
        subpastaId = subpastaVideosId;
      } else {
        console.error('Tipo de arquivo não suportado:', arquivo.name);
        continue; // Ignorar arquivos não suportados
      }

      const fileId = await uploadArquivo(arquivo, subpastaId);
      if (fileId) {
        idsArquivos.push(fileId);
      }
    }

    return idsArquivos;
  }

  // Exportar a função 'enviarEMarcarArquivos'
  return {
    enviarEMarcarArquivos,
  };
};
