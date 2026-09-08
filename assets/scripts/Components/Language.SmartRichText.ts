import { _decorator, CacheMode, math, RichText, SpriteAtlas, TTFFont } from 'cc';
import { Enums_EFontExtra, Enums_EFontType } from '../Enums/Enums.FontType';
import * as pConst from 'db://pts-core/scripts/utils/pConst';
import { LangKey } from './Language.LangKey';
import { editor_property, instance } from 'db://pts-core/scripts/utils/pClass';
import { EDITOR } from 'cc/env';
import { pTSAsset_TTFConfig } from '../pTSAssets/pTSAsset.TTFConfig';

const { ccclass, property } = _decorator;
const CORE_GROUP = pConst?.GROUPS?.CORE || { name: 'Core', id: '9', displayOrder: 1000 };

@ccclass('Language_SmartRichText')
export class Language_SmartRichText extends RichText {
    @property({ group: CORE_GROUP, override: true })
    get string() { return super.string }
    set string (value) {
        if (this._string === value) {
            return;
        }

        this._string = value;
        this._updateRichTextStatus();
    }

    @property({ group: CORE_GROUP, override: true })
    set horizontalAlign (value) {
        if (this.horizontalAlign === value) {
            return;
        }

        this._horizontalAlign = value;
        this._layoutDirty = true;
        this._updateRichTextStatus();
    }
    get horizontalAlign() { return super.horizontalAlign }

    @property({ group: CORE_GROUP, override: true })
    set verticalAlign (value) {
        if (this._verticalAlign === value) {
            return;
        }

        this._verticalAlign = value;
        this._layoutDirty = true;
        this._updateRichTextStatus();
    }
    get verticalAlign() { return super.verticalAlign }

    @property({ group: CORE_GROUP, override: true, visible: false })
    set useSystemFont (value: boolean) {
        if (this._isSystemFontUsed === value) {
            return;
        }
        this._isSystemFontUsed = value;

        if (EDITOR) {
            if (value) {
                this._font = null;
            } else if (this._userDefinedFont) {
                this._font = this._userDefinedFont;
                return;
            }
        }

        this._layoutDirty = true;
        this._updateRichTextStatus();
    }
    get useSystemFont(): boolean { return super.useSystemFont }

    @property({ group: CORE_GROUP, override: true })
    set fontSize(value: number) { super.fontSize = value }
    get fontSize(): number {
        return super.fontSize
    }

    @property({ group: CORE_GROUP, override: true })
    get fontColor(): math.Color { return super.fontColor }
    set fontColor(value: math.Color) {
        super.fontColor = value
    }

    @property({ group: CORE_GROUP, override: true, visible: false })
    get font(): TTFFont { return super.font }
    set font(value: TTFFont) {
        if (this._font === value) {
            return;
        }
        this._font = value;
        this._layoutDirty = true;
        if (this._font) {
            if (EDITOR) {
                this._userDefinedFont = this._font;
            }
            this.useSystemFont = false;
            this._onTTFLoaded();
        } else {
            this.useSystemFont = true;
        }
        this._updateRichTextStatus();
    }

    @property({ type: Enums_EFontType, displayName: "Font Type", group: CORE_GROUP })
    tfont: Enums_EFontType = Enums_EFontType.Regular;

    @property({ type: Enums_EFontExtra, displayName: "Font Extra", group: CORE_GROUP })
    extra: Enums_EFontExtra = Enums_EFontExtra.None;

    @property({ group: CORE_GROUP, override: true, visible: false })
    get fontFamily(): string { return super.fontFamily }
    set fontFamily(value: string) {
        if (this._fontFamily === value) return;
        this._fontFamily = value;
        this._layoutDirty = true;
        this._updateRichTextStatus();
    }


    @property({ group: CORE_GROUP, override: true })
    get cacheMode(): CacheMode { return super.cacheMode }
    set cacheMode(value: CacheMode) {
        if (this._cacheMode === value) {
            return;
        }
        this._cacheMode = value;
        this._updateRichTextStatus();
    }


    @property({ group: CORE_GROUP, override: true })
    get maxWidth (): number { return super.maxWidth }
    set maxWidth (value) {
        if (this._maxWidth === value) {
            return;
        }

        this._maxWidth = value;
        this._layoutDirty = true;
        this._updateRichTextStatus();
    }

    @property({ group: CORE_GROUP, override: true })
    get lineHeight(): number { return super.lineHeight }
    set lineHeight (value) {
        if (this._lineHeight === value) {
            return;
        }

        this._lineHeight = value;
        this._layoutDirty = true;
        this._updateRichTextStatus();
    }

    @property({ group: CORE_GROUP, override: true })
    get imageAtlas(): SpriteAtlas { return super.imageAtlas }
    set imageAtlas (value) {
        if (this._imageAtlas === value) {
            return;
        }

        this._imageAtlas = value;
        this._layoutDirty = true;
        this._updateRichTextStatus();
    }

    @property({ group: CORE_GROUP, override: true })
    get handleTouchEvent(): boolean { return super.handleTouchEvent }
    set handleTouchEvent (value) {
        if (this._handleTouchEvent === value) {
            return;
        }

        this._handleTouchEvent = value;
        if (this.enabledInHierarchy) {
            if (this.handleTouchEvent) {
                this._addEventListeners();
            } else {
                this._removeEventListeners();
            }
        }
    }

    @property({ tooltip: "If true -> Auto select the font base on the setting of the target.\nExample `bold` -> lookup for `bold` font.", group: CORE_GROUP })
    smart: boolean = true;

    @property({ group: CORE_GROUP })
    isUpdateKey: boolean = true;

    @property({ visible() { return this.isUpdateKey }, group: CORE_GROUP })
    space: string = " ";

    @property({ type: LangKey, visible() { return this.isUpdateKey }, group: CORE_GROUP })
    keys: LangKey[] = [];

    @property({ type: pTSAsset_TTFConfig, visible: true })
    protected _config: pTSAsset_TTFConfig = null;

    get config() {
        if(!this._config) {
            this._config = instance(pTSAsset_TTFConfig);
        }
        return this._config;
    }

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
        this.font = this.config.font(this.tfont, this.extra);
        this.useSystemFont = false;
    }
}
