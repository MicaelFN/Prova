const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const SEGREDO = 'euvoupracasa';

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cobrarTokenJWT);


function cobrarTokenJWT(req, resp, next){
    if(req.url == '/login'){
        next();
    }
    if(req.url == '/'){
        next();
    }
    var token = req.headers['x-access-token'];
    try{
        var decodificado = jwt.verify(token, SEGREDO);
        next();
    }catch(e){
        resp.status(500);
        resp.send({message: 'token invalido'});
    }
}

app.get('/', (req, resp)=>{
    resp.send({message: 'ok'});
});

app.post('/login',(request, response)=>{
    app.use(cobrarTokenJWT);
    var body = request.body;
    if(body.username == 'usuario' && body.password == '123456'){
        const id = 1;
        var token = jwt.sign({username: 'usuario', role: 'admin'}, SEGREDO,{
            expiresIn: '10h'
        });
        response.status(200);
        response.send({token});
    }else{
        response.status(401);
        response.send({message: 'Error in username or password'})
    }
});

var tasks = [];

app.post('/tasks',(request, response)=>{
    app.use(cobrarTokenJWT);
    const body = request.body;
    const task = {
        title: body.title,
        description: body.description,
        isDone: body.isDone,
        isPriority: body.isPriority,
        id: uuid()
    }
    tasks.push(task);
    response.status(201);
    response.send(task);
});

app.get('/tasks',(request, response)=>{
    app.use(cobrarTokenJWT);
    response.status(200);
    response.send(tasks);
});

app.get('/tasks/:taskId',(request, response)=>{
    app.use(cobrarTokenJWT);
    const task = tasks.find(t => t.id == request.params.taskId);
    if(task){
        response.status(200);
        response.send(task);
    }else{
        response.status(404);
        response.send();
    }
});

app.put('/tasks/:taskId',(request, response)=>{
    app.use(cobrarTokenJWT);
    const body = request.body;
    const task = tasks.find(t => t.id == request.params.taskId);
    if(tasks){
        task.title = body.title;
        task.description = body.description;
        task.isDone = body.isDone;
        task.isPriority = body.isPriority;
        response.send(task);
    }else{
        response.status(404);
        response.send();
    }
});

app.delete('/tasks/:taskId',(request, response)=>{
    app.use(cobrarTokenJWT);
    var task = tasks.find(t => t.id == request.params.taskId)
    if(tasks){
        tasks = tasks.filter(t => t.id != request.params.taskId);
        response.status(200);
        response.send(task);
    }else{
        response.status(404);
        response.send();
    }
});

app.listen(3000);

