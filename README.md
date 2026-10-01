# `pts-language` - Multi-Language Localization Engine

> **Author**: pTSern  
> **Version**: `1.0.0`  
> **Cocos Creator Compatibility**: `>= 3.8.0`  
> **Category**: Internationalization (i18n) & Typography

---

## 1. Overview

`pts-language` is an end-to-end localization and typography management system for Cocos Creator. It automates the extraction, synchronization, and type-generation of multi-language translation dictionaries, while providing runtime components that dynamically update UI labels, rich text, and TTF font assets when the active language changes.

---

## 2. Process Architecture & Topology

```
┌─────────────────────────────────────────────────────────────┐
│                 Editor Panel & Main Process                 │
│                                                             │
│  ┌──────────────────────┐         ┌──────────────────────┐  │
│  │ Localization Panel   │         │ Dictionary Scanner   │  │
│  │ (source/panel.ts)    │         │ (source/main.ts)     │  │
│  └──────────┬───────────┘         └──────────┬───────────┘  │
│             │                                │              │
│             ▼                                ▼              │
│  ┌──────────────────────┐         ┌──────────────────────┐  │
│  │ Project Preferences  │         │ Plugin Auto-Gen      │  │
│  │ (profile.project)    │         │ (_$plugins/pts_lang) │  │
│  └──────────────────────┘         └──────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Runtime Pipeline                       │
│                                                             │
│  ┌──────────────────────┐         ┌──────────────────────┐  │
│  │ Language.Manager     │◄────────┤ pTS.languages.ELang  │  │
│  │ (Singleton instance) │         │ Strongly-typed keys  │  │
│  └──────────┬───────────┘         └──────────────────────┘  │
│             │                                               │
│             ├───────────────────────┬──────────────────────┐│
│             ▼                       ▼                      ▼│
│  ┌──────────────────────┐┌──────────────────────┐┌─────────┴────────┐
│  │ Language.LangKey     ││ Language.SmartRich   ││ Config.GlobalTTF │
│  │ (Reactive UI.Label)  ││ (Formatted BBCode)   ││ (Font Swapper)   │
│  └──────────────────────┘└──────────────────────┘└──────────────────┘
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Core Features & Subsystems

### 3.1. Automatic Type Generation (`_$plugins/pts_language.d.ts`)
* Scans translation JSON files configured under `located_json`.
* Parses all language codes and translation keys.
* Automatically generates global TypeScript declarations:
  ```typescript
  namespace pTS.languages {
      export enum ELang {
          EN = "EN",
          ZH = "ZH",
          JA = "JA",
          VI = "VI"
      }
      export enum EKey {
          BTN_PLAY = "BTN_PLAY",
          TITLE_VICTORY = "TITLE_VICTORY",
          SHOP_BUY_GOLD = "SHOP_BUY_GOLD"
      }
  }
  ```
* Provides zero-cost compile-time autocompletion and prevents typos in translation keys!

---

### 3.2. Runtime Language Manager (`Language.Manager.ts`)
* Singleton controller managing the active language and dictionary mapping.
* Dispatches `onCountryChanged` events via `pDriver` when the user switches languages.
* Exposes utility methods for manual string retrieval:
  ```typescript
  import { Language_Manager } from 'db://pts-language/scripts/Components/Language.Manager';

  const localizedText = Language_Manager.instance.get(pTS.languages.EKey.BTN_PLAY);
  ```

---

### 3.3. UI Binding Components

* **`Language.LangKey` (`Language.LangKey.ts`)**:
  * Attached directly to nodes with a `cc.Label` component.
  * Select the `EKey` from the Inspector dropdown.
  * Automatically reacts to language switch events and updates the displayed text immediately.
* **`Language.SmartKey` (`Language.SmartKey.ts`)**:
  * Supports runtime parameter interpolation (e.g. `"Level {0}: {1}"` -> `"Level 5: Forest"`).
* **`Language.SmartRichText` (`Language.SmartRichText.ts`)**:
  * Formatted multi-color text localization supporting BBCode tags (`<color=#ff0000>...</color>`) and language-aware tag substitution.

---

### 3.4. Dynamic Typography & Font Management (`Config.GlobalTTF.ts`)
Different languages require different typography (e.g. CJK fonts for Chinese/Japanese, custom Latin fonts for English, specific glyph fonts for Arabic/Thai):
* **`Config.GlobalTTF`**: Component monitoring language transitions and dynamically re-assigning the active `cc.TTFFont` on registered labels.
* **`pTSAsset.TTFConfig`**: ScriptableObject asset pairing language enums (`ELang`) with target `TTFFont` assets.

---

## 4. Editor Panel & Workflow

1. Open **Extension -> pTS Language -> Open Panel**.
2. Configure **Localization JSON Path** (location of your translation files).
3. Toggle **Always Refresh** if you want the extension to watch files on disk.
4. Click **Force Generate** to re-index all keys and refresh TypeScript typing definitions.

---

## 5. Integration with `pts-core`

* Built upon `pDriver` for pub/sub language change notifications.
* Utilizes `pClass.singleton` and `pClass.editor_ccclass` for clean architecture.
* Font configuration utilizes `pTSAsset` for data serialization.
