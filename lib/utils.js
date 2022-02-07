
const fs = require('fs');

module.exports.toBigInt = function (number) {
    return number * 100000000
}

module.exports.padHex = function(hexNumber, toLength) {

    if(typeof hexNumber !== 'string'){
        throw "Number Supplied must be a hex String."
    }
    if(typeof toLength !== 'number' || toLength < 0){
        throw "toLength must be a non negative number"
    }

    if (hexNumber.length > toLength){
        throw "Padding can't be more than toLength";
    }

    let finalNumberHex = [];
    
    const pad = toLength - hexNumber.length;
    
    for (var i = 0; i< pad; ++i) {
        finalNumberHex.push("0")
    }
    
    hexNumber.split("").forEach(item => {
        finalNumberHex.push(item);
    })
    
    
    if(finalNumberHex.length == toLength){
        return finalNumberHex.join("").toUpperCase()
    }

    throw "Error in padding hex."
}


module.exports.checkFile = function(dir) {
    try {
        if (fs.existsSync(dir + "/config.json")) {
            return true;
        } else {
            return new Promise((resolve, reject) => {
                fs.writeFile(dir + "/config.json", "{}", { flag: 'wx' }, function (err) {
                    if (err)  reject(err);
                    console.log("Created a new File.");
                    resolve(true);
                })
            });
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports.readFile = function(dir) {
    return new Promise((resolve, reject) => {
        fs.readFile(dir + "/config.json", "utf-8", (err, jsonString) => {
            if (err) {
                throw err;
            }
            try {
                const content = JSON.parse(jsonString);
                resolve(content);
            } catch (err) {
                console.log(err);
                reject(err);
            }
        })
    })
}

module.exports.writeFile = function(dir, json) {
    return new Promise((resolve, reject) => {
        fs.writeFile(dir + "/config.json", JSON.stringify(json), (err, res) => {
            if(err) {
                console.log("Some Error Occured while writing the file.")
                throw err;
            }
            console.log("File Successfully Written!!");
        })
    })
}


module.exports.baseConfigJson = {"ADDRESS_INDEX":"00000000"};

