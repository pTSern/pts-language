import { assetManager, director, DirectorEvent, Enum, js, JsonAsset, Label, RichText } from 'cc';
import { COCOS_RUNTIME } from 'cc/env';
import { pArray, pClass, pConst, pDriver, pString } from 'db://pts-core/scripts/utils';
import { instance } from 'db://pts-core/scripts/utils/pClass';

const { singleton, editor_ccclass, editor_property } = pClass

type _TEvent = {
    onCountryChanged: pFlex.TFunc<[string, string], void>
}

type _TMap = Record<pTS.languages.ELang, Record<pTS.languages.ELang, string>>;

enum _EMode {
    Normal = 0,
    Pascal,
    Upper,
    Lower
}

Enum(_EMode);

interface _IReplacer {
    find: string;
    replacer: string | _ISetOpt;
    time?: number;
}

interface _ISetOpt {
    prefix?: string
    suffix?: string
    mode?: _EMode
    key: pTS.languages.EKey
    replacer?: _IReplacer[];
    handler?: pFlex.TFunc<[string], string>
    targets?: pFlex.TArray<Label | RichText>
}

type _TSetOpt = _ISetOpt | pTS.languages.EKey

@singleton()
@editor_ccclass('Language_Manager')
export class Language_Manager {
    private _$driver: pDriver.Handler<_TEvent> = new pDriver.Handler;
    get driver() { return this._$driver }

    @editor_property()
    protected _$country: pTS.languages.ELang = 'en';
    get country() { return this._$country }

    @editor_property()
    protected get _$is_resolved() { return Boolean(this._$promise) }

    protected _$map: _TMap = js.createMap(true);
    protected _$promise: Promise<_TMap> = null

    load() {
        if(!!this._$promise) return this._$promise;

        this._$promise = new Promise((_rs, _rj) => {
            assetManager.loadBundle(pTS.languages.path, (err, bundle) => {
                if(err) { _rj(err); return; }

                let _count = 0;
                pTS.languages.load(_ => {
                    bundle.load(_, (_err, _file) => {
                        if(_err) { _rj(_err); return; }
                        if(!(_file instanceof JsonAsset)) return;

                        this._$map[_file.name] = _file.json;
                        _count++;
                        if(_count >= pTS.languages.count) _rs(this._$map)
                    })
                })
            })
        })
        return this._$promise;
    }

    protected _replace(root: string, all: pFlex.TArray<_IReplacer>): string {
        all = pArray.flatter(all);
        return all.reduce((result, { find, replacer, time = 0 }) => {
            const _replacer = typeof replacer === 'string' ? replacer : this._get(replacer);
            if (time > 0) {
                for (let i = 0; i < time; i++) result = result.replace(find, _replacer);
            } else {
                result = result.replace(new RegExp(find, 'g'), _replacer);
            }
            return result;
        }, String(root));
    }

    protected _get(_opt: _TSetOpt) {
        const _json = this._$map[this._$country];

        const { mode = _EMode.Pascal, key, replacer, handler, prefix, suffix, targets } = typeof _opt === 'string' ? { key: _opt } : _opt;
        let _str: string = _json?.[key] || key;

        switch(mode) {
            case _EMode.Pascal: [_str] =  pString.pascal(_str); break;
            case _EMode.Upper: _str = _str.toUpperCase(); break;
            case _EMode.Lower: _str = _str.toLowerCase(); break;
        }

        _str = `${prefix||""}${this._replace(_str, replacer)}${suffix||""}`;
        if(handler) _str = handler(_str);
        targets && pArray.flatter(targets).forEach(_ => _.string = _str);
        return _str
    }

    async get(_opt: _TSetOpt) {
        await this.load();

        return this._get(_opt);
    }

    async gets(opt: pFlex.TArray<_TSetOpt>, ...opts: _TSetOpt[]): Promise<Record<pTS.languages.EKey, string>> {
        await this.load();
        opts = pArray.flat(opt, opts);

        const _out = js.createMap(true) as Record<pTS.languages.EKey, string>;

        for(const _opt of opts) {
            _out[typeof _opt === 'string' ? _opt : _opt.key] = this._get(_opt);
        }

        return _out;
    }

    async sgets(opt: pFlex.TArray<_TSetOpt>, ...opts: _TSetOpt[]) {
        await this.load();
        opts = pArray.flat(opt, opts);

        let _out = '';
        for(const _opt of opts) {
            _out += this._get(_opt);
        }

        return _out;
    }

    change(country: pTS.languages.ELang) {
        if(!pTS.languages.has(country)) return;
        this._$country = country;
    }
}

export namespace Language_Manager {
    export const EMode = _EMode;
    export type EMode = _EMode;
    export type TSetOpt = _TSetOpt;
    export type ISetOpt = _ISetOpt;
    export type TKey = pTS.languages.EKey;
}

(pConst.EDITOR_ONLY_IN_PREVIEW || COCOS_RUNTIME) && director.once(DirectorEvent.BEFORE_SCENE_LAUNCH, () => 
    instance(Language_Manager).load()
)

