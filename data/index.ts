import { BTN_LABELS } from "./btn-labels";
import { COMMAND_TEXT, STRINGS } from "./command-text";
export { bip39 } from "./bip39";

//  * Btn Labels
export const { btn__start, btn__tokenEditor, btn__confirmDel } = BTN_LABELS;

//  * Command Text
export const { str_cmd__start, str_cmd__genToken, str_cmd__showTokenList } = COMMAND_TEXT;

export const { str__startMessage, str__token, str__exit, str__delete, str__searchStarted, str__seedSended, str__err } = STRINGS;

// * Constants
export * from "./constants";

// * Database
export * from "./db";

// * Env Variables
export * from "./env";
