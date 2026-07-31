import pkg from '../package.json';
import path from 'path';
import fs from 'fs';

export const template = `
<div class="panel-container">
    <div class="top-controls">
        <ui-prop>
            <ui-label slot="label" tooltip="Folder containing .json language files">JSON Folder</ui-label>
            <ui-file slot="content" class="json-folder" type="directory" protocols="project"></ui-file>
        </ui-prop>
        <ui-prop>
            <ui-label slot="label">Always Refresh</ui-label>
            <ui-checkbox slot="content" class="always-refresh"></ui-checkbox>
        </ui-prop>

        <div class="actions-row">
            <ui-button class="add-btn" type="primary">Add Key</ui-button>
            <ui-button class="add-lang-btn" type="info">Add Lang</ui-button>
            <ui-button class="remove-toggle-btn" type="warning">Remove Mode</ui-button>
            <ui-button class="refresh-btn" type="secondary">Refresh Data</ui-button>
            <ui-button class="save-btn" type="success">Save All Changes</ui-button>
        </div>

        <div class="add-key-container hidden">
            <ui-input class="new-key-input" placeholder="Type new key name..." show-clear></ui-input>
            <ui-button class="confirm-add-btn" type="primary">Confirm</ui-button>
            <ui-button class="cancel-add-btn">Cancel</ui-button>
        </div>

        <div class="add-lang-container hidden">
            <ui-input class="new-lang-input" placeholder="Type new language code (e.g. fr, ja)..." show-clear></ui-input>
            <ui-button class="confirm-add-lang-btn" type="primary">Confirm</ui-button>
            <ui-button class="cancel-add-lang-btn">Cancel</ui-button>
        </div>

        <div class="remove-bar-container hidden">
            <span class="remove-count-label">0 keys selected to remove</span>
            <ui-button class="confirm-remove-btn" type="danger">Confirm Remove</ui-button>
            <ui-button class="cancel-remove-btn">Cancel</ui-button>
        </div>
    </div>

    <div class="search-bar-container">
        <ui-input class="search-input" placeholder="Filter keys..." show-clear></ui-input>
    </div>

    <div class="content-header">
        <span class="keys-count">0 Keys loaded</span>
    </div>

    <div class="keys-list-container">
        <!-- Rendered key items -->
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
    font-family: sans-serif;
}
.panel-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 10px;
}
.top-controls {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--color-normal-border, #444);
}
.actions-row {
    display: flex;
    gap: 10px;
    margin-top: 4px;
}
.add-key-container, .add-lang-container {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 6px;
    padding: 6px 8px;
    background: var(--color-normal-fill, #252525);
    border: 1px dashed var(--color-normal-border, #444);
    border-radius: 4px;
}
.add-key-container.hidden, .add-lang-container.hidden {
    display: none;
}
.remove-bar-container {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 6px;
    padding: 6px 10px;
    background: var(--color-danger-fill, #4d1515);
    border: 1px solid var(--color-danger-border, #a61c1c);
    border-radius: 4px;
}
.remove-bar-container.hidden {
    display: none;
}
.remove-count-label {
    flex: 1;
    font-size: 12px;
    font-weight: bold;
    color: #ffccc7;
}
.new-key-input, .new-lang-input {
    flex: 1;
}
.search-bar-container {
    width: 100%;
}
.search-input {
    width: 100%;
}
.content-header {
    font-size: 12px;
    opacity: 0.8;
    padding: 0 4px;
}
.keys-list-container {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-right: 4px;
}
.key-card {
    background: var(--color-normal-fill, #2a2a2a);
    border: 1px solid var(--color-normal-border, #3a3a3a);
    border-radius: 4px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.key-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
}
.remove-checkbox {
    margin-right: 2px;
}
.key-title {
    font-weight: bold;
    color: var(--color-normal-text, #40a9ff);
    font-size: 13px;
    word-break: break-all;
}
.lang-rows-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.lang-row {
    display: flex;
    align-items: center;
    gap: 8px;
}
.lang-label {
    width: 40px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    opacity: 0.85;
}
.lang-input {
    flex: 1;
}
`;

export const $ = {
    jsonFolder: '.json-folder',
    alwaysRefresh: '.always-refresh',
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
    keysList: '.keys-list-container',
};

let activePanel: any = null;
let currentData: Record<string, Record<string, { value: string; isArray: boolean }>> = {};
let currentLangs: string[] = [];
let currentFilter: string = '';

let isRemoveMode: boolean = false;
let keysToRemove: Set<string> = new Set<string>();

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
        thisAny.$.removeCountLabel.textContent = `${keysToRemove.size} key(s) selected to remove`;
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
        thisAny.$.keysCount.textContent = `${filteredKeys.length} / ${allKeys.length} Keys loaded (${currentLangs.length} languages)`;
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

        const title = document.createElement('div');
        title.className = 'key-title';
        title.textContent = key;
        titleRow.appendChild(title);

        card.appendChild(titleRow);

        const rowsContainer = document.createElement('div');
        rowsContainer.className = 'lang-rows-container';

        for (const lang of currentLangs) {
            const row = document.createElement('div');
            row.className = 'lang-row';

            const label = document.createElement('span');
            label.className = 'lang-label';
            label.textContent = lang + ':';

            const input = document.createElement('ui-input') as any;
            input.className = 'lang-input';
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
        notice.style.fontSize = '12px';
        notice.style.opacity = '0.7';
        notice.style.padding = '8px';
        notice.style.textAlign = 'center';
        notice.textContent = `Showing first ${renderLimit} of ${filteredKeys.length} keys. Filter to view specific keys.`;
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
    }
}

async function saveAllDataToDisk(thisAny: any) {
    const profile = await Editor.Profile.getProject(pkg.name) as any || {};
    const jsonFolder = profile.located_json || '';
    const physicDir = getPhysicPath(jsonFolder);

    if (!physicDir || !fs.existsSync(physicDir)) {
        console.warn(`[${pkg.name}] Cannot save data. JSON directory invalid: ${physicDir}`);
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
}

async function syncProfileValues(thisAny: any) {
    const profile = await Editor.Profile.getProject(pkg.name) as any || {};

    if (thisAny.$.jsonFolder) thisAny.$.jsonFolder.value = profile.located_json ?? '';
    if (thisAny.$.alwaysRefresh) thisAny.$.alwaysRefresh.value = profile.always_refresh ?? true;

    await loadDataFromDisk(profile.located_json || '');
    renderKeysList(thisAny);
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
        await loadDataFromDisk(val);
        renderKeysList(this);
    });

    this.$.alwaysRefresh?.addEventListener('change', () => {
        updateProfile('always_refresh', this.$.alwaysRefresh.value, 'profile::project::changed_refresh');
    });

    // Add Key UI Handlers
    this.$.addBtn?.addEventListener('click', () => {
        this.$.addKeyContainer?.classList.remove('hidden');
        this.$.addLangContainer?.classList.add('hidden');
        if (this.$.newKeyInput) {
            this.$.newKeyInput.value = '';
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
        } else {
            this.$.removeBarContainer?.classList.add('hidden');
            if (this.$.removeToggleBtn) this.$.removeToggleBtn.textContent = 'Remove Mode';
            keysToRemove.clear();
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
    });

    this.$.confirmRemoveBtn?.addEventListener('click', async () => {
        if (keysToRemove.size === 0) return;

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
        await Editor.Message.send(pkg.name, 'force-generate');
    });

    this.$.refreshBtn?.addEventListener('click', async () => {
        const val = this.$.jsonFolder?.value || '';
        await loadDataFromDisk(val);
        renderKeysList(this);
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
