import * as dotenv from "dotenv";
import { Bot, GrammyError, HttpError, Keyboard, InlineKeyboard, Context, CommandContext, BotError } from "grammy";
import { hydrate } from "@grammyjs/hydrate";

import { BOT_TOKEN } from "./data/env";
import { USER_STATES_LIST, REGEX_LIST } from "./data/init-data";
import { COMMAND_TEXT } from "./data/command-text";
import { ERR_TEXT } from "./data/err-text";
import { BTN_LABELS } from "./data/btn-labels";
import { StartKeyboard } from "./resources/keyboard";
import { genAuthToken } from "./helpers/genToken";
import { client } from "./data/db";

dotenv.config();

// * Use type: any for prevent error

const bot: any = new Bot<Context>(BOT_TOKEN);

bot.use(hydrate());

type TUserState = { [key: number]: string };
const USER_STATE: TUserState = {};

type T_TokenInfo = {
    token_name: string;
    token_body: string;
};

const collectionConnect = client.db("auth_tokens").collection("tokens");

// * Commands config
bot.api.setMyCommands([
    // * Only lowercase letters
    {
        command: "start",
        description: "Bot starting",
    },
]);

bot.command("start", async (ctx: CommandContext<Context>) => {
    await ctx.reply(COMMAND_TEXT.startMessage, {
        parse_mode: "HTML",
        reply_markup: StartKeyboard,
    });
});

bot.hears(BTN_LABELS.startBoard.genToken, async (ctx: CommandContext<Context>) => {
    ctx.reply(COMMAND_TEXT.enterToken, {
        parse_mode: "HTML",
    });

    USER_STATE[ctx.chat.id] = USER_STATES_LIST.waitTokenName;
});

bot.hears(BTN_LABELS.startBoard.tokenList, async (ctx: CommandContext<Context>) => {
    const tokenList = await collectionConnect.find({}).toArray();
    ctx.reply(
        `
        Список токенов:
    ${tokenList.map((item: any, i) => {
        return `${i + 1}. Название: <code>${item.token_name}</code>
        Токен: <code>${item.token_body}</code>
`;
    })}
        `,
        {
            parse_mode: "HTML",
        }
    );
});

// * Message handler
bot.on("msg", async (ctx: CommandContext<Context>) => {
    const userId = ctx.chat.id;

    if (USER_STATE[userId] === USER_STATES_LIST.waitTokenName) {
        const tokenName = ctx.message?.text;
        const tokenBody = genAuthToken(REGEX_LIST.token);

        ctx.reply(`Имя токена: <pre>${tokenName}</pre> Ваш токен: <pre>${tokenBody}</pre>`, {
            parse_mode: "HTML",
        });

        await collectionConnect.insertOne({ token_name: tokenName, token_body: tokenBody });
        bot.start();
    } else {
        await ctx.reply(ERR_TEXT.msgSended);
    }
});

// * Error handling
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
