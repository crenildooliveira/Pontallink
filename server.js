const express = require('express');
const app = express();
const port = 3000; // Porta do servidor
const bcrypt = require('bcrypt');

// Configurar middleware para servir arquivos CSS da pasta /login
app.use('/login', express.static(__dirname + '/login'));

// Configurar middleware para servir arquivos CSS de outro diretório (form.css)
app.use('/form', express.static(__dirname + '/form'));

// Configurar middleware para servir arquivos estáticos da pasta /feed
app.use('/feed', express.static(__dirname + '/feed'));


// Configurar middleware para analisar dados do formulário
app.use(express.urlencoded({ extended: true }));

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





// Rota para a página de registro (GET)
app.get('/registrar', (req, res) => {
  res.sendFile(__dirname + '/form/form.html'); // Substitua 'form.html' pelo caminho correto do seu arquivo HTML de registro
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




// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor está ouvindo na porta ${port}`);
});
