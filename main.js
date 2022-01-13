#!/usr/bin/env node

const yargs = require('yargs');
const chalk = require('chalk');
const figlet = require('figlet');

yargs.command({
    command: 'about',
    describe: 'Welcome',
   

    handler: function (argv)
    {   
        console.log(chalk.green('\n','Hello and Welcome to AeWeb !','\n'))
        console.log(chalk.blue(figlet.textSync('AeWeb',{font : "Alligator2"})))
        console.log(chalk.green('\n','Create your Website on top of ArchEthic'))
        console.log(chalk.green('\n','Version - 1.0.0','\n'))
        
    }
}); 

yargs.parse()

