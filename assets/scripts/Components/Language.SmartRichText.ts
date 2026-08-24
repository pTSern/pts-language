import { _decorator, CacheMode, math, RichText, SpriteAtlas, TTFFont } from 'cc';
import { Enums_EFontExtra, Enums_EFontType } from '../Enums/Enums.FontType';
import { pConst } from 'db://pts-core/scripts/utils';
import { LangKey } from './Language.LangKey';
import { editor_property, instance } from 'db://pts-core/scripts/utils/pClass';
import { Config_GlobalTTF } from '../Config/Config.GlobalTTF';

const { ccclass, property } = _decorator;

@ccclass('Language_SmartRichText')
export class Language_SmartRichText extends RichText {
    @property({ group: pConst.GROUPS.CORE, override: true })
    get string() { return super.string }
    set string(x) { super.string = x }

    @property({ group: pConst.GROUPS.CORE, override: true })
    set horizontalAlign(value) { super.horizontalAlign = value }
    get horizontalAlign() { return super.horizontalAlign }

    @property({ group: pConst.GROUPS.CORE, override: true })
    set verticalAlign(value) { super.verticalAlign = value }
    get verticalAlign() { return super.verticalAlign }

    @property({ group: pConst.GROUPS.CORE, override: true, visible: false })
    set useSystemFont(value: boolean) { super.useSystemFont = value }
    get useSystemFont(): boolean { return super.useSystemFont }

    @property({ group: pConst.GROUPS.CORE, override: true })
    set fontSize(value: number) { super.fontSize = value }
    get fontSize(): number {
        return super.fontSize
    }

    @property({ group: pConst.GROUPS.CORE, override: true })
    get fontColor(): math.Color { return super.fontColor }
    set fontColor(value: math.Color) {
        super.fontColor = value
    }

    @property({ group: pConst.GROUPS.CORE, override: true, visible: false })
    get font(): TTFFont { return super.font }
    set font(value: TTFFont) {
        super.font = value
    }

    @property({ type: Enums_EFontType, displayName: "Font Type", group: pConst.GROUPS.CORE })
    tfont: Enums_EFontType = Enums_EFontType.Regular;

    @property({ type: Enums_EFontExtra, displayName: "Font Extra", group: pConst.GROUPS.CORE })
    extra: Enums_EFontExtra = Enums_EFontExtra.None;

    @property({ group: pConst.GROUPS.CORE, override: true, visible: false })
    set fontFamily(value: string) { super.fontFamily = value }
    get fontFamily(): string {
        return super.fontFamily
    }

    @property({ group: pConst.GROUPS.CORE, override: true })
    set cacheMode(value: CacheMode) { super.cacheMode = value }
    get cacheMode(): CacheMode {
        return super.cacheMode
    }

    @property({ group: pConst.GROUPS.CORE, override: true })
    get maxWidth(): number { return super.maxWidth }
    set maxWidth(value: number) {
        super.maxWidth = value
    }

    @property({ group: pConst.GROUPS.CORE, override: true })
    get lineHeight(): number { return super.lineHeight }
    set lineHeight(value: number) {
        super.lineHeight = value
    }

    @property({ group: pConst.GROUPS.CORE, override: true })
    get imageAtlas(): SpriteAtlas { return super.imageAtlas }
    set imageAtlas(value: SpriteAtlas) {
        super.imageAtlas = value
    }

    @property({ group: pConst.GROUPS.CORE, override: true })
    get handleTouchEvent(): boolean { return super.handleTouchEvent }
    set handleTouchEvent(value: boolean) {
        super.handleTouchEvent = value
    }

    @property({ tooltip: "If true -> Auto select the font base on the setting of the target.\nExample `bold` -> lookup for `bold` font.", group: pConst.GROUPS.CORE })
    smart: boolean = true;

    @property({ group: pConst.GROUPS.CORE })
    isUpdateKey: boolean = true;

    @property({ visible() { return this.isUpdateKey }, group: pConst.GROUPS.CORE })
    space: string = " ";

    @property({ type: LangKey, visible() { return this.isUpdateKey }, group: pConst.GROUPS.CORE })
    keys: LangKey[] = [];

    @editor_property()
    protected _isUpdating: boolean = false;

    onEnable(): void {
        this._actUpdateTTF();
        this._actUpdateKey();
        super.onEnable();
    }

    protected _actUpdateKey() {
        if(!this.isUpdateKey) return;
        if(this._isUpdating) return;
        this._isUpdating = true;

        this.string = "";
        Promise.all(this.keys.map(_ => _.get())).then(_lang => {
            for(let i = 0; i < _lang.length; i ++) {
                const _str = _lang[i];
                this.string += _str;

                if(i != _lang.length - 1) {
                    this.string += this.space;
                }
            }
        }).finally(() => { this._isUpdating = false })
    }

    protected _actUpdateTTF() {
        const _config = instance(Config_GlobalTTF);
        if(!_config) return;

        this.font = _config.font(this.tfont, this.extra);
        this.useSystemFont = false;
    }
}
