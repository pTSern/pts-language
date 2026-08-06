import { pLazy } from "db://pts-core/scripts/utils";

export enum Enums_EFontType {
    Regular = "regular",
    Bold = "bold",
    Italic = "italic",
    Light = "light",
    Medium = "medium",
    Thin = "thin",
}

export enum Enums_EFontExtra {
    None = "none",
    Outline = "outline",
    Extra = "extra",
    ExtraOutline = "extra_outline",
}

pLazy.enums(Enums_EFontType, Enums_EFontExtra);
