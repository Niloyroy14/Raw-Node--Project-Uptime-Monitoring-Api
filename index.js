/* 
*Title: Uptime Monitoring Application
*Description: Application 
*Author: Niloy Roy
*/

//dependencies

const server = require('./lib/server.js');
const workers = require('./lib/worker.js');



//app object - module scaffolding
const app = {};

app.init = () => {
    //start the server
    server.init();
    //start the worker
    workers.init();
};

app.init();

//export the app
module.exports = app;