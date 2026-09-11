import { __private, _decorator, JsonAsset } from "cc";
import * as pConst from "db://pts-core/scripts/utils/pConst";
import * as pEngine from "db://pts-core/scripts/utils/pEngine";
import { editor_property, instance } from "db://pts-core/scripts/utils/pClass";
import { Language_Manager } from "./Language.Manager";
import { pTSAsset_Data } from "db://pts-core/scripts/pTSAsset/pTSAsset.Data";
import { pClass } from "db://pts-core/scripts/utils";

const { ccclass, property } = _decorator;

@ccclass("Language_SmartKey._Param")
class _Json {
    @property({  })
    prefix: string = "";

    @property({ type: JsonAsset, visible() { return !this.data } })
    param: JsonAsset = null;

    @property({ type: pTSAsset_Data, visible() { return !this.param }  })
    data: pTSAsset_Data = null;

    @editor_property(undefined, { kill: true })
    protected get __$see() {
        return pEngine.Json.param.previewer(this.param);
    }

    @property({  })
    suffix: string = "";

    async get() {
        const _data = this.param ? pEngine.Json.param.get(this.param) : this.data ? await this.data.string(true) : ""
        console.log("Language_SmartKey._Param.get", this.param, this.data, _data);
        return `${this.prefix}${_data}${this.suffix}`;
    }
}

@ccclass("Language_SmartKey_LangKey")
export class LangKey {
    @property({ type: Language_Manager.EMode })
    mode: Language_Manager.EMode = Language_Manager.EMode.Pascal;

    @property({ })
    prefix: string = ""

    @property({ visible() { return !!pConst?.EDITOR_ONLY_IN_PREVIEW; }, readonly: true })
    protected _key = '' as pTS.languages.EKey

    @property({ type: pTS.languages.EKey })
    get key() { return this._key }
    set key(x) { this._key = x }

    @property({ })
    suffix: string = ""

    @property({ type: _Json })
    params: _Json[] = [];

    init(handler: pFlex.THandler) {
        const _func = pClass.convert(handler)

        this.params.forEach(_param => {
            if(_param.data) {
                _param.data.on('onChanged', _func.func, _func.binder);
            }
        })
    }

    get() {
        return instance(Language_Manager).get({
            key: this.key,
            prefix: this.prefix,
            suffix: this.suffix,
            mode: this.mode,
            sync: true,
            handler: async _ => {
                const _out = await Promise.all(this.params.map(_str => _str.get()));
                return _ + _out.join("");
            }
        });
    }
}

export namespace LangKey {
    export const Param = _Json;

}
