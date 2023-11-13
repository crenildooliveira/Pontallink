const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const session = require('express-session');
const passport = require('./passport'); // Importe o arquivo passport.js que você criou
const multer = require('multer');
const upload = multer();
const flash = require('connect-flash');

// Importe o arquivo uploadDrive.js
const { enviarEMarcarArquivos, auth } = require('./uploadDrive'); // Obtenha a configuração de autenticação e a função enviarEMarcarArquivos

// Configuração do Express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secretpass', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(cors()); // Isso habilitará o CORS para todas as rotas


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

// Configurar middleware para servir arquivos estáticos da pasta /publicacao
app.use('/menu/pesquisa', express.static(__dirname + '/menu/pesquisa'));

// Configurar middleware para servir arquivos estáticos da pasta /publicacao
app.use('/menu/notificacoes', express.static(__dirname + '/menu/notificacoes'));

// Configurar o middleware body-parser para analisar os dados JSON enviados no corpo das solicitações
app.use(bodyParser.json());

// Configurar middleware para analisar dados do formulário
app.use(express.urlencoded({ extended: true }));

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

function obterIdRemetente(req) {
  if (req.isAuthenticated()) {
    return req.user.id_remetente;
  } else {
    return null; // Ou outra ação apropriada se o usuário não estiver autenticado
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

// Rota para a página de notificações (GET)
app.get('/menu/notificacoes', (req, res) => {
  res.sendFile(__dirname + '/menu/notificacoes/notificacoes.html'); // Substitua 'publicacao.html' pelo caminho correto do seu arquivo HTML de publicação
});

//-----------------------------------------------

app.get('/menu/pesquisa', (req, res) => {
  const searchTerm = req.query.q;

  if (!searchTerm) {
    res.status(400).json({ erro: 'Termo de pesquisa não especificado' });
    return;
  }

  const idUsuario = req.session.idusuario;

  // Consulta SQL para pesquisar usuários pelo nome (ajuste para o seu banco de dados)
  const sql = 'SELECT idusuarios, nome FROM usuarios WHERE nome LIKE ?';
  const query = '%' + searchTerm + '%';

  db.query(sql, [query], (err, results) => {
    if (err) {
      console.error('Erro na consulta de pesquisa:', err);
      res.status(500).json({ erro: 'Erro na pesquisa' });
      return;
    }

    const resultsWithId = results.map(user => ({ ...user, idUsuario }));

    // Antes de renderizar o template
    console.log('Valor de idUsuario no servidor:', idUsuario);

    // Renderize a página após a conclusão da consulta
    res.json({ idUsuario, resultsWithId });
  });
});


//-----------------------------------------------

// Rota para registrar o ID do usuário após o carregamento da pesquisa.html
app.get('/menu/registro-id-usuario', (req, res) => {
  const idUsuario = req.session.idusuario; // ou qualquer outra forma de obter o ID do usuário

  // Adicione um log para verificar o ID do usuário no console do servidor
  console.log('ID do usuário após o carregamento da pesquisa.html:', idUsuario);

  // Envie o ID do usuário de volta para o cliente
  res.json({ idUsuario });
});



//-----------------------------------------------

// Rota para obter notificações de solicitações de amizade
app.get('/notificacoes-amizade', (req, res) => {
  const idUsuario = req.user.id; // ID do usuário logado
  const sql = 'SELECT * FROM solicitacoes_amizade WHERE id_destinatario = ? AND status = "pendente"';
  db.query(sql, [idUsuario], (err, results) => {
    if (err) {
      console.error('Erro ao buscar notificações:', err);
      res.status(500).json({ erro: 'Erro ao buscar notificações' });
      return;
    }
    res.json(results);
  });
});

app.get('/solicitacoes-amizade', (req, res) => {
  const destinatarioID = req.user.id; // ID do usuário logado (destinatário)

  const sqlConsultarSolicitacoes = 'SELECT * FROM solicitacoes_amizade WHERE destinatarioID = ?';
  db.query(sqlConsultarSolicitacoes, [destinatarioID], (err, results) => {
    if (err) {
      console.error('Erro na consulta de solicitações de amizade:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
      return;
    }

    res.json(results); // Retorna todas as solicitações de amizade recebidas
  });
});


//-----------------------------------------------

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


//-----------------------------------------------

// Rota para lidar com o login
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Erro durante a autenticação:', err);
      return next(err);
    }
    if (!user) {
      req.flash('error', 'Nome de usuário ou senha incorretos.');
      return res.redirect('/login.html');
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error('Erro durante o login:', err);
        return next(err);
      }
      // Configure o idusuario na sessão após o login bem-sucedido
      req.session.idusuario = user.idusuarios;
      console.log('ID do usuário após o login:', req.session.idusuario);
      return res.redirect('/feed/feed.html');
    });
  })(req, res, next);
});


//-----------------------------------------------

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

//-----------------------------------------------

app.post('/enviar-solicitacao-amizade', (req, res) => {
  console.log('Recebendo solicitação de amizade:', req.body);
  const remetenteID = req.session.idusuario;
  const destinatarioID = req.body.id_destinatario;

  if (!destinatarioID || destinatarioID === remetenteID) {
    res.status(400).json({ erro: 'ID do destinatário ausente ou inválido' });
    return;
  }

  // Verificar se já existe uma solicitação pendente
  const sqlVerificarSolicitacao = 'SELECT * FROM solicitacoes_amizade WHERE (id_remetente = ? AND id_destinatario = ?) OR (id_remetente = ? AND id_destinatario = ?) AND status = "pendente"';
  db.query(sqlVerificarSolicitacao, [remetenteID, destinatarioID, destinatarioID, remetenteID], (err, results) => {
    if (err) {
      console.error('Erro na verificação de solicitação de amizade:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
      return;
    }

    if (results.length > 0) {
      res.status(400).json({ erro: 'Solicitação de amizade já existe' });
      return;
    }

    // Se não existir, inserir uma nova solicitação de amizade no banco de dados
    const sqlInserirSolicitacao = 'INSERT INTO solicitacoes_amizade (id_remetente, id_destinatario, status) VALUES (?, ?, "pendente")';
    db.query(sqlInserirSolicitacao, [remetenteID, destinatarioID], (err, result) => {
      if (err) {
        console.error('Erro ao inserir solicitação de amizade:', err);
        res.status(500).json({ erro: 'Erro interno do servidor' });
        return;
      }

      res.json({ mensagem: 'Solicitação de amizade enviada com sucesso', idRemetente: remetenteID });
    });
  });
});





//-----------------------------------------------

// Rota para gerenciar solicitações de amizade
app.post('/gerenciar-solicitacao-amizade', (req, res) => {
  const { idSolicitacao, acao } = req.body;
  const idUsuario = req.user.id; // ID do usuário logado
  if (acao === 'aceitar') {
    const sql = 'UPDATE solicitacoes_amizade SET status = "aceita" WHERE id = ? AND id_destinatario = ?';
    db.query(sql, [idSolicitacao, idUsuario], (err, result) => {
      if (err) {
        console.error('Erro ao aceitar solicitação de amizade:', err);
        res.status(500).json({ erro: 'Erro ao aceitar solicitação de amizade' });
        return;
      }
      res.json({ mensagem: 'Solicitação de amizade aceita com sucesso' });
    });
  } else if (acao === 'recusar') {
    const sql = 'UPDATE solicitacoes_amizade SET status = "recusada" WHERE id = ? AND id_destinatario = ?';
    db.query(sql, [idSolicitacao, idUsuario], (err, result) => {
      if (err) {
        console.error('Erro ao recusar solicitação de amizade:', err);
        res.status(500).json({ erro: 'Erro ao recusar solicitação de amizade' });
        return;
      }
      res.json({ mensagem: 'Solicitação de amizade recusada com sucesso' });
    });
  }
});

//-----------------------------------------------


// Rota para aceitar ou recusar uma solicitação de amizade
app.post('/responder-solicitacao-amizade', (req, res) => {
  const remetenteID = req.session.idusuario;
  const acao = req.body.acao; // 'aceitar' ou 'recusar'

  if (!remetenteID || !acao) {
    res.status(400).json({ erro: 'Parâmetros ausentes' });
    return;
  }

  // Atualizar o status da solicitação com base na ação
  const novoStatus = acao === 'aceitar' ? 'aceita' : 'recusada';

  const sqlAtualizarSolicitacao = 'UPDATE solicitacoes_amizade SET status = ? WHERE id_remetente = ? AND id_destinatario = ?';
  db.query(sqlAtualizarSolicitacao, [novoStatus, remetenteID, destinatarioID], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar a solicitação de amizade:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
      return;
    }

    res.json({ mensagem: 'Solicitação de amizade respondida com sucesso' });
  });
});

//-----------------------------------------------

// Rota para obter solicitações de amizade pendentes do usuário logado
app.get('/obter-solicitacoes-amizade', (req, res) => {
  const destinatarioID = req.session.idusuario;
  const remetenteID = req.body.id_destinatario;

  const sqlConsultarSolicitacoes = 'SELECT * FROM solicitacoes_amizade WHERE id_destinatario = ? AND id_remetente = ? AND status = "pendente"';
  db.query(sqlConsultarSolicitacoes, [destinatarioID, remetenteID], (err, results) => {
    if (err) {
      console.error('Erro na consulta de solicitações de amizade:', err);
      res.status(500).json({ erro: 'Erro interno do servidor' });
      return;
    }

    res.json(results); // Retorna as solicitações pendentes
  });
});

        
// Iniciar o servidor
  app.listen(port, () => {
  console.log(`Servidor está ouvindo na porta ${port}`);
});
        
