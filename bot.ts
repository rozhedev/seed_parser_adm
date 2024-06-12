import * as dotenv from "dotenv";
import { Bot, GrammyError, HttpError, InlineKeyboard, Context, CommandContext, BotError, CallbackQueryContext, Keyboard } from "grammy";
import { hydrate } from "@grammyjs/hydrate";
import { WithId } from "mongodb";

import { T_Token, TUserState } from "./types";
import { BOT_TOKEN } from "./data/env";
import { client } from "./data/db";
import { USER_STATES_LIST, REGEX_LIST } from "./data/init-data";
import { COMMAND_TEXT } from "./data/command-text";
import { ERR_TEXT } from "./data/err-text";
import { BTN_LABELS } from "./data/btn-labels";
import { bip39 } from "./data/bip39";

import { genFromRegex, useSeedPhrase, getTokenInfo, getTokenListBoard } from "./helpers";
import { TokenEditorBoard, StartBoard, ConfirmDelBoard } from "./resources/keyboard";

dotenv.config();

// * Use type: any for prevent error
const bot: any = new Bot<Context>(BOT_TOKEN);
bot.use(hydrate());

// * Store objects
const USER_STATE: TUserState = {};
const selectedToken: T_Token = {
    token_name: "",
    token_body: "",
    is_search_started: false,
    is_seed_sended: false,
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

    await ctx.reply(COMMAND_TEXT.token.enterName, {
        parse_mode: "HTML",
    });
});

// --> Token lists
bot.hears(BTN_LABELS.startBoard.tokenList, async (ctx: CommandContext<Context>) => {
    const tokenList: WithId<any>[] = await collectionConnect.find({}).toArray();

    // * Hard type assertion for prevent typo errors in async keyboard generating
    let board = getTokenListBoard(tokenList, ERR_TEXT.tokenListEmpty) as unknown as InlineKeyboard;

    await ctx.reply(COMMAND_TEXT.token.created, {
        reply_markup: board,
    });
});

// --> Handler fo inline buttons
bot.on("callback_query:data", async (ctx: CallbackQueryContext<Context>) => {
    selectedToken.token_name = ctx.callbackQuery.data as string;
    const tokenInfo = await collectionConnect.findOne({ token_name: selectedToken.token_name });

    // * Send seed
    if (ctx.callbackQuery.data === BTN_LABELS.tokenEditorBoard.sendSeed) {
        ctx.reply(COMMAND_TEXT.status.seedSended.finished, {
            reply_markup: StartBoard,
            parse_mode: "HTML",
        });
        return;
    }
    // * Choose token & output token editor keyboard
    if (tokenInfo === null) ctx.reply(ERR_TEXT.tokenNotFound);
    else {
        await getTokenInfo(ctx, selectedToken.token_name, tokenInfo.token_body, tokenInfo.is_search_started, tokenInfo.is_seed_sended);
        await ctx.reply(COMMAND_TEXT.token.actions, {
            reply_markup: TokenEditorBoard,
            parse_mode: "HTML",
        });
    }
});

// -->  ----Token Editor handlers----

// ? Exit
bot.hears(BTN_LABELS.tokenEditorBoard.exit, async (ctx: CommandContext<Context>) => {
    await ctx.reply(COMMAND_TEXT.exit.toMenu, {
        reply_markup: StartBoard,
    });
});

// ? Confirm delete
bot.hears(BTN_LABELS.tokenEditorBoard.delete, async (ctx: CommandContext<Context>) => {
    USER_STATE[ctx.chat.id] = USER_STATES_LIST.editTokenName;

    await ctx.reply(COMMAND_TEXT.delete.confirm, {
        reply_markup: ConfirmDelBoard,
    });
});

// ? Delete handlers
bot.hears(BTN_LABELS.confirmDelBoard.yes, async (ctx: CommandContext<Context>) => {
    // * necessary variable assign
    const deletedDocument = await collectionConnect.deleteOne({ token_name: selectedToken.token_name });
    const tokenList: WithId<any>[] = await collectionConnect.find({}).toArray();

    // * Hard type assertion for prevent typo errors in async keyboard generating
    let board = getTokenListBoard(tokenList, ERR_TEXT.tokenListEmpty) as unknown as InlineKeyboard;

    await ctx.reply(COMMAND_TEXT.token.chooseFromList, {
        reply_markup: StartBoard,
        parse_mode: "HTML",
    });
    await ctx.reply(COMMAND_TEXT.delete.success, {
        reply_markup: board,
    });
});

bot.hears(BTN_LABELS.confirmDelBoard.no, async (ctx: CommandContext<Context>) => {
    const tokenList: WithId<any>[] = await collectionConnect.find({}).toArray();

    const board = getTokenListBoard(tokenList, ERR_TEXT.tokenListEmpty);
    ctx.reply(COMMAND_TEXT.delete.canceled, {
        reply_markup: board,
    });
});

// ? Change name
bot.hears(BTN_LABELS.tokenEditorBoard.changeName, async (ctx: CommandContext<Context>) => {
    USER_STATE[ctx.chat.id] = USER_STATES_LIST.editTokenName;

    ctx.reply(COMMAND_TEXT.token.editName, {
        parse_mode: "HTML",
    });
});

// ? Generate & send seed
bot.hears(BTN_LABELS.tokenEditorBoard.genSeed, async (ctx: CommandContext<Context>) => {
    const { passStr } = useSeedPhrase(bip39);
    let board = new InlineKeyboard().text(BTN_LABELS.tokenEditorBoard.sendSeed).row();

    ctx.reply(`seed-фраза: <code>${passStr}</code>`, {
        reply_markup: board,
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

        const newToken: T_Token = {
            token_name: tokenName,
            token_body: tokenBody,
            is_search_started: false,
            is_seed_sended: false,
        };
        await collectionConnect.insertOne({ ...newToken });
    }
    // * Edit token name
    else if (USER_STATE[userId] === USER_STATES_LIST.editTokenName) {
        const newTokenName = ctx.message?.text as string;

        await collectionConnect.updateOne({ token_name: selectedToken.token_name }, { $set: { token_name: newTokenName } });

        ctx.reply(COMMAND_TEXT.token.successChangedName, {
            reply_markup: StartBoard,
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
