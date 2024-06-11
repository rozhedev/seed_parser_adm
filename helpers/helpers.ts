import { CallbackQueryContext, CommandContext, Context, InlineKeyboard, Keyboard } from "grammy";
import { Collection } from "mongodb";

type TContext = CommandContext<Context> | CallbackQueryContext<Context>;
type TBoard = Keyboard | InlineKeyboard;

// * Don't change import method
const RandExp = require("randexp");

export const genAuthToken = (regex: RegExp) => {
    const randexp: any = new RandExp(regex);
    let token: string = randexp.gen();
    return token;
};

export const getTokenInfo = (ctx: TContext, name: string, body: string) => {
    return ctx.reply(`Имя токена: <pre>${name}</pre> Токен для входа: <pre>${body}</pre>`, {
        parse_mode: "HTML",
    });
};

export const getTokenListBoard = (arr: string[], board: TBoard) => {
    // * Create btn rows via Inline keyboard
    let result = arr.forEach((btn) => {
        board.text(`${btn}`);
        board.row();
    });
    return result;
};

export const getOneFromDB = (ctx: TContext, collection: any) => {
    const data = ctx?.callbackQuery?.data as string;
    const document = collection.findOne({ token_name: data });
    return document;
};
