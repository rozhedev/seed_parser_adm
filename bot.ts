import * as dotenv from "dotenv";
import { Bot, GrammyError, HttpError, InlineKeyboard, Context, CommandContext, BotError, CallbackQueryContext, Keyboard } from "grammy";
import { hydrate } from "@grammyjs/hydrate";

import { BOT_TOKEN } from "./data/env";
import { USER_STATES_LIST, REGEX_LIST } from "./data/init-data";
import { COMMAND_TEXT } from "./data/command-text";
import { ERR_TEXT } from "./data/err-text";
import { BTN_LABELS } from "./data/btn-labels";
import { InfoEditorBoard, StartBoard } from "./resources/keyboard";
import { genAuthToken, getTokenInfo } from "./helpers/helpers";
import { client } from "./data/db";

dotenv.config();

// * Use type: any for prevent error

const bot: any = new Bot<Context>(BOT_TOKEN);

bot.use(hydrate());

type TUserState = { [key: number]: string };
const USER_STATE: TUserState = {};

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
    ctx.reply(COMMAND_TEXT.enterToken, {
        parse_mode: "HTML",
    });

    USER_STATE[ctx.chat.id] = USER_STATES_LIST.waitTokenName;
});

// --> Token lists
bot.hears(BTN_LABELS.startBoard.tokenList, async (ctx: CommandContext<Context>) => {
    // * Get token list from DB and save only token_name prop
    const tokenList = await collectionConnect.find({}).toArray();
    const TokenListArr: string[] = tokenList.map(({ token_name }) => token_name);

    // * Create btn rows via Inline keyboard
    const TokenListBoard: InlineKeyboard = new InlineKeyboard();

    TokenListArr.forEach((btn) => {
        TokenListBoard.text(`${btn}`);
        TokenListBoard.row();
    });

    ctx.reply("Созданные токены:", {
        reply_markup: TokenListBoard,
    });
});

// --> Callback query with tokens info
bot.on("callback_query:data", async (ctx: CallbackQueryContext<Context>) => {
    const tokenBodyList = await collectionConnect.find({}).toArray();

    if (!tokenBodyList.length) return ctx.reply(ERR_TEXT.tokenListEmpty);

    const data = ctx.callbackQuery.data as string;
    const tokenInfo = await collectionConnect.findOne({ token_name: data });

    if (tokenInfo === null) ctx.reply(ERR_TEXT.tokenNotFound);
    else {
        await getTokenInfo(ctx, data, tokenInfo["token_body"]);
        await ctx.reply("<b>&#8595; Действия &#8595;</b>", {
            reply_markup: InfoEditorBoard,
            parse_mode: "HTML",
        });
    }
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
