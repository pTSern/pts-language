const _$path = "lang";
const _$langs = {"__enums__":null,"en":"en","fr":"fr","ge":"ge","indo":"indo","jp":"jp","kr":"kr","vi":"vi","zh":"zh"};
const _$container = {"__enums__":null,"get":"get","reward":"reward","double":"double","daily":"daily","areas":"areas","room":"room","shop":"shop","home":"home","jigsaw":"jigsaw","rank":"rank","level":"level","day":"day","claim":"claim","claimed":"claimed","comming_soon":"comming_soon","daily_reward":"daily_reward","setting":"setting","quit":"quit","wait":"wait","please":"please","dyn_not_enough_@amount_@money":"dyn_not_enough_@amount_@money","notice":"notice","dyn_watch_ads_for_@reward":"dyn_watch_ads_for_@reward","dyn_ur_missing_@amount_ads_ticket_for_this_reward":"dyn_ur_missing_@amount_ads_ticket_for_this_reward","ok":"ok","no":"no","failed":"failed","dyn_would_u_like_to_spend_@amount1_of_@money1_for_@amount2_of_@money2":"dyn_would_u_like_to_spend_@amount1_of_@money1_for_@amount2_of_@money2","ads_ticket":"ads_ticket","coin":"coin","watch_ads":"watch_ads","dync_watch_ads_for_@amount_of_@money":"dync_watch_ads_for_@amount_of_@money","dyn_wult_spend_@price_of_@money_for_@anything":"dyn_wult_spend_@price_of_@money_for_@anything","dyn_watch_ads_for_@anything":"dyn_watch_ads_for_@anything","bomb":"bomb","clock":"clock","infinity_energy":"infinity_energy","hint":"hint","star":"star","piece":"piece","refresh":"refresh"};
const _$count = 8;

function _$has(key) {
    return !!_$langs[key];
}

function _$load(callback) {
    const _ = "";
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
