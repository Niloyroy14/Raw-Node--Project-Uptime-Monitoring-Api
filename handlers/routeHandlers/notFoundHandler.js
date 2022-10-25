/* 
*Title: NotFound Handaler
*Description: NotFound Handaler
*Author: Niloy Roy
*Date: 
*/

//module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
    console.log('Route Not Found');
    callback(404, {
        message: 'Your requested Url was not found!',
    });
};

module.exports = handler;