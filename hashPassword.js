const bcrypt = require('bcrypt');

// Senha que você deseja armazenar com hash
const senha = 'senha_secreta';

// Gere o hash da senha
bcrypt.hash(senha, 10, (err, hash) => {
  if (err) {
    console.error('Erro ao gerar o hash:', err);
    return;
  }
  console.log('Hash da senha:', hash);
});
