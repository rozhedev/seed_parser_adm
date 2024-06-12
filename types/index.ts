import { CallbackQueryContext, CommandContext, Context, InlineKeyboard, Keyboard } from "grammy";
import { ObjectId } from "mongodb";

export type TUserState = { [key: number | string]: string };

export type T_Token = {
    id?: ObjectId;
    token_name: string;
    token_body: string;
    is_search_started: boolean;
    is_seed_sended: boolean;
};

export type TContext = CommandContext<Context> | CallbackQueryContext<Context>;

export type TBoard = Keyboard | InlineKeyboard;