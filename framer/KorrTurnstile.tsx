// KORR — anti-robot Cloudflare Turnstile commun à tous les formulaires publics.
// Le script Cloudflare (≈ 700 Ko) n'est chargé que lorsqu'un formulaire approche de l'écran ou reçoit le focus :
// aucune page ne le télécharge au premier affichage. Le jeton est vérifié par l'API (POST … { turnstile }).
import { createElement, useEffect, useRef, useState } from "react"
import { lang } from "./KorrI18n.tsx"

export const TS_SITEKEY = "0x4AAAAAAFTOarAaXssiIsxI"
const TS_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

let loading: Promise<any> | null = null
/** Charge le script une seule fois pour toute la page (plusieurs formulaires partagent la même promesse). */
export function loadTurnstile(): Promise<any> {
    const w = window as any
    if (w.turnstile) return Promise.resolve(w.turnstile)
    if (loading) return loading
    loading = new Promise((resolve, reject) => {
        let s = document.querySelector("script[data-korr-ts]") as HTMLScriptElement | null
        if (!s) {
            s = document.createElement("script")
            s.src = TS_SCRIPT
            s.async = true
            s.setAttribute("data-korr-ts", "")
            document.head.appendChild(s)
        }
        s.addEventListener("load", () => resolve(w.turnstile))
        s.addEventListener("error", (e) => {
            loading = null
            reject(e)
        })
    })
    return loading
}

export type Human = {
    /** Emplacement du widget, à placer juste avant le bouton d'envoi. */
    box: any
    /** Jeton à envoyer à l'API dans le champ « turnstile » ; vide tant que la vérification n'est pas terminée. */
    token: string
    /** À appeler après chaque envoi : un jeton ne sert qu'une fois. */
    reset: () => void
    /** Message à afficher si l'utilisateur envoie avant la fin de la vérification. */
    waitMsg: string
}

/**
 * Widget Turnstile différé : rendu quand son emplacement arrive à 400 px de l'écran (ou dès qu'un champ du
 * formulaire reçoit le focus), retiré au démontage. Dans le canevas Framer, rien n'est chargé.
 */
export function useHuman(canvas = false): Human {
    const ref = useRef<HTMLDivElement>(null)
    const id = useRef<string | null>(null)
    const [token, setToken] = useState("")
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        if (canvas || !ref.current) return
        const el = ref.current
        let alive = true
        const start = () => {
            if (id.current || !alive) return
            loadTurnstile()
                .then((ts) => {
                    if (!alive || id.current || !el.isConnected) return
                    id.current = ts.render(el, {
                        sitekey: TS_SITEKEY,
                        theme: "dark",
                        language: lang(),
                        appearance: "interaction-only",
                        callback: (t: string) => setToken(t),
                        "expired-callback": () => setToken(""),
                        "error-callback": () => setToken(""),
                    })
                })
                .catch(() => setFailed(true))
        }
        const io = "IntersectionObserver" in window
            ? new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && start(), { rootMargin: "400px" })
            : null
        if (io) io.observe(el)
        else start()
        const form = el.closest("form")
        form?.addEventListener("focusin", start, { once: true })
        return () => {
            alive = false
            io?.disconnect()
            form?.removeEventListener("focusin", start)
            const ts = (window as any).turnstile
            if (ts && id.current) ts.remove(id.current)
            id.current = null
        }
    }, [canvas])

    const reset = () => {
        setToken("")
        const ts = (window as any).turnstile
        if (ts && id.current) ts.reset(id.current)
    }
    const waitMsg = failed
        ? "La vérification anti-robot n’a pas pu se charger. Désactivez le bloqueur de contenu ou réessayez."
        : "Patientez une seconde : la vérification anti-robot se termine."
    const box = createElement("div", { ref, style: { gridColumn: "1 / -1", minHeight: 0 } })
    return { box, token, reset, waitMsg }
}

/** fetch avec délai maximal : un réseau bloqué ne laisse jamais un bouton sur « Envoi… ». */
export function fetchWithTimeout(url: string, init: RequestInit = {}, ms = 15000): Promise<Response> {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), ms)
    return fetch(url, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(timer))
}
