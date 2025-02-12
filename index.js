// Importando módulos
const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const Curso = require("./models/CreateDB");

// Configuração do Handlebars
app.use(express.static("public"));
app.engine("handlebars", handlebars.engine({
    defaultLayout: "main",
    runtimeOptions: {
        allowProtoPropertiesByDefault: true
    }
}));
app.set("view engine", "handlebars");

// Configuração do Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Rota para página inicial
app.get("/", (req, res) => {
    Curso.findAll({ order: [["id", "DESC"]] })  
        .then((Curso) => {
            res.render("home", { Curso, style: "home.css" });
        });
});
    
//rota para listagem por ordem de cursos
app.get("/listaCurso", (req,res) =>{ 
    Curso.findAll({ order: [["NomeCurso", "ASC"]] })
    .then((Curso) => {
        res.render("listaCurso", { Curso, style: "home.css" });
    });
});
  
//rota para listagem por ordem de salas
app.get("/listaSala", (req,res) =>{ 
    Curso.findAll({ order: [["Sala", "ASC"]] })
    .then((Curso) => {
        res.render("listaCurso", { Curso, style: "home.css" });
    });
});
  
//rota para listagem por ordem de datas
app.get("/listaData", (req,res) =>{ 
    Curso.findAll({ order: [["Data", "DESC"]] })
    .then((Curso) => {
        res.render("listaCurso", { Curso, style: "home.css" });
    });
});
  

  

// Rota para formulário de agendamento
app.get("/cad", (req, res) => {
    res.render("agendamento", { style: "agendamento.css" });
});

// Rota para adicionar um evento ao banco de dados
app.post("/add", (req, res) => {
    Curso.create({
        NomeCurso: req.body.NomeCurso,
        Sala: req.body.Sala,
        Data: req.body.Data,
        Horario: req.body.Horario
    }).then(() => {
        res.redirect("/eventos");
    }).catch((erro) => {
        res.send("Houve um erro: " + erro);
    });
});

// Rota para deletar um evento
app.get("/deletar/:id", (req, res) => {
    Curso.destroy({ where: { "id": req.params.id } })
        .then(() => {
            res.render("voltar", { style: "voltar.css" });
        })
        .catch((erro) => {
            res.send("Este curso não existe! " + erro);
        });
});

app.get("/eventos", (req, res) => {
    Curso.findAll().then((eventos) => {
        // Formatar os eventos para passar ao frontend
        const eventosFormatados = eventos.map(evento => ({
            NomeCurso: "Curso: " +  evento.NomeCurso  ,
            Sala: "<br/>"+" Sala: "+evento.Sala ,
            Horario:"<br/>"+ "   Horario: " + evento.Horario,
            createdAt: new Date(evento.Data).toLocaleDateString('pt-BR')// Formato YYYY-MM-DD

        }));

        // Renderiza a página do calendário e passa os eventos formatados
        res.render("calendario", {
            eventos: JSON.stringify(eventosFormatados),  // Passa os eventos como JSON
            style: "calendario.css"
        });
    }).catch((erro) => {
        res.status(500).json({ error: "Erro ao buscar eventos: " + erro });
    });
});

// Iniciando o servidor
app.listen(8081, () => {
    console.log("Servidor rodando em http://localhost:8081");
});
