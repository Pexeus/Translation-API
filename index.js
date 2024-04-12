import { Translator } from "./src/translator.js";
import { Api } from "./src/api.js";

async function init() {
    const translator = new Translator()
    await translator.init()

    const api = new Api(translator)
    api.start(80)
}

init()