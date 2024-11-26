import { InlineKeyboard, Keyboard } from "grammy";
import { btn__confirmDel, btn__start, btn__tokenEditor } from "../data";

export const StartBoard: Keyboard = new Keyboard().text(btn__start.genToken).text(btn__start.tokenList).resized().persistent();

/* prettier-ignore-start */

export const TokenEditorBoard: Keyboard = new Keyboard().text(btn__tokenEditor.enterSeed).text(btn__tokenEditor.changeName).row().text(btn__tokenEditor.exit).text(btn__tokenEditor.delete).resized();

/* prettier-ignore-end */

export const ConfirmDelBoard = new Keyboard().text(btn__confirmDel.yes).text(btn__confirmDel.no).resized().oneTime();

export const SendBoard: Keyboard = new Keyboard().text(btn__tokenEditor.sendSeed).row().resized();
