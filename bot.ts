import * as dotenv from "dotenv";
import { Bot, GrammyError, HttpError, InlineKeyboard, Context, BotError } from "grammy";
import { hydrate } from "@grammyjs/hydrate";
import { Collection, WithId } from "mongodb";

import { CbQueryCtx, CommandCtx, TUser } from "./types";
import {
    client,
    BOT_TOKEN,
    COLLECTION_NAME,
    DB_NAME,
    USER_STATES_LIST,
    REGEX_LIST,
    INIT_DATA,
    str_cmd__start,
    str_cmd__genToken,
    str_cmd__showTokenList,
    str__startMessage,
    str_err__tokenListEmpty,
    btn__start,
    str_err__tokenNotFound,
    str__exit,
    str__token,
    btn__tokenEditor,
    str__delete,
    btn__confirmDel,
    str__seedSended,
    str_err__msgSended,
} from "./data";

import { genFromRegex, getTokenInfo, getTokenListBoard, genToken, showTokenList } from "./helpers";
import { TokenEditorBoard, StartBoard, ConfirmDelBoard, selectedToken, USER_STATE } from "./resources";

dotenv.config();

// * Use type: any for prevent error
const bot: any = new Bot<Context>(BOT_TOKEN);
bot.use(hydrate());

const db = client.db(DB_NAME);
const UsersCollection: Collection<TUser> = db.collection(COLLECTION_NAME);

// --> Commands config
bot.api.setMyCommands([
    // * Only lowercase letters
    {
        command: "start",
        description: str_cmd__start,
    },
    {
        command: "gentoken",
        description: str_cmd__genToken,
    },
    {
        command: "showtokenlist",
        description: str_cmd__showTokenList,
    },
]);

// --> Start command
bot.command("start", async (ctx: CommandCtx) => {
    await ctx.reply(str__startMessage, {
        parse_mode: "HTML",
        reply_markup: StartBoard,
    });
});

// --> Generate token
bot.command("gentoken", async (ctx: CommandCtx) => {
    genToken(ctx, USER_STATE, ctx.chat.id, USER_STATES_LIST.waitTokenName);
});

bot.hears(btn__start.genToken, async (ctx: CommandCtx) => {
    genToken(ctx, USER_STATE, ctx.chat.id, USER_STATES_LIST.waitTokenName);
});

// --> Token lists
bot.command("showtokenlist", async (ctx: CommandCtx) => {
    showTokenList(ctx, UsersCollection, str_err__tokenListEmpty);
});

bot.hears(btn__start.tokenList, async (ctx: CommandCtx) => {
    showTokenList(ctx, UsersCollection, str_err__tokenListEmpty);
});

// --> Handler fo inline buttons
bot.on("callback_query:data", async (ctx: CbQueryCtx) => {
    selectedToken.name = ctx.callbackQuery.data as string;

    const tokenInfo = await UsersCollection.findOne({ name: selectedToken.name });

    // * Choose token & output token editor keyboard
    if (tokenInfo === null) ctx.reply(str_err__tokenNotFound);
    else {
        // * Use prop as external store for save selected token name
        USER_STATE.tokenName = ctx.callbackQuery.data as string;

        await getTokenInfo(ctx, selectedToken.name, tokenInfo.password, tokenInfo.is_search_started, tokenInfo.is_seed_sended);
        await ctx.reply(str__token.actions, {
            reply_markup: TokenEditorBoard,
            parse_mode: "HTML",
        });
    }
    await ctx.answerCallbackQuery();
});

// -->  ----Token Editor handlers----

// ? Exit
bot.hears(btn__tokenEditor.exit, async (ctx: CommandCtx) => {
    await ctx.reply(str__exit.toMenu, {
        reply_markup: StartBoard,
    });
});

// ? Confirm delete
bot.hears(btn__tokenEditor.delete, async (ctx: CommandCtx) => {
    USER_STATE[ctx.chat.id] = USER_STATES_LIST.editTokenName;

    await ctx.reply(str__delete.confirm, {
        reply_markup: ConfirmDelBoard,
    });
});

// ? Delete handlers
bot.hears(btn__confirmDel.yes, async (ctx: CommandCtx) => {
    // * necessary variable assign
    const deletedDocument = await UsersCollection.deleteOne({ name: selectedToken.name });
    const tokenList: WithId<any>[] = await UsersCollection.find({}).toArray();

    // * Hard type assertion for prevent typo errors in async keyboard generating
    let board = getTokenListBoard(tokenList, str_err__tokenListEmpty) as unknown as InlineKeyboard;

    await ctx.reply(str__token.chooseFromList, {
        reply_markup: StartBoard,
        parse_mode: "HTML",
    });
    await ctx.reply(str__delete.success, {
        reply_markup: board,
    });
});

bot.hears(btn__confirmDel.no, async (ctx: CommandCtx) => {
    const tokenList: WithId<any>[] = await UsersCollection.find({}).toArray();

    const board = getTokenListBoard(tokenList, str_err__tokenListEmpty);
    ctx.reply(str__delete.canceled, {
        reply_markup: board,
    });
});

// ? Change name
bot.hears(btn__tokenEditor.changeName, async (ctx: CommandCtx) => {
    USER_STATE[ctx.chat.id] = USER_STATES_LIST.editTokenName;

    ctx.reply(str__token.editName, {
        parse_mode: "HTML",
    });
});

// ? Enter seed
bot.hears(btn__tokenEditor.enterSeed, async (ctx: CommandCtx) => {
    USER_STATE[ctx.chat.id] = USER_STATES_LIST.enterSeed;
    ctx.reply(str__token.enterSeed, {
        parse_mode: "HTML",
    });
});
// -->  --------------------

// --> Any message handler
bot.on("msg", async (ctx: CommandCtx) => {
    const chatID: number = ctx.chat.id;
    const username: string = ctx.from?.username || "";

    // * Enter token name
    if (USER_STATE[chatID] === USER_STATES_LIST.waitTokenName) {
        // * Necessary type assertion for prevent typo errors
        const tokenName = ctx.message?.text as string;
        const tokenBody = genFromRegex(REGEX_LIST.token) as string;

        // * Pass false by default
        getTokenInfo(ctx, tokenName, tokenBody, false, false);

        const newUser: TUser = {
            tg_username: username,
            name: tokenName,
            password: tokenBody,
            sended_seed: [],
            is_search_started: false,
            is_seed_sended: false,
        };
        await UsersCollection.insertOne({ ...newUser });
    }
    // * Edit token name
    else if (USER_STATE[chatID] === USER_STATES_LIST.editTokenName) {
        const newTokenName = ctx.message?.text as string;

        await UsersCollection.updateOne({ name: selectedToken.name }, { $set: { name: newTokenName } });

        await ctx.reply(str__token.successChangedName, {
            reply_markup: StartBoard,
        });
    }
    // * Get seed message & change keyboard
    else if (USER_STATE[chatID] === USER_STATES_LIST.enterSeed) {
        const enteredSeed = ctx.message?.text as string;

        await UsersCollection.updateOne({ name: USER_STATE.tokenName }, { $push: { sended_seed: enteredSeed } });
        await UsersCollection.updateOne({ name: USER_STATE.tokenName }, { $set: { is_seed_sended: true } });

        await ctx.reply(str__seedSended.finished, {
            reply_markup: StartBoard,
            parse_mode: "HTML",
        });
    } else {
        await ctx.reply(str_err__msgSended);
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
