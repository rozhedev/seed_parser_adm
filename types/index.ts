import { ObjectId } from "mongodb";

export type T_TokenList<T> = {
    id: ObjectId;
    token_name: string;
    token_list: string;
} & T;