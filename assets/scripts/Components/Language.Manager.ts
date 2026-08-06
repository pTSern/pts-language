import { assetManager, director, DirectorEvent, js, JsonAsset } from 'cc';
import { COCOS_RUNTIME } from 'cc/env';
import { pClass, pConst, pDriver } from 'db://pts-core/scripts/utils';
import { instance } from 'db://pts-core/scripts/utils/pClass';

const { singleton, editor_ccclass, editor_property } = pClass

type _TEvent = {
    onCountryChanged: pFlex.TFunc<[string, string], void>
}

type _TMap = Record<pTS.languages.TLang, Record<pTS.languages.TLang, string>>;

@singleton()
@editor_ccclass('Language_Manager')
export class Language_Manager {
    private _$driver: pDriver.Handler<_TEvent> = new pDriver.Handler;
    get driver() { return this._$driver }

    async get(key: string) {
        await this.load();

        const _json = this._$map[this._$country];
        if(!_json) return "[NONE]"
        return _json[key];
    }

    @editor_property()
    protected _$country: pTS.languages.TLang = 'en';
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

    change(country: pTS.languages.TLang) {
        if(!pTS.languages.has(country)) return;
        this._$country = country;
    }
}

(pConst.EDITOR_ONLY_IN_PREVIEW || COCOS_RUNTIME) && director.once(DirectorEvent.BEFORE_SCENE_LAUNCH, () => 
    instance(Language_Manager).load()
)

