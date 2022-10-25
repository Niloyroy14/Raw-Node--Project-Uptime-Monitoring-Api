/* 
*Title: Handle Request Response
*Description: Application Routes
*Author: Niloy Roy
*Date: 
*/

//dependencies
const { sampleHandler } = require('./handlers/routeHandlers/sampleHandaler.js');
const { userHandler } = require('./handlers/routeHandlers/userHandler.js');
const { tokenHandler } = require('./handlers/routeHandlers/tokenHandler.js');
const { checkHandler } = require('./handlers/routeHandlers/checkHandler.js');


const routes = {
     sample: sampleHandler,
     user: userHandler,
     token: tokenHandler,
     check: checkHandler,
};

module.exports = routes;