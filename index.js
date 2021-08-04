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

function MH(legs) {
    let dict_of_i = new Map();
    for (let i = 0; i < legs.length; i++){
        dict_of_i.set(i + 1, [])
    }
    for (let el = 0; el < legs.length; el++) {
        let minus_or_plus;
        if (legs[el][1] === 'R')
            minus_or_plus = -1
        else
            minus_or_plus = 1
        let r1 = 0;
        for (let i = 0; i < legs.length; i++){
            if (i != el)
                r1 += 1 / legs[i][0]
        }
        console.log(r1)
        let i = (legs[el][2] / (r1 + legs[el][0]))
        let arr = dict_of_i.get(el + 1)
        arr.push(i * minus_or_plus)
        dict_of_i.set(el + 1, arr)

        let uab = r1 * i
        for (let i = 0; i < legs.length; i++){
            if (i != el){
                let arr = dict_of_i.get(el + 1)
                arr.push((uab / legs[i][0] * -1 * minus_or_plus))
                dict_of_i.set(el + 1, arr)
            }
        }

    }
    return dict_of_i

}

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
        json.push({content: D, name: `${i}D`})
        json.push({content: V, name: `${i}V`})
        if (R === '' || D === 'Направление' || V === ''){
            decide = false;
        }
        array.push([parseInt(R, 10), D, parseInt(V, 10)])
        ran.push(i)
    }
    console.log(array[0])
    if (!decide){
        response.render("first_task_for_edit.html", {ran: ran, elems: json, lines:parseInt(request.body.lines)})
        return
    }
    console.log(MH(array))
    response.render("first_task_for_edit.html", {ran: ran, elems: json, lines:parseInt(request.body.lines)})
})
app.listen(3000, "localhost");