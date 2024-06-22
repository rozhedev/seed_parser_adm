import { CommandContext, Context, InlineKeyboard } from "grammy";
import { WithId } from "mongodb";
import { TContext, TUserState } from "../types";
import { ANSWER_TEXT } from "../data/command-text";
import { SEED_LENGTH } from "../data/init-data";

// * Don't change import method
const RandExp = require("randexp");

export const genFromRegex = (regex: RegExp) => {
    const randexp: any = new RandExp(regex);
    let token: string = randexp.gen();
    return token;
};

export const getTokenInfo = (ctx: TContext, name: string, body: string, isSearchStarted: boolean, isSeedSended: boolean) => {
    let searchStatusText: string = isSearchStarted ? ANSWER_TEXT.status.searchStarted.yes : ANSWER_TEXT.status.searchStarted.no;

    let seedStatusText: string = isSeedSended ? ANSWER_TEXT.status.seedSended.yes : ANSWER_TEXT.status.seedSended.no;
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

    // * Get token list from DB and save only name prop
    const TokenListArr: string[] = tokenList.map(({ name }) => name);

    // * Create btn rows via Inline keyboard
    TokenListArr.forEach((btn) => {
        board.text(`${btn}`);
        board.row();
    });
    return board;
};

export const getOneFromDB = (ctx: TContext, collection: any) => {
    const data = ctx?.callbackQuery?.data as string;
    const document = collection.findOne({ name: data });
    return document;
};

// * useSeedPhrase f(x) for seed generation. Maybe useful in future versions
export const useSeedPhrase = (wordArr: string[]) => {
    let randomIndex = 0;
    let passArr = [];

    for (let i = 0; i < SEED_LENGTH; i++) {
        randomIndex = getRandomIndex(wordArr);
        passArr.push(wordArr[randomIndex]);
        if (i >= 1 && passArr[i] == passArr[i - 1]) passArr.push(wordArr[getRandomIndex(wordArr)]);
    }

    let passStr = passArr.join(" ");
    let passLength = passArr.length;
    return { passArr, passStr, passLength };
};

function getRandomIndex(wordArr: string[]) {
    return Math.round(Math.random() * wordArr.length);
}

// * Standart bot commands
export const genToken = async (ctx: CommandContext<Context>, store: TUserState, storeId: number, stateListProp: string) => {
    store[storeId] = stateListProp;

    await ctx.reply(ANSWER_TEXT.token.enterName, {
        parse_mode: "HTML",
    });
};

export const showTokenList = async (ctx: CommandContext<Context>, collection: any, errText: string) => {
    const tokenList: WithId<any>[] = await collection.find({}).toArray();

    // * Hard type assertion for prevent typo errors in async keyboard generating
    let board = getTokenListBoard(tokenList, errText) as unknown as InlineKeyboard;

    await ctx.reply(ANSWER_TEXT.token.created, {
        reply_markup: board,
    });
};
