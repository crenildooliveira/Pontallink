const { google } = require('googleapis');

module.exports = (auth) => {
  // IDs das subpastas no Google Drive
  const subpastaTextId = '19srQ_L1Z2RRl9SUErymV_spZn0WJ8y3o'; // ID da subpasta "text" no Google Drive
  const subpastaImagesId = '13bnECuYzifyM3wHyyQEzjG_O4rttw7kD'; // ID da subpasta "images" no Google Drive
  const subpastaVideosId = '1roDbUKgmLo5cBn0wVn6sd6y56fopSlqJ'; // ID da subpasta "videos" no Google Drive

  // Função para fazer o upload de um arquivo para o Google Drive
  async function uploadArquivo(arquivo, subpastaId) {
    // Verifique se o arquivo e o subpastaId estão definidos
    if (!arquivo || !subpastaId) {
      throw new Error('Arquivo ou subpasta não especificados.');
    }

    try {
      const drive = google.drive({
        version: 'v3',
        auth: auth,
      });

      // Crie um fluxo legível (Readable Stream) a partir dos dados do arquivo
      const { Readable } = require('stream');
      const corpoStream = new Readable();
      corpoStream.push(arquivo.buffer); // Use 'buffer' para obter o conteúdo do arquivo
      corpoStream.push(null);

      // Crie metadados do arquivo
      const fileMetadata = {
        name: arquivo.originalname, // Use o nome original do arquivo
        parents: [subpastaId],
      };

      const media = {
        mimeType: arquivo.mimetype, // Use o tipo MIME do arquivo
        body: corpoStream,
      };

      // Faça o upload do arquivo para o Google Drive
      const respostaDrive = await drive.files.create({
        resource: fileMetadata,
        media: media,
      });

      // O ID do arquivo recém-criado no Google Drive
      const fileId = respostaDrive.data.id;

      return fileId;
    } catch (erro) {
      console.error('Erro ao fazer upload do arquivo no Google Drive:', erro);
      throw erro; // Lance o erro para que ele possa ser tratado fora da função, se necessário
    }
  }

  // Função para enviar e marcar múltiplos arquivos no Google Drive
  async function enviarEMarcarArquivos(arquivos) {
    const idsArquivos = [];

    for (const arquivo of arquivos) {
      if (!arquivo) {
        // Verifique se o arquivo está definido
        continue; // Pule para o próximo arquivo
      }

      let subpastaId;

      if (arquivo.originalname.endsWith('.txt')) {
        subpastaId = subpastaTextId;
      } else if (arquivo.originalname.endsWith('.jpg') || arquivo.originalname.endsWith('.png')) {
        subpastaId = subpastaImagesId;
      } else if (arquivo.originalname.endsWith('.mp4')) {
        subpastaId = subpastaVideosId;
      } else {
        console.error('Tipo de arquivo não suportado:', arquivo.originalname);
        continue; // Ignorar arquivos não suportados
      }

      console.log('Nome do arquivo:', arquivo.originalname);
      console.log('Subpasta ID:', subpastaId);
      
      const fileId = await uploadArquivo(arquivo, subpastaId);
      if (fileId) {
        idsArquivos.push(fileId);
      }
    }

    return idsArquivos;
  }

  // Exporte a função 'enviarEMarcarArquivos'
  return {
    enviarEMarcarArquivos,
  };
};
