const chokidar = require('chokidar');
const fs = require('fs');
const axios = require('axios');
const path = require("path");
const restify = require("restify");
const corsMiddleware = require("restify-cors-middleware");
const Controller = require('./zerotier-controller');
const Service = require('zerotier-service');
const random_name = require('node-random-name');
const JSONdb = require('simple-json-db');
const shell = require('shelljs');

const dataDir = process.argv[2];

if (!dataDir) {
    console.log("please provide");
    console.log("-a folder to persist data to reload after restart");
    console.log(process.argv);
    process.exit();
}

var supervisord = require('supervisord');
var supervisordclient = supervisord.connect('http://localhost:9001');

const databaseFile = path.join(dataDir, 'database.json');
console.log("databaseFile", databaseFile)
const db = new JSONdb(databaseFile);


console.log("Monitor starting...");

const server = restify.createServer({
    name: "MONITOR",
    version: "1.0.0"
});

const cors = corsMiddleware({
    preflightMaxAge: 5, //Optional
    origins: [
        /^http:\/\/localhost(:[\d]+)?$/,
        "http://*.dappnode.eth:81",
    ]
});


server.pre(cors.preflight);
server.use(cors.actual);

server.use(restify.plugins.bodyParser());

// ************************************************************************
// DB
// ************************************************************************

// Generic getter & setter
server.post("/db/set/:name", (req, res, next) => {
    if (!req.params.name || !req.body) {
        res.send(400, "not enough parameters");
        return next();
    }

    db.set(req.params.name, req.body.value);
    res.send(200, req.body);
    return next();
});

server.get("/db/get/:name", (req, res, next) => {
    if (!req.params.name) {
        res.send(400, "not enough parameters");
        return next();
    }
    const r = db.get(req.params.name);
    res.send(200, r);
    return next();
});

// ************************************************************************
// supervisord
// ************************************************************************

// get status of a supervisor process
server.get("/supervisord/status/:name", (req, res, next) => {
    if (req.params.name) {
        supervisordclient.getProcessInfo(req.params.name, function (err, result) {
            if (err) {
                res.send(500, err);
                return next();
            }
            res.send(200, result);
            return next();
        });
    } else {
        supervisordclient.getAllProcessInfo(function (err, result) {
            if (err) {
                res.send(500, err);
                return next();
            }
            res.send(200, result);
            return next();
        });
    }
})

server.get("/supervisord/readstdoutlogs/:name/:offset/:length", (req, res, next) => {
    if (req.params.name && req.params.offset && req.params.length) {

        supervisordclient.readProcessStdoutLog(req.params.name, req.params.offset, req.params.length, function (err, result) {
            if (err) {
                res.send(500, err);
                return next();
            }
            res.send(200, result);
            return next();
        });
    } else {
        res.send(400, "missing parameters", req.params);
        return next();
    }
});

server.get("/supervisord/start/:name", (req, res, next) => {
    if (req.params.name) {
        supervisordclient.startProcess(req.params.name, function (err, result) {
            if (err) {
                res.send(500, err);
                return next();
            }
            res.send(200, result);
            return next();
        });
    } else {
        res.send(400, "no name specified");
        return next();
    }
})

server.get("/supervisord/stop/:name", (req, res, next) => {
    if (req.params.name) {
        supervisordclient.stopProcess(req.params.name, function (err, result) {
            if (err) {
                res.send(500, err);
                return next();
            }
            res.send(200, result);
            return next();
        });
    } else {
        res.send(400, "no name specified");
        return next();
    }
})


// receive ping of client
server.get("/ping", async (req, res, next) => {
    if (!req.connection.remoteAddress) {
        res.send(400);
        return next();
    }
    const pingTime = Date.now();
    console.log(`received ping from ${req.connection.remoteAddress} (${pingTime})`);

    db.set(`ping-${req.connection.remoteAddress}`, pingTime);
    res.send(200);
    return next();
});

// serve React app
server.get('/*', restify.plugins.serveStaticFiles(`${__dirname}/wizard`, {
    maxAge: 1, // this is in millisecs
    etag: false,
}));

server.listen(82, function () {
    console.log("%s listening at %s", server.name, server.url);
});
