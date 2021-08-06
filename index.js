const express = require("express");
const bodyParser = require("body-parser");
const nunjucks = require("nunjucks");
const mathjs = require("mathjs")
var linSolve = require("robust-linear-solve")

const {sum, re, round} = require("mathjs");
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


function* MH_out(legs) {
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
        let list_of_r1 = []
        let list_of_r1_fuck = []
        for (let i = 0; i < legs.length; i++){
            if (i !== el){
                r1 += (1 / legs[i][0]) ** -1
                list_of_r1.push(`1/${legs[i][0]}`)
                list_of_r1_fuck.push(legs[i][0])
            }
        }
        r1 = mathjs.round(r1, 2)
        let str_r1 = ''
        if (list_of_r1.length > 2){
            str_r1 += '('
            str_r1 += join(list_of_r1, "+")
            str_r1 += ') ^ -1'
        } else if (list_of_r1.length){
            str_r1 += `${list_of_r1_fuck[0]} * ${list_of_r1_fuck[1]}/(${list_of_r1_fuck[0]} + ${list_of_r1_fuck[1]})`
        }
        yield `${str_r1} = ${r1}`
        let i = (legs[el][2] / (r1 + legs[el][0]))
        i = mathjs.round(i, 2)
        let arr = dict_of_i.get(el + 1)
        arr.push(i * minus_or_plus)
        dict_of_i.set(el + 1, arr)
        yield `${r1} + ${legs[el][0]} = ${r1 + legs[el][0]}`
        yield [el + 1, legs[el][2] + '/' + r1 + legs[el][0]]
        yield i * minus_or_plus
        let uab = mathjs.round(r1 * i, 2)
        yield `${r1} * ${i} = ${uab}`
        for (let i = 0; i < legs.length; i++){
            if (i != el){
                let arr = dict_of_i.get(el + 1)
                arr.push(mathjs.round((uab / legs[i][0] * -1 * minus_or_plus), 2))
                dict_of_i.set(el + 1, arr)
                yield [i + 1, uab + '/' + legs[i][0]]
                yield [mathjs.round(uab / legs[i][0] * -1 * minus_or_plus, 2)]
            }
        }

    }
    yield dict_of_i
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
    let result = ''
    let MH_gen = MH_out(array)
    for (let i = 0; i < array.length; i++) {
        result += i + 1 + '.' + '\n'
        result += 'R1 = ' + MH_gen.next().value + '\n'
        result += 'Rэ = ' + MH_gen.next().value + '\n'

        result += 'I = ' + MH_gen.next().value.join(' = ') + ' = ' + MH_gen.next().value + '\n'
        result += 'Uab = ' + MH_gen.next().value + '\n'
        for (let g = 0; g < array.length - 1; g++) {
            console.log(result)
            result += 'I' + MH_gen.next().value.join(' = ') + ' = ' + MH_gen.next().value + '\n'
        }
    }
    let dict_ = MH_gen.next().value
    result += '\n\nTrue currents: \n'
    for (let i = 1; i <= array.length; i++){
        let sum_i = ''
        let arr = dict_.get(i)
        for (let g = 0; g < arr.length; g++){
            if (g === 0)
                sum_i += arr[g]
            else
                sum_i += arr[g] < 0 ? ' - ' : ' + ' + mathjs.abs(arr[g])
        }
        result += `I${i} = ${sum_i} = ${round(sum(arr), 2)}\n`
    }
    console.log(result)
    response.render("first_task_for_edit.html", {ran: ran, elems: json, lines:parseInt(request.body.lines)})
})
app.listen(3000, "localhost");