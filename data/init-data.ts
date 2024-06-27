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
};

export const SEED_LENGTH: number = 12;
