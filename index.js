// Importando módulos
const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const Curso = require("./models/CreateDB");
const moment = require('moment'); // Adicionando moment.js
const PORT = process.env.PORT || 8081;

// Configuração do Handlebars
app.use(express.static("public")); // Serve arquivos estáticos da pasta 'public'


app.engine("handlebars", handlebars.engine({
    defaultLayout: "main",
    runtimeOptions: {
        allowProtoPropertiesByDefault: true
    },
    helpers: {
        formatDate: (date) => {
            // Verifica se a data está definida antes de formatar
            return date ? moment(date).format('YYYY-MM-DD') : '';
        }
    }
}));
// Configuração do Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("view engine", "handlebars"); // Definindo o motor de templates


// Rota para página inicial
app.get("/", (req, res) => {
    Curso.findAll({ order: [["id", "DESC"]] })  
        .then((Curso) => {
            res.render("home", { Curso, style: "home.css" });
        });
});

// Rota para listagem por ordem de cursos
app.get("/listaCurso", (req, res) => { 
    Curso.findAll({ order: [["NomeCurso", "ASC"]] })
    .then((Curso) => {
        res.render("listaCurso", { Curso, style: "home.css" });
    });
});

// Rota para listagem por ordem de salas
app.get("/listaSala", (req, res) => { 
    Curso.findAll({ order: [["Sala", "ASC"]] })
    .then((Curso) => {
        res.render("listaCurso", { Curso, style: "home.css" });
    });
});

// Rota para listagem por ordem de datas
app.get("/listaData", (req, res) => { 
    Curso.findAll({ order: [["Data", "DESC"]] })
    .then((Curso) => {
        res.render("listaCurso", { Curso, style: "home.css" });
    });
});

// Rota para formulário de agendamento
app.get("/cad", (req, res) => {
    res.render("agendamento", { style: "agendamento.css" });
});

// Rota POST para adicionar um novo curso
app.post("/add", (req, res) => {
    const verificaData = req.body.Data;  // A data vem no corpo da requisição (req.body)
    const verificaCurso = req.body.NomeCurso;

    if (!verificaData) {
        return res.status(400).json({ error: "Data não fornecida!" });
    }

    // Usando moment.js para formatar a data para YYYY-MM-DD
    const dataFormatada = moment(verificaData).format('YYYY-MM-DD');  // Usando o formato correto

    Curso.findAll().then((cursos) => {
        for (let i = 0; i < cursos.length; i++) {
            const cursoData = moment(cursos[i].Data).format('YYYY-MM-DD'); // Comparando com formato correto
            const cursoNome = cursos[i].NomeCurso;

            if (dataFormatada === cursoData && verificaCurso === cursoNome) {
                return res.render("agendamento", {
                    errorMessage: "Data já preenchida por este curso, escolha outra data ou outro curso.",
                    style: "agendamento.css"
                });
            }
        }

        // Criar o curso com a data formatada corretamente
        Curso.create({
            NomeCurso: req.body.NomeCurso,
            Sala: req.body.Sala,
            Data: moment(dataFormatada).toDate(), // Passa a data já formatada
            Horario: req.body.Horario
        }).then(() => {
            res.redirect("/eventos");
        }).catch((err) => {
            console.error("Erro ao criar o curso:", err);
            res.status(500).json({ error: "Erro ao criar o curso." });
        });
    }).catch((err) => {
        console.error("Erro ao consultar os cursos:", err);
        res.status(500).json({ error: "Erro ao consultar os cursos." });
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

// Rota GET para exibir o formulário de edição
app.get("/editar/:id", (req, res) => {
    Curso.findOne({ where: { "id": req.params.id } })
        .then((curso) => {
            if (curso) {
                res.render("editar", { 
                  
                   Curso: curso, // Passa os dados do curso para o template
                    errorMessage: null
                });
            } else {
                res.render("editar", {
                    errorMessage: "Curso não encontrado."
                });
            }
        })
        .catch((erro) => {
            res.render("editar", {
                errorMessage: "Erro: " + erro
            });
        });
});

// Rota POST para atualizar os dados do curso
app.post("/editar/:id", (req, res) => {
    const { NomeCurso, Sala, Data, Horario } = req.body;
    const verificaData = req.body.Data;
    const verificaCurso = req.body.NomeCurso;

    if (!verificaData) {
        return res.status(400).json({ error: "Data não fornecida!" });
    }

    const dataFormatada = moment(verificaData).format('YYYY-MM-DD');

    Curso.findAll().then((cursos) => {
        let dataConflito = false;
        for (let i = 0; i < cursos.length; i++) {
            const cursoData = moment(cursos[i].Data).format('YYYY-MM-DD');
            const cursoNome = cursos[i].NomeCurso;

            if (dataFormatada === cursoData && verificaCurso === cursoNome) {
                dataConflito = true;
                break;
            }
        }

        if (dataConflito) {
            // Renderiza novamente a página de edição com a mensagem de erro
            return res.render("editar", {
                errorMessage: "Data já preenchida por este curso, escolha outra data ou outro curso.",
                Curso: req.body // Passa os dados para o formulário
            });
        }

        // Atualiza o curso
        Curso.update(
            {
                NomeCurso: NomeCurso,
                Sala: Sala,
                Data: moment(dataFormatada).toDate(),
                Horario: Horario
            },
            {
                where: { id: req.params.id }
            }
        )
        .then(() => {
            // Após a edição bem-sucedida, redireciona para a página principal
            res.redirect("/");
        })
        .catch((erro) => {
            res.send("Erro ao atualizar o curso: " + erro);
        });
    }).catch((erro) => {
        res.status(500).send("Erro ao buscar cursos: " + erro);
    });
});

  
   

// Rota GET para exibir os eventos
app.get("/eventos", (req, res) => {
    Curso.findAll().then((eventos) => {
        // Formatar os eventos para passar ao frontend
        const eventosFormatados = eventos.map(evento => ({
            NomeCurso: "Curso: " + evento.NomeCurso,
            Sala: "<br/>" + " Sala: " + evento.Sala,
            Horario: "<br/>" + "   Horario: " + evento.Horario,
            createdAt: moment(evento.Data).format('YYYY-MM-DD') // Mudança: Formato ISO 8601
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
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});