const Sequelize = require("sequelize");

// Substitua pelos valores reais ou insira as variáveis diretamente
const sequelize = new Sequelize(
  'railway',        // Nome do banco de dados
  'root',     // Usuário do banco de dados
  'FgsYtzAaCwXwkylTytkCPBmTOvjzaCww',       // Senha do banco de dados
  {
    host: 'tramway.proxy.rlwy.net',    // Endereço do host (exemplo: 'localhost' ou 'nomedohost.com')
    port: 10300,               // Porta do banco de dados (o padrão para MySQL é 3306)
    dialect: 'mysql',         // Tipo de banco de dados
    dialectOptions: {
      ssl: {
        require: true,            // Exige SSL
        rejectUnauthorized: false, // Não rejeitar certificados não verificados
      },
    },
  }
);

// Teste da conexão
sequelize.authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
  })
  .catch((error) => {
    console.error('Não foi possível conectar ao banco de dados:', error);
  });

module.exports = {
  Sequelize,
  sequelize,
};
