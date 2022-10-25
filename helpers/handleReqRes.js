/* 
*Title: Handle Request Response
*Description: Application request response handlaning
*Author: Niloy Roy
*/

//dependencies

const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes.js');
const {notFoundHandler} = require('../handlers/routeHandlers/notFoundHandler.js');
const { parseJSON } = require('../helpers/utilities.js');


//module scaffolding
const handler = {};


handler.handleReqRes = (req, res) => {
    //request handaling
    //get the url and parse it
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const queryStringObject = parsedUrl.query;
    const headersObject = req.headers;

    const requestProperties = {
        parsedUrl,
        path,
        trimmedPath,
        method,
        queryStringObject,
        headersObject,
    };

    const decoder = new StringDecoder('utf-8');
    let realData = '';

    //call routes
    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;

    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });

    req.on('end', async () => {
        realData +=  decoder.end();
       // console.log(realData);

        requestProperties.body = await parseJSON(realData);

        chosenHandler(requestProperties, (statusCode, payload) => {
            statusCode = typeof statusCode === 'number' ? statusCode : 500;
            payload = typeof payload === 'object' ? payload : {};

            const payloadString = JSON.stringify(payload);

            //return the final response
            res.setHeader('Content-Type','application\json');
            res.writeHead(statusCode);
            res.end(payloadString);

        });

        //response handling
        //res.end('Hello Raw Node Js Project');
    });
}


module.exports = handler;