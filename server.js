const express = require('express');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const session = require('express-session');
const passport = require('./passport'); // Importe o arquivo passport.js que você criou
const multer = require('multer');
const upload = multer();

// Importe o arquivo uploadDrive.js
const { enviarEMarcarArquivos, auth } = require('./uploadDrive'); // Obtenha a configuração de autenticação e a função enviarEMarcarArquivos

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

// Middleware para verificar a autenticação do usuário
function verificaAutenticacao(req, res, next) {
  if (req.isAuthenticated()) {
    // O usuário está autenticado, siga para a próxima etapa
    return next();
  } else {
    // O usuário não está autenticado, envie uma resposta não autorizada
    res.status(401).json({ erro: 'Usuário não autenticado' });
  }
}


// Rota para lidar com o login
app.post('/login', passport.authenticate('local', {
  successRedirect: '/feed/feed.html', // Redireciona em caso de sucesso
  failureRedirect: '/login.html', // Redireciona em caso de falha
  failureFlash: true // Ativar mensagens flash para mensagens de erro
}));

// Rota para lidar com o envio de publicações (POST)
app.post('/enviar-publicacao', upload.fields([{ name: 'imagem', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  try {
    // Acessar os dados do corpo da solicitação (texto)
    const { texto } = req.body;

    // Acessar os arquivos enviados (imagem e vídeo)
    const imagem = req.files && req.files['imagem'] ? req.files['imagem'][0] : null;
    const video = req.files && req.files['video'] ? req.files['video'][0] : null;

    // Recupere o ID do usuário autenticado da variável de sessão do Passport.js
    const idusuarios = req.user.idusuarios; // Substitua 'id' pelo nome do campo que armazena o ID do usuário em seu modelo de usuário

    console.log('Arquivo texto:', texto);
    console.log('Arquivo imagem:', imagem);
    console.log('Arquivo vídeo:', video);


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
        
