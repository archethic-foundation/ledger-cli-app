
const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const { listen } = require("@ledgerhq/logs");
const archethic = require('archethic')
const { toBigInt, padHex, writeFile } = require("./utils");

const chalk = require('chalk');
const fs = require('fs');
const os = require('os');

const BASE_DIR = "/.alca"
const HOME_DIR = os.homedir();

const ORIGIN_SIGNATURE_PRIVATE_KEY = "01009280BDB84B8F8AEDBA205FE3552689964A5626EE2C60AA10E3BF22A91A036009";

const ENDPOINT = "https://testnet.archethic.net"

function toHex(bytes) {
    return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}

class ArchethicHandler {

    constructor() {
        this.instance = null;
        this.endpoint = ENDPOINT;
    }

    setEndPoint = (endpoint) => {
        if (endpoint && endpoint.startsWith("https://")) {
            this.endpoint = endpoint;
        } else {
            console.log("Not a Valid Endpoint using default: ", ENDPOINT);
            this.endpoint = ENDPOINT;
        }
    }

    connectDevice = () => {
        if (!this.instance)
            this.instance = TransportNodeHid.open("")
    }

    isConnected = () => {
        return new Promise((resolve, reject) => {
            TransportNodeHid.list().then(res => {
                if (res.length == 0) {
                    throw Error("Please make sure ledger device is connected to your computer and unlocked. !!!");
                }
                resolve(true);
            })
        })
    }

    sendGetAppAndVersion = async () => {
        this.connectDevice()
        return new Promise((resolve, reject) => {
            this.instance
                .then(async (transport) => {
                    listen(log => console.log)
                    let res = await transport.send(0xb0, 0x01, 0, 0);
                    let appName = res.toString().replace(/[^a-zA-Z]/g, '');
                    let version = res.toString().replace(/[^0-9]/g, '').split("").join(".")

                    console.log("Got reponse from the device")
                    console.log("Application Name: ", appName)
                    console.log("Application Version: ", version)
                    resolve(appName + "|" + version);
                })
        })

    }

    sendGetAppVersion = async () => {
        this.connectDevice()
        return new Promise((resolve, reject) => {
            this.instance
                .then(async (transport) => {
                    listen(log => console.log)
                    let res = await transport.send(0xe0, 0x01, 0, 0);
                    // console.log("Response for Get Application Version", res);
                    const verArr = res.toString("hex").slice(0, -4).split("");
                    // console.log(verArr)
                    var versionStr = "";
                    for (let i = 0; i < verArr.length; i += 2) {
                        versionStr += verArr[i] + verArr[i + 1] + "."
                    }
                    console.log("Current Installed Device Version :", versionStr.slice(0, -1));
                    resolve(versionStr.slice(0, -1));
                })
        })

    }

    sendGetPubKey = async () => {
        this.connectDevice()
        return new Promise((resolve, reject) => {
            this.instance
                .then(async (transport) => {
                    listen(log => console.log)
                    let res = await transport.send(0xe0, 0x02, 0, 0);
                    console.log("Response for Get Pubkey", res);
                    console.log("Ledger Origin PublicKey: ", res.toString("hex").slice(0, -4))
                    resolve(res.toString("hex"))
                })
        })
    }

    sendGetArchAddress = async (address_index, encrypted_key_plus_wallet) => {
        this.connectDevice();
        let addrIndex;
        if (address_index === null || address_index === undefined) {
            addrIndex = "00000000";
        } else {
            addrIndex = address_index;
        }
        return new Promise((resolve, reject) => {
            this.instance
                .then(async (transport) => {
                    listen(log => console.log)
                    console.log(transport.device);
                    let res = await transport.send(0xe0, 0x04, 0, 0, Buffer.from(addrIndex + encrypted_key_plus_wallet, "hex"));
                    console.log("Address :", res.toString("hex").slice(0, -4));
                    console.log("Address Index: ", addrIndex);
                    resolve(res.toString("hex"));
                })
        });
    }

    sendSignTxn = (address_index, reciever, amount, encrypted_key_plus_wallet) => {
        this.connectDevice()
        return new Promise((resolve, reject) => {

            this.instance
                .then(async (transport) => {

                    listen(log => console.log(log))
                    // console.log(transport.deviceModel)

                    // Check in advance the requirements
                    let txnAmount = parseFloat(amount);
                    // console.log(txnAmount);

                    let addrIndex;
                    if (address_index === null) {
                        addrIndex = "00000000";
                    } else {
                        addrIndex = address_index;
                    }

                    txnAmount = padHex(toBigInt(txnAmount).toString(16), 16);
                    console.log(txnAmount);
                    const recAddr = reciever.toUpperCase();
                    if (recAddr.length !== 68) {
                        throw "Reciever needs to contain also curve_type!! Add 02 in front of address if you are using ARCHEthic wallet Address."
                    }

                    const enc_k_p_w = encrypted_key_plus_wallet.toUpperCase();

                    const payload = addrIndex + recAddr + txnAmount + enc_k_p_w;
                    // console.log(payload);

                    let res = await transport.send(0xe0, 0x08, 0, 0, Buffer.from(payload, "hex"))
                    // console.log(res.toString("hex"))
                    const rawTxn = res.toString("hex").slice(0, -4)
                    // console.log(rawTxn)
                    let offset = 0;
                    const txnHash = rawTxn.slice(0, 64)

                    offset += 64;
                    // const curve_type = rawTxn.slice(offset, offset + 2)
                    // const origin_type = rawTxn.slice(offset + 2, offset + 4)

                    // Public Key with curve_type and origin_type
                    const pub_key = rawTxn.slice(offset, offset + 67 * 2)
                    offset += 67 * 2

                    // Signed Transaction with signTag 
                    // const signTag = rawTxn.slice(offset, offset + 2)
                    const signLen = rawTxn.slice(offset + 2, offset + 4)
                    const asn_der_sign = rawTxn.slice(offset, offset + 4 + (parseInt(signLen, 16) * 2))


                    // New Transaction Builder
                    const txnBuilder = archethic.newTransactionBuilder("transfer");

                    txnBuilder.addUCOTransfer(recAddr.slice(2, recAddr.length), parseFloat(amount));
                    txnBuilder.setPreviousSignatureAndPreviousPublicKey(asn_der_sign, pub_key);


                    // To get next address
                    let nextIndex = parseInt(Number("0x" + addrIndex), 16);
                    nextIndex += 1;
                    const nextAddrIndexHex = padHex(nextIndex.toString(16), 8);

                    // Send Device to get next Address
                    const nextAddr = await this.sendGetArchAddress(nextAddrIndexHex, enc_k_p_w);

                    // remove 9000 SW_OK response from address
                    const rawAddr = nextAddr.slice(0, -4);
                    // removing curve_type from start of the address
                    const absNextAddr = rawAddr.slice(2, rawAddr.length);
                    txnBuilder.setAddress(absNextAddr)

                    const signedTxn = txnBuilder.originSign(ORIGIN_SIGNATURE_PRIVATE_KEY);


                    archethic.sendTransaction(signedTxn, this.endpoint).then((res) => {
                        console.log(res);
                        console.log(chalk.blue("Transaction Sent Successfully !"))
                        console.log(chalk.green(this.endpoint + "/explorer/transaction/" + (toHex(signedTxn.address))))
                        writeFile(HOME_DIR + BASE_DIR, { "ADDRESS_INDEX": nextAddrIndexHex })
                        resolve(true);
                    })

                })
        });
    }
}

module.exports = {
    ArchethicHandler
};
