const fs = require('fs');
const path = require('path');

const COLORS_JSON = path.join(__dirname, '../fintech-colors.json');
const OPTIONS_JSON = path.join(__dirname, '../fintech-options.json');
const OUTPUT_CSS = path.join(__dirname, '../tokens/tokens.css');

function resolveTokens(json) {
    const tokens = {};
    const data = json[0];
    const category = Object.keys(data)[0]; // e.g., "Colors" or "Options"
    const modes = data[category].modes;

    for (const modeName in modes) {
        tokens[modeName] = {};
        const modeData = modes[modeName];
        
        for (const key in modeData) {
            if (typeof modeData[key] === 'object' && !modeData[key].$type) {
                flattenGroup(modeData[key], key, tokens[modeName]);
            } else if (modeData[key].$type) {
                tokens[modeName][key] = modeData[key];
            }
        }
    }
    return { category, tokens };
}

function flattenGroup(group, groupPath, target) {
    for (const key in group) {
        const item = group[key];
        const newPath = groupPath ? `${groupPath}.${key}` : key;
        
        if (item && item.$type && item.$value !== undefined) {
            target[newPath] = item;
        } else if (item && typeof item === 'object') {
            flattenGroup(item, newPath, target);
        }
    }
}

function resolveReferences(tokenMap, allTokensInMode, category) {
    const resolved = {};
    for (const key in tokenMap) {
        resolved[key] = resolveSingle(tokenMap[key].$value, tokenMap, category);
    }
    return resolved;
}

function resolveSingle(value, tokenMap, category) {
    if (typeof value !== 'string') return value;
    
    const re = /\{([^}]+)\}/g;
    return value.replace(re, (match, fullPath) => {
        if (tokenMap[fullPath]) {
            return resolveSingle(tokenMap[fullPath].$value, tokenMap, category);
        }
        
        const parts = fullPath.split('.');
        if (parts[0] === category) {
            const subPath = parts.slice(1).join('.');
            if (tokenMap[subPath]) {
                return resolveSingle(tokenMap[subPath].$value, tokenMap, category);
            }
            const subSubPath = parts.slice(2).join('.');
            if (tokenMap[subSubPath]) {
                return resolveSingle(tokenMap[subSubPath].$value, tokenMap, category);
            }
        }
        return match;
    });
}

function toKebabCase(pathStr, category) {
    const parts = pathStr.split('.');
    const cleanParts = [];

    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];
        
        if (i === 0 && (part === category || part === 'Colors' || part === 'Options')) continue;

        if (cleanParts.length > 0) {
            const prevPart = cleanParts[cleanParts.length - 1].replace(/-/g, '').toLowerCase();
            const currentPartLower = part.toLowerCase();
            
            if (currentPartLower.startsWith(prevPart)) {
                part = part.substring(prevPart.length);
            }
        }

        const kebabPart = part
            .replace(/([a-z])([A-Z0-9])/g, "$1-$2")
            .replace(/[\s_]+/g, "-")
            .toLowerCase()
            .replace(/^-+|-+$/g, '');
        
        if (kebabPart) {
            cleanParts.push(kebabPart);
        }
    }

    return cleanParts.join('-');
}

const WEIGHT_MAP = {
    'thin': '100',
    'extralight': '200',
    'light': '300',
    'regular': '400',
    'medium': '500',
    'semibold': '600',
    'bold': '700',
    'extrabold': '800',
    'black': '900'
};

function formatValue(value, key) {
    const keyLower = key.toLowerCase();
    
    // Handle Font Weight Mapping
    if (keyLower.includes('weight')) {
        const valLower = String(value).toLowerCase().replace(/[\s-]/g, '');
        if (WEIGHT_MAP[valLower]) {
            return WEIGHT_MAP[valLower];
        }
        return value;
    }

    // Handle Opacity (convert 0-100 to 0-1)
    if (keyLower.includes('opacity')) {
        const num = parseFloat(value);
        if (!isNaN(num) && num > 1) {
            return (num / 100).toString();
        }
        return value;
    }

    // Handle dimensions (add px if numeric and not unitless)
    if (typeof value === 'number' && 
        !keyLower.includes('z-index') &&
        !keyLower.includes('opacity')) {
        return `${value}px`;
    }

    return value;
}

function generateCSS() {
    const colorsData = JSON.parse(fs.readFileSync(COLORS_JSON, 'utf8'));
    const optionsData = JSON.parse(fs.readFileSync(OPTIONS_JSON, 'utf8'));

    const { category: colorCat, tokens: colorTokens } = resolveTokens(colorsData);
    const { category: optionCat, tokens: optionTokens } = resolveTokens(optionsData);

    const lightColors = resolveReferences(colorTokens.Light, colorTokens.Light, colorCat);
    const darkColors = resolveReferences(colorTokens.Dark, colorTokens.Dark, colorCat);
    const defaultOptions = resolveReferences(optionTokens.Default, optionTokens.Default, optionCat);

    let css = `/* =============================================
   Fintech UI Kit – Complete Design Tokens
   Generated from fintech-options.json + fintech-colors.json
   ============================================= */

:root {
    /* ============== OPTIONS ============== */
`;

    for (const key in defaultOptions) {
        const value = defaultOptions[key];
        const cssVar = `--${toKebabCase(key, optionCat)}`;
        css += `    ${cssVar}: ${formatValue(value, cssVar)};\n`;
    }

    css += `\n    /* ============== LIGHT MODE COLORS ============== */\n`;
    for (const key in lightColors) {
        const value = lightColors[key];
        const cssVar = `--color-${toKebabCase(key, colorCat)}`;
        css += `    ${cssVar}: ${formatValue(value, cssVar)};\n`;
    }

    css += `}\n\n/* ============== DARK MODE COLORS ============== */\n.dark {\n`;
    for (const key in darkColors) {
        const value = darkColors[key];
        const cssVar = `--color-${toKebabCase(key, colorCat)}`;
        css += `    ${cssVar}: ${formatValue(value, cssVar)};\n`;
    }
    css += `}\n`;

    fs.mkdirSync(path.dirname(OUTPUT_CSS), { recursive: true });
    fs.writeFileSync(OUTPUT_CSS, css);
    console.log(`✅ Successfully generated ${OUTPUT_CSS}`);
}

generateCSS();
