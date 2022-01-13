#!/usr/bin/env node

const yargs = require('yargs')
const chalk = require('chalk');
var figlet = require('figlet');
const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const { listen } = require("@ledgerhq/logs");


// const { hideBin } = require('yargs/helpers')
// const argv = yargs(hideBin(process.argv)).argv

// console.log(argv);
const apdu_payload = "79CCB90235842588695A0B99256EB316A9E6807C8277564115FCA1A67FDA08FD0401EC530D1BBDF3B1B3E18C6E2330E5CFD1BFD88EB6D84102184CB39EC271793578B469ACBD8EB4F684C41B5DA87712A203AAA910B7964218794E3D3F343835843C44AFFE281D750E6CA526C6FC265167FE37DB9E47828BF80964DAC837E1072CA9954FF1852FF71865B9043BC117BC001C47D76A326A2A2F7CF6B16AB49E9E57F9D5E6D8E1D00D7F1B7E2F986C711DCA060005B2C8F485";

const sendSignTxn = (payload) => {
    TransportNodeHid.open("")
    .then(async (transport) => {
      listen(log => console.log(log))
      console.log(transport.deviceModel)
      let res = await transport.send(0xe0, 0x08, 0, 0, Buffer.from(apdu_payload, "hex"))
      console.log(res)
    })
}




yargs.command({
    command: 'about',
    describe: 'Welcome',

    handler: function (argv)
    {   
        console.log(chalk.green('\n','Hello and Welcome to Archethic Ledger CLI !','\n'))
        console.log(chalk.blue(figlet.textSync('AE Ledger CLI',{font : "Alligator2"})))
        console.log(chalk.green('\n','Send Transactions to Archethic'))
        console.log(chalk.green('\n','Version - 1.0.0','\n'))
        
    }
})

yargs.command({
    
    command: 'generate-address',
    describe: 'Generate Address',
    builder: {
        seed: {
            describe: 'Seed',
            demandOption: true,  // Required
            type: 'string'     
        },
        index: {
            describe: 'Index',
            demandOption: true,  // Required
            type: 'number'     
        }
       
    },
    
    handler: function (argv)
    {   
       
        sendSignTxn(apdu_payload)
    
    }
})


yargs.parse();