const restify = require("restify");
const corsMiddleware = require("restify-cors-middleware");
const exec = require("child_process").exec;
const fs = require("fs");
const path = require("path");

console.log("Monitor starting...");

const server = restify.createServer();

const cors = corsMiddleware({
    preflightMaxAge: 5, //Optional
    origins: [
        /^http:\/\/localhost(:[\d]+)?$/,
        "http://*.dappnode.eth",
    ]
});

server.pre(cors.preflight);
server.use(cors.actual);
server.use(restify.plugins.bodyParser());

server.get("/addr", function (req, res, next) {
    getAddr().then((stdout) => {
        res.send(200, stdout);
    }).catch((e) => {
        res.send(500, e);
    });
});

function getAddr() {
    return new Promise((resolve, reject) => {
        const cmd = "miner peer addr";
        console.log(`Running ${cmd}`);

        const child = exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return reject(error.message);
            }
            if (stderr) {
                return reject(stderr);
            }
            return resolve(stdout);
        });

        child.stdout.on("data", function(data) {
            console.log(data.toString());
        });
    });
}

server.listen(82, function() {
    console.log(`${server.name} listening at ${server.url}`);
});
