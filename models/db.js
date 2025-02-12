
//puxar qualquer funcao do sequelize para dentro de uma variavel
const Sequelize = require("sequelize");

//conexão com o banco de dados Mysql                      cmd: config mysql mysql -h localhost -u root -p

const sequelize =  new Sequelize("diascurso", "root", "Ets2@123",{
    host: "localhost",
    dialect: "mysql"
});

module.exports = {                               //exportar o sequelize para ser utilizado em outros arquivos
    Sequelize: Sequelize,   
    sequelize: sequelize
}                                           