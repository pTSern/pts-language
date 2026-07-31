import { _decorator, Component, Label } from 'cc';
import { editor_property, instance } from 'db://pts-core/scripts/utils/pClass';
import { Config_GlobalTTF } from '../Config/Config.GlobalTTF';
import { Language_Manager } from './Language.Manager';
import { pConst } from 'db://pts-core/scripts/utils';

const { ccclass, property, requireComponent, menu } = _decorator;

@ccclass('Language_SmartKey')
@menu('pts-language/Language/SmartKey')
@requireComponent(Label)
export class Language_SmartKey extends Component {
    @property({ type: Label })
    protected _hooker: Label = null
    @property({ type: Label })
    get hooker() { this._ensure(); return this._hooker }
    set hooker(x) { if(!x) { this._ensure(); return; } this._hooker = x }

    @editor_property(Language_Manager)
    get __check() {
        return instance(Language_Manager)
    }

    @property({ visible: pConst.EDITOR_ONLY_IN_PREVIEW })
    protected _key: pTS.languages.TKey = '' as pTS.languages.TKey;
    @property({ type: pTS.languages.EKey })
    get key() { return this._key }
    set key(x) {
        console.log("[Language_Manager] Log: ", x)
        this._key = x;
    }

    protected _ensure() {
        if(!this._hooker) {
            this._hooker = this.getComponent(Label);
        }
    }

    protected onEnable(): void {
        this._actUpdateTTF();
        console.log("[Language_SmartKey] Key: ", this.key)
        instance(Language_Manager).get(this.key).then(_ => {
            this._hooker.string = _;
            console.log("[Language_SmartKey] Log: ", this.key, _, instance(Language_Manager))
        })
    }

    protected _actUpdateTTF() {
        const _config = instance(Config_GlobalTTF);
        if(!_config) return;

        this.hooker.font = _config.get();
        this.hooker.useSystemFont = false;
    }

}
