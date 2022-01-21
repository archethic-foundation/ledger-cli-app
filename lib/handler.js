
const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const { listen } = require("@ledgerhq/logs");

const sendGetAppVersion = () => {
    TransportNodeHid.open("")
        .then(async (transport) => {
            listen(log => console.log)
            let res = await transport.send(0xe0, 0x01, 0, 0);
            console.log("Response for Get Application Version", res);
            const verArr = res.toString("hex").slice(0, -4).split("");
            console.log(verArr)
            var versionStr = "";
            for (let i = 0; i < verArr.length; i += 2) {
                versionStr += verArr[i] + verArr[i + 1] + "."
            }
            console.log("Current Installed Device Version :", versionStr.slice(0, -1));
        })
}

const sendGetPubKey = () => {
    TransportNodeHid.open("")
        .then(async (transport) => {
            listen(log => console.log)
            let res = await transport.send(0xe0, 0x02, 0, 0);
            console.log("Response for Get Pubkey", res);
            console.log(res.toString("hex"))
        })
}

const sendGetArchAddress = (payload) => {
    // console.log(payload)
    TransportNodeHid.open("")
        .then(async (transport) => {
            listen(log => console.log)
            console.log(transport.device);
            let res = await transport.send(0xe0, 0x04, 0, 0, Buffer.from(payload, "hex"));
            console.log("Response for Get Arch Address", res);
            console.log(res.toString("hex"))
        })
}

const sendSignTxn = (payload) => {
    TransportNodeHid.open("")
        .then(async (transport) => {
            listen(log => console.log(log))
            console.log(transport.deviceModel)
            let res = await transport.send(0xe0, 0x08, 0, 0, Buffer.from(payload, "hex"))
            console.log(res.toString("hex"))
        })
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

    sendGetArchAddress = (payload) => {
        // console.log(payload)
        this.connectDevice()
        this.instance
            .then(async (transport) => {
                listen(log => console.log)
                console.log(transport.device);
                let res = await transport.send(0xe0, 0x04, 0, 0, Buffer.from(payload, "hex"));
                console.log("Response for Get Arch Address", res);
                console.log(res.toString("hex"))
            })
    }

    sendSignTxn = (payload) => {
        this.connectDevice()
        this.instance
            .then(async (transport) => {
                listen(log => console.log(log))
                console.log(transport.deviceModel)
                let res = await transport.send(0xe0, 0x08, 0, 0, Buffer.from(payload, "hex"))
                console.log(res.toString("hex"))
            })
    }
}

module.exports = {
    ArchethicHandler
};

// module.exports = {
//     sendGetAppVersion,
//     sendGetArchAddress,
//     sendGetPubKey,
//     sendSignTxn
// }