import { InlineKeyboard, Keyboard } from "grammy";
import { BTN_LABELS } from "../data/btn-labels";

export const StartBoard: Keyboard = new Keyboard().text(BTN_LABELS.startBoard.genToken).text(BTN_LABELS.startBoard.tokenList).resized().persistent();

export const TokenEditorBoard: Keyboard = new Keyboard()
    .text(BTN_LABELS.tokenEditorBoard.enterSeed)
    .text(BTN_LABELS.tokenEditorBoard.changeName)
    .row()
    .text(BTN_LABELS.tokenEditorBoard.exit)
    .text(BTN_LABELS.tokenEditorBoard.delete)
    .resized();

export const ConfirmDelBoard = new Keyboard().text(BTN_LABELS.confirmDelBoard.yes).text(BTN_LABELS.confirmDelBoard.no).resized().oneTime();

export const SendBoard: Keyboard = new Keyboard().text(BTN_LABELS.tokenEditorBoard.sendSeed).row().resized();
