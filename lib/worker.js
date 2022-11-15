/* 
*Title: Worker Related File
*Description: Worker Related File
*Author: Niloy Roy
*/

//dependencies
const url = require('url')
const data = require('./data.js');
const http = require('http');
const https = require('https');
const { parseJSON } = require('../helpers/utilities.js');
const { sendTwilioSms } = require('../helpers/notifications.js');



//server object - module scaffolding
const worker = {};

//timer to execute worker process once per miniute
worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 8000);
};


//lookup all the checks

worker.gatherAllChecks = () => {
    //get all the checks
    data.list('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach(check => {
                //read the checkData
                data.read('checks', check, async (err2, originalCheckData) => {
                    if (!err2 && originalCheckData) {
                        //pass the data to the check validator
                        let parseoriginalCheckData = await parseJSON(originalCheckData);
                       
                        worker.validateCheckData(parseoriginalCheckData);
                    } else {
                        console.log('Error: reading one of the checks data');
                    }
                });
            });
        } else {
            console.log('Could Not Found Any Check Process');
        }
    });
};

//validate individual check data
worker.validateCheckData = (originalData) => {
    let originalCheckData = originalData;
    if (originalCheckData && originalCheckData.id) {
         originalCheckData.state = typeof (originalCheckData.state) === 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';
        originalCheckData.lastChecked = typeof (originalCheckData.lastChecked) === 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;

        //pass to the next process
        worker.performCheck(originalCheckData);
    } else {
        console.log('Error','Check was invalid or not properly formatted!');
    }
};

//perform check
worker.performCheck = (originalCheckData) => {
   //prepare the initail check outcome
    let checkOutCome = {
        'error': false,
        'responseCode':false
    };
    //mark the outcome has not been sent yet
    let outcomeSent = false;

    //pass the hostname and full url from original data
    let parsedUrl = url.parse(originalCheckData.protocol + '://' + originalCheckData.url,true);
    const hostName = parsedUrl.hostname;
    const path = parsedUrl.path;

    //construct the request 
    const requestDetails = {
        'protocol': originalCheckData.protocol + ':',
        'hostname': hostName,
        'method': originalCheckData.method.toUpperCase(),
        'path': path,
        'timeout': originalCheckData.timeoutSeconds * 1000,
    };
    
    const protocolToUse = originalCheckData.protocol === 'http' ? http : https;

    let req = protocolToUse.request(requestDetails, (res) => {
        //grab the status of the response
        const status = res.statusCode;

        //update the check outcome and pass to the next process
        checkOutCome.responseCode = status;
        if (!outcomeSent) {
            worker.processCheckOutCome(originalCheckData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.on('error', (e) => {
         checkOutCome = {
            'error': true,
            'value': e,
        };
        //update the check outcome and pass to the next process
        if (!outcomeSent) {
            worker.processCheckOutCome(originalCheckData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.on('timeout', () => {
       checkOutCome = {
            'error': true,
            'value': 'timeout',
        };
        //update the check outcome and pass to the next process
        if (!outcomeSent) {
            worker.processCheckOutCome(originalCheckData, checkOutCome);
            outcomeSent = true;
        }
    });

    //req send
    req.end();

}

//save check outcome to database and send to next process
worker.processCheckOutCome = (originalCheckData, checkOutCome) => {
    //check if checkoutcome is up or down
    let state = !checkOutCome.error && checkOutCome.responseCode && originalCheckData.succesCode.indexOf(checkOutCome.responseCode) > -1 ? 'up' : 'down';

    // deceide whether we should alert the user or not
    let alertWanted = originalCheckData.lastChecked && originalCheckData.state != state ? true : false;

    //updat ethe checkdata
    let newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    //update to check to disk
    data.update('checks', newCheckData.id, newCheckData, (err) => {
        if (!err) {
            if (alertWanted) {
                //send the check data to next process
                worker.alertUserToChangeStatus(newCheckData);
            } else {
                console.log('Alert is not needed as there is no state change!')
            }
        } else {
            console.log('Error Trying to save check data of one of the checks!')
        }
    });

}

//send notification sms to user if the state changes
worker.alertUserToChangeStatus = (newCheckData) => {
    let msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;
    sendTwilioSms(newCheckData.userPhone, msg, (err) => {
        if (!err) {
            console.log(`User was alerted to a status change via SMS: ${msg}`);
        } else {
            console.log('There was a problem sending sms to one of the user!');
        }
    });
}
//start the workers
worker.init = () => {
    //execute all the checks
    worker.gatherAllChecks();
    //call the loop so that checks continue
    worker.loop();
};



//export
module.exports = worker;