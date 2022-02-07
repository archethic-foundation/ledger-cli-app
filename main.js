#!/usr/bin/env node

const yargs = require('yargs')
const chalk = require('chalk');
var figlet = require('figlet');

const fs = require('fs');
const os = require('os');
const { ArchethicHandler } = require('./lib/handler');
const {
    checkFile,
    readFile,   
    writeFile,
    baseConfigJson
} = require("./lib/utils");

const BASE_DIR = "/.alca"
const HOME_DIR = os.homedir();

if (!fs.existsSync(HOME_DIR + BASE_DIR)) {
    console.log(".alca doesn't exists!! Making Folder with path", HOME_DIR + BASE_DIR);
    fs.mkdirSync(HOME_DIR + BASE_DIR);
}

const encrypted_key_plus_wallet = "0401EC530D1BBDF3B1B3E18C6E2330E5CFD1BFD88EB6D84102184CB39EC271793578B469ACBD8EB4F684C41B5DA87712A203AAA910B7964218794E3D3F343835843C44AFFE281D750E6CA526C6FC265167FE37DB9E47828BF80964DAC837E1072CA9954FF1852FF71865B9043BC117BC001C47D76A326A2A2F7CF6B16AB49E9E57F9D5E6D8E1D00D7F1B7E2F986C711DCA060005B2C8F485"

// Always send CURVE_TYPE with address to Ledger DEVICE or else BADDECODE
// receiver = "0200E48824AB31C949F422E916F2439B5505985C2B1ACC6AF9735BDDF1865B071DA7"


const mainInstance = new ArchethicHandler();


yargs.command({
    command: 'about',
    describe: 'Welcome',

    handler: function (argv) {
        console.log(chalk.green('\n', 'Welcome to Archethic Ledger CLI !', '\n'))
        console.log(chalk.blue(figlet.textSync('AE Ledger CLI', { font: "Alligator2" })))
        console.log(chalk.green('\n', 'Send Transactions to Archethic'))
        console.log(chalk.green('\n', 'Version - 1.0.0', '\n'))

        console.log(chalk.greenBright("Available Commands: \n Use it as ledger_cli `command`"))
        console.log(chalk.cyan(" 1. getAppDetails \n 2. getAppVersion \n 3. getPublicKey \n 4. getArchAddress \n 5. sendTxn"))

    }
})

yargs.command({
    command: 'getAppDetails',
    describe: 'Get the version and name for the Ledger Application',
    handler: function (argv) {
        mainInstance.sendGetAppAndVersion()
    }
})

yargs.command({
    command: 'getAppVersion',
    describe: 'Get the version for the Ledger Application',
    handler: function (argv) {
        mainInstance.sendGetAppVersion()
    }
})

yargs.command({
    command: 'getPublicKey',
    describe: 'Get the PublicKey of the Ledger Device',
    handler: function (argv) {
        mainInstance.sendGetPubKey()
    }
})

yargs.command({
    command: 'getArchAddress',
    describe: 'Get the Archethic Address from the Ledger Device',
    builder: {
        endpoint: {
            describe: 'Node Endpoint',
            demandOption: false,  // Required
            type: 'string'
        },
    },  
    handler: async function (argv) {
        if(await checkFile(HOME_DIR + BASE_DIR)){
            const contents = await readFile(HOME_DIR + BASE_DIR);
            
            mainInstance.setEndPoint(argv.endpoint);
            if(contents.hasOwnProperty("ADDRESS_INDEX")) {
                mainInstance.sendGetArchAddress(contents["ADDRESS_INDEX"], encrypted_key_plus_wallet);
            } else {
                console.log("Config File have no ADDRESS_INDEX. Starting from ADDRESS_INDEX = 0");
                writeFile(HOME_DIR + BASE_DIR ,baseConfigJson);
                mainInstance.sendGetArchAddress(null, encrypted_key_plus_wallet);
            }
            
        } else {
            console.log("Failed to get config file from root Folder.")
        }
    }
})

yargs.command({
    command: 'sendTxn',
    describe: 'Send Transaction APDU Payload to the ledger.',
    builder: {
        endpoint: {
            describe: 'Node Endpoint',
            demandOption: false,  // Required
            type: 'string'
        },
        amount: {
            describe: 'Amount to Send in UCOs (e.g 10.0)',
            demandOption: true, // Required
            type: 'string'
        },
        reciever: {
            describe: 'Address of reciever to recieve UCOs. (68 hex characters) Add 02 in front of address if you are using ARCHEthic wallet Address.',
            demandOption: true, // Required
            type: 'string'
        }
    },
    handler: async function (argv) {
        if(await checkFile(HOME_DIR + BASE_DIR)){
            const contents = await readFile(HOME_DIR + BASE_DIR);
            mainInstance.setEndPoint(argv.endpoint);
            if(contents.hasOwnProperty("ADDRESS_INDEX")) {
                
                mainInstance.sendSignTxn(contents["ADDRESS_INDEX"], argv.reciever, argv.amount, encrypted_key_plus_wallet);
            } else {
                console.log("Config File have no ADDRESS_INDEX. Starting from ADDRESS_INDEX = 0");
                mainInstance.sendSignTxn(null, argv.reciever, argv.amount, encrypted_key_plus_wallet);
            }
            
        } else {
            console.log("Failed to get config file from root Folder.")
        }
    }
})


yargs.parse();