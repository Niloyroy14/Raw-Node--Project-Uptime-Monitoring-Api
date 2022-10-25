/* 
*Title: Utilities
*Description: Handle All utilities related things 
*Author: Niloy Roy
*/


//dependencies
const crypto = require('crypto');
const { type } = require('os');
const environments = require('./environments.js');

//module scaffolding
const utilities = {};

//parse JSON string to Object
utilities.parseJSON = async (jsonString) => {

    let output;

    try {
        output = await JSON.parse(jsonString);
    } catch {
        output = {};
    }
   // console.log(output);
    return output;
}


//hash string
utilities.hash = (str) => {
    if (typeof (str) === 'string' && str.length > 0) {
        const hash = crypto.createHmac("sha256", environments.secretKey)
            .update(str)
            .digest("hex");
        return hash;
    } else {
        return false;
    }
    
}


//create random string
utilities.createRandomString = (strlength) => {
    let length = strlength;
    length = typeof (strlength) === 'number' && strlength > 0 ? strlength : false;
    if (length) {
        let possiblecharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let output = '';
        for (i = 1; i <= length; i++){
            let randomCharacter = possiblecharacters.charAt(Math.floor(Math.random() * possiblecharacters.length));
            output += randomCharacter;
        }
        return output;
    } else {
        return false;
    }
}




//export module
module.exports = utilities;