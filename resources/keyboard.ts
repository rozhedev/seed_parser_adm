import { Keyboard } from "grammy";
import { BTN_LABELS } from "../data/btn-labels";

export const startKeyboard = new Keyboard().text(BTN_LABELS.startBoard.genToken).text(BTN_LABELS.startBoard.tokenList).resized();
