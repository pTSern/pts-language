import pkg from '../package.json';
import path from 'path';
import fs from 'fs';

export const template = `
<div class="panel-container">
    <!-- Header -->
    <div class="header-section">
        <div class="header-main">
            <div class="title-row">
                <span class="header-badge">pTS</span>
                <span class="header-title">Language Manager</span>
            </div>
            <div class="header-desc">Manage multi-language localization assets & real-time synchronization</div>
        </div>
    </div>

    <!-- Top Settings Card -->
    <div class="settings-card">
        <div class="setting-item">
            <span class="setting-label" title="Folder containing .json language files">JSON Folder</span>
            <ui-file class="json-folder" type="directory" protocols="project"></ui-file>
        </div>
        <div class="settings-switches">
            <div class="switch-item" title="Auto-regenerate when JSON files change in AssetDB">
                <ui-checkbox class="always-refresh"></ui-checkbox>
                <span class="switch-label">Always Refresh</span>
            </div>
            <div class="switch-item" title="Enable lazy loading for language JSON files (disabled when located_json is 'bundle')">
                <ui-checkbox class="is-lazy-load"></ui-checkbox>
                <span class="switch-label">Lazy Load</span>
            </div>
        </div>
    </div>

    <!-- Actions Row -->
    <div class="actions-card">
        <div class="actions-row">
            <ui-button class="add-btn" type="primary">
                <span>+ Add Key</span>
            </ui-button>
            <ui-button class="add-lang-btn" type="info">
                <span>+ Add Lang</span>
            </ui-button>
            <ui-button class="remove-toggle-btn" type="warning">
                <span>Remove Mode</span>
            </ui-button>
            <ui-button class="refresh-btn" type="secondary">
                <span>Refresh</span>
            </ui-button>
            <ui-button class="save-btn" type="success">
                <span>Save All</span>
            </ui-button>
        </div>

        <!-- Add Key Popdown -->
        <div class="popdown-card add-key-container hidden">
            <div class="popdown-header">
                <span class="popdown-title">Add New Translation Key</span>
            </div>
            <div class="popdown-body">
                <ui-input class="new-key-input" placeholder="Enter key identifier (e.g. title_screen_play)..." show-clear></ui-input>
                <div class="popdown-actions">
                    <ui-button class="confirm-add-btn" type="primary">Confirm</ui-button>
                    <ui-button class="cancel-add-btn">Cancel</ui-button>
                </div>
            </div>
        </div>

        <!-- Add Lang Popdown -->
        <div class="popdown-card add-lang-container hidden">
            <div class="popdown-header">
                <span class="popdown-title">Add New Language</span>
            </div>
            <div class="popdown-body">
                <ui-input class="new-lang-input" placeholder="Enter language code (e.g. fr, ja, ko, de)..." show-clear></ui-input>
                <div class="popdown-actions">
                    <ui-button class="confirm-add-lang-btn" type="primary">Confirm</ui-button>
                    <ui-button class="cancel-add-lang-btn">Cancel</ui-button>
                </div>
            </div>
        </div>

        <!-- Remove Mode Bar -->
        <div class="remove-bar-card remove-bar-container hidden">
            <div class="remove-bar-info">
                <span class="remove-warning-icon">&#9888;</span>
                <span class="remove-count-label">0 keys selected</span>
            </div>
            <div class="remove-bar-actions">
                <ui-button class="confirm-remove-btn" type="danger">Delete Selected</ui-button>
                <ui-button class="cancel-remove-btn">Cancel</ui-button>
            </div>
        </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="filter-section">
        <div class="search-box">
            <ui-input class="search-input" placeholder="Search by key name or filter..." show-clear></ui-input>
        </div>
        <div class="stats-pills">
            <span class="pill pill-keys keys-count">0 Keys</span>
            <span class="pill pill-langs langs-count">0 Langs</span>
        </div>
    </div>

    <!-- Keys List Container -->
    <div class="keys-list-container">
        <!-- Rendered key items -->
    </div>

    <!-- Bottom Status Bar -->
    <div class="bottom-status-bar">
        <span class="status-indicator"></span>
        <span class="status-message">Ready</span>
    </div>
</div>
`;

export const style = `
:host {
    display: flex;
    flex-direction: column;
    padding: 12px;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: var(--color-normal-text, #e0e0e0);
    background: var(--color-normal-contrast, #1e1e1e);
}

.panel-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 10px;
    overflow: hidden;
}

/* Header */
.header-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: linear-gradient(135deg, rgba(24, 144, 255, 0.12) 0%, rgba(19, 194, 194, 0.06) 100%);
    border: 1px solid rgba(24, 144, 255, 0.25);
    border-radius: 8px;
}

.title-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.header-badge {
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    color: #fff;
    font-weight: 800;
    font-size: 11px;
    padding: 2px 7px;
    border-radius: 4px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

.header-title {
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.3px;
}

.header-desc {
    font-size: 11px;
    opacity: 0.7;
    margin-top: 2px;
}

/* Settings Card */
.settings-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px 12px;
    background: var(--color-normal-fill, #262626);
    border: 1px solid var(--color-normal-border, #3a3a3a);
    border-radius: 6px;
}

.setting-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
}

.setting-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-normal-text, #ddd);
    white-space: nowrap;
    min-width: 85px;
    flex-shrink: 0;
}

.json-folder {
    flex: 1;
    min-width: 0;
}

.settings-switches {
    display: flex;
    align-items: center;
    gap: 28px;
    margin-top: 2px;
    padding-top: 8px;
    border-top: 1px dashed rgba(255, 255, 255, 0.08);
}

.switch-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
}

.switch-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-normal-text, #ccc);
    white-space: nowrap;
}

.switch-item:hover .switch-label {
    color: #fff;
}

/* Actions Card */
.actions-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.actions-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.actions-row ui-button {
    flex: 1;
    min-width: 90px;
    font-weight: 600;
}

/* Popdowns */
.popdown-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: fadeIn 0.15s ease-out;
}

.add-key-container {
    background: #1a2733;
    border: 1px solid #1890ff;
}

.add-lang-container {
    background: #162d2d;
    border: 1px solid #13c2c8;
}

.popdown-header {
    display: flex;
    align-items: center;
}

.popdown-title {
    font-size: 12px;
    font-weight: 700;
    color: #69c0ff;
}

.add-lang-container .popdown-title {
    color: #5cdbd3;
}

.popdown-body {
    display: flex;
    gap: 8px;
}

.popdown-body ui-input {
    flex: 1;
}

.popdown-actions {
    display: flex;
    gap: 6px;
}

.popdown-card.hidden {
    display: none !important;
}

/* Remove Bar */
.remove-bar-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: linear-gradient(135deg, #431418 0%, #2a1215 100%);
    border: 1px solid #ff4d4f;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(255, 77, 79, 0.2);
}

.remove-bar-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.remove-warning-icon {
    color: #ff7875;
    font-size: 16px;
}

.remove-count-label {
    font-size: 12px;
    font-weight: 700;
    color: #ffa39e;
}

.remove-bar-actions {
    display: flex;
    gap: 8px;
}

.remove-bar-card.hidden {
    display: none !important;
}

/* Filter Section */
.filter-section {
    display: flex;
    align-items: center;
    gap: 10px;
}

.search-box {
    flex: 1;
}

.search-input {
    width: 100%;
}

.stats-pills {
    display: flex;
    gap: 6px;
}

.pill {
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.3px;
    white-space: nowrap;
}

.pill-keys {
    background: rgba(24, 144, 255, 0.15);
    color: #40a9ff;
    border: 1px solid rgba(24, 144, 255, 0.3);
}

.pill-langs {
    background: rgba(82, 196, 26, 0.15);
    color: #73d13d;
    border: 1px solid rgba(82, 196, 26, 0.3);
}

/* Keys List */
.keys-list-container {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-right: 4px;
}

.keys-list-container::-webkit-scrollbar {
    width: 6px;
}

.keys-list-container::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
}

.keys-list-container::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
}

/* Key Card */
.key-card {
    background: linear-gradient(180deg, #2c2c2c 0%, #252525 100%);
    border: 1px solid var(--color-normal-border, #3c3c3c);
    border-radius: 6px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.key-card:hover {
    border-color: rgba(64, 169, 255, 0.45);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.key-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.remove-checkbox {
    margin-right: 2px;
}

.key-badge {
    background: rgba(64, 169, 255, 0.12);
    color: #40a9ff;
    border: 1px solid rgba(64, 169, 255, 0.3);
    border-radius: 4px;
    padding: 2px 8px;
    font-family: Consolas, Monaco, "Courier New", monospace;
    font-weight: 700;
    font-size: 12px;
    word-break: break-all;
}

.lang-rows-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 6px 12px;
}

.lang-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.lang-tag {
    min-width: 36px;
    text-align: center;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Dynamic Language Colors */
.lang-tag-en { background: rgba(24, 144, 255, 0.2); color: #69c0ff; border: 1px solid rgba(24, 144, 255, 0.4); }
.lang-tag-vi { background: rgba(82, 196, 26, 0.2); color: #95de64; border: 1px solid rgba(82, 196, 26, 0.4); }
.lang-tag-zh { background: rgba(250, 140, 22, 0.2); color: #ffc069; border: 1px solid rgba(250, 140, 22, 0.4); }
.lang-tag-ja, .lang-tag-jp { background: rgba(235, 47, 150, 0.2); color: #ff85c0; border: 1px solid rgba(235, 47, 150, 0.4); }
.lang-tag-ko, .lang-tag-kr { background: rgba(114, 46, 209, 0.2); color: #b37feb; border: 1px solid rgba(114, 46, 209, 0.4); }
.lang-tag-fr { background: rgba(19, 194, 194, 0.2); color: #5cdbd3; border: 1px solid rgba(19, 194, 194, 0.4); }
.lang-tag-de, .lang-tag-ge { background: rgba(250, 219, 20, 0.2); color: #fff566; border: 1px solid rgba(250, 219, 20, 0.4); }
.lang-tag-default { background: rgba(255, 255, 255, 0.1); color: #d9d9d9; border: 1px solid rgba(255, 255, 255, 0.2); }

.lang-input {
    flex: 1;
}

.empty-notice {
    padding: 30px 10px;
    text-align: center;
    color: rgba(255, 255, 255, 0.4);
    font-size: 13px;
}

.more-notice {
    font-size: 12px;
    opacity: 0.7;
    padding: 8px;
    text-align: center;
}

/* Status Bar */
.bottom-status-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: var(--color-normal-fill, #202020);
    border: 1px solid var(--color-normal-border, #333);
    border-radius: 4px;
    font-size: 11px;
}

.status-indicator {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #52c41a;
}

.status-message {
    opacity: 0.85;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
}
`;

export const $ = {
    jsonFolder: '.json-folder',
    alwaysRefresh: '.always-refresh',
    isLazyLoad: '.is-lazy-load',
    addBtn: '.add-btn',
    addKeyContainer: '.add-key-container',
    newKeyInput: '.new-key-input',
    confirmAddBtn: '.confirm-add-btn',
    cancelAddBtn: '.cancel-add-btn',
    addLangBtn: '.add-lang-btn',
    addLangContainer: '.add-lang-container',
    newLangInput: '.new-lang-input',
    confirmAddLangBtn: '.confirm-add-lang-btn',
    cancelAddLangBtn: '.cancel-add-lang-btn',
    removeToggleBtn: '.remove-toggle-btn',
    removeBarContainer: '.remove-bar-container',
    removeCountLabel: '.remove-count-label',
    confirmRemoveBtn: '.confirm-remove-btn',
    cancelRemoveBtn: '.cancel-remove-btn',
    refreshBtn: '.refresh-btn',
    saveBtn: '.save-btn',
    searchInput: '.search-input',
    keysCount: '.keys-count',
    langsCount: '.langs-count',
    keysList: '.keys-list-container',
    statusIndicator: '.status-indicator',
    statusMessage: '.status-message',
};

let activePanel: any = null;
let currentData: Record<string, Record<string, { value: string; isArray: boolean }>> = {};
let currentLangs: string[] = [];
let currentFilter: string = '';

let isRemoveMode: boolean = false;
let keysToRemove: Set<string> = new Set<string>();

function getLangTagClass(lang: string): string {
    const l = lang.toLowerCase();
    if (['en', 'vi', 'zh', 'ja', 'jp', 'ko', 'kr', 'fr', 'de', 'ge'].includes(l)) {
        return `lang-tag-${l}`;
    }
    return 'lang-tag-default';
}

function setStatus(thisAny: any, msg: string, isError: boolean = false) {
    if (thisAny.$.statusMessage) {
        thisAny.$.statusMessage.textContent = msg;
    }
    if (thisAny.$.statusIndicator) {
        thisAny.$.statusIndicator.style.background = isError ? '#ff4d4f' : '#52c41a';
    }
}

function getPhysicPath(rawPath: string): string | null {
    if (!rawPath) return null;
    const norm = rawPath.replace(/\\/g, '/');
    let relPath = '';

    if (norm.startsWith('project://assets')) {
        relPath = norm.substring('project://assets'.length);
    } else if (norm.startsWith('db://assets')) {
        relPath = norm.substring('db://assets'.length);
    } else if (norm.startsWith('project://')) {
        const rel = norm.substring('project://'.length);
        relPath = rel.startsWith('assets') ? rel.substring('assets'.length) : rel;
    } else if (path.isAbsolute(rawPath)) {
        const projectAssets = path.join(Editor.Project.path, 'assets').replace(/\\/g, '/');
        const absNorm = path.resolve(rawPath).replace(/\\/g, '/');
        if (absNorm.startsWith(projectAssets)) {
            relPath = absNorm.substring(projectAssets.length);
        } else {
            return null;
        }
    } else {
        relPath = norm.startsWith('/') ? norm : '/' + norm;
    }

    return path.join(Editor.Project.path, 'assets', relPath);
}

async function loadDataFromDisk(jsonFolder: string) {
    currentData = Object.create(null);
    currentLangs = [];

    const physicDir = getPhysicPath(jsonFolder);
    if (!physicDir || !fs.existsSync(physicDir)) {
        return;
    }

    try {
        const files = fs.readdirSync(physicDir);
        const jsonFiles = files.filter(f => f.toLowerCase().endsWith('.json'));

        currentLangs = jsonFiles.map(f => path.basename(f, '.json'));

        for (const file of jsonFiles) {
            const lang = path.basename(file, '.json');
            const fullPath = path.join(physicDir, file);

            try {
                const raw = fs.readFileSync(fullPath, 'utf8');
                const content = JSON.parse(raw);

                if (content && typeof content === 'object' && !Array.isArray(content)) {
                    for (const key of Object.keys(content)) {
                        const val = content[key];
                        const isString = typeof val === 'string';
                        const isStringArray = Array.isArray(val) && val.every((item: any) => typeof item === 'string');

                        if (isString || isStringArray) {
                            currentData[key] = currentData[key] || Object.create(null);
                            const strVal = isStringArray ? (val as string[]).join(', ') : (val as string);
                            currentData[key][lang] = {
                                value: strVal,
                                isArray: isStringArray
                            };
                        }
                    }
                }
            } catch (e) {
                console.error(`[${pkg.name}] Error loading file: ${file}`, e);
            }
        }
    } catch (e) {
        console.error(`[${pkg.name}] Error reading directory: ${physicDir}`, e);
    }
}

function updateRemoveBarCount(thisAny: any) {
    if (thisAny.$.removeCountLabel) {
        thisAny.$.removeCountLabel.textContent = `${keysToRemove.size} key(s) selected`;
    }
}

function renderKeysList(thisAny: any) {
    const container = thisAny.$.keysList;
    if (!container) return;

    container.innerHTML = '';

    const allKeys = Object.keys(currentData);
    const filterLower = currentFilter.trim().toLowerCase();
    const filteredKeys = filterLower
        ? allKeys.filter(k => k.toLowerCase().includes(filterLower))
        : allKeys;

    if (thisAny.$.keysCount) {
        thisAny.$.keysCount.textContent = `${filteredKeys.length} / ${allKeys.length} Keys`;
    }
    if (thisAny.$.langsCount) {
        thisAny.$.langsCount.textContent = `${currentLangs.length} Langs`;
    }

    if (filteredKeys.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-notice';
        empty.textContent = allKeys.length === 0 ? 'No language data found. Set JSON Folder or click "+ Add Key".' : 'No keys match the search filter.';
        container.appendChild(empty);
        return;
    }

    // Limit initial rendered items for performance
    const renderLimit = 150;
    const keysToRender = filteredKeys.slice(0, renderLimit);

    const fragment = document.createDocumentFragment();

    for (const key of keysToRender) {
        const card = document.createElement('div');
        card.className = 'key-card';

        const titleRow = document.createElement('div');
        titleRow.className = 'key-title-row';

        if (isRemoveMode) {
            const checkbox = document.createElement('ui-checkbox') as any;
            checkbox.className = 'remove-checkbox';
            checkbox.value = keysToRemove.has(key);
            checkbox.addEventListener('change', () => {
                if (checkbox.value) {
                    keysToRemove.add(key);
                } else {
                    keysToRemove.delete(key);
                }
                updateRemoveBarCount(thisAny);
            });
            titleRow.appendChild(checkbox);
        }

        const badge = document.createElement('span');
        badge.className = 'key-badge';
        badge.textContent = key;
        titleRow.appendChild(badge);

        card.appendChild(titleRow);

        const rowsContainer = document.createElement('div');
        rowsContainer.className = 'lang-rows-container';

        for (const lang of currentLangs) {
            const row = document.createElement('div');
            row.className = 'lang-row';

            const label = document.createElement('span');
            label.className = `lang-tag ${getLangTagClass(lang)}`;
            label.textContent = lang;

            const input = document.createElement('ui-input') as any;
            input.className = 'lang-input';
            input.placeholder = `[${lang.toUpperCase()}]`;
            const cellData = currentData[key]?.[lang];
            input.value = cellData?.value || '';
            input.setAttribute('data-key', key);
            input.setAttribute('data-lang', lang);

            input.addEventListener('confirm', () => onFieldChange(thisAny, key, lang, input.value));
            input.addEventListener('change', () => onFieldChange(thisAny, key, lang, input.value));

            row.appendChild(label);
            row.appendChild(input);
            rowsContainer.appendChild(row);
        }

        card.appendChild(rowsContainer);
        fragment.appendChild(card);
    }

    if (filteredKeys.length > renderLimit) {
        const notice = document.createElement('div');
        notice.className = 'more-notice';
        notice.textContent = `Showing first ${renderLimit} of ${filteredKeys.length} keys. Filter above to view specific keys.`;
        fragment.appendChild(notice);
    }

    container.appendChild(fragment);
}

function onFieldChange(thisAny: any, key: string, lang: string, newValue: string) {
    currentData[key] = currentData[key] || Object.create(null);
    const existing = currentData[key][lang];
    const isArray = existing ? existing.isArray : false;

    currentData[key][lang] = {
        value: newValue,
        isArray
    };

    if (thisAny.$.alwaysRefresh?.value) {
        saveAllDataToDisk(thisAny);
    } else {
        setStatus(thisAny, `Modified "${key}" (${lang})`);
    }
}

async function saveAllDataToDisk(thisAny: any) {
    const profile = await Editor.Profile.getProject(pkg.name) as any || {};
    const jsonFolder = profile.located_json || '';
    const physicDir = getPhysicPath(jsonFolder);

    if (!physicDir || !fs.existsSync(physicDir)) {
        console.warn(`[${pkg.name}] Cannot save data. JSON directory invalid: ${physicDir}`);
        setStatus(thisAny, 'Cannot save: Invalid JSON directory', true);
        return;
    }

    for (const lang of currentLangs) {
        const fullPath = path.join(physicDir, `${lang}.json`);
        let fileContent: Record<string, any> = {};

        try {
            if (fs.existsSync(fullPath)) {
                const raw = fs.readFileSync(fullPath, 'utf8');
                fileContent = JSON.parse(raw) || {};
            }
        } catch (e) {
            fileContent = {};
        }

        for (const key of Object.keys(currentData)) {
            const entry = currentData[key]?.[lang];
            if (entry !== undefined) {
                if (entry.isArray) {
                    fileContent[key] = entry.value.split(',').map(s => s.trim());
                } else {
                    fileContent[key] = entry.value;
                }
            }
        }

        try {
            fs.writeFileSync(fullPath, JSON.stringify(fileContent, null, 4), 'utf8');
        } catch (e) {
            console.error(`[${pkg.name}] Failed to save JSON file: ${fullPath}`, e);
        }
    }

    await Editor.Message.send(pkg.name, 'force-generate');
    const time = new Date().toLocaleTimeString();
    setStatus(thisAny, `All changes saved at ${time}`);
}

async function syncProfileValues(thisAny: any) {
    const profile = await Editor.Profile.getProject(pkg.name) as any || {};

    if (thisAny.$.jsonFolder) thisAny.$.jsonFolder.value = profile.located_json ?? '';
    if (thisAny.$.alwaysRefresh) thisAny.$.alwaysRefresh.value = profile.always_refresh ?? true;

    const isBundle = profile.located_json === 'bundle';
    if (thisAny.$.isLazyLoad) {
        if (isBundle) {
            thisAny.$.isLazyLoad.value = false;
            thisAny.$.isLazyLoad.setAttribute('disabled', 'true');
        } else {
            thisAny.$.isLazyLoad.removeAttribute('disabled');
            thisAny.$.isLazyLoad.value = profile.is_lazy_load ?? false;
        }
    }

    await loadDataFromDisk(profile.located_json || '');
    renderKeysList(thisAny);
    setStatus(thisAny, 'Data synchronized');
}

const onWindowFocus = () => {
    if (activePanel) {
        syncProfileValues(activePanel);
    }
};

export const ready = async function(this: any) {
    activePanel = this;

    await syncProfileValues(this);

    window.addEventListener('focus', onWindowFocus);

    const updateProfile = async (key: string, value: any, messageName?: string) => {
        await Editor.Profile.setProject(pkg.name, key, value);
        if (messageName) {
            await Editor.Message.send(pkg.name, messageName, key, value);
        }
    };

    this.$.jsonFolder?.addEventListener('confirm', async () => {
        const val = this.$.jsonFolder.value;
        await updateProfile('located_json', val, 'profile::project::changed_location');
        if (val === 'bundle') {
            if (this.$.isLazyLoad) {
                this.$.isLazyLoad.value = false;
                this.$.isLazyLoad.setAttribute('disabled', 'true');
            }
            await updateProfile('is_lazy_load', false, 'profile::project::changed_lazy_load');
        } else {
            this.$.isLazyLoad?.removeAttribute('disabled');
        }
        await loadDataFromDisk(val);
        renderKeysList(this);
    });

    this.$.alwaysRefresh?.addEventListener('change', () => {
        updateProfile('always_refresh', this.$.alwaysRefresh.value, 'profile::project::changed_refresh');
    });

    this.$.isLazyLoad?.addEventListener('change', async () => {
        if (this.$.jsonFolder?.value === 'bundle') {
            this.$.isLazyLoad.value = false;
            this.$.isLazyLoad.setAttribute('disabled', 'true');
            return;
        }
        await updateProfile('is_lazy_load', this.$.isLazyLoad.value, 'profile::project::changed_lazy_load');
    });

    // Add Key UI Handlers
    this.$.addBtn?.addEventListener('click', () => {
        this.$.addKeyContainer?.classList.remove('hidden');
        this.$.addLangContainer?.classList.add('hidden');
        if (this.$.newKeyInput) {
            this.$.newKeyInput.value = '';
            this.$.newKeyInput.focus();
        }
    });

    this.$.cancelAddBtn?.addEventListener('click', () => {
        this.$.addKeyContainer?.classList.add('hidden');
        if (this.$.newKeyInput) {
            this.$.newKeyInput.value = '';
        }
    });

    const performAddKey = async () => {
        const rawKey = this.$.newKeyInput?.value || '';
        const trimmedKey = rawKey.trim();
        if (!trimmedKey) return;

        if (currentData[trimmedKey]) {
            currentFilter = trimmedKey;
            if (this.$.searchInput) this.$.searchInput.value = trimmedKey;
            this.$.addKeyContainer?.classList.add('hidden');
            renderKeysList(this);
            setStatus(this, `Key "${trimmedKey}" already exists`);
            return;
        }

        currentData[trimmedKey] = Object.create(null);
        for (const lang of currentLangs) {
            currentData[trimmedKey][lang] = {
                value: '',
                isArray: false
            };
        }

        currentFilter = trimmedKey;
        if (this.$.searchInput) {
            this.$.searchInput.value = trimmedKey;
        }

        this.$.addKeyContainer?.classList.add('hidden');
        if (this.$.newKeyInput) this.$.newKeyInput.value = '';

        renderKeysList(this);
        setStatus(this, `Added key "${trimmedKey}"`);

        if (this.$.alwaysRefresh?.value) {
            await saveAllDataToDisk(this);
        }
    };

    this.$.confirmAddBtn?.addEventListener('click', performAddKey);
    this.$.newKeyInput?.addEventListener('confirm', performAddKey);

    // Add Lang UI Handlers
    this.$.addLangBtn?.addEventListener('click', () => {
        this.$.addLangContainer?.classList.remove('hidden');
        this.$.addKeyContainer?.classList.add('hidden');
        if (this.$.newLangInput) {
            this.$.newLangInput.value = '';
            this.$.newLangInput.focus();
        }
    });

    this.$.cancelAddLangBtn?.addEventListener('click', () => {
        this.$.addLangContainer?.classList.add('hidden');
        if (this.$.newLangInput) {
            this.$.newLangInput.value = '';
        }
    });

    const performAddLang = async () => {
        const rawLang = this.$.newLangInput?.value || '';
        const langCode = rawLang.trim().toLowerCase();
        if (!langCode) return;

        const profile = await Editor.Profile.getProject(pkg.name) as any || {};
        const jsonFolder = profile.located_json || '';
        const physicDir = getPhysicPath(jsonFolder);

        if (!physicDir || !fs.existsSync(physicDir)) {
            console.warn(`[${pkg.name}] Cannot add language. Invalid JSON folder: ${physicDir}`);
            setStatus(this, 'Cannot add language: Invalid JSON folder', true);
            return;
        }

        if (!currentLangs.includes(langCode)) {
            currentLangs.push(langCode);
        }

        const newLangFilePath = path.join(physicDir, `${langCode}.json`);
        const fileContent: Record<string, any> = {};

        for (const key of Object.keys(currentData)) {
            currentData[key][langCode] = currentData[key][langCode] || { value: '', isArray: false };
            fileContent[key] = currentData[key][langCode].isArray ? [] : '';
        }

        try {
            fs.writeFileSync(newLangFilePath, JSON.stringify(fileContent, null, 4), 'utf8');
        } catch (e) {
            console.error(`[${pkg.name}] Failed to write new language file: ${newLangFilePath}`, e);
        }

        this.$.addLangContainer?.classList.add('hidden');
        if (this.$.newLangInput) this.$.newLangInput.value = '';

        renderKeysList(this);
        setStatus(this, `Added language "${langCode}"`);
        await Editor.Message.send(pkg.name, 'force-generate');
    };

    this.$.confirmAddLangBtn?.addEventListener('click', performAddLang);
    this.$.newLangInput?.addEventListener('confirm', performAddLang);

    // Remove Mode UI Handlers
    this.$.removeToggleBtn?.addEventListener('click', () => {
        isRemoveMode = !isRemoveMode;
        if (isRemoveMode) {
            this.$.removeBarContainer?.classList.remove('hidden');
            if (this.$.removeToggleBtn) this.$.removeToggleBtn.textContent = 'Exit Remove';
            setStatus(this, 'Remove Mode active: Select keys to delete');
        } else {
            this.$.removeBarContainer?.classList.add('hidden');
            if (this.$.removeToggleBtn) this.$.removeToggleBtn.textContent = 'Remove Mode';
            keysToRemove.clear();
            setStatus(this, 'Ready');
        }
        updateRemoveBarCount(this);
        renderKeysList(this);
    });

    this.$.cancelRemoveBtn?.addEventListener('click', () => {
        isRemoveMode = false;
        keysToRemove.clear();
        this.$.removeBarContainer?.classList.add('hidden');
        if (this.$.removeToggleBtn) this.$.removeToggleBtn.textContent = 'Remove Mode';
        renderKeysList(this);
        setStatus(this, 'Ready');
    });

    this.$.confirmRemoveBtn?.addEventListener('click', async () => {
        if (keysToRemove.size === 0) return;

        const count = keysToRemove.size;
        const profile = await Editor.Profile.getProject(pkg.name) as any || {};
        const jsonFolder = profile.located_json || '';
        const physicDir = getPhysicPath(jsonFolder);

        for (const key of keysToRemove) {
            delete currentData[key];
        }

        if (physicDir && fs.existsSync(physicDir)) {
            for (const lang of currentLangs) {
                const fullPath = path.join(physicDir, `${lang}.json`);
                try {
                    if (fs.existsSync(fullPath)) {
                        const raw = fs.readFileSync(fullPath, 'utf8');
                        const content = JSON.parse(raw) || {};
                        for (const key of keysToRemove) {
                            delete content[key];
                        }
                        fs.writeFileSync(fullPath, JSON.stringify(content, null, 4), 'utf8');
                    }
                } catch (e) {
                    console.error(`[${pkg.name}] Error deleting keys from ${fullPath}`, e);
                }
            }
        }

        keysToRemove.clear();
        isRemoveMode = false;
        this.$.removeBarContainer?.classList.add('hidden');
        if (this.$.removeToggleBtn) this.$.removeToggleBtn.textContent = 'Remove Mode';

        renderKeysList(this);
        setStatus(this, `Deleted ${count} key(s)`);
        await Editor.Message.send(pkg.name, 'force-generate');
    });

    this.$.refreshBtn?.addEventListener('click', async () => {
        const val = this.$.jsonFolder?.value || '';
        await loadDataFromDisk(val);
        renderKeysList(this);
        setStatus(this, 'Data refreshed from disk');
        await Editor.Message.send(pkg.name, 'force-generate');
    });

    this.$.saveBtn?.addEventListener('click', async () => {
        await saveAllDataToDisk(this);
    });

    this.$.searchInput?.addEventListener('change', () => {
        currentFilter = this.$.searchInput.value || '';
        renderKeysList(this);
    });

    this.$.searchInput?.addEventListener('confirm', () => {
        currentFilter = this.$.searchInput.value || '';
        renderKeysList(this);
    });
};

export const close = function(this: any) {
    window.removeEventListener('focus', onWindowFocus);
    activePanel = null;
};
