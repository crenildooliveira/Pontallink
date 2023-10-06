const express = require('express');
const app = express();
const port = 3000; // Porta do servidor
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const multer = require('multer');


const uploadArquivo = require('./uploadDrive.js')(google); // Substitua pelo caminho correto para o seu arquivo uploadDrive.js

// Configuração do multer para o armazenamento de arquivos
const storage = multer.memoryStorage(); // Use a memória para armazenar os arquivos, você pode escolher outro local, se desejar
const upload = multer({ storage: storage });


// Agora você pode usar a função uploadArquivo() quando precisar fazer upload de arquivos.


// Configurar middleware para servir arquivos CSS da pasta /login
app.use('/login', express.static(__dirname + '/login'));

// Configurar middleware para servir arquivos CSS de outro diretório (form.css)
app.use('/form', express.static(__dirname + '/form'));

// Configurar middleware para servir arquivos estáticos da pasta /feed
app.use('/feed', express.static(__dirname + '/feed'));

// Configurar middleware para servir arquivos estáticos da pasta /perfil
app.use('/perfil', express.static(__dirname + '/perfil'));

// Configurar middleware para servir arquivos estáticos da pasta /perfil
app.use('/publicacao', express.static(__dirname + '/publicacao'));

// Configurar o middleware body-parser para analisar os dados JSON enviados no corpo das solicitações
app.use(bodyParser.json());

// Configurar middleware para analisar dados do formulário
app.use(express.urlencoded({ extended: true }));


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


// Configurar a conexão com o banco de dados MySQL
const mysql = require('mysql');
const db = mysql.createConnection({
  host: '127.0.0.1', // Nome do host do MySQL
  user: 'root',
  password: '@Eumesmo01',
  database: 'form'
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




// Rota para a página de feed (GET)
app.get('/perfil', (req, res) => {
  res.sendFile(__dirname + '/perfil/perfil.html'); // Substitua 'perfil.html' pelo caminho correto do seu arquivo HTML de perfil
});





// Rota para a página de registro (GET)
app.get('/registrar', (req, res) => {
  res.sendFile(__dirname + '/form/form.html'); // Substitua 'form.html' pelo caminho correto do seu arquivo HTML de registro
});



// Rota para a página de registro (GET)
app.get('/publicacao', (req, res) => {
  res.sendFile(__dirname + '/publicacao/publicacao.html'); // Substitua 'form.html' pelo caminho correto do seu arquivo HTML de registro
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
// Fim Rota para lidar com o envio do formulário






// Rota para lidar com o login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  // Consulta SQL para verificar o email e a senha
  const query = 'SELECT * FROM usuarios WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      res.status(500).send('Erro interno do servidor');
      return;
    }

    if (results.length === 0) {
      // Usuário não encontrado, exiba uma mensagem de erro no formulário
      res.send('Email ou senha incorretos. Tente novamente.');
      return;
    }

    const usuario = results[0];

    // Verificar se a senha fornecida corresponde ao hash armazenado
    bcrypt.compare(senha, usuario.senha, (bcryptErr, senhaCorresponde) => {
      if (bcryptErr) {
        console.error('Erro ao verificar senha:', bcryptErr);
        res.status(500).send('Erro interno do servidor');
        return;
      }

      if (senhaCorresponde) {
        // A senha está correta, você pode redirecionar o usuário para a página principal.
        res.redirect('/feed/feed.html');
      } else {
        // Senha incorreta, exiba uma mensagem de erro no formulário.
        res.send('Email ou senha incorretos. Tente novamente.');
      }
    });
  });
});
// Fim Rota para lidar com o login




// Rota para lidar com o envio de mensagens (POST) usando Multipart
app.post('/enviar-mensagem', upload.fields([{ name: 'imagem', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  try {
    // Acessar os dados do corpo da solicitação (texto)
    const { texto } = req.body;

    // Acessar os arquivos enviados (imagem e vídeo)
    const imagem = req.files['imagem'] ? req.files['imagem'][0] : null;
    const video = req.files['video'] ? req.files['video'][0] : null;

    const pastaTextoID = '19srQ_L1Z2RRl9SUErymV_spZn0WJ8y3o';
    const pastaImagemID = '13bnECuYzifyM3wHyyQEzjG_O4rttw7kD';
    const pastaVideoID = '1roDbUKgmLo5cBn0wVn6sd6y56fopSlqJ';

    // Exemplo de como criar arquivos no Google Drive usando uma biblioteca como 'googleapis'
    // Substitua com suas próprias configurações de autenticação
    const { google } = require('googleapis');
    const drive = google.drive('v3');
    const auth = new google.auth.GoogleAuth({
      keyFile: './json/googleApi.json', // Substitua pelo caminho da sua chave de API
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

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
      } catch (error) {
        console.error('Erro ao criar o arquivo no Google Drive:', error);
      }
    }

    // Crie arquivos com base nos dados recebidos
    if (texto) {
      // Exemplo: criar um arquivo de texto
      await criarArquivoNoDrive('mensagem.txt', pastaTextoID, 'text/plain', texto);
    }

    if (imagem) {
      // Exemplo: criar um arquivo de imagem e não criar em outras pastas
      await criarArquivoNoDrive('imagem.png', pastaImagemID, 'image/png', imagem.buffer);
    }

    if (video) {
      // Exemplo: criar um arquivo de vídeo e não criar em outras pastas
      await criarArquivoNoDrive('video.mp4', pastaVideoID, 'video/mp4', video.buffer);
    }

    res.json({ mensagem: 'Mensagem recebida e arquivos criados com sucesso no Google Drive' });
  } catch (error) {
    console.error('Erro ao processar a mensagem:', error);
    res.status(500).json({ erro: 'Ocorreu um erro ao processar a mensagem' });
  }
});




// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor está ouvindo na porta ${port}`);
});
