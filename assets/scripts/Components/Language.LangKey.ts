import { _decorator, JsonAsset } from "cc";
import { pConst, pEngine } from "db://pts-core/scripts/utils";
import { editor_property, instance } from "db://pts-core/scripts/utils/pClass";
import { Language_Manager } from "./Language.Manager";

const { ccclass, property } = _decorator;

@ccclass("Language_SmartKey._Param")
class _Json {
    @property({  })
    prefix: string = "";

    @property({ type: JsonAsset })
    param: JsonAsset = null;

    @editor_property(undefined, { kill: true })
    protected get __$see() {
        return pEngine.Json.param.previewer(this.param);
    }

    @property({  })
    suffix: string = "";

    get() {
        if(!this.param) return "";
        return `${this.prefix}${pEngine.Json.param.get(this.param)}${this.suffix}`;
    }
}

@ccclass("Language_SmartKey_LangKey")
export class LangKey {
    @property({ type: Language_Manager.EMode })
    mode: Language_Manager.EMode = Language_Manager.EMode.Pascal;

    @property({ })
    prefix: string = ""

    @property({ visible: pConst.EDITOR_ONLY_IN_PREVIEW, readonly: true })
    protected _key = '' as pTS.languages.EKey

    @property({ type: pTS.languages.EKey })
    get key() { return this._key }
    set key(x) { this._key = x }

    @property({ })
    suffix: string = ""

    @property({ type: _Json })
    params: _Json[] = [];

    get() {
        return instance(Language_Manager).get({
            key: this.key,
            prefix: this.prefix,
            suffix: this.suffix,
            mode: this.mode,
            handler: _ => _ + this.params.map(_str => _str.get()).join("")
        });
    }
}

export namespace LangKey {
    export const Param = _Json;

}
