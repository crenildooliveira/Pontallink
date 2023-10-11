const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const mysql = require('mysql');

const db = mysql.createConnection({
    // Configurações do banco de dados
    host: '127.0.0.1',
    user: 'root',
    password: '@Eumesmo01',
    database: 'form',
});

// Configurar a estratégia de autenticação local
passport.use(new LocalStrategy({
    usernameField: 'email', // Campo de nome de usuário
    passwordField: 'senha', // Campo de senha
}, (email, senha, done) => {
    // Consulta SQL para verificar as credenciais do usuário
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            return done(err);
        }

        if (results.length === 0) {
            return done(null, false, { message: 'Email ou senha incorretos' });
        }

        const user = results[0];

        // Verificar se a senha fornecida corresponde ao hash armazenado
        bcrypt.compare(senha, user.senha, (bcryptErr, passwordMatch) => {
            if (bcryptErr) {
                return done(bcryptErr);
            }

            if (passwordMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Email ou senha incorretos' });
            }
        });
    });
}));

// Serialização e desserialização do usuário (gerenciar sessões)
passport.serializeUser((user, done) => {
    done(null, user.idusuarios);
});

passport.deserializeUser((idusuarios, done) => {
    // Consulte o banco de dados para encontrar o usuário com base no ID
    const query = 'SELECT * FROM usuarios WHERE idusuarios = ?';
    db.query(query, [idusuarios], (err, results) => {
        if (err) {
            return done(err);
        }
        if (results.length === 0) {
            return done(null, false);
        }
        const user = results[0];
        done(null, user);
    });
});

module.exports = passport;
