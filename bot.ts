import * as dotenv from "dotenv";
import { Bot, GrammyError, HttpError, InlineKeyboard, Context, CommandContext, BotError, CallbackQueryContext, Keyboard } from "grammy";
import { hydrate } from "@grammyjs/hydrate";
import { WithId } from "mongodb";

import { TUser } from "./types";
import { BOT_TOKEN, COLLECTION_NAME } from "./data/env";
import { client } from "./data/db";
import { USER_STATES_LIST, REGEX_LIST } from "./data/init-data";
import { ANSWER_TEXT, COMMAND_TEXT } from "./data/command-text";
import { ERR_TEXT } from "./data/err-text";
import { BTN_LABELS } from "./data/btn-labels";

import { genFromRegex, getTokenInfo, getTokenListBoard, genToken, showTokenList } from "./helpers";
import { USER_STATE, selectedToken } from "./resources/store";
import { TokenEditorBoard, StartBoard, ConfirmDelBoard } from "./resources/keyboard";

dotenv.config();

// * Use type: any for prevent error
const bot: any = new Bot<Context>(BOT_TOKEN);
bot.use(hydrate());

// * Don't change collection name
const collectionConnect = client.db("auth_tokens").collection(COLLECTION_NAME);

// --> Commands config
bot.api.setMyCommands([
    // * Only lowercase letters
    {
        command: "start",
        description: COMMAND_TEXT.start,
    },
    {
        command: "gentoken",
        description: COMMAND_TEXT.gentoken,
    },
    {
        command: "showtokenlist",
        description: COMMAND_TEXT.showtokenlist,
    },
]);

// --> Start command
bot.command("start", async (ctx: CommandContext<Context>) => {
    await ctx.reply(ANSWER_TEXT.startMessage, {
        parse_mode: "HTML",
        reply_markup: StartBoard,
    });
});

// --> Generate token
bot.command("gentoken", async (ctx: CommandContext<Context>) => {
    genToken(ctx, USER_STATE, ctx.chat.id, USER_STATES_LIST.waitTokenName);
});

bot.hears(BTN_LABELS.startBoard.genToken, async (ctx: CommandContext<Context>) => {
    genToken(ctx, USER_STATE, ctx.chat.id, USER_STATES_LIST.waitTokenName);
});

// --> Token lists
bot.command("showtokenlist", async (ctx: CommandContext<Context>) => {
    showTokenList(ctx, collectionConnect, ERR_TEXT.tokenListEmpty);
});

bot.hears(BTN_LABELS.startBoard.tokenList, async (ctx: CommandContext<Context>) => {
    showTokenList(ctx, collectionConnect, ERR_TEXT.tokenListEmpty);
});

// --> Handler fo inline buttons
bot.on("callback_query:data", async (ctx: CallbackQueryContext<Context>) => {
    selectedToken.name = ctx.callbackQuery.data as string;

    const tokenInfo = await collectionConnect.findOne({ name: selectedToken.name });

    // * Choose token & output token editor keyboard
    if (tokenInfo === null) ctx.reply(ERR_TEXT.tokenNotFound);
    else {
        // * Use prop as external store for save selected token name
        USER_STATE.tokenName = ctx.callbackQuery.data as string;

        await getTokenInfo(ctx, selectedToken.name, tokenInfo.password, tokenInfo.is_search_started, tokenInfo.is_seed_sended);
        await ctx.reply(ANSWER_TEXT.token.actions, {
            reply_markup: TokenEditorBoard,
            parse_mode: "HTML",
        });
    }
    await ctx.answerCallbackQuery();
});

// -->  ----Token Editor handlers----

// ? Exit
bot.hears(BTN_LABELS.tokenEditorBoard.exit, async (ctx: CommandContext<Context>) => {
    await ctx.reply(ANSWER_TEXT.exit.toMenu, {
        reply_markup: StartBoard,
    });
});

// ? Confirm delete
bot.hears(BTN_LABELS.tokenEditorBoard.delete, async (ctx: CommandContext<Context>) => {
    USER_STATE[ctx.chat.id] = USER_STATES_LIST.editTokenName;

    await ctx.reply(ANSWER_TEXT.delete.confirm, {
        reply_markup: ConfirmDelBoard,
    });
});

// ? Delete handlers
bot.hears(BTN_LABELS.confirmDelBoard.yes, async (ctx: CommandContext<Context>) => {
    // * necessary variable assign
    const deletedDocument = await collectionConnect.deleteOne({ name: selectedToken.name });
    const tokenList: WithId<any>[] = await collectionConnect.find({}).toArray();

    // * Hard type assertion for prevent typo errors in async keyboard generating
    let board = getTokenListBoard(tokenList, ERR_TEXT.tokenListEmpty) as unknown as InlineKeyboard;

    await ctx.reply(ANSWER_TEXT.token.chooseFromList, {
        reply_markup: StartBoard,
        parse_mode: "HTML",
    });
    await ctx.reply(ANSWER_TEXT.delete.success, {
        reply_markup: board,
    });
});

bot.hears(BTN_LABELS.confirmDelBoard.no, async (ctx: CommandContext<Context>) => {
    const tokenList: WithId<any>[] = await collectionConnect.find({}).toArray();

    const board = getTokenListBoard(tokenList, ERR_TEXT.tokenListEmpty);
    ctx.reply(ANSWER_TEXT.delete.canceled, {
        reply_markup: board,
    });
});

// ? Change name
bot.hears(BTN_LABELS.tokenEditorBoard.changeName, async (ctx: CommandContext<Context>) => {
    USER_STATE[ctx.chat.id] = USER_STATES_LIST.editTokenName;

    ctx.reply(ANSWER_TEXT.token.editName, {
        parse_mode: "HTML",
    });
});

// ? Enter seed
bot.hears(BTN_LABELS.tokenEditorBoard.enterSeed, async (ctx: CommandContext<Context>) => {
    USER_STATE[ctx.chat.id] = USER_STATES_LIST.enterSeed;
    ctx.reply(ANSWER_TEXT.token.enterSeed, {
        parse_mode: "HTML",
    });
});
// -->  --------------------

// --> Any message handler
bot.on("msg", async (ctx: CommandContext<Context>) => {
    const userId: number = ctx.chat.id;

    // * Enter token name
    if (USER_STATE[userId] === USER_STATES_LIST.waitTokenName) {
        // * Necessary type assertion for prevent typo errors
        const tokenName = ctx.message?.text as string;
        const tokenBody = genFromRegex(REGEX_LIST.token) as string;

        // * Pass false by default
        getTokenInfo(ctx, tokenName, tokenBody, false, false);

        const newUser: TUser = {
            name: tokenName,
            password: tokenBody,
            is_search_started: false,
            is_seed_sended: false,
        };
        await collectionConnect.insertOne({ ...newUser });
    }
    // * Edit token name
    else if (USER_STATE[userId] === USER_STATES_LIST.editTokenName) {
        const newTokenName = ctx.message?.text as string;

        await collectionConnect.updateOne({ name: selectedToken.name }, { $set: { name: newTokenName } });

        await ctx.reply(ANSWER_TEXT.token.successChangedName, {
            reply_markup: StartBoard,
        });
    }
    // * Get seed message & change keyboard
    else if (USER_STATE[userId] === USER_STATES_LIST.enterSeed) {
        const enteredSeed = ctx.message?.text as string;

        await collectionConnect.updateOne({ name: USER_STATE.tokenName }, { $set: { is_seed_sended: true } });

        await ctx.reply(ANSWER_TEXT.status.seedSended.finished, {
            reply_markup: StartBoard,
            parse_mode: "HTML",
        });
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
