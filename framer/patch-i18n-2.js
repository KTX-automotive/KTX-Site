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
