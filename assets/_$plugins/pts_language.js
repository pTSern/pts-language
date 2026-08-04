const _$path = "game";
const _$langs = {"__enums__":null,"en":"en","vi":"vi"};
const _$container = {"__enums__":null,"get":"get","reward":"reward","double":"double"};
const _$count = 2;

function _$has(key) {
    return !!_$langs[key];
}

function _$load(callback) {
    const _ = "$language";
    for (const _lang in _$langs) {
        if (_lang === '__enums__') continue;
        const _sub = _ ? (_ + '/' + _lang) : _lang;
        callback(_sub);
    }
}

window['pTS'] = window['pTS'] || {};
window['pTS']['languages'] = {
    ELang: _$langs, path: _$path, EKey: _$container, load: _$load, has: _$has, count: _$count,
};
