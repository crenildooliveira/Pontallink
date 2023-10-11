const express = require('express');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const multer = require('multer');
const session = require('express-session');
const passport = require('./passport'); // Importe o arquivo passport.js que você criou

const uploadDrive = require('./uploadDrive');
const uploadDriveInstance = uploadDrive(google);


// Configuração do multer para o armazenamento de arquivos
const storage = multer.memoryStorage(); // Use a memória para armazenar os arquivos, você pode escolher outro local, se desejar
const upload = multer({ storage: storage });

// Configuração do Express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secretpass', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Configurar middleware para servir arquivos CSS da pasta /login
app.use('/login', express.static(__dirname + '/login'));

// Configurar middleware para servir arquivos CSS de outro diretório (form.css)
app.use('/form', express.static(__dirname + '/form'));

// Configurar middleware para servir arquivos estáticos da pasta /feed
app.use('/feed', express.static(__dirname + '/feed'));

// Configurar middleware para servir arquivos estáticos da pasta /perfil
app.use('/perfil', express.static(__dirname + '/perfil'));

// Configurar middleware para servir arquivos estáticos da pasta /publicacao
app.use('/publicacao', express.static(__dirname + '/publicacao'));

// Configurar o middleware body-parser para analisar os dados JSON enviados no corpo das solicitações
app.use(bodyParser.json());

// Configurar middleware para analisar dados do formulário
app.use(express.urlencoded({ extended: true }));

// Middleware para verificar a autenticação do usuário
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); // O usuário está autenticado, prossiga
  } else {
    res.status(401).json({ erro: 'Usuário não autenticado' });
  }
}

// Configuração de autenticação com a chave de API do Google Drive
const auth = new google.auth.GoogleAuth({
  keyFile: '/json/googleApi.json',
  scopes: ['https://www.googleapis.com/auth/drive'],
});

// Inicialize o cliente do Google Drive
const drive = google.drive({
  version: 'v3',
  auth: auth,
});

// Configuração do banco de dados MySQL
const mysql = require('mysql');
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '@Eumesmo01',
  database: 'form',
});

// Conectar ao banco de dados
db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conexão com o banco de dados MySQL estabelecida');
});

// Rota para a página inicial
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/login/login.html'); // Substitua 'index.html' pelo caminho correto do seu arquivo HTML
});

// Rota para a página de feed (GET)
app.get('/feed', (req, res) => {
  res.sendFile(__dirname + '/feed/feed.html'); // Substitua 'feed.html' pelo caminho correto do seu arquivo HTML de feed
});

// Rota para a página de perfil (GET)
app.get('/perfil', (req, res) => {
  res.sendFile(__dirname + '/perfil/perfil.html'); // Substitua 'perfil.html' pelo caminho correto do seu arquivo HTML de perfil
});

// Rota para a página de registro (GET)
app.get('/registrar', (req, res) => {
  res.sendFile(__dirname + '/form/form.html'); // Substitua 'form.html' pelo caminho correto do seu arquivo HTML de registro
});

// Rota para a página de publicação (GET)
app.get('/publicacao', (req, res) => {
  res.sendFile(__dirname + '/publicacao/publicacao.html'); // Substitua 'publicacao.html' pelo caminho correto do seu arquivo HTML de publicação
});

// Rota para lidar com o envio do formulário
app.post('/enviar-formulario', (req, res) => {
  // Obter os dados do formulário do corpo da solicitação
  const { nome, email, senha, telefone, genero, data_nascimento } = req.body;

  // Hash da senha antes de armazená-la no banco de dados
  bcrypt.hash(senha, 10, (err, hash) => {
    if (err) {
      console.error('Erro ao gerar o hash da senha:', err);
      res.status(500).send('Erro interno do servidor');
      return;
    }

    // Inserir os dados no banco de dados, incluindo o hash da senha
    const query = 'INSERT INTO usuarios (nome, email, senha, telefone, sexo, data_nasc) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [nome, email, hash, telefone, genero, data_nascimento], (err, result) => {
      if (err) {
        console.error('Erro ao inserir dados no banco de dados:', err);
        res.status(500).send('Erro interno do servidor');
        return;
      }

      console.log('Dados inseridos com sucesso no banco de dados');

      // Redirecionar o usuário para a página de login após o envio bem-sucedido
      res.redirect('/login/login.html');
    });
  });
});

// Rota para lidar com o login
app.post('/login', passport.authenticate('local', {
  successRedirect: '/feed/feed.html', // Redireciona em caso de sucesso
  failureRedirect: '/login.html', // Redireciona em caso de falha
  failureFlash: true // Ativar mensagens flash para mensagens de erro
}));


// Middleware de autenticação personalizado para verificar se o usuário está autenticado
function verificaAutenticacao(req, res, next) {
  if (req.isAuthenticated()) {
    // O usuário está autenticado, siga para a próxima etapa
    return next();
  } else {
    // O usuário não está autenticado, envie uma resposta não autorizada
    res.status(401).json({ erro: 'Usuário não autenticado' });
  }
}

// Função para enviar e armazenar múltiplos arquivos no Google Drive
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

    const fileId = await uploadArquivo(arquivo, subpastaId);
    if (fileId) {
      idsArquivos.push(fileId);
    }
  }

  return idsArquivos;
}


  // Exporte a função 'enviarEMarcarArquivos'
  module.exports = enviarEMarcarArquivos;

// Rota para lidar com o envio de publicações (POST) usando Multipart
app.post('/enviar-publicacao', verificaAutenticacao, upload.fields([{ name: 'texto', maxCount: 1 }, { name: 'imagem', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {

  try {
    // Acessar os dados do corpo da solicitação (texto)
    const { texto } = req.body;

    // Acessar os arquivos enviados (imagem e vídeo)
    const imagem = req.files && req.files['imagem'] ? req.files['imagem'][0] : null;
    const video = req.files && req.files['video'] ? req.files['video'][0] : null;
    

    // Recupere o ID do usuário autenticado da variável de sessão do Passport.js
    const idusuarios = req.user.idusuarios; // Substitua 'id' pelo nome do campo que armazena o ID do usuário em seu modelo de usuário

    // Função para criar um arquivo no Google Drive na pasta especificada
    async function criarArquivoNoDrive(nomeArquivo, pastaID, mimeType, corpo) {
      try {
        const fileMetadata = {
          name: nomeArquivo,
          parents: [pastaID],
        };

        // Crie um fluxo legível (Readable Stream) a partir dos dados do corpo (corpo)
        const { Readable } = require('stream');
        const corpoStream = new Readable();
        corpoStream.push(corpo);
        corpoStream.push(null);

        const media = {
          mimeType: mimeType,
          body: corpoStream,
        };

        // Certifique-se de que "drive" e "auth" estejam configurados corretamente
        const driveResponse = await drive.files.create({
          resource: fileMetadata,
          media: media,
          auth: auth,
        });

        console.log(`Arquivo "${nomeArquivo}" criado com sucesso no Google Drive. ID: ${driveResponse.data.id}`);

        return driveResponse; // Retorne o driveResponse após a criação do arquivo
      } catch (error) {
        console.error('Erro ao criar o arquivo no Google Drive:', error);
        throw error; // Lance o erro para que ele possa ser tratado fora da função, se necessário
      }
    }

    // Chame a função enviarEMarcarArquivos
    const arquivos = [texto, imagem, video];
    const idsArquivos = await enviarEMarcarArquivos(arquivos);

    // Suponha que você já tenha os arquivos texto, imagem e vídeo disponíveis
    const fileIdTexto = idsArquivos[0]; // O primeiro ID é do texto
    const fileIdImagem = idsArquivos[1]; // O segundo ID é da imagem
    const fileIdVideo = idsArquivos[2]; // O terceiro ID é do vídeo

    // Insira a publicação no banco de dados, incluindo os IDs dos arquivos e o ID do usuário
    const query = 'INSERT INTO publicacoes (idusuarios, file_id_texto, file_id_imagem, file_id_video) VALUES (?, ?, ?, ?)';
    db.query(query, [idusuarios, fileIdTexto, fileIdImagem, fileIdVideo], (err, result) => {
      if (err) {
        console.error('Erro ao inserir a publicação no banco de dados:', err);
        // Lide com o erro de inserção, se necessário
        res.status(500).json({ erro: 'Ocorreu um erro ao inserir a publicação no banco de dados' });
        return;
      }

      console.log('Publicação inserida com sucesso no banco de dados');
      res.json({ mensagem: 'Publicação recebida e arquivos criados com sucesso no Google Drive' });
    });
  } catch (error) {
    console.error('Erro ao processar a publicação:', error);
    res.status(500).json({ erro: 'Ocorreu um erro ao processar a publicação' });
  }
});


// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor está ouvindo na porta ${port}`);
});
