import { CallbackQueryContext, CommandContext, Context, InlineKeyboard, Keyboard } from "grammy";
import { ObjectId } from "mongodb";

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

export type TContext = CommandContext<Context> | CallbackQueryContext<Context>;

export type TBoard = Keyboard | InlineKeyboard;
