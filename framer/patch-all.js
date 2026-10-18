// Branche un fichier de code Framer sur KorrI18n (exécuté dans l'éditeur Framer).
// Usage : await __patchI18n(expectedMarker, extra) — extra(t) applique des remplacements propres au fichier.
window.__patchI18n = async (marker, extra) => {
    for (let i = 0; i < 40 && !document.querySelector(".monaco-editor .view-lines"); i++) await new Promise((r) => setTimeout(r, 1000))
    await new Promise((r) => setTimeout(r, 2000))
    window.__ta = () => document.querySelector(".monaco-editor textarea")
    window.__focus = async () => {
        const ed = document.querySelector(".monaco-editor .view-lines")
        const r = ed.getBoundingClientRect()
        ed.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, clientX: r.x + 50, clientY: r.y + 20 }))
        ed.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, clientX: r.x + 50, clientY: r.y + 20 }))
        await new Promise((r) => setTimeout(r, 300))
        __ta().focus()
        await new Promise((r) => setTimeout(r, 300))
    }
    window.__selAll = async () => {
        const ta = __ta()
        ta.dispatchEvent(new KeyboardEvent("keydown", { key: "a", code: "KeyA", keyCode: 65, metaKey: true, bubbles: true }))
        ta.dispatchEvent(new KeyboardEvent("keydown", { key: "a", code: "KeyA", keyCode: 65, ctrlKey: true, bubbles: true }))
        await new Promise((r) => setTimeout(r, 300))
    }
    window.__read = async () => {
        await __focus()
        await __selAll()
        const dt = new DataTransfer()
        __ta().dispatchEvent(new ClipboardEvent("copy", { clipboardData: dt, bubbles: true, cancelable: true }))
        return dt.getData("text/plain")
    }
    window.__write = async (txt) => {
        await __focus()
        await __selAll()
        const dt = new DataTransfer()
        dt.setData("text/plain", txt)
        __ta().dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }))
        await new Promise((r) => setTimeout(r, 500))
        __ta().dispatchEvent(new KeyboardEvent("keydown", { key: "s", code: "KeyS", keyCode: 83, metaKey: true, bubbles: true }))
        __ta().dispatchEvent(new KeyboardEvent("keydown", { key: "s", code: "KeyS", keyCode: 83, ctrlKey: true, bubbles: true }))
        await new Promise((r) => setTimeout(r, 2000))
    }
    let t = await __read()
    if (!t.includes(marker)) throw new Error("fichier inattendu : " + t.slice(0, 80))
    if (t.includes("KorrI18n.tsx")) return "déjà branché"
    window.__backup = t
    // 1. Pragma JSX classique : korrH remplace createElement.
    t = "/** @jsxRuntime classic */\n/** @jsx korrH */\n/** @jsxFrag KorrFragment */\n" + t
    // 2. Import après la première ligne d'import.
    const imp = t.match(/^import [\s\S]*?from\s+"[^"]+"\s*$/m)[0]
    t = t.replace(imp, imp + '\nimport { h as korrH, Fragment as KorrFragment, useLang, lang, loc, tr } from "./KorrI18n.tsx"')
    // 3. useLang() en tête de chaque composant exporté (nom en majuscule).
    const re = /export (?:default )?function ([A-Z]\w*)\s*\(/g
    const spots = []
    let m
    while ((m = re.exec(t))) {
        let i = m.index + m[0].length, depth = 1
        while (depth && i < t.length) {
            if (t[i] === "(") depth++
            else if (t[i] === ")") depth--
            i++
        }
        const brace = t.indexOf("{", i)
        spots.push(brace + 1)
    }
    for (const at of spots.reverse()) t = t.slice(0, at) + "\n    useLang()" + t.slice(at)
    // 4. Langue envoyée à l'API.
    t = t.replace(/langue:\s*"fr"/g, "langue: lang()")
    if (extra) t = extra(t)
    await __write(t)
    await new Promise((r) => setTimeout(r, 1500))
    const b = await __read()
    return [b.length, spots.length, b.includes("KorrI18n.tsx"), (b.match(/useLang\(\)/g) || []).length]
}
"ok"
// Ajoute une référence explicite à korrH / KorrFragment (sinon l'import est retiré à la compilation).
window.__fixJsx = async () => {
    for (let i = 0; i < 40 && !document.querySelector(".monaco-editor .view-lines"); i++) await new Promise((r) => setTimeout(r, 1000))
    await new Promise((r) => setTimeout(r, 1500))
    let t = await __read()
    if (t.includes("void [korrH, KorrFragment]") || t.includes("void [h, Fragment]")) return "déjà corrigé"
    const m = t.match(/from "\.\/KorrI18n\.tsx"\n/)
    if (!m) throw new Error("import KorrI18n absent")
    const at = m.index + m[0].length
    t = t.slice(0, at) + "// Référence explicite : sans elle, l’import utilisé seulement par le pragma JSX est retiré à la compilation.\nvoid [korrH, KorrFragment]\n" + t.slice(at)
    await __write(t)
    await new Promise((r) => setTimeout(r, 1500))
    const b = await __read()
    return b.includes("void [korrH, KorrFragment]")
}
"ok"
