// Vercel serverless function: the real gate.
// The bonus link lives only in the BONUS_DRIVE_URL (or BONUS_URL) environment variable
// and is returned to the browser ONLY after the Google Sheet confirms the lead was saved.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const BOOK = "Weihnachten weitererzählen";
const LINGUA = "DE";
const MSG = {
  "invalid": "Ungültige Anfrage.",
  "generic": "Deine Angaben konnten nicht gespeichert werden. Bitte versuche es noch einmal.",
  "name": "Bitte gib deinen Vor- und Nachnamen ein.",
  "email": "Bitte gib eine gültige E-Mail-Adresse ein.",
  "setup": "Die Seite ist noch nicht eingerichtet. Bitte versuche es später noch einmal.",
  "later": "Deine Angaben konnten nicht gespeichert werden. Bitte versuche es gleich noch einmal.",
  "method": "Methode nicht erlaubt."
};

function readBody(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  if (typeof req.body === "string") {
    try { return Promise.resolve(JSON.parse(req.body)); } catch (e) { return Promise.resolve(null); }
  }
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => { data += c; if (data.length > 10000) data = ""; });
    req.on("end", () => { try { resolve(JSON.parse(data || "{}")); } catch (e) { resolve(null); } });
    req.on("error", () => resolve(null));
  });
}

function clean(v, max) {
  return String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: MSG.method });
  }

  const body = await readBody(req);
  if (!body) return res.status(400).json({ ok: false, error: MSG.invalid });

  // honeypot: bots fill the hidden "website" field. Reply as if it failed, never write, never reveal.
  if (clean(body.website, 200)) return res.status(400).json({ ok: false, error: MSG.generic });

  const nome = clean(body.nome, 80);
  const cognome = clean(body.cognome, 80);
  const email = clean(body.email, 160).toLowerCase();
  if (!nome || !cognome) return res.status(400).json({ ok: false, error: MSG.name });
  if (!EMAIL.test(email)) return res.status(400).json({ ok: false, error: MSG.email });

  // optional consent to receive news (unchecked by default on the page)
  const consenso = body.newsletter === true ? "sì" : "no";

  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;
  const bonusUrl = process.env.BONUS_DRIVE_URL || process.env.BONUS_URL;
  if (!scriptUrl || !secret || !bonusUrl) {
    console.error("Missing environment variables: GOOGLE_SCRIPT_URL, APPS_SCRIPT_SECRET and BONUS_DRIVE_URL (or BONUS_URL) are required.");
    return res.status(500).json({ ok: false, error: MSG.setup });
  }

  let upstream;
  try {
    const r = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ nome, cognome, email, timestamp: new Date().toISOString(), libro: BOOK, lingua: LINGUA, consenso, secret }),
      redirect: "follow",
    });
    const text = await r.text();
    try { upstream = JSON.parse(text); } catch (e) { upstream = null; }
    if (!r.ok || !upstream || upstream.ok !== true) {
      console.error("Google Script did not confirm the write:", r.status, text.slice(0, 300));
      return res.status(502).json({ ok: false, error: MSG.later });
    }
  } catch (e) {
    console.error("Google Script unreachable:", e && e.message);
    return res.status(502).json({ ok: false, error: MSG.later });
  }

  return res.status(200).json({ ok: true, bonusUrl });
};
