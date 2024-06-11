import { Keyboard } from "grammy";
import { BTN_LABELS } from "../data/btn-labels";

export const StartBoard: Keyboard = new Keyboard().text(BTN_LABELS.startBoard.genToken).text(BTN_LABELS.startBoard.tokenList).resized().persistent();

export const InfoEditorBoard: Keyboard = new Keyboard()
    .text(BTN_LABELS.infoEditorBoard.sendSeed)
    .text(BTN_LABELS.infoEditorBoard.changeName)
    .row()
    .text(BTN_LABELS.infoEditorBoard.exit)
    .text(BTN_LABELS.infoEditorBoard.delete)
    .resized();
