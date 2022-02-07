# ALCA: Archethic Ledger CLI App

## Instructions to Run

- Clone this Repositoy
- Inside the directory run `npm install`
- Run `npm link`
- From Terminal use it as `ledger_cli (about | getAppVersion | getPublicKey | getArchAddress | sendTxn)`

## Usage Example
+ ledger_cli getArchAddress
+ ledger_cli sendTxn --amount 47.00 --reciever 0200E49887E794D068C79D0D779F16D3B9D879EC007BE8FA4959CCE3450BE6DB859D

## Additional Info
+ For `address_index` please check file named `config.json` in `YOUR_HOME_PATH/.alca/config.json`

## If any Error 
- Make sure that archethic/lib/transaction_builder have following functions

- setPreviousSignatureAndPreviousPublicKey(prevSign, prevPubKey) {
    if (typeof(prevSign) == "string") {
      if (!isHex(prevSign)) {
        throw "'previous Signature' must be in hexadecimal form if it's string"
      }
    }
    if (typeof(prevPubKey) == "string") {
      if (!isHex(prevPubKey)) {
        throw "'previous Public Key' must be in hexadecimal form if it's string"
      }
    }
    
    this.previousPublicKey = hexToUint8Array(prevPubKey);
    this.previousSignature = hexToUint8Array(prevSign);
    return this
  }

- setAddress(addr) {
    if (typeof(addr) !== "string" && !(addr instanceof Uint8Array)) {
      throw "'addr' must be a string or Uint8Array"
    }

    if (typeof(addr) == "string") {
      if (!isHex(addr)) {
        throw "'addr' must be in hexadecimal form if it's string"
      }
      addr = hexToUint8Array(addr)
    }
    this.address = addr;
    return this
  }