import { AssetInfo, IAssetMeta } from "@cocos/creator-types/editor/packages/asset-db/@types/public";
import pkg from '../package.json';
import path from 'path';
import fs from 'fs';

interface IConfig {
    located_json: string;
    always_refresh: boolean;
}

interface IState {
    promise: Promise<void>;
    resolver: () => void;
}

const PLUGIN_NAME = 'pts_language';

const __config_: IConfig = Object.create(null);
const __state_: IState = Object.create(null);
__state_.promise = new Promise<void>(_rs => __state_.resolver = _rs);

export const methods: { [key: string]: (...any: any[]) => any } = {
    openPanel() {
        Editor.Panel.open(pkg.name);
    },
    "force-generate": async function() {
        return _shiping();
    },
    "profile::project::changed_refresh": async function(key: string, value: boolean) {
        __config_.always_refresh = Boolean(value);
        _shiping();
    },
    "profile::project::changed_location": async function(key: string, value: string) {
        __config_.located_json = value;
        await _shiping();
    }
};

async function _shiping() {
    await __state_.promise;
    if (!__config_) return;

    const jsonDir = _resolveDir(__config_.located_json);
    if (!jsonDir) {
        console.warn(`[${pkg.name}] JSON folder is not specified or invalid.`);
        return;
    }

    // Safety check: Ensure jsonDir is NOT OUTSIDE the project path
    const normalizedProjectPath = path.resolve(Editor.Project.path).replace(/\\/g, '/');
    const normalizedJsonPhysicPath = path.resolve(jsonDir.physic).replace(/\\/g, '/');
    if (!normalizedJsonPhysicPath.startsWith(normalizedProjectPath)) {
        console.error(`[${pkg.name}] Selected JSON folder is OUTSIDE of the project path: ${normalizedJsonPhysicPath}`);
        return;
    }

    // Fixed plugin output directory inside extension assets folder: extensions/pts-language/assets/_$plugins
    const extensionAssetsPhysic = path.resolve(__dirname, '..', 'assets', '_$plugins');
    const extensionAssetsDb = `db://${pkg.name}/_$plugins`;

    try {
        if (!fs.existsSync(extensionAssetsPhysic)) {
            fs.mkdirSync(extensionAssetsPhysic, { recursive: true });
            await Editor.Message.request('asset-db', 'refresh-asset', extensionAssetsDb);
        }
    } catch (_error) {
        console.error(`[${pkg.name}] Failed to create extension plugin directory:`, extensionAssetsPhysic, _error);
        return;
    }

    return _generate(jsonDir, { db: extensionAssetsDb, physic: extensionAssetsPhysic });
}

function _resolveDir(rawLocation: string) {
    if (!rawLocation) return null;

    let db = '';
    const norm = rawLocation.replace(/\\/g, '/');

    if (norm.startsWith('project://assets')) {
        db = 'db://' + norm.substring('project://'.length);
    } else if (norm.startsWith('db://assets')) {
        db = norm;
    } else if (norm.startsWith('project://')) {
        const rel = norm.substring('project://'.length);
        db = rel.startsWith('assets') ? 'db://' + rel : 'db://assets/' + rel;
    } else if (path.isAbsolute(rawLocation)) {
        const normalizedProjectPath = path.resolve(Editor.Project.path).replace(/\\/g, '/');
        const normalizedAssetsPath = path.join(normalizedProjectPath, 'assets').replace(/\\/g, '/');
        const normalizedAbsDir = path.resolve(rawLocation).replace(/\\/g, '/');

        if (normalizedAbsDir.startsWith(normalizedAssetsPath)) {
            const rel = normalizedAbsDir.substring(normalizedAssetsPath.length);
            db = 'db://assets' + (rel.startsWith('/') ? rel : '/' + rel);
        } else if (normalizedAbsDir.startsWith(normalizedProjectPath)) {
            const rel = normalizedAbsDir.substring(normalizedProjectPath.length);
            db = 'db://assets' + (rel.startsWith('/') ? rel : '/' + rel);
        } else {
            return null; // Outside project directory!
        }
    } else {
        db = 'db://assets/' + norm;
    }

    if (db.endsWith('/')) {
        db = db.substring(0, db.length - 1);
    }

    const relAssets = db.substring('db://assets'.length);
    const physic = path.join(Editor.Project.path, 'assets', relAssets);
    const projectPath = 'project://assets' + relAssets;

    return { db, physic, project: projectPath };
}

async function _getConfig() {
    const _proj = await Editor.Profile.getProject(pkg.name);

    __config_.located_json = _proj.located_json || '';
    __config_.always_refresh = typeof _proj.always_refresh === 'boolean' ? _proj.always_refresh : true;

    return __config_;
}

async function _ensureBundle(dbPath: string): Promise<{ bundle: string; path: string }> {
    if (!dbPath) return { bundle: '', path: '' };

    let currentDb = dbPath.replace(/\\/g, '/');

    while (currentDb && currentDb.startsWith('db://assets')) {
        if (currentDb === 'db://assets') break;

        let isBundle = false;

        // Check via Editor AssetDB Message
        try {
            const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', currentDb) as AssetInfo;
            if (assetInfo?.uuid) {
                const meta = await Editor.Message.request('asset-db', 'query-asset-meta', assetInfo.uuid) as IAssetMeta;
                if (meta?.userData?.isBundle) {
                    isBundle = true;
                }
            }
        } catch (e) {}

        // Fallback check via physical .meta file
        if (!isBundle) {
            try {
                const relPath = currentDb.substring('db://assets'.length);
                const physicPath = path.join(Editor.Project.path, 'assets', relPath);
                const metaFilePath = physicPath + '.meta';
                if (fs.existsSync(metaFilePath)) {
                    const rawMeta = fs.readFileSync(metaFilePath, 'utf8');
                    const metaContent = JSON.parse(rawMeta);
                    if (metaContent?.userData?.isBundle) {
                        isBundle = true;
                    }
                }
            } catch (e) {}
        }

        if (isBundle) {
            return {
                bundle: currentDb,
                path: dbPath
            };
        }

        const lastSlash = currentDb.lastIndexOf('/');
        if (lastSlash <= 'db://assets'.length) {
            break;
        } else {
            currentDb = currentDb.substring(0, lastSlash);
        }
    }

    // None of the parent folders is a bundle -> Force set target folder (dbPath) as bundle
    try {
        const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', dbPath) as AssetInfo;
        if (assetInfo?.uuid) {
            const meta = await Editor.Message.request('asset-db', 'query-asset-meta', dbPath) as IAssetMeta;
            if (meta) {
                meta.userData = meta.userData || {};
                meta.userData.isBundle = true;
                await Editor.Message.request('asset-db', 'save-asset-meta', meta.uuid, JSON.stringify(meta));
                await Editor.Message.request('asset-db', 'refresh-asset', dbPath);
            }
        } else {
            const relPath = dbPath.substring('db://assets'.length);
            const physicPath = path.join(Editor.Project.path, 'assets', relPath);
            const metaFilePath = physicPath + '.meta';
            if (fs.existsSync(metaFilePath)) {
                const rawMeta = fs.readFileSync(metaFilePath, 'utf8');
                const metaContent = JSON.parse(rawMeta) || {};
                metaContent.userData = metaContent.userData || {};
                metaContent.userData.isBundle = true;
                fs.writeFileSync(metaFilePath, JSON.stringify(metaContent, null, 4), 'utf8');
                await Editor.Message.request('asset-db', 'refresh-asset', dbPath);
            }
        }
    } catch (e) {
        console.error(`[${pkg.name}] Failed to force set bundle for ${dbPath}`, e);
    }

    return {
        bundle: dbPath,
        path: dbPath
    };
}

async function _generate(jsonDir: { db: string; physic: string; project: string }, pluginDir: { db: string; physic: string }) {
    const _$langs: Record<string, any> = { __enums__: null };
    const _$container: Record<string, any> = { __enums__: null };

    if (fs.existsSync(jsonDir.physic)) {
        try {
            const files = fs.readdirSync(jsonDir.physic);
            const jsonFiles = files.filter(f => f.toLowerCase().endsWith('.json'));

            for (const file of jsonFiles) {
                const fileNameKey = path.basename(file, '.json');
                _$langs[fileNameKey] = fileNameKey;

                const fullPath = path.join(jsonDir.physic, file);

                try {
                    const rawData = fs.readFileSync(fullPath, 'utf8');
                    const jsonContent = JSON.parse(rawData);

                    if (jsonContent && typeof jsonContent === 'object' && !Array.isArray(jsonContent)) {
                        for (const key of Object.keys(jsonContent)) {
                            const val = jsonContent[key];

                            // Rule: value must ONLY be string or string[]
                            const isString = typeof val === 'string';
                            const isStringArray = Array.isArray(val) && val.every(item => typeof item === 'string');

                            if (isString || isStringArray) {
                                _$container[key] = key;
                            }
                        }
                    }
                } catch (e) {
                    console.error(`[${pkg.name}] Error reading/parsing JSON file: ${file}`, e);
                }
            }
        } catch (e) {
            console.error(`[${pkg.name}] Failed to read JSON directory: ${jsonDir.physic}`, e);
        }
    }

    const langKeys = Object.keys(_$langs).filter(k => k !== '__enums__');
    const validKeys = Object.keys(_$container).filter(k => k !== '__enums__');
    const langCount = langKeys.length;
    const pathObj = await _ensureBundle(jsonDir.db);

    // Calculate bundle name without db://assets/ prefix
    let bundleName = pathObj.bundle;
    if (bundleName.startsWith('db://assets/')) {
        bundleName = bundleName.substring('db://assets/'.length);
    } else if (bundleName.startsWith('db://assets')) {
        bundleName = bundleName.substring('db://assets'.length);
    }
    if (bundleName.startsWith('/')) {
        bundleName = bundleName.substring(1);
    }

    // Calculate relative path inside bundle
    let relPath = '';
    if (pathObj.path.startsWith(pathObj.bundle)) {
        relPath = pathObj.path.substring(pathObj.bundle.length);
        if (relPath.startsWith('/')) {
            relPath = relPath.substring(1);
        }
    }

    // Build JS Content
    let _js = `const _$path = ${JSON.stringify(bundleName)};\n`;
    _js += `const _$langs = ${JSON.stringify(_$langs)};\n`;
    _js += `const _$container = ${JSON.stringify(_$container)};\n`;
    _js += `const _$count = ${langCount};\n\n`;

    _js += `function _$has(key) {\n    return !!_$langs[key];\n}\n\n`;

    _js += `function _$load(callback) {\n`;
    _js += `    const _ = ${JSON.stringify(relPath)};\n`;
    _js += `    for (const _lang in _$langs) {\n`;
    _js += `        if (_lang === '__enums__') continue;\n`;
    _js += `        const _sub = _ ? (_ + '/' + _lang) : _lang;\n`;
    _js += `        callback(_sub);\n`;
    _js += `    }\n`;
    _js += `}\n\n`;

    _js += `window['pTS'] = window['pTS'] || {};\n`;
    _js += `window['pTS']['languages'] = {\n    ELang: _$langs, path: _$path, EKey: _$container, load: _$load, has: _$has, count: _$count,\n};\n`;

    // Build d.ts Content
    let _dts = `declare namespace pTS {\n`;
    _dts += `    export namespace languages {\n`;
    _dts += `        const _$langs = [${langKeys.map(k => `"${k}"`).join(', ')}] as const;\n`;
    _dts += `        export type ELang = typeof _$langs[number];\n`;
    _dts += `        const _$keys = [${validKeys.map(k => `"${k}"`).join(', ')}] as const;\n`;
    _dts += `        export type EKey = typeof _$keys[number];\n`;
    _dts += `        export const path: string;\n`;
    _dts += `        export const ELang: Record<string, string>;\n`;
    _dts += `        export const EKey: Record<string, string>;\n`;
    _dts += `        export function load(callback: pFlex.TFunc<[string], void>): void;\n`;
    _dts += `        export function has(key: string): boolean;\n`;
    _dts += `        export const count: number;\n`;
    _dts += `    }\n`;
    _dts += `}\n`;

    // Write physical files directly inside extension assets folder using Node.js fs
    const jsPath = path.join(pluginDir.physic, `${PLUGIN_NAME}.js`);
    const dtsPath = path.join(pluginDir.physic, `${PLUGIN_NAME}.d.ts`);
    const jsUrl = `${pluginDir.db}/${PLUGIN_NAME}.js`;
    const dtsUrl = `${pluginDir.db}/${PLUGIN_NAME}.d.ts`;

    try {
        fs.writeFileSync(jsPath, _js, 'utf8');
        await Editor.Message.request('asset-db', 'refresh-asset', jsUrl);

        // Update meta for JS to make it a plugin script
        const objMeta = await Editor.Message.request('asset-db', 'query-asset-meta', jsUrl) as IAssetMeta;
        if (objMeta) {
            objMeta.userData = objMeta.userData || {};
            const pluginSettings = {
                isPlugin: true,
                loadPluginInWeb: true,
                loadPluginInNative: true,
                loadPluginInEditor: true,
                loadPluginInPreview: true,
                loadPluginInMiniGame: true
            };

            let needUpdate = false;
            for (const key in pluginSettings) {
                if (objMeta.userData[key] !== (pluginSettings as any)[key]) {
                    objMeta.userData[key] = (pluginSettings as any)[key];
                    needUpdate = true;
                }
            }

            if (needUpdate) {
                await Editor.Message.request('asset-db', 'save-asset-meta', objMeta.uuid, JSON.stringify(objMeta));
                await Editor.Message.request('asset-db', 'refresh-asset', jsUrl);
            }
        }

        // Save DTS file
        fs.writeFileSync(dtsPath, _dts, 'utf8');
        await Editor.Message.request('asset-db', 'refresh-asset', dtsUrl);

        console.log(`[${pkg.name}] Successfully generated plugin files inside extension at: ${jsUrl}`);
    } catch (e) {
        console.error(`[${pkg.name}] Failed to write plugin assets inside extension:`, e);
    }
}

function _asset_db_notify(uuid: string, event: AssetInfo, meta: IAssetMeta) {
    uuid; meta;
    if (!__config_.always_refresh) return;

    if (event?.type === 'cc.JsonAsset' || (event?.path && event.path.toLowerCase().endsWith('.json'))) {
        _shiping();
    }
}

function _bind(what: string | string[], func: Function, add: boolean) {
    const whats = Array.isArray(what) ? what : [what];
    const method = add ? 'addBroadcastListener' : 'removeBroadcastListener';

    for (const _event of whats) {
        //@ts-ignore
        Editor.Message[method](_event, func);
    }
}

export function load() {
    _bind(['asset-db:ready', 'asset-db:asset-add', 'asset-db:asset-change', 'asset-db:asset-delete'], _asset_db_notify, true);
    _getConfig().then(() => {
        __state_.resolver();
        _shiping();
    });
}

export function unload() {
    _bind(['asset-db:ready', 'asset-db:asset-add', 'asset-db:asset-change', 'asset-db:asset-delete'], _asset_db_notify, false);
}
