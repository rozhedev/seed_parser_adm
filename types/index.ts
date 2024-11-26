import { type CallbackQueryContext, type CommandContext, Context, InlineKeyboard, Keyboard } from "grammy";
import { ObjectId } from "mongodb";

// Utilities
export type CommandCtx = CommandContext<Context>;
export type CbQueryCtx = CallbackQueryContext<Context>;

export type TContext = CommandCtx | CbQueryCtx;
export type TBoard = Keyboard | InlineKeyboard;

// User
export type TUserState = { [key: number | string]: string };

export type TUser = {
    id?: ObjectId;
    tg_username: string;
    name: string;
    password: string;
    sended_seed: string[];
    is_search_started: boolean;
    is_seed_sended: boolean;
};

export type TUserArr = TUser[];
