import { _decorator, js, Label, RichText, TTFFont } from 'cc';
import { pTSAsset } from 'db://pts-core/scripts/pTSAsset';
import { Enums_EFontExtra, Enums_EFontType } from '../Enums/Enums.FontType';
import { singleton } from 'db://pts-core/scripts/utils/pClass';

const { ccclass, property } = _decorator;

type _$TFont = Record<string, Record<string, TTFFont>>;
type _$TMap = Record<string, _$TFont>;

@ccclass("pTSAsset_TTFConfig._Font")
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

@ccclass("pTSAsset_TTFConfig._Helper")
class _Helper {
    @property({ type: pTS.languages.ELang })
    country: string = "en";

    @property({  })
    protected _seal: boolean = false;

    @property({ type: _Font })
    fonts: _Font[] = [];

    constructor(country?: string) {
        if(country) {
            this.country = country;
            this._seal = true;
        }
    }

    sign(map: _$TMap) {
        map[this.country] = map[this.country] || js.createMap(true);
        for(const _font of this.fonts) {
            _font.sign(map[this.country]);
        }
        return map;
    }
}

@ccclass('pTSAsset_TTFConfig')
@singleton({ initer: '_onAwake', setup: false })
export class pTSAsset_TTFConfig extends pTSAsset {
    @property({ type: _Helper })
    default: _Helper = new _Helper('default');

    @property({ type: _Helper })
    list: _Helper[] = []

    protected _$map: Record<string, Record<string, Record<`${boolean}`, TTFFont>>> = js.createMap(true);
    protected _$default: TTFFont = null;

    font(type: Enums_EFontType, extra: Enums_EFontExtra = Enums_EFontExtra.None): TTFFont {
        return this._$map['default']?.[type]?.[extra] || this._$default;
    }

    protected _onAwake() {
        this._$map = this.default.sign(this._$map);

        for(const _ret of this.list) {
            this._$map = _ret.sign(this._$map);
        }

        for(const _font of this.default.fonts) {
            if(!!this._$default) break;
            _font?.font && (this._$default = _font.font);
        }
        console.log(`pTSAsset_TTFConfig: ${this._$default?.name || 'No Default Font'}`, this._$map, this._$default);
    }

    set(label: Label | RichText, type: Enums_EFontType, extra: Enums_EFontExtra) {
        if(!label) return;
        label.useSystemFont = false;
        label.font = this.font(type, extra);
    }
}
