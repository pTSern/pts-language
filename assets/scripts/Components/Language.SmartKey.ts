import { _decorator, Component, JsonAsset, Label, } from 'cc';
import { editor_property, instance } from 'db://pts-core/scripts/utils/pClass';
import { Config_GlobalTTF } from '../Config/Config.GlobalTTF';
import { Language_Manager } from './Language.Manager';
import { pConst, pEngine } from 'db://pts-core/scripts/utils';
import { Enums_EFontExtra, Enums_EFontType } from '../Enums/Enums.FontType';
import { LangKey } from './Language.LangKey';

const { ccclass, property, requireComponent, menu } = _decorator;

@ccclass('Language_SmartKey')
@menu('pts-language/Language/SmartKey')
@requireComponent(Label)
export class Language_SmartKey extends Component {
    @property({ type: Label })
    protected _hooker: Label = null
    @property({ type: Label })
    get hooker() { this._ensure(); return this._hooker }
    set hooker(x) {
        if(!x) {
            this._ensure();
            return; 
        }
        this._hooker = x 
    }

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

    @property({ type: LangKey, visible() { return this.isUpdateKey }  })
    keys: LangKey[] = [];

    @editor_property()
    protected _isUpdating: boolean = false;
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
        if(this._isUpdating) return;
        this._isUpdating = true;

        this._hooker.string = "";
        Promise.all(this.keys.map(_ => _.get())).then(_lang => {
            for(let i = 0; i < _lang.length; i ++) {
                const _str = _lang[i];
                this._hooker.string += _str;

                if(i != _lang.length - 1) {
                    this._hooker.string += this.space;
                }
            }
        }).finally(() => { this._isUpdating = false })
    }

    protected _actUpdateTTF() {
        const _config = instance(Config_GlobalTTF);
        if(!_config) return;

        this.hooker.font = _config.font(this.font, this.extra);
        this.hooker.useSystemFont = false;
    }
}

export namespace Language_SmartKey {
    export const Helper = LangKey
}
