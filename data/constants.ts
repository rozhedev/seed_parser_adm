export const INIT_DATA = {
    domain: "http://localhost:3000",
    sendMsgRoute: "http://localhost:3000/api/tg_message",
};

export const USER_STATES_LIST = {
    waitTokenName: "enter_name",
    tokenInfo: "token_info",
    editTokenName: "edit_name",
    enterSeed: "enter_seed",
};

export const REGEX_LIST = {
    token: /^[a-z0-9]{12}$/,
    enteredLog: /^[a-z]{3,5}:(\d+\.\d+):(\d+(\.\d+)?)$/,
    enteredSeed: /^([a-z]{3,8}\s){11}[a-z]{3,8}/,
};

export const SEED_LENGTH: number = 12;

export const CryptoExchangers = {
    coinbase: "Coinbase",
    kraken: "Kraken",
    kuCoin: "KuCoin",
    bitfinex: "Bitfinex",
    okx: "OKX",
    gateIO: "Gate.io",
    bybit: "Bybit",
    mexc: "MEXC",
    huobi: "Huobi",
    gemini: "Gemini",
    bitget: "Bitget",
    cryptoCom: "Crypto.com",
    lbank: "LBank",
    wazirX: "WazirX",
    phemex: "Phemex",
    coincheck: "Coincheck",
    bitMart: "BitMart",
    poloniex: "Poloniex",
    zbCom: "ZB.com",
};

export const CryptoExchangersValues = Object.values(CryptoExchangers);
