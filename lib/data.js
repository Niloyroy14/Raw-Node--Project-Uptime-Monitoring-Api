//dependencies
const fs = require('fs');
const path = require('path');

const lib = {};

//base directory of the data folder
lib.basedir = path.join(__dirname, '/../.data/');

//write data to file
lib.create = (dir, file, data, callback) => {
    //open file for writing
    fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            //convert srting data
            const stringData = JSON.stringify(data);
            
            //write data tofile and close it
            fs.writeFile(fileDescriptor, stringData, (err2) => {
                if (!err2) {
                    fs.close(fileDescriptor, (err3) => {
                        if (!err3) {
                            callback(false);
                        } else {
                            callback('Error closing the new file');
                        }
                    })
                } else {
                    callback('Error writing to new file!');
                }
            })
        } else {
            callback('Could not create new file, it may already exits!');
        }
        
    });
};


//raed data from file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf-8', (err, data) => {
        callback(err, data);
    });
};


//update existing file
lib.update = (dir, file, data, callback) => {
    //file open for writing
    fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            //convert srting data
            const stringData = JSON.stringify(data);

            //truncate the file
            fs.ftruncate(fileDescriptor, (err2) => {
                if (!err2) {
                    //write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, (err3) => {
                        if (!err3) {
                            //close the file
                            fs.close(fileDescriptor, (err4) => {
                                if (!err4) {
                                    callback(false);
                                } else {
                                    callback('Error closing file!')
                                }
                            });
                        } else {
                            callback('Error writing to file!');
                        }
                    })
                } else {
                    console.log('Error truncating file!');
                }
            })
        } else {
            console.log('Error updating. File may not exist!');
        }
    });
}

//delete existing file
lib.delete = (dir, file, callback) => {
    //unlink file
    fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback(`Error deleting file`);
        }
    })
}

//list all the items in a directory
lib.list = (dir, callback) => {
    fs.readdir(`${lib.basedir + dir}`, (err, fileNames) => {
        if (!err && fileNames && fileNames.length > 0) {
            let trimmedFileNames = [];
            fileNames.forEach(fileNames =>{
                trimmedFileNames.push(fileNames.replace('.json', ''));
            });
            callback(false,trimmedFileNames);
        } else {
            callback('Error reading directory!');
        }
    });
};

module.exports = lib;