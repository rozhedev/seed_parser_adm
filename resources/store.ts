import { TUser, TUserState } from "../types";

// * Store objects
export const USER_STATE: TUserState = {};
export const selectedToken: TUser = {
    tg_username: "",
    name: "",
    password: "",
    sended_seed: [],
    is_search_started: false,
    is_seed_sended: false,
};
