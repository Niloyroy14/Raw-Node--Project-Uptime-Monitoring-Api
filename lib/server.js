/* 
*Title: Server Related File
*Description: Server Related File
*Author: Niloy Roy
*/

//dependencies
const http = require('http');
const environment = require('../helpers/environments.js');
const { handleReqRes } = require('../helpers/handleReqRes.js');


//server object - module scaffolding
const server = {};



//create server
server.createServer = () => {
    const createServerVariable = http.createServer(server.handleReqRes);
    createServerVariable.listen(environment.port, () => {
        console.log(`listening to port ${environment.port}`);
    });
}

//handle Request Response
server.handleReqRes = handleReqRes;

//start the server
server.init = () => {
    server.createServer();
};

//export
module.exports = server;