import { CallbackQueryContext, CommandContext, Context } from "grammy";

type TContext = CommandContext<Context> | CallbackQueryContext<Context>;

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
