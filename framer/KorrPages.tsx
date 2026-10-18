/** @jsxRuntime classic */
/** @jsx h */
/** @jsxFrag Fragment */
// KORR — pages du site (contenu repris de l'ancien site KTX, aux couleurs KORR).
// Rendu par KorrPrivacy (KorrFooter.tsx) selon sa propriété « Page » : une page Framer = une instance.
// Fichier volontairement long : il regroupe le contenu de 8 pages et leurs formulaires publics.
import { useEffect, useMemo, useRef, useState } from "react"
import KorrNav from "./KorrNav.tsx"
import KorrPlans from "./KorrPlans.tsx"
import KorrFAQ from "./KorrFAQ.tsx"
import KorrWaitlist from "./KorrWaitlist.tsx"
import { h, Fragment, useLang, lang, loc, tr } from "./KorrI18n.tsx"
// Référence explicite : sans elle, l’import utilisé seulement par le pragma JSX est retiré à la compilation.
void [h, Fragment]

const API = "https://ktx-api.fly.dev"
const IMG = "https://cdn.jsdelivr.net/gh/KTX-automotive/KTX-Site@564d05d74494288d4a2eb6fd09f881ed7414edd5/home/assets/"
const ACCENT = "#3FBF9F"
const FONT =
    "https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&display=swap"

export const PAGES = [
    "fonctionnement",
    "forfaits",
    "pneus-et-mags",
    "fin-de-bail",
    "entreprises",
    "garages",
    "faq",
    "liste-attente",
] as const
export type PageKey = (typeof PAGES)[number]

function useInter() {
    useEffect(() => {
        if (document.querySelector("link[data-korr-font]")) return
        const l = document.createElement("link")
        l.rel = "stylesheet"
        l.href = FONT
        l.setAttribute("data-korr-font", "")
        document.head.appendChild(l)
    }, [])
}

// ───── Styles communs ─────

const wrap = { maxWidth: 1200, margin: "0 auto" }
const section = (pad = 96) => ({
    width: "100%",
    padding: `${pad}px clamp(16px, 4vw, 48px)`,
    boxSizing: "border-box" as const,
})
const eyebrowS = { font: "600 15px Inter, sans-serif", color: ACCENT, margin: "0 0 14px" }
const h1S = {
    margin: "0 0 20px",
    font: "600 clamp(40px, 6.4vw, 72px)/1.02 Inter, sans-serif",
    letterSpacing: "-0.04em",
    background: "linear-gradient(180deg, #FFFFFF 0%, #E5E5E7 55%, #8E8E93 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
}
const h2S = {
    margin: "0 0 16px",
    font: "600 clamp(30px, 4.4vw, 48px)/1.08 Inter, sans-serif",
    letterSpacing: "-0.03em",
    color: "#F5F5F7",
}
const h3S = { margin: "0 0 8px", font: "600 19px/1.3 Inter, sans-serif", color: "#F5F5F7" }
const leadS = { margin: 0, font: "400 clamp(17px, 2vw, 21px)/1.5 Inter, sans-serif", color: "#A1A1A6", maxWidth: 720 }
const pS = { margin: 0, font: "400 15px/1.55 Inter, sans-serif", color: "#A1A1A6" }
const smallS = { margin: 0, font: "400 13px/1.5 Inter, sans-serif", color: "#6E6E73" }
const card = {
    background: "#0D0D0F",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 28,
    boxSizing: "border-box" as const,
}
const grid = (min = 240) => ({
    display: "grid",
    gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))`,
    gap: 16,
})
const btn = (primary = true) => ({
    display: "inline-block",
    font: "600 15px Inter, sans-serif",
    color: primary ? "#050505" : "#F5F5F7",
    background: primary ? ACCENT : "transparent",
    border: primary ? "none" : "1px solid rgba(255,255,255,0.24)",
    padding: "13px 22px",
    borderRadius: 999,
    textDecoration: "none",
    cursor: "pointer",
})

// ───── Blocs ─────

function Hero({ eyebrow, title, lead, image, alt }: { eyebrow: string; title: string; lead: string; image?: string; alt?: string }) {
    return (
        <header style={{ ...section(0), paddingTop: "clamp(120px, 14vw, 170px)", paddingBottom: 64 }}>
            <div style={wrap}>
                <p style={eyebrowS}>{eyebrow}</p>
                <h1 style={h1S}>{title}</h1>
                <p style={leadS}>{lead}</p>
                {image ? (
                    <img
                        src={IMG + image}
                        alt={alt || ""}
                        loading="eager"
                        style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", borderRadius: 28, marginTop: 48, display: "block", background: "#0D0D0F" }}
                    />
                ) : null}
            </div>
        </header>
    )
}

function Head({ eyebrow, title, lead, id }: { eyebrow?: string; title: string; lead?: string; id?: string }) {
    return (
        <div id={id} style={{ marginBottom: 40, scrollMarginTop: 80 }}>
            {eyebrow ? <p style={eyebrowS}>{eyebrow}</p> : null}
            <h2 style={h2S}>{title}</h2>
            {lead ? <p style={leadS}>{lead}</p> : null}
        </div>
    )
}

function Cards({ items, numbered }: { items: [string, string, string?][]; numbered?: boolean }) {
    return (
        <div style={grid(240)}>
            {items.map(([t, d, tag], i) => (
                <div key={t} style={card}>
                    {numbered || tag ? (
                        <div style={{ font: "600 13px Inter, sans-serif", color: ACCENT, marginBottom: 18, letterSpacing: "0.04em" }}>
                            {tag || String(i + 1).padStart(2, "0")}
                        </div>
                    ) : null}
                    <h3 style={h3S}>{t}</h3>
                    <p style={pS}>{d}</p>
                </div>
            ))}
        </div>
    )
}

function Checks({ items, minus }: { items: string[]; minus?: boolean }) {
    return (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
            {items.map((t) => (
                <li key={t} style={{ display: "flex", gap: 12, font: "400 16px/1.5 Inter, sans-serif", color: "#D2D2D7" }}>
                    <span style={{ color: minus ? "#86868B" : ACCENT, flex: "0 0 auto" }}>{minus ? "–" : "✓"}</span>
                    <span>{t}</span>
                </li>
            ))}
        </ul>
    )
}

function Band({ title, text, href = "#liste-attente", label = "Rejoindre la liste d’attente" }: { title: string; text: string; href?: string; label?: string }) {
    return (
        <section style={section(32)}>
            <div style={{ ...wrap, ...card, padding: "clamp(32px, 5vw, 56px)", textAlign: "center" }}>
                <h2 style={{ ...h2S, marginBottom: 12 }}>{title}</h2>
                <p style={{ ...leadS, margin: "0 auto 28px" }}>{text}</p>
                <a href={href} style={btn()}>{label}</a>
            </div>
        </section>
    )
}

// ───── Champs de formulaire ─────

const fieldS = {
    width: "100%",
    boxSizing: "border-box" as const,
    background: "#111113",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    color: "#F5F5F7",
    padding: "12px 14px",
    font: "400 16px Inter, sans-serif",
    outline: "none",
    appearance: "none" as const,
}
const labelS = { display: "grid", gap: 8, font: "500 14px Inter, sans-serif", color: "#D2D2D7" }

function Field({ label, children, wide }: { label: string; children: any; wide?: boolean }) {
    return (
        <label style={{ ...labelS, gridColumn: wide ? "1 / -1" : undefined }}>
            {label}
            {children}
        </label>
    )
}

function Select({ name, value, onChange, options, required, placeholder = "Choisir…", disabled }: {
    name?: string; value: string; onChange: (v: string) => void; options: [string, string][]; required?: boolean; placeholder?: string; disabled?: boolean
}) {
    return (
        <select name={name} value={value} required={required} disabled={disabled} onChange={(e) => onChange(e.target.value)} style={{ ...fieldS, opacity: disabled ? 0.5 : 1 }}>
            <option value="">{placeholder}</option>
            {options.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
            ))}
        </select>
    )
}

function Choice({ name, value, onChange, options }: { name: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
    return (
        <div role="radiogroup" aria-label={name} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {options.map(([v, l]) => {
                const on = value === v
                return (
                    <button
                        key={v}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => onChange(v)}
                        style={{
                            font: "500 14px Inter, sans-serif",
                            padding: "10px 14px",
                            borderRadius: 999,
                            cursor: "pointer",
                            border: on ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.14)",
                            background: on ? "rgba(63,191,159,0.14)" : "transparent",
                            color: on ? "#F5F5F7" : "#A1A1A6",
                        }}
                    >
                        {l}
                    </button>
                )
            })}
        </div>
    )
}

function Consent({ checked, onChange, text }: { checked: boolean; onChange: (v: boolean) => void; text: string }) {
    return (
        <label style={{ gridColumn: "1 / -1", display: "flex", gap: 12, alignItems: "flex-start", font: "400 13px/1.5 Inter, sans-serif", color: "#A1A1A6" }}>
            <input type="checkbox" required checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ marginTop: 3, accentColor: ACCENT, width: 18, height: 18, flex: "0 0 auto" }} />
            <span>{text}</span>
        </label>
    )
}

// Champ piège invisible : un robot le remplit, l'API ignore alors la demande.
function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <input
            type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
        />
    )
}

const formS = { ...card, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: 18, position: "relative" as const }

function Submit({ busy, label, status }: { busy: boolean; label: string; status: { ok?: boolean; msg: string } | null }) {
    return (
        <div style={{ gridColumn: "1 / -1", display: "grid", gap: 12 }}>
            <button type="submit" disabled={busy} style={{ ...btn(), border: "none", opacity: busy ? 0.6 : 1, justifySelf: "start" }}>
                {busy ? "Envoi…" : label}
            </button>
            {status ? (
                <p role="status" style={{ ...pS, color: status.ok ? ACCENT : "#FF6B6B" }}>{status.msg}</p>
            ) : null}
        </div>
    )
}

async function post(path: string, body: unknown): Promise<any> {
    const r = await fetch(API + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) {
        const msg = r.status === 429 ? data.message || "Trop de demandes, réessayez dans quelques minutes." : data.message && data.message !== "Données invalides" ? data.message : "Vérifiez les champs du formulaire."
        throw new Error(msg)
    }
    return data
}

// ───── Véhicule : marque → modèle → année → version (liste Wheel-Size de l'API, saisie libre si indisponible) ─────

type Opt = { slug: string; name: string; label?: string }
type Vehicle = { make: string; model: string; year: string; trim: string; makeName: string; modelName: string; trimName: string }
const EMPTY_VEHICLE: Vehicle = { make: "", model: "", year: "", trim: "", makeName: "", modelName: "", trimName: "" }
const cache: Record<string, any> = {}
async function getList(path: string): Promise<any[]> {
    if (cache[path]) return cache[path]
    const r = await fetch(API + path)
    if (!r.ok) throw new Error("indisponible")
    const j = await r.json()
    cache[path] = j.data || []
    return cache[path]
}

function VehicleFields({ v, setV, requireMake = true }: { v: Vehicle; setV: (v: Vehicle) => void; requireMake?: boolean }) {
    const [makes, setMakes] = useState<Opt[]>([])
    const [models, setModels] = useState<Opt[]>([])
    const [years, setYears] = useState<number[]>([])
    const [trims, setTrims] = useState<Opt[]>([])
    const [free, setFree] = useState(false)
    useEffect(() => {
        getList("/v1/vehicles/makes").then(setMakes).catch(() => setFree(true))
    }, [])
    useEffect(() => {
        setModels([])
        if (v.make) getList(`/v1/vehicles/models?make=${v.make}`).then(setModels).catch(() => setFree(true))
    }, [v.make])
    useEffect(() => {
        setYears([])
        if (v.make && v.model) getList(`/v1/vehicles/years?make=${v.make}&model=${v.model}`).then(setYears).catch(() => setFree(true))
    }, [v.make, v.model])
    useEffect(() => {
        setTrims([])
        if (v.make && v.model && v.year) getList(`/v1/vehicles/trims?make=${v.make}&model=${v.model}&year=${v.year}`).then(setTrims).catch(() => undefined)
    }, [v.make, v.model, v.year])

    if (free) {
        return (
            <>
                <Field label={`Marque${requireMake ? " *" : ""}`}>
                    <input required={requireMake} value={v.makeName} onChange={(e) => setV({ ...v, makeName: e.target.value })} style={fieldS} />
                </Field>
                <Field label="Modèle">
                    <input value={v.modelName} onChange={(e) => setV({ ...v, modelName: e.target.value })} style={fieldS} />
                </Field>
                <Field label="Année">
                    <input inputMode="numeric" maxLength={4} value={v.year} onChange={(e) => setV({ ...v, year: e.target.value.replace(/\D/g, "") })} style={fieldS} />
                </Field>
            </>
        )
    }
    const name = (list: Opt[], slug: string) => list.find((o) => o.slug === slug)?.name || ""
    return (
        <>
            <Field label={`Marque${requireMake ? " *" : ""}`}>
                <Select required={requireMake} value={v.make} options={[...makes.map((o) => [o.slug, o.name] as [string, string]), ["__autre", "Autre"]]}
                    onChange={(s) => (s === "__autre" ? (setFree(true), setV({ ...EMPTY_VEHICLE })) : setV({ ...EMPTY_VEHICLE, make: s, makeName: name(makes, s) }))} />
            </Field>
            <Field label="Modèle">
                <Select value={v.model} disabled={!v.make} options={models.map((o) => [o.slug, o.name])}
                    onChange={(s) => setV({ ...v, model: s, modelName: name(models, s), year: "", trim: "", trimName: "" })} />
            </Field>
            <Field label="Année">
                <Select value={v.year} disabled={!v.model} options={years.map((y) => [String(y), String(y)])}
                    onChange={(s) => setV({ ...v, year: s, trim: "", trimName: "" })} />
            </Field>
            <Field label="Version">
                <Select value={v.trim} disabled={!trims.length} options={trims.map((o) => [o.slug, o.label || o.name])}
                    onChange={(s) => setV({ ...v, trim: s, trimName: name(trims, s) })} />
            </Field>
        </>
    )
}

const vehicleBody = (v: Vehicle) => ({
    marque: v.makeName,
    modele: v.modelName || undefined,
    annee: v.year || undefined,
    version: v.trimName || undefined,
    vehicule_ref: v.make && v.model && v.year && v.trim ? { make: v.make, model: v.model, year: Number(v.year), trim: v.trim } : undefined,
})

// ───── Formulaire : demande de prix pneus et mags ─────

const SIZES = "185/65R15 195/65R15 205/65R15 195/55R16 205/55R16 205/60R16 215/55R16 215/60R16 215/65R16 225/60R16 235/70R16 205/50R17 215/45R17 215/50R17 215/55R17 215/60R17 225/45R17 225/50R17 225/55R17 225/60R17 225/65R17 235/55R17 235/65R17 245/65R17 265/70R17 215/55R18 225/40R18 225/45R18 225/55R18 225/60R18 235/40R18 235/45R18 235/50R18 235/55R18 235/60R18 245/40R18 245/45R18 245/60R18 255/55R18 255/70R18 265/60R18 265/65R18 225/40R19 225/45R19 225/55R19 235/35R19 235/40R19 235/45R19 235/50R19 235/55R19 245/40R19 245/45R19 255/35R19 255/40R19 255/45R19 255/50R19 255/55R19 275/35R19 275/40R19 235/35R20 235/45R20 235/55R20 245/35R20 245/40R20 245/45R20 255/35R20 255/40R20 255/45R20 255/50R20 265/50R20 275/35R20 275/40R20 275/45R20 275/55R20 275/60R20 285/35R20 285/45R20 245/35R21 255/35R21 255/40R21 265/35R21 265/40R21 275/35R21 275/40R21 275/45R21 285/35R21 295/35R21 315/30R21 265/35R22 275/40R22 285/40R22 285/45R22 305/40R22"
    .split(" ")

function QuoteForm() {
    const [product, setProduct] = useState("pneus")
    const [season, setSeason] = useState("hiver")
    const [v, setV] = useState<Vehicle>(EMPTY_VEHICLE)
    const [size, setSize] = useState("")
    const [qty, setQty] = useState("4")
    const [first, setFirst] = useState("")
    const [member, setMember] = useState("non")
    const [email, setEmail] = useState("")
    const [ok, setOk] = useState(false)
    const [hp, setHp] = useState("")
    const [busy, setBusy] = useState(false)
    const [status, setStatus] = useState<{ ok?: boolean; msg: string } | null>(null)
    const tires = product === "pneus" || product === "ensemble"
    const submit = async (e: any) => {
        e.preventDefault()
        setBusy(true)
        setStatus(null)
        try {
            await post("/v1/product-quotes", {
                produit: product, saison: tires ? season : undefined, type_mags: product === "ensemble" ? "origine" : undefined,
                ...vehicleBody(v), dimension: size && size !== "inconnue" && size !== "autre" ? size : undefined, quantite: qty, prenom: first || undefined,
                membre: member, courriel: email, consentement: ok ? "oui" : "", langue: lang(), website: hp,
            })
            setStatus({ ok: true, msg: "Demande reçue. Vous recevrez votre prix par courriel, en général dans un jour ouvrable." })
        } catch (err: any) {
            setStatus({ msg: err.message })
        } finally {
            setBusy(false)
        }
    }
    return (
        <form onSubmit={submit} style={formS}>
            <Honeypot value={hp} onChange={setHp} />
            <Field label="Produit" wide>
                <Choice name="Produit" value={product} onChange={setProduct}
                    options={[["pneus", "Pneus"], ["mags_origine", "Mags d’origine (OEM)"], ["ensemble", "Ensemble mags d’origine et pneus"]]} />
            </Field>
            {tires ? (
                <Field label="Saison" wide>
                    <Choice name="Saison" value={season} onChange={setSeason} options={[["hiver", "Hiver"], ["ete", "Été"], ["quatre_saisons", "Quatre saisons"]]} />
                </Field>
            ) : null}
            <VehicleFields v={v} setV={setV} />
            <Field label="Dimension *">
                <Select required value={size} onChange={setSize} options={[["inconnue", "Je ne sais pas"], ...SIZES.map((s) => [s, s] as [string, string]), ["autre", "Autre"]]} />
            </Field>
            <Field label="Quantité">
                <Select value={qty} onChange={setQty} placeholder="Quantité" options={[["1", "1"], ["2", "2"], ["4", "4"]]} />
            </Field>
            <Field label="Prénom">
                <input value={first} onChange={(e) => setFirst(e.target.value)} autoComplete="given-name" style={fieldS} />
            </Field>
            <Field label="Courriel *">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={fieldS} />
            </Field>
            <Field label="Êtes-vous membre KORR ?" wide>
                <Choice name="Membre" value={member} onChange={setMember} options={[["oui", "Oui, je suis membre"], ["non", "Non"]]} />
            </Field>
            <Consent checked={ok} onChange={setOk} text="J’accepte que KORR conserve mes coordonnées et les renseignements de mon véhicule pour me répondre par courriel au sujet de cette demande de prix." />
            <Submit busy={busy} label="Recevoir mon prix" status={status} />
        </form>
    )
}

// ───── Formulaire : estimation photo d'une jante ─────

const MAX_SIDE = 1600
async function toJpeg(file: File): Promise<string> {
    const url = URL.createObjectURL(file)
    try {
        const img = await new Promise<HTMLImageElement>((res, rej) => {
            const i = new Image()
            i.onload = () => res(i)
            i.onerror = rej
            i.src = url
        })
        const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
        const c = document.createElement("canvas")
        c.width = Math.round(img.naturalWidth * k)
        c.height = Math.round(img.naturalHeight * k)
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height)
        // Réencodage JPEG : retire aussi les métadonnées (position GPS, appareil).
        for (const q of [0.82, 0.7, 0.55]) {
            const d = c.toDataURL("image/jpeg", q)
            if (d.length < 1_500_000) return d
        }
        return c.toDataURL("image/jpeg", 0.45)
    } finally {
        URL.revokeObjectURL(url)
    }
}

function RimForm() {
    const [leased, setLeased] = useState("")
    const [photos, setPhotos] = useState<string[]>([])
    const [count, setCount] = useState("1")
    const [v, setV] = useState<Vehicle>(EMPTY_VEHICLE)
    const [first, setFirst] = useState("")
    const [email, setEmail] = useState("")
    const [ok, setOk] = useState(false)
    const [hp, setHp] = useState("")
    const [busy, setBusy] = useState(false)
    const [status, setStatus] = useState<{ ok?: boolean; msg: string } | null>(null)
    const addPhotos = async (files: FileList | null) => {
        if (!files) return
        const list = Array.from(files).slice(0, 4 - photos.length)
        const encoded = await Promise.all(list.map(toJpeg))
        setPhotos([...photos, ...encoded].slice(0, 4))
    }
    const submit = async (e: any) => {
        e.preventDefault()
        if (leased !== "non") return setStatus({ msg: "Véhicule loué : utilisez plutôt le diagnostic Fin de bail." })
        if (!photos.length) return setStatus({ msg: "Ajoutez au moins une photo de la jante." })
        setBusy(true)
        setStatus(null)
        try {
            const r = await post("/v1/rim-estimates", {
                vehicule_loue: "non", photos, nb_jantes: count, marque: v.makeName || undefined, modele: v.modelName || undefined,
                annee: v.year || undefined, prenom: first || undefined, courriel: email, consentement: ok ? "oui" : "", langue: lang(), website: hp,
            })
            setStatus({ ok: true, msg: `Demande ${r.code || ""} reçue. Votre fourchette arrive par courriel, en général dans un jour ouvrable.` })
            setPhotos([])
        } catch (err: any) {
            setStatus({ msg: err.message })
        } finally {
            setBusy(false)
        }
    }
    return (
        <form onSubmit={submit} style={formS}>
            <Honeypot value={hp} onChange={setHp} />
            <Field label="Ce véhicule est-il loué ? *" wide>
                <Choice name="Location" value={leased} onChange={setLeased} options={[["non", "Non, j’en suis propriétaire"], ["oui", "Oui, il est loué"]]} />
            </Field>
            {leased === "oui" ? (
                <p style={{ ...pS, gridColumn: "1 / -1" }}>
                    Pour un véhicule loué, le <a href="/fin-de-bail#diagnostic" style={{ color: ACCENT }}>diagnostic Fin de bail</a> est plus adapté : il tient compte de la grille de retour du loueur.
                </p>
            ) : null}
            <div style={{ gridColumn: "1 / -1", display: "grid", gap: 12 }}>
                <label style={{ ...card, padding: 20, borderStyle: "dashed", cursor: photos.length >= 4 ? "default" : "pointer", display: "grid", gap: 4 }}>
                    <span style={{ font: "600 15px Inter, sans-serif", color: "#F5F5F7" }}>+ Ajouter des photos ({photos.length}/4)</span>
                    <span style={smallS}>De face et de près, à la lumière du jour. Évitez de montrer la plaque.</span>
                    <input type="file" accept="image/*" multiple disabled={photos.length >= 4} onChange={(e) => { addPhotos(e.target.files); e.target.value = "" }} style={{ display: "none" }} />
                </label>
                {photos.length ? (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {photos.map((p, i) => (
                            <button key={i} type="button" title="Retirer" onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                                style={{ padding: 0, border: "none", background: "none", cursor: "pointer" }}>
                                <img src={p} alt={`Photo ${i + 1}`} style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 12, display: "block" }} />
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>
            <Field label="Nombre de jantes à réparer">
                <Select value={count} onChange={setCount} placeholder="Nombre" options={[["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"]]} />
            </Field>
            <VehicleFields v={v} setV={setV} requireMake={false} />
            <Field label="Prénom">
                <input value={first} onChange={(e) => setFirst(e.target.value)} autoComplete="given-name" style={fieldS} />
            </Field>
            <Field label="Courriel *">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={fieldS} />
            </Field>
            <Consent checked={ok} onChange={setOk} text="J’accepte que KORR conserve mes photos et mes coordonnées pour préparer une estimation indicative et m’écrire à ce sujet (2 rappels au plus). Les photos peuvent être analysées par un outil d’intelligence artificielle dont les serveurs peuvent se trouver hors du Québec ; elles sont supprimées après 90 jours au plus." />
            <Submit busy={busy} label="Recevoir mon estimation" status={status} />
        </form>
    )
}

// ───── Formulaire : autodiagnostic fin de bail ─────

const LEASE_Q: [string, string, [string, string][]][] = [
    ["q_carrosserie", "Bosses, rayures ou éclats de peinture sur la carrosserie", [["aucune", "Aucun"], ["legeres", "Légers, peu visibles"], ["importantes", "Visibles ou nombreux"]]],
    ["q_parebrise", "Pare-brise", [["non", "Intact"], ["eclat", "Éclat ou impact"], ["fissure", "Fissure"]]],
    ["q_feux", "Phare, feu ou rétroviseur fissuré ou brisé", [["non", "Non"], ["oui", "Oui"]]],
    ["q_interieur", "Taches, déchirures ou brûlures à l’intérieur", [["aucune", "Aucune"], ["legeres", "Légères"], ["importantes", "Visibles ou nombreuses"]]],
    ["q_eraflures", "Éraflures de trottoir sur les jantes", [["aucune", "Aucune"], ["legeres", "Légères, superficielles"], ["importantes", "Profondes ou nombreuses"]]],
    ["q_jante", "Jante voilée, fissurée ou bosselée", [["non", "Non"], ["incertain", "Je ne sais pas"], ["oui", "Oui"]]],
    ["q_profondeur", "Profondeur restante des pneus", [["plus5", "Plus de 5 mm"], ["de4a5", "4 à 5 mm"], ["moins4", "Moins de 4 mm"], ["incertain", "Je ne sais pas"]]],
    ["q_pneus_identiques", "Les 4 pneus sont de même marque et même modèle", [["oui", "Oui"], ["non", "Non"], ["incertain", "Je ne sais pas"]]],
    ["q_flancs", "Bosse, coupure ou hernie sur un flanc", [["non", "Non"], ["oui", "Oui"]]],
    ["q_tpms", "Voyant de pression des pneus allumé", [["non", "Non"], ["oui", "Oui"]]],
]
const LEVEL: Record<string, [string, string]> = {
    faible: ["Peu de points à surveiller", ACCENT],
    modere: ["Quelques points à vérifier avant le retour", "#F5C451"],
    eleve: ["Des réparations sont à prévoir avant le retour", "#FF8A65"],
}

function LeaseForm() {
    const [v, setV] = useState<Vehicle>(EMPTY_VEHICLE)
    const [end, setEnd] = useState("")
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [first, setFirst] = useState("")
    const [email, setEmail] = useState("")
    const [ok, setOk] = useState(false)
    const [hp, setHp] = useState("")
    const [busy, setBusy] = useState(false)
    const [status, setStatus] = useState<{ ok?: boolean; msg: string } | null>(null)
    const [result, setResult] = useState<any>(null)
    const missing = LEASE_Q.filter(([k]) => !answers[k]).length
    const submit = async (e: any) => {
        e.preventDefault()
        if (missing) return setStatus({ msg: `Répondez aux ${missing} question${missing > 1 ? "s" : ""} restante${missing > 1 ? "s" : ""}.` })
        setBusy(true)
        setStatus(null)
        try {
            const r = await post("/v1/lease-check", {
                marque: v.makeName, modele: v.modelName || undefined, annee: v.year || undefined, fin_bail: end,
                ...answers, prenom: first || undefined, courriel: email, consentement: ok ? "oui" : "", langue: lang(), website: hp,
            })
            setResult(r)
        } catch (err: any) {
            setStatus({ msg: err.message })
        } finally {
            setBusy(false)
        }
    }
    if (result) {
        const [label, color] = LEVEL[result.report?.level] || LEVEL.modere
        return (
            <div style={{ ...card, display: "grid", gap: 16 }}>
                <p style={eyebrowS}>Rapport {result.code}</p>
                <h3 style={{ ...h2S, color }}>{label}</h3>
                <p style={pS}>
                    {result.report?.daysLeft != null ? `${result.report.daysLeft} jours avant la fin de votre bail. ` : ""}
                    Votre rapport daté vous a été envoyé par courriel (confirmez votre adresse pour recevoir les rappels à 60 et 30 jours). Il se vérifie en tout temps avec son code.
                </p>
                <p style={smallS}>Autodiagnostic indicatif : il ne remplace pas l’inspection du loueur et ne garantit pas l’absence de frais au retour.</p>
                <a href="#liste-attente" style={{ ...btn(), justifySelf: "start" }}>Réserver le forfait Fin de bail</a>
            </div>
        )
    }
    const today = new Date().toISOString().slice(0, 10)
    return (
        <form onSubmit={submit} style={formS}>
            <Honeypot value={hp} onChange={setHp} />
            <VehicleFields v={v} setV={setV} />
            <Field label="Date de fin du bail *">
                <input type="date" required min={today} value={end} onChange={(e) => setEnd(e.target.value)} style={{ ...fieldS, colorScheme: "dark" }} />
            </Field>
            {LEASE_Q.map(([k, q, opts]) => (
                <Field key={k} label={q} wide>
                    <Choice name={q} value={answers[k] || ""} onChange={(a) => setAnswers({ ...answers, [k]: a })} options={opts} />
                </Field>
            ))}
            <Field label="Prénom">
                <input value={first} onChange={(e) => setFirst(e.target.value)} autoComplete="given-name" style={fieldS} />
            </Field>
            <Field label="Courriel *">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={fieldS} />
            </Field>
            <Consent checked={ok} onChange={setOk} text="J’accepte de recevoir de KORR mon rapport, deux rappels avant la fin de mon bail et des nouvelles du lancement. Désinscription en tout temps." />
            <Submit busy={busy} label="Obtenir mon rapport daté" status={status} />
        </form>
    )
}

// ───── Vérification d'un rapport ─────

function VerifyForm() {
    const [code, setCode] = useState("")
    const [busy, setBusy] = useState(false)
    const [res, setRes] = useState<{ ok: boolean; msg: string } | null>(null)
    useEffect(() => {
        const c = new URLSearchParams(window.location.search).get("code")
        if (c) setCode(c.toUpperCase())
    }, [])
    const submit = async (e: any) => {
        e.preventDefault()
        const c = code.trim().toUpperCase().replace(/^R(?!-)/, "R-")
        if (!/^R-[A-HJ-NP-Z2-9]{10}$/.test(c)) return setRes({ ok: false, msg: "Code invalide. Il ressemble à R-ABCD234EFG." })
        setBusy(true)
        try {
            const r = await fetch(`${API}/v1/reports/${c}`)
            if (r.status === 404) return setRes({ ok: false, msg: "Aucun rapport ne correspond à ce code." })
            if (!r.ok) throw new Error()
            const d = await r.json()
            const when = d.createdAt ? new Date(d.createdAt).toLocaleDateString(lang() === "en" ? "en-CA" : "fr-CA", { day: "numeric", month: "long", year: "numeric" }) : ""
            const veh = [d.make, d.model, d.year].filter(Boolean).join(" ")
            setRes(
                d.verified
                    ? { ok: true, msg: `Rapport authentique${when ? ` du ${when}` : ""}${veh ? ` · ${veh}` : ""}. Son contenu n’a pas été modifié.` }
                    : { ok: false, msg: "Ce rapport existe, mais son contenu ne correspond plus à l’original." }
            )
        } catch {
            setRes({ ok: false, msg: "Vérification indisponible pour le moment, réessayez plus tard." })
        } finally {
            setBusy(false)
        }
    }
    return (
        <form onSubmit={submit} style={{ ...card, display: "grid", gap: 14 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input aria-label="Code du rapport" placeholder="R-XXXXXXXXXX" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                    style={{ ...fieldS, flex: "1 1 220px", width: "auto", letterSpacing: "0.06em" }} />
                <button type="submit" disabled={busy} style={{ ...btn(), border: "none" }}>{busy ? "…" : "Vérifier"}</button>
            </div>
            {res ? <p role="status" style={{ ...pS, color: res.ok ? ACCENT : "#FF8A65" }}>{res.msg}</p> : null}
        </form>
    )
}

// ───── Candidature garage partenaire ─────

function PartnerForm() {
    const [f, setF] = useState({ entreprise: "", nom: "", courriel: "", telephone: "", code_postal: "", type: "garage", baies: "", services: "", message: "" })
    const [ok, setOk] = useState(false)
    const [hp, setHp] = useState("")
    const [busy, setBusy] = useState(false)
    const [status, setStatus] = useState<{ ok?: boolean; msg: string } | null>(null)
    const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value })
    const consentText = "J’accepte que KORR conserve ces renseignements pour évaluer ma candidature et me contacter à ce sujet."
    const submit = async (e: any) => {
        e.preventDefault()
        setBusy(true)
        setStatus(null)
        try {
            await post("/v1/partners/applications", { ...f, baies: f.baies || undefined, source: "korrauto.com/garages", consentement: ok ? "oui" : "", texte_consentement: tr(consentText), langue: lang(), website: hp })
            setStatus({ ok: true, msg: "Candidature reçue. Nous vous écrirons avant l’évaluation de décembre 2026." })
        } catch (err: any) {
            setStatus({ msg: err.message })
        } finally {
            setBusy(false)
        }
    }
    return (
        <form onSubmit={submit} style={formS}>
            <Honeypot value={hp} onChange={setHp} />
            <Field label="Entreprise *"><input required value={f.entreprise} onChange={set("entreprise")} autoComplete="organization" style={fieldS} /></Field>
            <Field label="Votre nom *"><input required value={f.nom} onChange={set("nom")} autoComplete="name" style={fieldS} /></Field>
            <Field label="Courriel *"><input type="email" required value={f.courriel} onChange={set("courriel")} autoComplete="email" style={fieldS} /></Field>
            <Field label="Téléphone"><input type="tel" value={f.telephone} onChange={set("telephone")} autoComplete="tel" style={fieldS} /></Field>
            <Field label="Code postal"><input value={f.code_postal} onChange={set("code_postal")} autoComplete="postal-code" style={fieldS} /></Field>
            <Field label="Type">
                <Select value={f.type} onChange={(t) => setF({ ...f, type: t })} placeholder="Type"
                    options={[["garage", "Garage indépendant"], ["dealer", "Concessionnaire"], ["rim_shop", "Atelier de jantes"], ["detailing", "Esthétique automobile"], ["other", "Autre"]]} />
            </Field>
            <Field label="Nombre de baies"><input inputMode="numeric" value={f.baies} onChange={(e) => setF({ ...f, baies: e.target.value.replace(/\D/g, "") })} style={fieldS} /></Field>
            <Field label="Services offerts"><input value={f.services} onChange={set("services")} placeholder="Pneus, alignement, freins…" style={fieldS} /></Field>
            <Field label="Message" wide><textarea rows={4} value={f.message} onChange={set("message")} style={{ ...fieldS, resize: "vertical" }} /></Field>
            <Consent checked={ok} onChange={setOk} text={consentText} />
            <Submit busy={busy} label="Envoyer ma candidature" status={status} />
        </form>
    )
}

// ───── Rappel « 1er décembre » ─────

export function WinterAlert() {
    const [email, setEmail] = useState("")
    const [cp, setCp] = useState("")
    const [make, setMake] = useState("")
    const [ok, setOk] = useState(false)
    const [hp, setHp] = useState("")
    const [busy, setBusy] = useState(false)
    const [status, setStatus] = useState<{ ok?: boolean; msg: string } | null>(null)
    const days = useMemo(() => {
        const now = new Date()
        const y = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear()
        return Math.max(0, Math.ceil((new Date(y, 11, 1).getTime() - now.getTime()) / 86_400_000))
    }, [])
    const consentText = "J’accepte de recevoir de KORR un rappel avant le 1er décembre et des nouvelles du lancement. Désinscription en tout temps."
    const submit = async (e: any) => {
        e.preventDefault()
        setBusy(true)
        setStatus(null)
        try {
            await post("/v1/alerts/winter", { courriel: email, code_postal: cp || undefined, marque: make || undefined, consentement: ok ? "oui" : "", texte_consentement: tr(consentText), langue: lang(), website: hp })
            setStatus({ ok: true, msg: "C’est noté. Confirmez votre adresse dans le courriel que nous venons d’envoyer." })
        } catch (err: any) {
            setStatus({ msg: err.message })
        } finally {
            setBusy(false)
        }
    }
    return (
        <div style={{ ...grid(300), alignItems: "center", gap: 40 }}>
            <div>
                <p style={eyebrowS}>Pneus d’hiver obligatoires · 1er décembre</p>
                <div style={{ font: "600 clamp(64px, 10vw, 120px)/1 Inter, sans-serif", letterSpacing: "-0.05em", color: "#F5F5F7" }}>
                    {days}<span style={{ fontSize: "0.3em", color: "#86868B", marginLeft: 8 }}>jours</span>
                </div>
                <h2 style={{ ...h2S, marginTop: 16 }}>Avant la cohue, un rappel.</h2>
                <p style={pS}>Au Québec, les pneus d’hiver sont obligatoires du 1er décembre au 15 mars. Chaque automne, les garages débordent les deux dernières semaines. Recevez un rappel trois semaines avant.</p>
            </div>
            <form onSubmit={submit} style={formS}>
                <Honeypot value={hp} onChange={setHp} />
                <Field label="Courriel *" wide><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={fieldS} /></Field>
                <Field label="Code postal"><input value={cp} onChange={(e) => setCp(e.target.value)} autoComplete="postal-code" style={fieldS} /></Field>
                <Field label="Marque du véhicule"><input value={make} onChange={(e) => setMake(e.target.value)} style={fieldS} /></Field>
                <Consent checked={ok} onChange={setOk} text={consentText} />
                <Submit busy={busy} label="Activer mon rappel" status={status} />
            </form>
        </div>
    )
}

// ───── Calendrier de la cohue ─────

const MONTHS = ["Sept.", "Oct.", "Nov.", "Déc.", "Janv.", "Févr.", "Mars", "Avr.", "Mai"]
function Season() {
    const bar = (from: number, to: number, color: string, label: string, top: number) => (
        <div style={{ position: "absolute", left: `${(from / 9) * 100}%`, width: `${((to - from) / 9) * 100}%`, top, height: 34, borderRadius: 10, background: color, display: "flex", alignItems: "center", padding: "0 12px", boxSizing: "border-box", font: "600 12px Inter, sans-serif", color: "#050505", whiteSpace: "nowrap", overflow: "hidden" }}>
            {label}
        </div>
    )
    return (
        <div style={{ ...card, overflowX: "auto" }}>
            <div style={{ minWidth: 640 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", font: "500 12px Inter, sans-serif", color: "#86868B", marginBottom: 16 }}>
                    {MONTHS.map((m) => <span key={m}>{m}</span>)}
                </div>
                <div style={{ position: "relative", height: 132 }}>
                    {bar(0.3, 2, ACCENT, "Vos créneaux KORR d’automne", 0)}
                    {bar(2, 3, "#FF8A65", "La cohue", 46)}
                    {bar(3, 6.5, "#D2D2D7", "Pneus d’hiver obligatoires · 1er déc. au 15 mars", 92)}
                    {bar(7, 8.6, ACCENT, "Printemps", 0)}
                </div>
            </div>
        </div>
    )
}

// ───── Pages ─────

function Fonctionnement() {
    return (
        <>
            <Hero eyebrow="Comment ça marche" title="Un seul interlocuteur : KORR. Nos garages partenaires font le travail."
                lead="KORR anticipe vos créneaux, garde vos pneus, coordonne le garage partenaire et documente chaque service." image="garage-v3.webp"
                alt="Technicien d’un garage partenaire serrant les écrous d’une roue, voiture sur le pont" />
            <section style={section(48)}>
                <div style={wrap}>
                    <Cards numbered items={[
                        ["Inscrivez-vous", "Choisissez votre forfait. Un paiement, l’année réglée."],
                        ["Réservez vos 2 créneaux", "Automne et printemps, fixés dès l’inscription, pas en novembre avec tout le monde."],
                        ["Présentez votre code QR", "Au garage partenaire de votre secteur. Un scan valide la visite, rien à payer sur place."],
                        ["Recevez votre rapport", "Mesures de vos pneus, photos datées, état des freins et des jantes, sur votre téléphone."],
                    ]} />
                </div>
            </section>
            <section style={section()}>
                <div style={{ ...wrap, ...grid(320), gap: 48, alignItems: "center" }}>
                    <div>
                        <Head id="korr-trace" eyebrow="KORR Trace" title="Chaque visite laisse une trace. Datée, mesurée, vérifiable."
                            lead="Après chaque visite, vous recevez votre rapport KORR Trace : l’état de vos pneus et de vos jantes, mesuré et photographié au garage partenaire, avec un code QR que n’importe qui peut vérifier." />
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <a href="#liste-attente" style={btn()}>Rejoindre la liste d’attente</a>
                            <a href="/fin-de-bail#verifier" style={btn(false)}>Vérifier un rapport</a>
                        </div>
                        <p style={{ ...smallS, marginTop: 16 }}>Disponible pour les membres dès le lancement d’avril 2027.</p>
                    </div>
                    <img src={IMG + "qr.webp"} alt="Code QR affiché sur un téléphone, scanné au comptoir d’un garage partenaire" loading="lazy"
                        style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", borderRadius: 28, display: "block" }} />
                </div>
                <div style={{ ...wrap, marginTop: 40 }}>
                    <Cards numbered items={[
                        ["Pneus mesurés", "L’usure et l’âge de chaque pneu, relevés au garage partenaire à chaque visite."],
                        ["Serrage consigné", "Le serrage de vos roues est inscrit au rapport par le garage partenaire."],
                        ["Revente et fin de bail", "Un historique daté, avec photos, que l’acheteur de votre véhicule ou votre loueur peut vérifier par code QR."],
                    ]} />
                </div>
            </section>
            <section style={section(48)}>
                <div style={wrap}>
                    <Head eyebrow="Pourquoi réserver d’avance" title="Le 1er décembre ne se déplace pas. Votre rendez-vous, oui."
                        lead="Au Québec, les pneus d’hiver sont obligatoires du 1er décembre au 15 mars. Chaque automne, tout le monde appelle son garage la même semaine. Avec KORR, votre créneau est fixé bien avant." />
                    <Season />
                </div>
            </section>
            <section style={section()}>
                <div style={wrap}><WinterAlert /></div>
            </section>
        </>
    )
}

function Forfaits() {
    return (
        <>
            <div style={{ height: 52 }} />
            <KorrPlans />
            <section style={section()}>
                <div style={{ ...wrap, ...card, padding: "clamp(28px, 5vw, 48px)", display: "grid", gap: 24 }}>
                    <div>
                        <p style={eyebrowS}>Arrive en 2028</p>
                        <h2 style={{ ...h2S, marginBottom: 8 }}>Entretien</h2>
                        <p style={pS}>Forfait annuel · s’ajoute à votre forfait pneus. Offert aux membres dès l’automne 2028, prix selon la marque et l’année.</p>
                    </div>
                    <Checks items={[
                        "1 changement d’huile par année, aux normes du constructeur (ou 1 entretien de véhicule électrique)",
                        "Inspection des freins à chaque changement de pneus (2 par année)",
                        "Vérification des liquides",
                        "Historique d’entretien daté, gardé par KORR",
                        "Réparations de freins sur soumission écrite que vous approuvez, rabais membre appliqué",
                    ]} />
                    <p style={smallS}>Le travail est fait par un garage spécialisé ou un concessionnaire partenaire. Indiquez votre intérêt sur la liste d’attente.</p>
                </div>
            </section>
        </>
    )
}

function PneusEtMags() {
    return (
        <>
            <Hero eyebrow="Pneus, mags et réparations" title="Vous achetez chez KORR. Le réseau s’occupe du reste."
                lead="Pneus et mags au prix membre, posés au garage partenaire lors de votre créneau. Réparation et remise à neuf de jantes par des ateliers spécialisés, suivies par KORR." />
            <section style={section(32)}>
                <div style={wrap}>
                    <Cards items={[
                        ["Hiver, été, quatre saisons", "Demandez votre prix en ligne : commandés par KORR, livrés et posés au garage partenaire lors de votre créneau.", "PNEUS"],
                        ["D’origine", "Mags d’origine du constructeur (OEM), dimensions et déports vérifiés pour votre véhicule, toutes marques, Tesla et électriques compris.", "MAGS"],
                        ["Retouche et remise à neuf", "Éraflures de trottoir, corrosion, voilage léger : estimation photo en ligne, puis soumission d’un atelier partenaire, suivie par KORR.", "RÉPARATION DE JANTES"],
                    ]} />
                </div>
            </section>
            <section style={section()}>
                <div style={{ ...wrap, ...grid(340), gap: 48, alignItems: "start" }}>
                    <div>
                        <Head id="prix" eyebrow="Acheter en ligne" title="Pneus et mags au prix KORR."
                            lead="Choisissez le produit, indiquez votre véhicule et la dimension : KORR vous répond par courriel avec le prix, ou le prix membre si vous êtes membre. Les pneus et les mags sont livrés et posés au garage partenaire lors de votre créneau." />
                        <Checks items={[
                            "Pneus d’hiver, d’été ou quatre saisons, toutes marques.",
                            "Mags d’origine (OEM), seuls ou en ensemble avec pneus montés : dimensions et déport vérifiés. Pas de mags après-marché.",
                            "Paiement en ligne sécurisé à partir du lancement d’avril 2027.",
                        ]} />
                        <p style={{ ...smallS, marginTop: 20 }}>Prix avant taxes, selon la disponibilité chez le distributeur. Pose et équilibrage des pneus au prix du garage partenaire.</p>
                    </div>
                    <QuoteForm />
                </div>
            </section>
            <section style={section()}>
                <div style={{ ...wrap, ...grid(340), gap: 48, alignItems: "start" }}>
                    <div>
                        <Head id="estimation" eyebrow="Estimation photo" title="Une éraflure ? Envoyez une photo."
                            lead="Photographiez votre jante : nous classons le dommage et vous envoyons une fourchette de prix par jante, validée par KORR." />
                        <img src={IMG + "wheel-v2.webp"} alt="Gros plan d’une jante en alliage photographiée au téléphone pour une estimation" loading="lazy"
                            style={{ width: "100%", aspectRatio: "16 / 10", objectFit: "cover", borderRadius: 24, display: "block", marginBottom: 20 }} />
                        <ol style={{ margin: "0 0 20px", paddingLeft: 20, display: "grid", gap: 10, font: "400 16px/1.5 Inter, sans-serif", color: "#D2D2D7" }}>
                            <li>Vous envoyez de 1 à 4 photos de la jante (véhicule dont vous êtes propriétaire).</li>
                            <li>Le dommage est classé, puis vérifié par KORR.</li>
                            <li>Vous recevez une fourchette indicative par courriel, en général dans un jour ouvrable.</li>
                        </ol>
                        <p style={smallS}>Fourchette indicative, avant taxes : le prix final est celui de la soumission écrite de l’atelier partenaire, après examen de la jante, et vous l’acceptez ou non avant tout travail. Une jante fissurée se remplace et ne se répare pas.</p>
                    </div>
                    <RimForm />
                </div>
            </section>
            <section style={section(48)}>
                <div style={wrap}>
                    <Head eyebrow="Réparation de jantes" title="Vous approuvez avant chaque travail." />
                    <Cards numbered items={[
                        ["Constat", "Le dommage est photographié lors de votre changement de saison, ou vous nous envoyez vos photos."],
                        ["Soumission", "Un atelier partenaire chiffre la réparation. Vous recevez le prix, rabais membre appliqué."],
                        ["Approbation", "Aucun travail sans votre accord écrit."],
                        ["Retour", "La jante réparée est posée à votre prochain créneau."],
                    ]} />
                    <p style={{ ...smallS, marginTop: 20 }}>Les commandes seront traitées à partir du printemps 2027.</p>
                </div>
            </section>
        </>
    )
}

function FinDeBail() {
    return (
        <>
            <Hero eyebrow="Forfait Fin de bail" title="Rendez votre véhicule avec un dossier complet."
                lead="Les grilles de retour des loueurs facturent les dommages au véhicule : carrosserie, pare-brise, intérieur, jantes et pneus. KORR garde un historique daté pendant tout le bail, coordonne les réparations et vous laisse le temps d’agir avant l’inspection du loueur."
                image="wheel-v2.webp" alt="Gros plan d’une jante en alliage photographiée au téléphone pour une estimation" />
            <section style={section(32)}>
                <div style={wrap}>
                    <Cards items={[
                        ["Changements et entreposage", "2 par an · 1 jeu de 4 pneus"],
                        ["Inspection du véhicule complet", "60 jours avant la restitution"],
                        ["Rapport", "Photos et vidéo datées"],
                        ["Remise à neuf des jantes", "Jusqu’à 4 jantes incluses"],
                        ["Autres réparations", "Coordonnées par KORR, sur soumission"],
                        ["Pneus et jantes", "Prix membre · 15 % de rabais sur les jantes"],
                    ]} />
                </div>
            </section>
            <section style={section(64)}>
                <div style={{ ...wrap, ...grid(320) }}>
                    <div style={card}>
                        <p style={eyebrowS}>Ce que le forfait fait</p>
                        <Checks items={[
                            "Documente l’état de votre véhicule, jantes et pneus compris, à chaque changement",
                            "Vous laisse 60 jours pour faire réparer avant l’inspection du loueur",
                            "Coordonne les réparations : carrosserie, pare-brise, esthétique et jantes",
                            "Vous donne un dossier daté à présenter en cas de désaccord",
                        ]} />
                    </div>
                    <div style={card}>
                        <p style={{ ...eyebrowS, color: "#86868B" }}>Ce qu’il ne promet pas</p>
                        <Checks minus items={[
                            "Il ne remplace pas l’inspection du loueur",
                            "Il ne garantit pas l’absence de frais au retour",
                            "Seules 4 jantes sont remises à neuf dans le forfait ; les autres réparations sont sur soumission",
                            "Un 2e jeu de pneus est facturé en supplément",
                        ]} />
                    </div>
                </div>
            </section>
            <section style={section()}>
                <div style={{ ...wrap, maxWidth: 900 }}>
                    <Head id="diagnostic" eyebrow="Diagnostic gratuit · 2 minutes" title="Où en est votre véhicule ?"
                        lead="Dix questions sur l’état de votre véhicule : carrosserie, pare-brise, intérieur, jantes et pneus. Vous recevez un rapport daté, un calendrier à rebours avant le retour et deux rappels : 60 et 30 jours avant la fin du bail." />
                    <LeaseForm />
                    <p style={{ ...smallS, marginTop: 16 }}>Autodiagnostic indicatif. Il ne remplace pas l’inspection du loueur et ne garantit pas l’absence de frais au retour.</p>
                </div>
            </section>
            <section style={section(48)}>
                <div style={{ ...wrap, maxWidth: 900 }}>
                    <Head id="verifier" eyebrow="Vérifier un rapport" title="Un rapport KORR se vérifie."
                        lead="Entrez le code inscrit sur le rapport pour confirmer qu’il est authentique. Aucun renseignement personnel n’est affiché." />
                    <VerifyForm />
                    <div style={{ ...card, marginTop: 32 }}>
                        <p style={eyebrowS}>KORR Trace</p>
                        <p style={{ ...pS, color: "#D2D2D7" }}>Chaque visite produit un rapport daté, vérifiable par code QR.</p>
                        <a href={loc("/fonctionnement#korr-trace")} style={{ display: "inline-block", marginTop: 12, color: ACCENT, font: "600 15px Inter, sans-serif", textDecoration: "none" }}>Voir comment →</a>
                    </div>
                </div>
            </section>
        </>
    )
}

function Entreprises() {
    return (
        <>
            <Hero eyebrow="Entreprises et flottes" title="Toute la flotte, sans gérer un seul garage."
                lead="Créneaux réservés par véhicule, entreposage, une seule facture et un rapport de conformité. Planifié hors des pointes d’octobre et d’avril."
                image="storage-v2.webp" alt="Allée d’entrepôt de pneus, chaque ensemble étiqueté par code QR" />
            <section style={section(32)}>
                <div style={wrap}>
                    <Cards items={[
                        ["Portail entreprise centralisé", "Tous vos véhicules, leurs créneaux et leur historique au même endroit.", "PORTAIL"],
                        ["Au garage ou sur votre site", "Au garage partenaire de votre secteur, ou sur votre site par un partenaire sous-traitant, selon le secteur et la taille de la flotte.", "SERVICE"],
                        ["Une facture, payée d’avance", "Une seule facture consolidée pour toute la flotte, réglée avant la saison.", "FACTURATION"],
                        ["Rapport de conformité", "L’état des pneus de chaque véhicule, daté, pour vos obligations du 1er décembre.", "CONFORMITÉ"],
                    ]} />
                </div>
            </section>
            <Band title="Parlons de votre flotte." text="Indiquez le nombre de véhicules sur la liste d’attente : nous vous écrivons avant la prévente de mars 2027." label="Parlons de votre flotte" />
        </>
    )
}

function Garages() {
    return (
        <>
            <Hero eyebrow="Vous êtes un garage ?" title="Des clients planifiés des semaines d’avance."
                lead="KORR remplit vos plages disponibles avec des membres déjà réservés et vous paie le jour même. Vous faites ce que vous faites le mieux."
                image="garage-v3.webp" alt="Technicien d’un garage partenaire serrant les écrous d’une roue, voiture sur le pont" />
            <section style={section(32)}>
                <div style={wrap}>
                    <Cards numbered items={[
                        ["Volume prévisible", "Des voitures planifiées d’avance, réparties sur les plages que vous choisissez. Vous remplissez vos creux, pas vos pics."],
                        ["Zéro prise de rendez-vous", "KORR gère la réservation, les rappels, la relation client et la facturation client."],
                        ["Payé le jour même", "Le scan du code QR de fin de service valide le travail : les services validés avant 17 h sont payés le jour même."],
                        ["Travaux additionnels", "Alignement, pneus neufs, freins : sur soumission écrite approuvée par le client."],
                    ]} />
                </div>
            </section>
            <section style={section()}>
                <div style={{ ...wrap, ...grid(340), gap: 48, alignItems: "start" }}>
                    <Head id="partenaire" eyebrow="Rejoignez le réseau" title="Devenir garage partenaire."
                        lead="Nous sélectionnons quelques garages indépendants et réseaux partenaires par secteur, du centre-ville de Montréal jusqu’à Vaudreuil-Soulanges. Les candidatures sont évaluées en décembre 2026." />
                    <PartnerForm />
                </div>
            </section>
        </>
    )
}

const FAQ_ITEMS = [
    { q: "Quand le service commence-t-il ?", a: "Le lancement est prévu en avril 2027. Inscrivez-vous à la liste d’attente pour réserver votre place et être averti en premier." },
    { q: "Est-ce que KORR change mes pneus ?", a: "Non. KORR réserve et coordonne. Le travail est fait par un garage partenaire, qui en assume la responsabilité." },
    { q: "Pourquoi pas directement chez un garage ?", a: "En octobre et en novembre, les créneaux disparaissent. Avec KORR, vos dates sont réservées dès l’inscription, vos pneus sont entreposés et votre historique reste au même endroit." },
    { q: "Quels secteurs sont desservis ?", a: "Du centre-ville de Montréal à Vaudreuil-Soulanges pour la première saison, par un réseau de garages partenaires. La liste sera publiée avant la prévente." },
    { q: "Est-ce que je paie au garage ?", a: "Non. Vous scannez votre code QR sur place : le service est validé et réglé par votre forfait. Rien à payer au comptoir." },
    { q: "Mon véhicule est-il admissible ?", a: "Oui, toutes les marques et tous les modèles sont acceptés." },
    { q: "Où sont entreposés mes pneus ?", a: "Avec les forfaits Sérénité et Prestige, vos pneus sont lavés, étiquetés et rangés dans un entrepôt sécurisé. Chaque entrée et chaque sortie est scannée et datée." },
    { q: "Et si le garage trouve un autre problème ?", a: "Vous recevez les photos et une évaluation écrite. Aucun travail additionnel (alignement, pneus neufs, freins) n’est fait sans une soumission que vous avez approuvée." },
    { q: "Comment je me rends au garage et j’en reviens ?", a: "En Uber. Le trajet aller-retour est inclus avec Prestige et Entreprises, et offert à l’acte avec les autres forfaits." },
    { q: "Combien coûtent les forfaits ?", a: "Les prix seront dévoilés en mars 2027, taxes en sus. Les membres de la liste d’attente les recevront en premier." },
    { q: "La liste d’attente m’engage-t-elle ?", a: "Non. Elle vous donne un accès prioritaire à la prévente. Vous pouvez vous désinscrire en tout temps." },
    { q: "Éliminez-vous les frais de fin de bail ?", a: "Non, personne ne peut le promettre. Le forfait Fin de bail documente l’état de votre véhicule et prévoit une inspection 60 jours avant la restitution, pour vous laisser le temps d’agir." },
    { q: "Quelles sont les dates de l’obligation au Québec ?", a: "Les pneus d’hiver sont obligatoires du 1er décembre au 15 mars." },
]

function Faq() {
    return (
        <>
            <div style={{ height: 52 }} />
            <KorrFAQ eyebrow="Questions fréquentes" title="Ce qu’on nous demande." items={FAQ_ITEMS} />
            <section style={section(32)}>
                <p style={{ ...pS, textAlign: "center" }}>
                    Une question qui n’est pas ici ? <a href="mailto:services@korrauto.com" style={{ color: ACCENT }}>services@korrauto.com</a>
                </p>
            </section>
        </>
    )
}

function ListeAttente() {
    // L’offre « Membre exclusif · 200 places » et le parrainage sont affichés par KorrWaitlist, juste en dessous.
    return <div style={{ height: 52 }} />
}

// ───── Accueil : blocs repris de l'ancien accueil KTX (chiffres, photos, 400 $, cohue, rappel) ─────

function Reveal({ image, alt, eyebrow, title, text, flip }: { image: string; alt: string; eyebrow: string; title: string; text: string; flip?: boolean }) {
    return (
        <div style={{ ...grid(320), gap: 48, alignItems: "center", direction: flip ? "rtl" : "ltr" }}>
            <img src={IMG + image} alt={alt} loading="lazy" style={{ width: "100%", aspectRatio: "16 / 10", objectFit: "cover", borderRadius: 28, display: "block" }} />
            <div style={{ direction: "ltr" }}>
                <p style={eyebrowS}>{eyebrow}</p>
                <h2 style={h2S}>{title}</h2>
                <p style={leadS}>{text}</p>
            </div>
        </div>
    )
}

/** Inséré par KorrBento, sur l'accueil seulement. */
// ───── Film d'accueil : la publicité KORR (77 s, voix off et musique) ─────

const FILM_VIDEO = { fr: IMG + "video/korr-pub-fr.mp4", en: IMG + "video/korr-pub-en.mp4" }
const FILM_POSTER = IMG + "video/korr-pub-poster.webp"

function KorrFilm() {
    const L = lang() === "en" ? "en" : "fr"
    const vid = useRef<HTMLVideoElement>(null)
    const [playing, setPlaying] = useState(true)
    const [sound, setSound] = useState(false)
    const [pct, setPct] = useState(0)

    // Lecture muette en boucle quand le film est à l’écran, comme sur l’ancien site KTX.
    useEffect(() => {
        const v = vid.current
        if (!v || typeof IntersectionObserver === "undefined") return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false)
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && playing) v.play().catch(() => {})
            else v.pause()
        }, { threshold: 0.35 })
        io.observe(v)
        return () => io.disconnect()
    }, [playing, L])

    const toggleSound = () => {
        const v = vid.current
        if (!v) return
        if (sound) {
            v.muted = true
            setSound(false)
            return
        }
        v.muted = false
        v.currentTime = 0
        v.play().catch(() => {})
        setSound(true)
        setPlaying(true)
    }
    const togglePlay = () => {
        const v = vid.current
        if (!v) return
        if (playing) v.pause()
        else v.play().catch(() => {})
        setPlaying(!playing)
    }
    const btn = { height: 34, padding: "0 14px", borderRadius: 999, border: 0, background: "rgba(255,255,255,0.14)", backdropFilter: "blur(10px)", color: "#F5F5F7", font: "600 12px/1 Inter, sans-serif", letterSpacing: "0.08em", cursor: "pointer" }

    return (
        <section id="film" style={{ ...section(96), textAlign: "center" as const }}>
            <div style={wrap}>
                <p style={eyebrowS}>Le film</p>
                <h2 style={{ ...h2S, margin: 0 }}>KORR en une minute.</h2>
            </div>
            <div style={{ position: "relative", margin: "48px auto 0", maxWidth: 1200, borderRadius: 28, overflow: "hidden", background: "#000", aspectRatio: "16 / 9" }}>
                <video
                    key={L}
                    ref={vid}
                    src={FILM_VIDEO[L]}
                    poster={FILM_POSTER}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label="Film KORR"
                    onTimeUpdate={(e) => { const v = e.currentTarget; if (v.duration) setPct((v.currentTime / v.duration) * 100) }}
                    style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8 }}>
                    <button type="button" aria-pressed={sound} onClick={toggleSound} style={{ ...btn, ...(sound ? {} : { background: ACCENT, color: "#06120E" }) }}>
                        {sound ? (L === "en" ? "SOUND ON" : "SON ACTIVÉ") : L === "en" ? "TURN SOUND ON" : "ACTIVER LE SON"}
                    </button>
                    <button type="button" onClick={togglePlay} style={btn}>
                        {playing ? "PAUSE" : L === "en" ? "PLAY" : "LECTURE"}
                    </button>
                </div>
                <div style={{ position: "absolute", left: 20, right: 20, bottom: 18, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.22)", overflow: "hidden" }}>
                    <i style={{ display: "block", height: "100%", width: pct + "%", background: "#F5F5F7" }} />
                </div>
            </div>
        </section>
    )
}

export function HomeExtras() {
    useLang()
    useInter()
    const nums: [string, string][] = [
        ["2", "créneaux réservés dès l’inscription, automne et printemps"],
        ["1", "seul interlocuteur : KORR, du rappel au rapport"],
        ["0 $", "à payer au garage, un scan de code QR suffit"],
        ["60", "jours d’avance pour agir avant un retour de location"],
    ]
    return (
        <div style={{ width: "100%", background: "#050505", fontFamily: "Inter, sans-serif" }}>
            <KorrFilm />
            <section style={section(64)}>
                <div style={{ ...wrap, ...grid(220) }}>
                    {nums.map(([n, t]) => (
                        <div key={n} style={{ ...card, padding: 24 }}>
                            <div style={{ font: "600 clamp(44px, 6vw, 64px)/1 Inter, sans-serif", letterSpacing: "-0.04em", color: "#F5F5F7", marginBottom: 10 }}>{n}</div>
                            <p style={pS}>{t}</p>
                        </div>
                    ))}
                </div>
            </section>
            <section style={section(64)}>
                <div style={{ ...wrap, display: "grid", gap: 96 }}>
                    <Reveal image="storage-v2.webp" alt="Allée d’entrepôt de pneus, chaque ensemble étiqueté par code QR" eyebrow="Entreposage suivi par code QR"
                        title="Vos pneus dorment ici." text="Lavés, étiquetés, rangés. Chaque entrée et chaque sortie est datée. Plus de pneus dans le garage ni sur le balcon du condo." />
                    <Reveal flip image="garage-v3.webp" alt="Technicien d’un garage partenaire serrant les écrous d’une roue, voiture sur le pont" eyebrow="Garages partenaires sélectionnés"
                        title="Nos garages font le travail." text="Un réseau choisi du centre-ville de Montréal jusqu’à Vaudreuil-Soulanges. Votre créneau est bloqué bien avant novembre. KORR coordonne tout, vous arrivez à l’heure dite." />
                    <Reveal image="qr.webp" alt="Code QR affiché sur un téléphone, scanné au comptoir d’un garage partenaire" eyebrow="Validation par code QR"
                        title="Un scan. C’est réglé." text="Rien à payer sur place. Après la visite, votre rapport arrive sur votre téléphone : profondeur des pneus, photos datées, état des jantes." />
                    <div style={{ ...grid(320), gap: 48, alignItems: "center", direction: "rtl" }}>
                        <img src={IMG + "wheel-v2.webp"} alt="Gros plan d’une jante en alliage photographiée au téléphone pour une estimation" loading="lazy"
                            style={{ width: "100%", aspectRatio: "16 / 10", objectFit: "cover", borderRadius: 28, display: "block" }} />
                        <div style={{ direction: "ltr" }}>
                            <p style={eyebrowS}>Forfait Fin de bail</p>
                            <div style={{ font: "600 clamp(64px, 10vw, 112px)/1 Inter, sans-serif", letterSpacing: "-0.05em", color: "#F5F5F7" }}>400 $</div>
                            <h2 style={{ ...h2S, marginTop: 8 }}>Une éraflure peut coûter ça au retour.*</h2>
                            <p style={leadS}>KORR documente vos jantes à chaque changement et les inspecte 60 jours avant la restitution. Vous avez le temps d’agir, et un dossier daté en cas de désaccord.</p>
                            <a href="/fin-de-bail#diagnostic" style={{ ...btn(false), marginTop: 24 }}>Faire le diagnostic gratuit</a>
                            <p style={{ ...smallS, marginTop: 16 }}>* Par jante, selon la grille de retour d’un constructeur allemand. Ne remplace pas l’inspection du loueur et ne garantit pas l’absence de frais.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

/** Inséré par KorrAudience, sur l'accueil seulement : rappel du 1er décembre et appel final. */
export function HomeClosing() {
    useLang()
    useInter()
    return (
        <div style={{ width: "100%", background: "#050505", fontFamily: "Inter, sans-serif" }}>
            <section style={section()}>
                <div style={wrap}><WinterAlert /></div>
            </section>
            <section style={section(64)}>
                <div style={{ ...wrap, textAlign: "center" }}>
                    <p style={eyebrowS}>Lancement avril 2027</p>
                    <h2 style={{ ...h1S, fontSize: "clamp(36px, 5.6vw, 64px)" }}>La prochaine cohue, vous la regardez passer.</h2>
                    <p style={{ ...leadS, margin: "0 auto 28px" }}>Inscription gratuite et sans engagement. Accès prioritaire à la prévente de mars 2027.</p>
                    <a href="#liste-attente" style={btn()}>Rejoindre la liste d’attente</a>
                </div>
            </section>
        </div>
    )
}

const RENDER: Record<PageKey, () => any> = {
    fonctionnement: Fonctionnement,
    forfaits: Forfaits,
    "pneus-et-mags": PneusEtMags,
    "fin-de-bail": FinDeBail,
    entreprises: Entreprises,
    garages: Garages,
    faq: Faq,
    "liste-attente": ListeAttente,
}

/** Barre de navigation fixe, partagée par toutes les pages (y compris la confidentialité). */
export function KorrPageNav() {
    return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}>
            <KorrNav />
        </div>
    )
}

/** Contenu complet d'une page : navigation, contenu, liste d'attente (cible des boutons « #liste-attente »). */
export function KorrPageContent({ page }: { page: PageKey }) {
    useLang()
    useInter()
    const Body = RENDER[page] || Fonctionnement
    return (
        <div style={{ width: "100%", background: "#050505", fontFamily: "Inter, sans-serif", overflowX: "clip" }}>
            <KorrPageNav />
            <main>
                <Body />
            </main>
            <KorrWaitlist />
        </div>
    )
}
