import { _decorator, CCClass, CCString, js, Label, TTFFont } from 'cc';
import { Smart_Limiter } from 'db://pts-core/scripts/Components/Smart/Smart.Limiter';
import { pClass } from 'db://pts-core/scripts/utils'
import { Enums_EFontExtra, Enums_EFontType } from '../Enums/Enums.FontType';
import { Config_Smart } from 'db://pts-core/scripts/Components/Config/Config.Smart';
import { Editor_Smart_SelfFocus } from 'db://pts-core/scripts/editor/Smart/Editor.Smart.SelfFocus';

const { ccclass, property, menu, requireComponent } = _decorator;

const { singleton } = pClass;

type _$TFont = Record<string, Record<string, TTFFont>>;
type _$TMap = Record<string, _$TFont>;

@ccclass("Config_GlobalTTF_Font")
class _Font {
    @property({ type: Enums_EFontType })
    type: Enums_EFontType = Enums_EFontType.Regular;

    @property({ type: Enums_EFontExtra })
    extra: Enums_EFontExtra = Enums_EFontExtra.None;

    @property({ type: TTFFont })
    font: TTFFont = null

    sign(map: _$TFont) {
        if(!this.font) return false;

        map[this.type] = map[this.type] || js.createMap(true);
        map[this.type][this.extra] = this.font
        return true;
    }
}

@ccclass("Config_GlobalTTF_Helper")
class _Helper extends Editor_Smart_SelfFocus {
    @property({ type: pTS.languages.ELang })
    country: string = "en";

    @property({  })
    protected _seal: boolean = false;

    @property({ type: _Font })
    fonts: _Font[] = [];

    sign(map: _$TMap) {
        map[this.country] = map[this.country] || js.createMap(true);
        for(const _font of this.fonts) {
            _font.sign(map[this.country]);
        }
        return map;
    }

    focus(): void {
        if(this._seal) {
            CCClass.Attr.setClassAttr(this, 'country', 'type', CCString);
            CCClass.Attr.setClassAttr(this, 'country', 'readonly', true);
        }
    }

    constructor(country?: string) {
        super();
        if(country) {
            this.country = country;
            this._seal = true;
        }
    }
}

@ccclass("Config_GlobalTTF_Config")
class _Config {
    @property({ type: _Helper })
    default: _Helper = new _Helper('default');

    @property({ type: _Helper })
    list: _Helper[] = []

    protected _$map: Record<string, Record<string, Record<`${boolean}`, TTFFont>>> = js.createMap(true);
    protected _$default: TTFFont = null;

    get(type: Enums_EFontType, extra: Enums_EFontExtra = Enums_EFontExtra.None): TTFFont {
        return this._$map['default']?.[type]?.[extra] || this._$default;
    }

    init() {
        this._$map = this.default.sign(this._$map);

        for(const _ret of this.list) {
            this._$map = _ret.sign(this._$map);
        }

        for(const _font of this.default.fonts) {
            if(!!this._$default) break;
            _font?.font && (this._$default = _font.font);
        }

        console.log("Config_GlobalTTF_Config: ", this._$map);
    }
}

@ccclass('Config_GlobalTTF')
@menu('pts-language/Config/GlobalTTF')
@singleton()
@requireComponent(Smart_Limiter)
export class Config_GlobalTTF extends Config_Smart<_Config> {
    protected _filter: pClass.ETypes = 'NoneComponent';
    protected _type: string = 'Config_GlobalTTF_Config';
    protected _$lock: boolean = true;
    protected _$max: number = 1;
    protected _$sid: string = 'Config_GlobalTTF';
    protected _$seal: boolean = true

    font(type: Enums_EFontType, extra: Enums_EFontExtra): TTFFont {
        const _cfg = this.get();
        return _cfg.get(type, extra);
    }

    set(label: Label, type: Enums_EFontType, extra: Enums_EFontExtra) {
        if(!label) return;
        label.font = this.font(type, extra);
    }

    protected _onPreLoad(): void {
        this.get()?.init();
    }

}
