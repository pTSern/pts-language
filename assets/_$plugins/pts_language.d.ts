declare namespace pTS {
    export namespace languages {
        const _$langs = ["en", "vi"] as const;
        export type ELang = typeof _$langs[number];
        const _$keys = ["get", "reward", "double", "daily", "areas", "room", "shop", "home", "jigsaw", "rank", "level", "day", "claim", "claimed", "comming_soon", "daily_reward", "setting", "quit", "wait", "please", "dyn_not_enough_@amount_@money", "notice", "dyn_watch_ads_for_@reward", "dyn_ur_missing_@amount_ads_ticket_for_this_reward", "ok", "no", "failed", "dyn_would_u_like_to_spend_@amount1_of_@money1_for_@amount2_of_@money2", "ads_ticket", "coin", "watch_ads"] as const;
        export type EKey = typeof _$keys[number];
        export const path: string;
        export const ELang: Record<string, string>;
        export const EKey: Record<string, string>;
        export function load(callback: pFlex.TFunc<[string], void>): void;
        export function has(key: string): boolean;
        export const count: number;
    }
}
