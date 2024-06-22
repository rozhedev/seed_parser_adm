import { TUser, TUserState } from "../types";

// * Store objects
export const USER_STATE: TUserState = {};
export const selectedToken: TUser = {
    name: "",
    password: "",
    is_search_started: false,
    is_seed_sended: false,
};
