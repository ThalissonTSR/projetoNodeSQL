// arquivo para criar conexão com banco de dados  e realizar CRUDs

const db = require("./db")     // puxando o modulo de conectar no banco de dados

const Curso = db.sequelize.define("diascurso",{
    NomeCurso:{
        type: db.Sequelize.STRING
    },
    Sala:{
        type: db.Sequelize.TEXT
    },
    Data:{
        type: db.Sequelize.DATE
    },
    Horario: {
        type: db.Sequelize.STRING
    }
})

//gerar tabela  (para gerar abrir o mysql no cmd e criar ou usar algum db)  so usar para criar coisas novas 
//Curso.sync({force:true})     

module.exports = Curso