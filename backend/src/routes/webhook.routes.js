const express = require("express");
const crypto = require("crypto");

const router = express.Router();

function verifyGithubSignature(rawBodyBuffer, signatureHeader, secret) {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(rawBodyBuffer);
  const expected = "sha256=" + hmac.digest("hex");

  

  const sigBuf = Buffer.from(signatureHeader, "utf8");
  const expBuf = Buffer.from(expected, "utf8");
  if (sigBuf.length !== expBuf.length) return false;

  return crypto.timingSafeEqual(sigBuf, expBuf);
}

router.post(
  "/github",
  express.raw({ type: "application/json" }),
  (req, res) => {
    try {
     

      const secret = process.env.GITHUB_WEBHOOK_SECRET;
      if (!secret) return res.status(500).json({ error: "Secret no configurado" });

      // Asegurar que el body sea Buffer
      if (!Buffer.isBuffer(req.body)) {
        return res.status(500).json({ error: "Body no es RAW Buffer (verifica express.raw)" });
      }

      const signature = req.get("x-hub-signature-256");
      const ok = verifyGithubSignature(req.body, signature, secret);
      if (!ok) return res.status(401).json({ error: "Firma invalida" });

      const event = req.get("x-github-event");
      if (event !== "push") return res.status(202).json({ ignored: true });

      const payload = JSON.parse(req.body.toString("utf8"));

      console.log("[WEBHOOK][PUSH]", {
        repo: payload.repository?.full_name,
        ref: payload.ref,
        pusher: payload.pusher?.name || payload.sender?.login,
        commits: Array.isArray(payload.commits) ? payload.commits.length : 0
      });

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("WEBHOOK ERROR:", err);
      return res.status(500).json({ error: "Webhook error", detail: err.message });
    }
  }
);

module.exports = router;

