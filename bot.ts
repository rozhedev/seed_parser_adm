import * as dotenv from "dotenv";
import { Bot, GrammyError, HttpError, InlineKeyboard, Context, CommandContext, BotError, CallbackQueryContext, Keyboard } from "grammy";
import { hydrate } from "@grammyjs/hydrate";

import { BOT_TOKEN } from "./data/env";
import { USER_STATES_LIST, REGEX_LIST } from "./data/init-data";
import { COMMAND_TEXT } from "./data/command-text";
import { ERR_TEXT } from "./data/err-text";
import { BTN_LABELS } from "./data/btn-labels";
import { TokenEditorBoard, StartBoard, ConfirmDelBoard } from "./resources/keyboard";
import { genAuthToken, getTokenInfo, getTokenListBoard } from "./helpers";
import { client } from "./data/db";
import { WithId } from "mongodb";
import { T_TokenList } from "./types";

dotenv.config();

// * Use type: any for prevent error

const bot: any = new Bot<Context>(BOT_TOKEN);

bot.use(hydrate());

type TUserState = { [key: number]: string };
const USER_STATE: TUserState = {};

const selectedToken: { name: string; body: string } = {
    name: "",
    body: "",
};

const collectionConnect = client.db("auth_tokens").collection("tokens");

// --> Commands config
bot.api.setMyCommands([
    // * Only lowercase letters
    {
        command: "start",
        description: "Запуск бота",
    },
]);

// --> Start command
bot.command("start", async (ctx: CommandContext<Context>) => {
    await ctx.reply(COMMAND_TEXT.startMessage, {
        parse_mode: "HTML",
        reply_markup: StartBoard,
    });
});

// --> Generate token
bot.hears(BTN_LABELS.startBoard.genToken, async (ctx: CommandContext<Context>) => {
    USER_STATE[ctx.chat.id] = USER_STATES_LIST.waitTokenName;

    await ctx.reply(COMMAND_TEXT.enterToken, {
        parse_mode: "HTML",
    });
});

// --> Token lists
bot.hears(BTN_LABELS.startBoard.tokenList, async (ctx: CommandContext<Context>) => {
    const tokenList: WithId<any>[] = await collectionConnect.find({}).toArray();

    // * Hard type assertion for prevent typo errors in async keyboard generating
    let board = getTokenListBoard(tokenList, ERR_TEXT.tokenListEmpty) as unknown as InlineKeyboard;

    await ctx.reply(COMMAND_TEXT.createdToken, {
        reply_markup: board,
    });
});

// --> Callback query with tokens info
bot.on("callback_query:data", async (ctx: CallbackQueryContext<Context>) => {
    selectedToken.name = ctx.callbackQuery.data as string;
    const tokenInfo = await collectionConnect.findOne({ token_name: selectedToken.name });

    if (tokenInfo === null) ctx.reply(ERR_TEXT.tokenNotFound);
    else {
        await getTokenInfo(ctx, selectedToken.name, tokenInfo.token_body);
        await ctx.reply(COMMAND_TEXT.tokenActions, {
            reply_markup: TokenEditorBoard,
            parse_mode: "HTML",
        });
    }
});

// --> Token Info Editor handlers
// * Exit
bot.hears(BTN_LABELS.tokenEditorBoard.exit, async (ctx: CommandContext<Context>) => {
    await ctx.reply(COMMAND_TEXT.exitToMenu, {
        reply_markup: StartBoard,
    });
});

// * Confirm delete
bot.hears(BTN_LABELS.tokenEditorBoard.delete, async (ctx: CommandContext<Context>) => {
    await ctx.reply(COMMAND_TEXT.confirmDelete, {
        reply_markup: ConfirmDelBoard,
    });
});

// TODO Integrate hydrate for improve confirm deleting

// * Delete handler
bot.hears(BTN_LABELS.confirmDelBoard.yes, async (ctx: CommandContext<Context>) => {
    const deletedDocument = await collectionConnect.deleteOne({ token_name: selectedToken.name });
    const tokenList: WithId<any>[] = await collectionConnect.find({}).toArray();

    // * Hard type assertion for prevent typo errors in async keyboard generating
    let board = getTokenListBoard(tokenList, ERR_TEXT.tokenListEmpty) as unknown as InlineKeyboard;

    await ctx.reply(COMMAND_TEXT.successDelete, {
        reply_markup: board,
    });
    await ctx.reply(COMMAND_TEXT.tokenActions, {
        reply_markup: TokenEditorBoard,
        parse_mode: "HTML",
    });
});

bot.hears(BTN_LABELS.confirmDelBoard.no, async (ctx: CommandContext<Context>) => {
    ctx.reply(COMMAND_TEXT.canceledDelete, {
        reply_markup: StartBoard,
    });
});

// --> Any message handler
bot.on("msg", async (ctx: CommandContext<Context>) => {
    const userId: number = ctx.chat.id;

    if (USER_STATE[userId] === USER_STATES_LIST.waitTokenName) {
        // * Necessary type assertion for prevent typo errors
        const tokenName = ctx.message?.text as string;
        const tokenBody = genAuthToken(REGEX_LIST.token) as string;

        getTokenInfo(ctx, tokenName, tokenBody);

        await collectionConnect.insertOne({ token_name: tokenName, token_body: tokenBody });
    } else {
        await ctx.reply(ERR_TEXT.msgSended);
    }
});

// --> Error handling
bot.catch((err: BotError) => {
    const ctx = err.ctx;
    const e = err.error;
    console.error(`Error while handling update ${ctx.update.update_id}`);

    if (e instanceof GrammyError) {
        console.error(`Error in request ${e.description}`);
    } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }
});

bot.start();
