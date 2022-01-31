
const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const { listen } = require("@ledgerhq/logs");
const archethic = require('archethic')

const chalk = require('chalk');

// console.log(txnBuilder.originSignaturePayload())
const ORIGIN_SIGNATURE_PRIVATE_KEY = "009280BDB84B8F8AEDBA205FE3552689964A5626EE2C60AA10E3BF22A91A036009";
const encrypted_key_plus_wallet = "0401EC530D1BBDF3B1B3E18C6E2330E5CFD1BFD88EB6D84102184CB39EC271793578B469ACBD8EB4F684C41B5DA87712A203AAA910B7964218794E3D3F343835843C44AFFE281D750E6CA526C6FC265167FE37DB9E47828BF80964DAC837E1072CA9954FF1852FF71865B9043BC117BC001C47D76A326A2A2F7CF6B16AB49E9E57F9D5E6D8E1D00D7F1B7E2F986C711DCA060005B2C8F485"
const address_index = "00000001"
// Address APDU
const test_payload_addr = address_index + encrypted_key_plus_wallet

const endpoint = "https://testnet.archethic.net"

function toHex(bytes) {
    return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}

class ArchethicHandler {

    constructor() {
        this.instance = null;
    }

    connectDevice = () => {
        this.isConnected()
        if(!this.instance)
        this.instance = TransportNodeHid.open("")
    }

    isConnected = () => {
        TransportNodeHid.list().then(res => {
            if (res.length == 0) {
                throw Error("Please make sure ledger device is connected to your computer and unlocked. !!!");
            }
            return true;
        })
    }

    sendGetAppAndVersion = () => {
        this.connectDevice()
        this.instance
            .then(async (transport) => {
                listen(log => console.log)
                let res = await transport.send(0xb0, 0x01, 0, 0);
                let appName = res.toString().replace(/[^a-zA-Z]/g, '');
                let version = res.toString().replace(/[^0-9]/g, '').split("").join(".")

                console.log("Got reponse from the device")
                console.log("Application Name: ", appName)
                console.log("Application Version: ", version)
            })
    }

    sendGetAppVersion = () => {
        this.connectDevice()
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
            })
    }

    sendGetPubKey = () => {
        this.connectDevice()
        this.instance
            .then(async (transport) => {
                listen(log => console.log)
                let res = await transport.send(0xe0, 0x02, 0, 0);
                console.log("Response for Get Pubkey", res);
                console.log(res.toString("hex"))
            })
    }

    sendGetArchAddress = async (payload) => {
        // console.log(payload)
        this.connectDevice()
        return new Promise((resolve, reject) => {
            this.instance
            .then(async (transport) => {
                listen(log => console.log)
                console.log(transport.device);
                let res = await transport.send(0xe0, 0x04, 0, 0, Buffer.from(payload, "hex"));
                console.log("Response for Get Arch Address", res);
                console.log(res.toString("hex"))
                resolve(res.toString("hex"));
            })
        });
    }

    sendSignTxn = (payload, reciever) => {
        this.connectDevice()
        this.instance
            .then(async (transport) => {
                listen(log => console.log(log))
                console.log(transport.deviceModel)
                let res = await transport.send(0xe0, 0x08, 0, 0, Buffer.from(payload, "hex"))
                // console.log(res.toString("hex"))
                const rawTxn = res.toString("hex").slice(0, -4)
                let offset = 0;
                const txnHash = rawTxn.slice(0, 64)
                // console.log(rawTxn, "----", txnHash)
                offset += 64;
                const signTag = rawTxn.slice(offset, offset + 2)
                const signLen = rawTxn.slice(offset + 2, offset + 4)
                const asn_der_sign = rawTxn.slice(offset, offset + 4 + (parseInt(signLen, 16)*2))

                // console.log(signTag)
                // console.log(signLen)
                // console.log(asn_der_sign)

                offset += 4 + (parseInt(signLen, 16)*2)

                const curve_type = rawTxn.slice(offset, offset + 2)
                offset += 2
                const origin_type = rawTxn.slice(offset, offset + 2)
                offset += 2

                const pub_key = rawTxn.slice(offset, rawTxn.length)

                // console.log(curve_type)
                // console.log(origin_type)
                // console.log(pub_key)
                
                // Process Transaction Here
                const txnBuilder = archethic.newTransactionBuilder("transfer");
                        txnBuilder.addUCOTransfer(receiver, 10.0)
                        txnBuilder.setPreviousSignatureAndPreviousPublicKey(asn_der_sign, pub_key);

                const thisAddr = await this.sendGetArchAddress(test_payload_addr);
                console.log(thisAddr.slice(0, -4))
                const rawAddr = thisAddr.slice(0, -4);
                console.log(rawAddr.slice(2, rawAddr.length));
                const absAddr = rawAddr.slice(2, rawAddr.length);
                    txnBuilder.setAddress(absAddr)
                console.log(thisAddr.slice(0, -4).slice(0, 2));
                console.log(txnBuilder.toJSON());

                const signedTxn = txnBuilder.originSign(ORIGIN_SIGNATURE_PRIVATE_KEY);
                console.log(txnHash);
                console.log(signedTxn);

                archethic.sendTransaction(signedTxn, endpoint).then(() => {
            
                    console.log(chalk.blue("Transaction Sent Successfully !"))
                    console.log(chalk.green(endpoint+"/explorer/transaction/"+(toHex(signedTxn.address))+""))
                    
                })

            })
    }
}

module.exports = {
    ArchethicHandler
};
