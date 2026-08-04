declare namespace pTS {
    export namespace languages {
        const _$langs = ["en", "vi"] as const;
        export type TLang = typeof _$langs[number];
        const _$keys = ["get", "reward", "double"] as const;
        export type TKey = typeof _$keys[number];
        export const path: string;
        export const ELang: Record<string, string>;
        export const EKey: Record<string, string>;
        export function load(callback: pFlex.TFunc<[string], void>): void;
        export function has(key: string): boolean;
        export const count: number;
    }
}
