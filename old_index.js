/* 
*Title: Uptime Monitoring Application
*Description: Application 
*Author: Niloy Roy
*/

//dependencies
const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes.js');
const environment = require('./helpers/environments.js');
const data = require('./lib/data.js');
const { sendTwilioSms } = require('./helpers/notifications.js');

//app object - module scaffolding
const app = {};

//test twilio delete later

// sendTwilioSms('01727532825', 'Hello World', (e) => {
//     console.log(`this is the error`,e);
// });


//testing file system
//pore muche dibo
// data soho file create hocche kina check korar jonne,
// data.create('test', 'newFile', { name: 'Bangladesh', language: 'Bangla' },  (err)=> {
//     console.log(`error was`, err);
// });


// // data  read hocche kina file theke check korar jonne,
// data.read('test', 'newFile', (err,result) => {
//     console.log(err,result);
// });

// // data update hocche kina file theke check korar jonne,
// data.update('test', 'newFile', { name: 'India', language: 'Hindi' }, (err) => {
//     console.log(err);
// });

// data delete hocche kina file theke check korar jonne,
// data.delete('test', 'newFile', (err) => {
//     console.log(err);
// });

//create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(environment.port, () => {
        console.log(`listening to port ${environment.port}`);
    });
}

//handle Request Response
app.handleReqRes = handleReqRes;

//start the server
app.createServer();