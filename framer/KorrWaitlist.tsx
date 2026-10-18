/** @jsxRuntime classic */
/** @jsx korrH */
/** @jsxFrag KorrFragment */
import { useEffect, useRef, useState } from "react"
import { h as korrH, Fragment as KorrFragment, useLang, lang, tr } from "./KorrI18n.tsx"
// Référence explicite : sans elle, l’import utilisé seulement par le pragma JSX est retiré à la compilation.
void [korrH, KorrFragment]
import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { motion } from "framer-motion"

// KORR — liste d’attente (formulaire complet repris de KTX) + offre « Membre exclusif · 200 places » et parrainage.

const FONT = "https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&display=swap"
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

// Cloudflare Turnstile (clé publique) : le jeton est vérifié par l'API.
const API_BASE = "https://ktx-api.fly.dev"
const API_DEFAULT = API_BASE + "/v1/waitlist"
const TS_SITEKEY = "0x4AAAAAAFTOarAaXssiIsxI"
const TS_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
function loadTurnstile(): Promise<any> {
    const w = window as any
    if (w.turnstile) return Promise.resolve(w.turnstile)
    return new Promise((resolve, reject) => {
        let s = document.querySelector("script[data-korr-ts]") as HTMLScriptElement | null
        if (!s) {
            s = document.createElement("script")
            s.src = TS_SCRIPT
            s.async = true
            s.setAttribute("data-korr-ts", "")
            document.head.appendChild(s)
        }
        s.addEventListener("load", () => resolve(w.turnstile))
        s.addEventListener("error", reject)
    })
}

const ACCENT = "#3FBF9F"
const PLANS = ["Essentiel", "Sérénité", "Prestige", "Fin de bail", "Entreprise / flotte", "Garage partenaire", "Je ne sais pas encore"]
// Valeurs acceptées par l'API : Particulier, Entreprise, Garage, Autre
const PROFILES = ["Particulier", "Entreprise", "Garage", "Autre"]
const SOURCES = ["Réseaux sociaux", "Bouche-à-oreille", "Recherche Google", "Garage", "Autre"]
const DIAMETERS = ["15 po", "16 po", "17 po", "18 po", "19 po", "20 po", "21 po", "22 po", "Je ne sais pas"]
const ERRORS: Record<number, string> = {
    400: "Vérifiez les champs obligatoires et votre courriel.",
    403: "La vérification anti-robot a échoué. Rechargez la page et réessayez.",
    422: "Cochez la case de consentement pour continuer.",
    429: "Trop d’envois en peu de temps. Réessayez dans quelques minutes.",
}

const field = {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#161618",
    color: "#F5F5F7",
    font: "400 16px Inter, sans-serif",
    outline: "none",
}
const label = { font: "500 13px Inter, sans-serif", color: "#A1A1A6", marginBottom: 8, display: "block" }
const group = { font: "600 15px Inter, sans-serif", color: "#F5F5F7", margin: "8px 0 0" }
const row = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }
const card = { borderRadius: 24, padding: 24, background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.08)" }
const small = { font: "400 13px/1.5 Inter, sans-serif", color: "#86868B", margin: 0 }

type Opt = { slug: string; name: string }
const cache: Record<string, any> = {}
async function getList(path: string): Promise<any[]> {
    if (cache[path]) return cache[path]
    const r = await fetch(API_BASE + path)
    if (!r.ok) throw new Error("indisponible")
    const j = await r.json()
    cache[path] = j.data || []
    return cache[path]
}

function Sel({ id, value, onChange, options, placeholder = "Choisir…", disabled = false, required = false }: any) {
    return (
        <select id={id} value={value} disabled={disabled} required={required} onChange={(e) => onChange(e.target.value)}
            style={{ ...field, appearance: "none", opacity: disabled ? 0.5 : 1 }}>
            <option value="">{placeholder}</option>
            {options.map(([v, l]: [string, string]) => (
                <option key={v} value={v}>{l}</option>
            ))}
        </select>
    )
}

function Pills({ name, value, onChange, options }: { name: string; value: string; onChange: (v: string) => void; options: string[] }) {
    return (
        <div role="radiogroup" aria-label={name} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {options.map((o) => {
                const on = value === o
                return (
                    <button key={o} type="button" role="radio" aria-checked={on} onClick={() => onChange(on ? "" : o)}
                        style={{
                            font: "500 14px Inter, sans-serif", padding: "10px 16px", borderRadius: 999, cursor: "pointer",
                            color: on ? "#050505" : "#F5F5F7", background: on ? ACCENT : "#161618",
                            border: on ? "1px solid " + ACCENT : "1px solid rgba(255,255,255,0.14)",
                        }}>
                        {o}
                    </button>
                )
            })}
        </div>
    )
}

/** Offre réservée aux 200 premiers membres et conditions (prévente + parrainage obligatoire de 2 personnes). */
export function MemberOffer() {
    useLang()
    const check = (t: string) => (
        <li style={{ display: "flex", gap: 10, font: "400 15px/1.5 Inter, sans-serif", color: "#D2D2D7" }}>
            <span style={{ color: ACCENT }}>✓</span>
            <span>{t}</span>
        </li>
    )
    return (
        <div style={{ display: "grid", gap: 14, marginTop: 32 }}>
            <div style={{ ...card, border: "1px solid rgba(63,191,159,0.45)" }}>
                <div style={{ font: "600 13px Inter, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" as const, color: ACCENT, marginBottom: 10 }}>
                    Membre exclusif · 200 places
                </div>
                <div style={{ font: "600 22px/1.2 Inter, sans-serif", color: "#F5F5F7", marginBottom: 14 }}>
                    Réservé aux 200 premiers inscrits.
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
                    {check("Accès prioritaire à la prévente de mars 2027")}
                    {check("Tarif exclusif conservé tant que vous restez membre")}
                    {check("Aucun paiement avant la prévente")}
                </ul>
            </div>
            <div style={card}>
                <div style={{ font: "600 15px Inter, sans-serif", color: "#F5F5F7", marginBottom: 10 }}>Pour obtenir le statut</div>
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, font: "400 15px/1.5 Inter, sans-serif", color: "#D2D2D7" }}>
                    <li>Adhérer à la prévente de mars 2027</li>
                    <li>Parrainer 2 personnes qui s’inscrivent à la liste d’attente (obligatoire)</li>
                </ol>
                <p style={{ ...small, marginTop: 12 }}>
                    Votre lien de parrainage personnel arrive par courriel après votre inscription. Un paiement manqué ou un abonnement en pause retire automatiquement le statut : la place passe au suivant sur la liste.
                </p>
            </div>
            <div style={card}>
                <div style={{ font: "600 15px Inter, sans-serif", color: "#F5F5F7", marginBottom: 10 }}>Les 200 places sont prises ?</div>
                <p style={{ margin: 0, font: "400 15px/1.5 Inter, sans-serif", color: "#D2D2D7" }}>
                    Inscrivez-vous quand même : vous entrez sur la liste d’attente de la clientèle premium. Chaque place qui se libère est offerte à la personne suivante, dans l’ordre d’inscription.
                </p>
            </div>
        </div>
    )
}

/**
 * KORR — liste d'attente, envoyée à l'API (POST /v1/waitlist)
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function KorrWaitlist({ eyebrow, title, text, endpoint, consentText, button, success, showOffer }) {
    useLang()
    useInter()
    const canvas = RenderTarget.current() === RenderTarget.canvas
    const [form, setForm] = useState({
        prenom: "", nom: "", courriel: "", codePostal: "", profil: "", forfait: "Sérénité",
        make: "", makeName: "", model: "", modelName: "", year: "",
        flotte: "", source: "", bail: "", jeux: "", diametre: "", runFlat: "", entretien: false,
        consentement: false, website: "",
    })
    const [makes, setMakes] = useState<Opt[]>([])
    const [models, setModels] = useState<Opt[]>([])
    const [years, setYears] = useState<number[]>([])
    const [freeVehicle, setFreeVehicle] = useState(false)
    const [ref, setRef] = useState("")
    const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle")
    const [msg, setMsg] = useState("")
    const [token, setToken] = useState("")
    const tsBox = useRef<HTMLDivElement>(null)
    const tsId = useRef<string | null>(null)
    const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

    useEffect(() => {
        const w = window as any
        if (w.__korrPlan) set("forfait", w.__korrPlan)
        const on = (e: any) => set("forfait", e.detail)
        window.addEventListener("korr-plan", on)
        const r = new URLSearchParams(window.location.search).get("ref")
        if (r) setRef(r.toUpperCase().slice(0, 20))
        return () => window.removeEventListener("korr-plan", on)
    }, [])

    useEffect(() => {
        if (canvas) return
        getList("/v1/vehicles/makes").then(setMakes).catch(() => setFreeVehicle(true))
    }, [canvas])
    useEffect(() => {
        setModels([])
        if (form.make) getList(`/v1/vehicles/models?make=${form.make}`).then(setModels).catch(() => setFreeVehicle(true))
    }, [form.make])
    useEffect(() => {
        setYears([])
        if (form.make && form.model) getList(`/v1/vehicles/years?make=${form.make}&model=${form.model}`).then(setYears).catch(() => setFreeVehicle(true))
    }, [form.make, form.model])

    useEffect(() => {
        if (canvas || state === "done") return
        let alive = true
        loadTurnstile()
            .then((ts) => {
                if (!alive || !tsBox.current || tsId.current) return
                tsId.current = ts.render(tsBox.current, {
                    sitekey: TS_SITEKEY,
                    theme: "dark",
                    language: lang(),
                    callback: (t: string) => setToken(t),
                    "expired-callback": () => setToken(""),
                    "error-callback": () => setToken(""),
                })
            })
            .catch(() => setMsg("La vérification anti-robot n’a pas pu se charger. Désactivez le bloqueur de contenu ou réessayez."))
        return () => {
            alive = false
            const ts = (window as any).turnstile
            if (ts && tsId.current) ts.remove(tsId.current)
            tsId.current = null
        }
    }, [canvas, state === "done"])

    const submit = async (e: any) => {
        e.preventDefault()
        if (!form.prenom.trim() || !form.nom.trim()) return setMsg("Entrez votre prénom et votre nom.")
        if (!/^\S+@\S+\.\S+$/.test(form.courriel)) return setMsg("Entrez un courriel valide.")
        if (!/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(form.codePostal.trim())) return setMsg("Entrez un code postal valide (ex. J7V 0A1).")
        if (!form.profil) return setMsg("Choisissez votre profil.")
        if (!form.consentement) return setMsg("Cochez la case de consentement pour continuer.")
        if (!token) return setMsg("Patientez une seconde : la vérification anti-robot se termine.")
        setMsg("")
        const q = new URLSearchParams(window.location.search)
        const payload = {
            prenom: form.prenom.trim(),
            nom: form.nom.trim(),
            courriel: form.courriel.trim(),
            code_postal: form.codePostal.trim(),
            profil: form.profil,
            marque: form.makeName || undefined,
            modele: form.modelName || undefined,
            annee: form.year || undefined,
            nb_vehicules: form.flotte || undefined,
            source: form.source || undefined,
            bail: form.bail || (form.forfait === "Fin de bail" ? "Oui" : undefined),
            jeux_jantes: form.jeux || undefined,
            diametre: form.diametre || undefined,
            run_flat: form.runFlat || undefined,
            entretien: form.entretien ? "Oui" : undefined,
            consentement: "oui",
            texte_consentement: tr(consentText),
            langue: lang(),
            ref: ref || undefined,
            utm_source: q.get("utm_source") || undefined,
            utm_campaign: q.get("utm_campaign") || undefined,
            website: form.website,
            turnstile: token,
        }
        try {
            setState("sending")
            const r = await fetch(endpoint || API_DEFAULT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (!r.ok) {
                setState("error")
                setMsg(ERRORS[r.status] || "L’envoi a échoué. Réessayez dans un instant.")
                const ts = (window as any).turnstile
                if (ts && tsId.current) ts.reset(tsId.current)
                setToken("")
                return
            }
            setState("done")
        } catch {
            setState("error")
            setMsg("L’envoi a échoué. Vérifiez votre connexion et réessayez.")
        }
    }

    const name = (list: Opt[], slug: string) => list.find((o) => o.slug === slug)?.name || ""
    const business = form.profil === "Entreprise" || form.forfait === "Entreprise / flotte"

    return (
        <section id="liste-attente" style={{ width: "100%", background: "#050505", padding: "clamp(96px, 12vw, 160px) clamp(16px, 4vw, 48px)", boxSizing: "border-box", scrollMarginTop: 52 }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))", gap: "clamp(40px, 6vw, 80px)", alignItems: "start" }}>
                <div>
                    <div style={{ font: "600 17px Inter, sans-serif", color: ACCENT, marginBottom: 16 }}>{eyebrow}</div>
                    <h2 style={{
                        margin: "0 0 20px", font: "600 clamp(40px, 6vw, 80px)/0.98 Inter, sans-serif", letterSpacing: "-0.04em",
                        background: "linear-gradient(180deg, #FFFFFF 0%, #E5E5E7 55%, #8E8E93 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
                    }}>{title}</h2>
                    <p style={{ margin: 0, font: "400 19px/1.45 Inter, sans-serif", color: "#A1A1A6", maxWidth: 460 }}>{text}</p>
                    {showOffer ? <MemberOffer /> : null}
                </div>

                <div style={{ borderRadius: 28, padding: "clamp(24px, 3vw, 36px)", background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {state === "done" ? (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 12, padding: "24px 0" }}>
                            <div style={{ width: 48, height: 48, borderRadius: 24, background: "rgba(63,191,159,0.15)", display: "grid", placeItems: "center", color: ACCENT, font: "600 22px Inter, sans-serif" }}>✓</div>
                            <div style={{ font: "600 24px Inter, sans-serif", color: "#F5F5F7" }}>{form.prenom ? "Merci, " + form.prenom + "." : "Merci."}</div>
                            <div style={{ font: "400 16px/1.5 Inter, sans-serif", color: "#A1A1A6" }}>{success}</div>
                            <div style={{ font: "500 15px/1.5 Inter, sans-serif", color: "#F5F5F7" }}>Prochaine étape : partagez votre lien de parrainage avec 2 personnes pour obtenir le statut de membre exclusif.</div>
                        </motion.div>
                    ) : (
                        <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                            <p style={{ ...small, color: "#A1A1A6" }}>Quatre champs obligatoires, 30 secondes. Le reste nous aide à préparer votre forfait.</p>
                            {ref ? <p style={{ ...small, color: ACCENT }}>{"Parrainé par le code"} {ref}</p> : null}

                            <div style={group}>Vos informations</div>
                            <div style={row}>
                                <div>
                                    <label style={label} htmlFor="korr-prenom">Prénom *</label>
                                    <input id="korr-prenom" style={field} value={form.prenom} onChange={(e) => set("prenom", e.target.value)} autoComplete="given-name" />
                                </div>
                                <div>
                                    <label style={label} htmlFor="korr-nom">Nom *</label>
                                    <input id="korr-nom" style={field} value={form.nom} onChange={(e) => set("nom", e.target.value)} autoComplete="family-name" />
                                </div>
                            </div>
                            <div>
                                <label style={label} htmlFor="korr-mail">Courriel *</label>
                                <input id="korr-mail" type="email" required style={field} value={form.courriel} onChange={(e) => set("courriel", e.target.value)} autoComplete="email" />
                            </div>
                            <div style={row}>
                                <div>
                                    <label style={label} htmlFor="korr-cp">Code postal *</label>
                                    <input id="korr-cp" style={field} value={form.codePostal} onChange={(e) => set("codePostal", e.target.value.toUpperCase())} placeholder="J7V 0A1" autoComplete="postal-code" />
                                </div>
                                <div>
                                    <label style={label} htmlFor="korr-profil">Profil *</label>
                                    <Sel id="korr-profil" value={form.profil} onChange={(v: string) => set("profil", v)} options={PROFILES.map((p) => [p, p])} />
                                </div>
                            </div>
                            <div>
                                <label style={label} htmlFor="korr-plan">Forfait qui vous intéresse</label>
                                <Sel id="korr-plan" value={form.forfait} onChange={(v: string) => set("forfait", v)} options={PLANS.map((p) => [p, p])} />
                            </div>

                            <div style={group}>Votre véhicule et vos besoins</div>
                            {freeVehicle ? (
                                <div style={row}>
                                    <div>
                                        <label style={label} htmlFor="korr-marque">Marque</label>
                                        <input id="korr-marque" style={field} value={form.makeName} onChange={(e) => set("makeName", e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={label} htmlFor="korr-modele">Modèle</label>
                                        <input id="korr-modele" style={field} value={form.modelName} onChange={(e) => set("modelName", e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={label} htmlFor="korr-annee">Année</label>
                                        <input id="korr-annee" inputMode="numeric" maxLength={4} style={field} value={form.year} onChange={(e) => set("year", e.target.value.replace(/\D/g, ""))} />
                                    </div>
                                </div>
                            ) : (
                                <div style={row}>
                                    <div>
                                        <label style={label} htmlFor="korr-marque">Marque</label>
                                        <Sel id="korr-marque" value={form.make} options={makes.map((o) => [o.slug, o.name])}
                                            onChange={(s: string) => setForm((f) => ({ ...f, make: s, makeName: name(makes, s), model: "", modelName: "", year: "" }))} />
                                    </div>
                                    <div>
                                        <label style={label} htmlFor="korr-modele">Modèle</label>
                                        <Sel id="korr-modele" value={form.model} disabled={!form.make} placeholder={form.make ? "Choisir…" : "Choisir la marque d’abord"}
                                            options={models.map((o) => [o.slug, o.name])}
                                            onChange={(s: string) => setForm((f) => ({ ...f, model: s, modelName: name(models, s), year: "" }))} />
                                    </div>
                                    <div>
                                        <label style={label} htmlFor="korr-annee">Année</label>
                                        <Sel id="korr-annee" value={form.year} disabled={!form.model} placeholder={form.model ? "Choisir…" : "Choisir le modèle d’abord"}
                                            options={years.map((y) => [String(y), String(y)])} onChange={(s: string) => set("year", s)} />
                                    </div>
                                </div>
                            )}
                            <div style={row}>
                                {business ? (
                                    <div>
                                        <label style={label} htmlFor="korr-flotte">Nombre de véhicules (flotte)</label>
                                        <input id="korr-flotte" inputMode="numeric" style={field} value={form.flotte} onChange={(e) => set("flotte", e.target.value.replace(/\D/g, "").slice(0, 5))} />
                                    </div>
                                ) : null}
                                <div>
                                    <label style={label} htmlFor="korr-source">Comment avez-vous connu KORR ?</label>
                                    <Sel id="korr-source" value={form.source} onChange={(v: string) => set("source", v)} options={SOURCES.map((s) => [s, s])} />
                                </div>
                            </div>

                            <details style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14 }}>
                                <summary style={{ ...group, cursor: "pointer", margin: 0 }}>Facultatif · pour préparer votre forfait</summary>
                                <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
                                    <div>
                                        <span style={label}>Véhicule loué (bail) ?</span>
                                        <Pills name="Véhicule loué (bail) ?" value={form.bail} onChange={(v) => set("bail", v)} options={["Oui", "Non"]} />
                                    </div>
                                    <div>
                                        <span style={label}>Combien de jeux de pneus avez-vous déjà montés sur jantes ?</span>
                                        <Pills name="Jeux de pneus montés sur jantes" value={form.jeux} onChange={(v) => set("jeux", v)} options={["1 jeu", "2 jeux", "Je ne sais pas"]} />
                                    </div>
                                    <div>
                                        <label style={label} htmlFor="korr-diam">Diamètre de vos jantes</label>
                                        <Sel id="korr-diam" value={form.diametre} onChange={(v: string) => set("diametre", v)} options={DIAMETERS.map((d) => [d, d])} />
                                    </div>
                                    <div>
                                        <span style={label}>Vos pneus sont-ils run-flat ?</span>
                                        <Pills name="Run-flat" value={form.runFlat} onChange={(v) => set("runFlat", v)} options={["Oui", "Non", "Je ne sais pas"]} />
                                    </div>
                                    <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", font: "400 14px/1.5 Inter, sans-serif", color: "#D2D2D7" }}>
                                        <input type="checkbox" checked={form.entretien} onChange={(e) => set("entretien", e.target.checked)} style={{ marginTop: 3, accentColor: ACCENT }} />
                                        <span>Je suis intéressé(e) par un forfait d’entretien annuel</span>
                                    </label>
                                </div>
                            </details>

                            {/* Champ piège : invisible pour les humains, rempli par les robots */}
                            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website}
                                onChange={(e) => set("website", e.target.value)} style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />
                            <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", font: "400 13px/1.5 Inter, sans-serif", color: "#A1A1A6" }}>
                                <input type="checkbox" checked={form.consentement} onChange={(e) => set("consentement", e.target.checked)} style={{ marginTop: 3, accentColor: ACCENT }} />
                                <span>{consentText}</span>
                            </label>
                            <div ref={tsBox} style={{ minHeight: canvas ? 0 : 65 }} />
                            {msg ? <div role="alert" style={{ font: "500 14px Inter, sans-serif", color: "#FF8A80" }}>{msg}</div> : null}
                            <button type="submit" disabled={state === "sending"} style={{
                                font: "600 16px Inter, sans-serif", color: "#050505", background: ACCENT, border: "none", borderRadius: 999,
                                padding: "16px 24px", cursor: "pointer", opacity: state === "sending" ? 0.6 : 1, boxShadow: "0 12px 40px rgba(63,191,159,0.25)",
                            }}>
                                {state === "sending" ? "Envoi…" : button}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    )
}

KorrWaitlist.defaultProps = {
    eyebrow: "Liste d’attente",
    title: "Réservez votre place pour avril 2027.",
    text: "Les membres de la liste d’attente reçoivent les prix en premier, en mars 2027, et choisissent leurs créneaux avant tout le monde.",
    endpoint: API_DEFAULT,
    consentText:
        "J’accepte que KORR utilise ces renseignements pour m’informer du lancement et de ses forfaits, conformément à sa politique de confidentialité. Je peux retirer mon consentement en tout temps.",
    button: "Rejoindre la liste d’attente",
    success: "Votre place est réservée. Confirmez votre inscription avec le lien reçu par courriel : vous y trouverez aussi votre lien de parrainage.",
    showOffer: true,
}

addPropertyControls(KorrWaitlist, {
    eyebrow: { type: ControlType.String, title: "Accroche" },
    title: { type: ControlType.String, title: "Titre" },
    text: { type: ControlType.String, displayTextArea: true, title: "Texte" },
    endpoint: { type: ControlType.String, title: "API (URL)", placeholder: "https://api.korrauto.com/v1/waitlist" },
    consentText: { type: ControlType.String, displayTextArea: true, title: "Consentement" },
    button: { type: ControlType.String, title: "Bouton" },
    success: { type: ControlType.String, displayTextArea: true, title: "Message de succès" },
    showOffer: { type: ControlType.Boolean, title: "Offre 200 places", defaultValue: true },
})
