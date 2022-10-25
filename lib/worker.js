/* 
*Title: Worker Related File
*Description: Worker Related File
*Author: Niloy Roy
*/

//dependencies
const data = require('./data.js');


//server object - module scaffolding
const worker = {};

//timer to execute worker process once per miniute
worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 1000 * 60);
};


//lookup all the checks

worker.gatherAllChecks = () => {
  //get all the checks

};

//start the workers
worker.init = () => {
    //execute all the checks
    worker.gatherAllChecks();

    //call the loop so that checks continue
    worker.loop();
};



//export
module.exports = worker;