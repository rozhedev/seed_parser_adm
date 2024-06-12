import { InlineKeyboard } from "grammy";
import { WithId } from "mongodb";
import { TContext } from "../types";

// * Don't change import method
const RandExp = require("randexp");

export const genAuthToken = (regex: RegExp) => {
    const randexp: any = new RandExp(regex);
    let token: string = randexp.gen();
    return token;
};

export const getTokenInfo = (ctx: TContext, name: string, body: string) => {
    return ctx.reply(
        `
        Имя токена: <pre><code>${name}</code></pre> Токен для входа: <pre><code>${body}</code></pre> Не начал поиск 
        seed не отправлен
        `,
        {
            parse_mode: "HTML",
        }
    );
};

export const getTokenListBoard = (tokenList: WithId<any>[], errText: string) => {
    let board: InlineKeyboard = new InlineKeyboard();

    if (!tokenList.length) return new InlineKeyboard().text(errText).row();

    // * Get token list from DB and save only token_name prop
    const TokenListArr: string[] = tokenList.map(({ token_name }) => token_name);

    // * Create btn rows via Inline keyboard
    TokenListArr.forEach((btn) => {
        board.text(`${btn}`);
        board.row();
    });
    return board;
};

export const getOneFromDB = (ctx: TContext, collection: any) => {
    const data = ctx?.callbackQuery?.data as string;
    const document = collection.findOne({ token_name: data });
    return document;
};
