/* 
*Title: Environments
*Description: Handle All environments related things 
*Author: Niloy Roy
*/


//dependencies



//module scaffolding
const environments = {};

environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'hdstryffhgfmm',
    maxChecks: 5,
    twilio: {
        fromPhone: '+14243641116',
        accountSid: 'ACeed18a81af557089151ba56244762ace',
        authToken: '1e37c4b96be35b98b5155d851d837aa3'
    },
};

environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'hdhklstryffyryfnhgfmm',
    maxChecks: 5,
    twilio: {
        fromPhone: '+14243641116',
        accountSid: 'ACeed18a81af557089151ba56244762ace',
        authToken: '1e37c4b96be35b98b5155d851d837aa3'
    },
};


//determine which environment was passed
const currentEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

//export corresponding environment object
const environmentToExport = typeof environments[currentEnvironment] === 'object' ? environments[currentEnvironment] : environments.staging;

//export module
module.exports = environmentToExport;