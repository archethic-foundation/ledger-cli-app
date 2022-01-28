#!/usr/bin/env node

const yargs = require('yargs')
const chalk = require('chalk');
var figlet = require('figlet');

// const {
//     sendGetPubKey,
//     sendGetAppVersion,
//     sendGetArchAddress,
//     sendSignTxn
//  } = require("./lib/handler");

 const { ArchethicHandler } = require('./lib/handler');
 const archethic = require('archethic')

// const { hideBin } = require('yargs/helpers')
// const argv = yargs(hideBin(process.argv)).argv

encrypted_key_plus_wallet = "0401EC530D1BBDF3B1B3E18C6E2330E5CFD1BFD88EB6D84102184CB39EC271793578B469ACBD8EB4F684C41B5DA87712A203AAA910B7964218794E3D3F343835843C44AFFE281D750E6CA526C6FC265167FE37DB9E47828BF80964DAC837E1072CA9954FF1852FF71865B9043BC117BC001C47D76A326A2A2F7CF6B16AB49E9E57F9D5E6D8E1D00D7F1B7E2F986C711DCA060005B2C8F485"
address_index = "00000000"
receiver = "020019CA33A6CA9E69B5C29E6E8497CC5AC9675952F847347709AD39C92C1B1B5313"
amount = "000000038407B700"

// Address APDU
const apdu_hex_payload_addr = address_index + encrypted_key_plus_wallet

// Sign APDU
const apdu_hex_payload = address_index + receiver + amount + encrypted_key_plus_wallet

const mainInstance = new ArchethicHandler();

const txnBuilder = archethic.newTransactionBuilder("transfer");
        txnBuilder.addUCOTransfer(receiver, 10.0)

// console.log(txnBuilder.originSignaturePayload())

yargs.command({
    command: 'about',
    describe: 'Welcome',

    handler: function (argv)
    {   
        console.log(chalk.green('\n','Welcome to Archethic Ledger CLI !','\n'))
        console.log(chalk.blue(figlet.textSync('AE Ledger CLI',{font : "Alligator2"})))
        console.log(chalk.green('\n','Send Transactions to Archethic'))
        console.log(chalk.green('\n','Version - 1.0.0','\n'))

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
    handler: function (argv) {
        mainInstance.sendGetArchAddress(apdu_hex_payload_addr);
    }   
})

yargs.command({
    command: 'sendTxn',
    describe: 'Send Transaction APDU Payload to the ledger.',
    builder: { },
    handler: function (argv) {   
        mainInstance.sendSignTxn(apdu_hex_payload)
    }
})


yargs.parse();