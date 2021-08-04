const express = require("express");
const bodyParser = require("body-parser");
const nunjucks = require("nunjucks");
const app = express();

const urlencodedParser = bodyParser.urlencoded({extended: false});

nunjucks.configure('templates', {
    autoescape: true,
    express: app
});

app.use("/static", express.static(__dirname + "/static"));
app.use("/phys/static", express.static(__dirname + "/static"));

app.get("/", function (request, response) {
    response.sendFile("/home/pankov/WebstormProjects/train/templates/menu.html");
});



app.get("/phys/task_1", urlencodedParser, function (request, response){
    response.sendFile("/home/pankov/WebstormProjects/train/templates/first_task.html")
})

app.post("/phys/task_1", urlencodedParser, function (request, response) {
    if (!request.body) return response.sendStatus(400);
    let array = [];
    let ran = [];
    let decide = true;
    let R, D, V;
    let json = [];
    for (let i = 1; i <= request.body.lines; i++){
        R = request.body[`${i}R`];
        D = request.body[`${i}D`];
        V = request.body[`${i}V`];
        json.push({content: R, name: `${i}R`})
        if (R === '' || D === 'Направление' || V === ''){
            decide = false;
        }
        array.push([R, D, V])
        ran.push(i)
    }
    console.log(ran)
    if (!decide){
        response.render("first_task_for_edit.html", {ran: ran, elems: json, lines:parseInt(request.body.lines)})
    }
})
app.listen(3000, "localhost");