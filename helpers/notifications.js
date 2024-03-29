/* 
*Title: Notification Library
*Description: Import function to notify users
*Author: Niloy Roy
*Date: 
*/

//depencies

const https = require('https');
const {twilioCredential} = require('./environments.js')
const twilio = require('twilio'); // by library

//module scaffolding
const notifications = {};


//send sms to user using twilio api
notifications.sendTwilioSms = (phone, msg, callback) => {
    //input vallidation
    const userPhone = typeof phone === 'string' && phone.trim().length === 11 ? phone.trim() : false;

    const userMsg = typeof msg === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;

    if (userPhone && userMsg) {

        const accountSid = twilioCredential.accountSid;
        const authToken = twilioCredential.authToken;
        const client = new twilio(accountSid, authToken);

        client.messages
            .create({
                body: userMsg,
                from: twilioCredential.fromPhone,
                statusCallback: 'http://postb.in/1234abcd',
                to: `+88${userPhone}`
            })
            .then(message => console.log(message));

        // //configure the request payload
        // const payload = {
        //     From: twilio.fromPhone,
        //     To: `+88${userPhone}`,
        //     Body: userMsg,
        // };

        // //stringyfy the payload
        // const stringyfyPayload = JSON.stringify(payload);

        // //configure the request details
        // const requestDetails = {
        //     hostName: 'api.twilio.com',
        //     method: 'POST',
        //     path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
        //     auth: `${twilio.accountSid}:${twilio.authToken}`,
        //     headers: {
        //         'Content-Type': 'application/x-www-form-urlencoded',
        //     },
        // };

        // //instantiated the request object

        // const req = https.request(requestDetails, (res) => {
        //     //get the status of the send request
        //     const status = res.statusCode;
        //     console.log(status);
        //     //callback succesfully if the request went throw
        //     if (status === 200 || status === 201) {
        //         callback(false);
        //     } else {
        //         callback(`Status code returned was ${status}`);
        //     }
        // });

        // req.on('error', (e) => {
        //     callback(e);
        // });

        // req.write(stringyfyPayload);
        // req.end();

    } else {
        callback('Given parameters were missing or invalid!');
    }
};

//export the module
module.exports = notifications;
