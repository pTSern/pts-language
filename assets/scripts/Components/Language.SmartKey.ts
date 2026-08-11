import { _decorator, Component, Enum, JsonAsset, Label } from 'cc';
import { editor_property, instance } from 'db://pts-core/scripts/utils/pClass';
import { Config_GlobalTTF } from '../Config/Config.GlobalTTF';
import { Language_Manager } from './Language.Manager';
import { pConst, pEngine, pString } from 'db://pts-core/scripts/utils';
import { Enums_EFontExtra, Enums_EFontType } from '../Enums/Enums.FontType';

const { ccclass, property, requireComponent, menu } = _decorator;

enum _EMode {
    Normal = 0,
    Pascal,
    Upper,
    Lower
}

Enum(_EMode);

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
class _LangKey {
    @property({ type: _EMode })
    mode: _EMode = _EMode.Pascal;

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

    async get() {
        const _out = await instance(Language_Manager).get(this.key);
        const _str = this.prefix + _out + this.suffix + this.params.map(_ => _.get()).join("");

        switch(this.mode) {
            case _EMode.Pascal: return pString.pascal(_str)
            case _EMode.Upper: return _str.toUpperCase()
            case _EMode.Lower: return _str.toLowerCase()
        }

        return _str;
    }
}

@ccclass('Language_SmartKey')
@menu('pts-language/Language/SmartKey')
@requireComponent(Label)
export class Language_SmartKey extends Component {
    @property({ type: Label })
    protected _hooker: Label = null
    @property({ type: Label })
    get hooker() { this._ensure(); return this._hooker }
    set hooker(x) { if(!x) { this._ensure(); return; } this._hooker = x }

    @property({ type: Enums_EFontType })
    font: Enums_EFontType = Enums_EFontType.Regular;
    @property({ type: Enums_EFontExtra })
    extra: Enums_EFontExtra = Enums_EFontExtra.None;

    @property({ tooltip: "If true -> Auto select the font base on the setting of the target.\nExample `bold` -> lookup for `bold` font." })
    smart: boolean = true;

    @property({})
    isUpdateKey: boolean = true;

    @property({ visible() { return this.isUpdateKey } })
    space: string = " ";

    @property({ type: _LangKey, visible() { return this.isUpdateKey }  })
    keys: _LangKey[] = [];

    protected _ensure() {
        if(!this._hooker) {
            this._hooker = this.getComponent(Label);
        }
    }

    protected onEnable(): void {
        this._actUpdateTTF();
        this._actUpdateKey();
    }

    protected _actUpdateKey() {
        if(!this.isUpdateKey) return;

        this._hooker.string = "";
        Promise.all(this.keys.map(_ => _.get())).then(_lang => {
            for(let i = 0; i < _lang.length; i ++) {
                const _str = _lang[i];
                this._hooker.string += _str;

                if(i != _lang.length - 1) {
                    this._hooker.string += this.space;
                }
            }
        })
    }

    protected _actUpdateTTF() {
        const _config = instance(Config_GlobalTTF);
        if(!_config) return;

        this.hooker.font = _config.font(this.font, this.extra);
        this.hooker.useSystemFont = false;
    }

}
