const express = require("express");
const bodyParser = require("body-parser");
const nunjucks = require("nunjucks");
const mathjs = require("mathjs")
var linSolve = require("robust-linear-solve")

const {sum, re} = require("mathjs");
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
            if (i !== el)
                r1 += (1 / legs[i][0]) ** -1
        }
        r1 = mathjs.round(r1, 2)
        let i = (legs[el][2] / (r1 + legs[el][0]))
        i = mathjs.round(i, 2)
        let arr = dict_of_i.get(el + 1)
        arr.push(i * minus_or_plus)
        dict_of_i.set(el + 1, arr)

        let uab = mathjs.round(r1 * i, 2)
        for (let i = 0; i < legs.length; i++){
            if (i != el){
                let arr = dict_of_i.get(el + 1)
                arr.push(mathjs.round((uab / legs[i][0] * -1 * minus_or_plus), 2))
                dict_of_i.set(el + 1, arr)
            }
        }

    }
    return dict_of_i
}

function MYH(legs) {
    let dict_of_i = new Map();
    let gs = [];
    let edss = [];
    let uab = 0;
    for (let leg of legs) {
        gs.push(mathjs.round(1 / leg[0], 3))
        if (leg[1] == 'R')
            edss.push(-leg[2])
        else
            edss.push(leg[2])
        uab += gs[gs.length - 1] * edss[gs.length - 1]
        console.log(1 / leg[0], leg[0])
    }
    console.log(uab)
    uab /= sum(gs)
    uab = mathjs.round(uab, 2)

    for (let i = 0; i < legs.length; i++){
        dict_of_i[i + 1] = (edss[i] - uab) * gs[i]
    }
    return dict_of_i
}


function MYKY_help_1(num){
    let result = [];
    let x = 0;
    for (let i = 1;  i <= num; i++){
        if (i === 1)
            result.push([i])
        else if (i === num)
            result[x].push(i)
        else{
            result[x].push(i)
            x += 1
            result.push([i])
        }
    }
    return result
}


function MYKY(legs){
    let arr = MYKY_help_1(legs.length)

    let b = [0]
    for (let g = 0; g < arr.length; g++){
        console.log(arr[g])
        let one = legs[arr[g][0] - 1][2] * (legs[arr[g][0] - 1][1] === 'L'? -1: 1)
        let second = legs[arr[g][1] - 1][2] * (legs[arr[g][1] - 1][1] === 'R'? -1: 1)
        console.log(one, second)
        b.push(one + second)
    }
    let a = []
    let bb = []
    for (let g = 0; g < legs.length; g++){
        bb.push(1)
    }
    a.push(bb)
    for (let g = 0; g < arr.length; g++){
        let gg = []
        for (let i = 1; i <= legs.length; i++){
            gg.push(arr[g].includes(i) ? (arr[g].indexOf(i) === 1 ? legs[i - 1][0] : -legs[i - 1][0]) : 0)
        }
        a.push(gg)
    }
    let x = mathjs.lusolve(a, b)
    return x
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
    console.log(MYH(array))
    console.log(MH(array))
    console.log(MYKY(array))
    response.render("first_task_for_edit.html", {ran: ran, elems: json, lines:parseInt(request.body.lines)})
})
app.listen(3000, "localhost");