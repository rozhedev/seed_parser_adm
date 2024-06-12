import { InlineKeyboard } from "grammy";
import { WithId } from "mongodb";
import { TContext } from "../types";
import { COMMAND_TEXT } from "../data/command-text";

// * Don't change import method
const RandExp = require("randexp");

export const genFromRegex = (regex: RegExp) => {
    const randexp: any = new RandExp(regex);
    let token: string = randexp.gen();
    return token;
};

export const getTokenInfo = (ctx: TContext, name: string, body: string, is_search_started: boolean, is_seed_sended: boolean) => {
    let searchStatusText: string = is_search_started ? COMMAND_TEXT.status.searchStarted.yes : COMMAND_TEXT.status.searchStarted.no;

    let seedStatusText: string = is_seed_sended ? COMMAND_TEXT.status.seedSended.yes : COMMAND_TEXT.status.seedSended.no;
    return ctx.reply(
        `
        Имя токена: <pre>${name}</pre> Токен для входа: <pre>${body}</pre>\n\n ${searchStatusText} \n ${seedStatusText} \n
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
