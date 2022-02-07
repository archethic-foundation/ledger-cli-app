var assert = require('assert');
const { ArchethicHandler } = require('../lib/handler');


const is_curve_type = (curve_type) => {
  // Allowed Curve Types

  // curve_type [1 byte] =

  // 0: ED25519
  // 1: NISTP256 (SECP256R1/PRIME256V1)
  // 2: SECP256K1
  return curve_type === "01" || curve_type === "00" || curve_type === "02"
}

const is_origin_type = (origin_type) => {
  // Allowed Origin Types
  // 0: Onchain Wallet
  // 1: Software Wallet (Node, Mobile App, Desktop, etc.)
  // 2: TPM (Node)
  // 3: Yubikey (Node, Hardware Wallet)
  // 4: Ledger (Hardware Wallet)
  return origin_type === "00" || origin_type === "01" || origin_type === "02" || origin_type === "03" || origin_type === "04"
}

const is_hash_type = (hash_type) => {
  // Allowed Hash Type
  // 0: SHA256 (sha2)
  // 1: SHA512 (sha2)
  // 2: SHA3_256 (keccak)
  // 3: SHA3_512 (keccak)
  // 4: BLAKE2B\
  return hash_type === "00" || hash_type === "01" || hash_type === "02" || hash_type === "03" || hash_type === "04"
}

describe('Archethic Ledger Tests', function () {

  const encrypted_key_plus_wallet = "0401EC530D1BBDF3B1B3E18C6E2330E5CFD1BFD88EB6D84102184CB39EC271793578B469ACBD8EB4F684C41B5DA87712A203AAA910B7964218794E3D3F343835843C44AFFE281D750E6CA526C6FC265167FE37DB9E47828BF80964DAC837E1072CA9954FF1852FF71865B9043BC117BC001C47D76A326A2A2F7CF6B16AB49E9E57F9D5E6D8E1D00D7F1B7E2F986C711DCA060005B2C8F485"
  const receiver = "0200E48824AB31C949F422E916F2439B5505985C2B1ACC6AF9735BDDF1865B071DA7"
  const address_index = "0000000";
  const instance = new ArchethicHandler();
  const ENDPOINT = "https://testnet.archethic.net"

  this.beforeEach(async () => {
    instance.instance = null;
  })

  describe(" Endpoint Checks", () => {
    it("default endpoint", () => {
      assert.equal(instance.endpoint, ENDPOINT, "Default Endpoint Doesn't Match");
    })
    it("changes Endpoint", () => {
      let newEndPoint = "https://mainnet.archethic.net"
      instance.setEndPoint(newEndPoint);
      assert.equal(instance.endpoint, newEndPoint, "New Endpoint doesn't Set");
      assert.notEqual(instance.endpoint, ENDPOINT, "Endpont should not be equal to default Endpoint.");
    })
  })

  describe('Archethic Name and Version.', async () => {
    it('should return app version and name', async () => {
      await instance.connectDevice();
      let res = await instance.sendGetAppAndVersion();
      const resArr = res.split("|");
      assert.equal(resArr[0], "ARCHEthic", "Name is not equals to `ARCHEthic`");
      assert.equal(resArr[1], "1.0.1", "Version should be equal to 1.0.1");

      res = await instance.sendGetAppVersion();
      const verArr = res.split(".");
      assert.equal(verArr[0], "01", "First Hex to be `01`");
      assert.equal(verArr[1], "00", "Second Hex to be `00`");
      assert.equal(verArr[2], "01", "Third Hex to be `01`");

    });
  });

  describe("Get Ledger Origin Public Key", async () => {

    it("should return device origin public key", async function() {
      // Set timeout for this test to be 30 seconds
      this.timeout(30000);
      let res = await instance.sendGetPubKey();
      let fullPubkey = res.slice(0, -4);
      assert.equal(fullPubkey.length, 134, "Public Key Length Doesn't Match");
      let offset = 0;
      const curve_type = res.slice(offset, offset + 2);
      offset += 2;
      const device_origin = res.slice(offset, offset + 2);
      offset += 2;
    
      assert(is_curve_type(curve_type), "Curve Type is unknown");
      assert(is_origin_type(device_origin), "Device Origin is Unknown");
    })
  })
  

  // describe("Get Sign the transaction", async () => {
  //   it("should return valid address", async function() {
  //     this.timeout(30000);
  //     console.log(instance.instance);
  //     let res = await instance.sendSignTxn(address_index,receiver, 47 ,encrypted_key_plus_wallet);
  //     console.log(res);
  //   })
  // })

  // describe("Get Ledger Address", async () => {
  //   it("should return valid address", async function() {
  //     this.timeout(30000);
  //     let res = await instance.sendGetArchAddress(address_index, encrypted_key_plus_wallet);
  //     console.log(res);
  //   })
  // })

});
