// Importando módulos
const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const Curso = require("./models/CreateDB");
const moment = require('moment'); // Adicionando moment.js

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
    
// Rota para listagem por ordem de cursos
app.get("/listaCurso", (req,res) =>{ 
    Curso.findAll({ order: [["NomeCurso", "ASC"]] })
    .then((Curso) => {
        res.render("listaCurso", { Curso, style: "home.css" });
    });
});
  
// Rota para listagem por ordem de salas
app.get("/listaSala", (req,res) =>{ 
    Curso.findAll({ order: [["Sala", "ASC"]] })
    .then((Curso) => {
        res.render("listaCurso", { Curso, style: "home.css" });
    });
});
  
// Rota para listagem por ordem de datas
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
app.post("/add", (req, res) => {
    const verificaData = req.body.Data;  // A data vem no corpo da requisição (req.body)
    const verificaCurso = req.body.NomeCurso ;

    // Verifica se a data foi fornecida
    if (!verificaData) {
        return res.status(400).json({ error: "Data não fornecida!" });
    }

    // Usando moment.js para formatar a data recebida e comparar apenas o dia
    const dataFormatada = moment(verificaData).startOf('day').format('YYYY-MM-DD');




    Curso.findAll()
        .then((cursos) => {
            // Percorre os cursos e compara as datas formatadas
            for (let i = 0; i < cursos.length; i++) {
                const cursoData = moment(cursos[i].Data).startOf('day').format('YYYY-MM-DD'); // Formata a data do banco de dados
                const cursoNome = (cursos[i].NomeCurso)

                // Compara a data fornecida com a data do curso
                if (verificaData === cursoData && verificaCurso === cursoNome) {
                    // Se encontrar uma data igual, envia uma resposta de erro sem redirecionar
                    return res.render("agendamento", {
                        errorMessage: "Data já preenchida por este curso, escolha outra data ou outro curso.",
                        style: "agendamento.css"
                    });
                }
            }

            // Se não encontrar nenhuma data igual, cria o curso
            Curso.create({
                NomeCurso: req.body.NomeCurso,
                Sala: req.body.Sala,
                Data: req.body.Data,
                Horario: req.body.Horario
            }).then(() => {
                // Redireciona para a página de eventos ou para a página de sucesso
                res.redirect("/eventos");
            }).catch((err) => {
                console.error("Erro ao criar o curso:", err);
                res.status(500).json({ error: "Erro ao criar o curso." });
            });
        })
        .catch((err) => {
            console.error("Erro ao consultar os cursos:", err);
            res.status(500).json({ error: "Erro ao consultar os cursos." });
        });
});



// Rota para adicionar um evento ao banco de dados
app.post("/add", (req, res) => {
    const { NomeCurso, Sala, Data, Horario } = req.body;

    // Usando Moment.js para formatar a data sem fuso horário
    let dataSemFuso = moment(Data).startOf('day').toDate(); // Zera a hora para evitar mudanças de fuso horário

    Curso.create({
        NomeCurso: NomeCurso,
        Sala: Sala,
        Data: dataSemFuso,
        Horario: Horario
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
            NomeCurso: "Curso: " +  evento.NomeCurso,
            Sala: "<br/>" + " Sala: " + evento.Sala,
            Horario: "<br/>" + "   Horario: " + evento.Horario,
            createdAt: moment(evento.Data).format('DD/MM/YYYY') // Formatando a data com Moment.js para evitar problemas de fuso horário
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
