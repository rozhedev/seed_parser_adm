// * Don't change import method
const RandExp = require("randexp");

export const genAuthToken = (regex: RegExp) => {
    const randexp: any = new RandExp(regex);
    let token: string = randexp.gen();
    return token;
};
