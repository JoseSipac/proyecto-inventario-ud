const request = require("supertest");
const crypto = require("crypto");
const secret = "mi_secret_webhook_123";
process.env.GITHUB_WEBHOOK_SECRET = secret;

const app = require("../app");

function sign(bodyBuffer, secretKey) {
  const h = crypto.createHmac("sha256", secretKey);
  h.update(bodyBuffer);
  return "sha256=" + h.digest("hex");
}

describe("POST /webhooks/github", () => {
  test("firma inválida => 401", async () => {
    const bodyStr = JSON.stringify({});
    const bodyBuf = Buffer.from(bodyStr, "utf8");

    await request(app)
      .post("/webhooks/github")
      .set("X-GitHub-Event", "push")
      .set("X-Hub-Signature-256", "sha256=0000")
      .type("application/json")
      .send(bodyStr) // ✅ enviar string
      .expect(401);
  });

  test("push válido => 200", async () => {
    const payload = {
      ref: "refs/heads/master",
      commits: [{ id: "c1" }, { id: "c2" }],
      repository: { full_name: "PROYECTOINVENTARIO" },
      pusher: { name: "JoseSipac" }
    };

    const bodyStr = JSON.stringify(payload);
    const bodyBuf = Buffer.from(bodyStr, "utf8");

    await request(app)
      .post("/webhooks/github")
      .set("X-GitHub-Event", "push")
      .set("X-Hub-Signature-256", sign(bodyBuf, secret)) // ✅ firmar buffer del string
      .type("application/json")
      .send(bodyStr) // ✅ enviar string
      .expect(200);
  });

  test("evento distinto a push => 202", async () => {
    const bodyStr = JSON.stringify({ any: "data" });
    const bodyBuf = Buffer.from(bodyStr, "utf8");

    await request(app)
      .post("/webhooks/github")
      .set("X-GitHub-Event", "issues")
      .set("X-Hub-Signature-256", sign(bodyBuf, secret)) // ✅ firmar buffer del string
      .type("application/json")
      .send(bodyStr) // ✅ enviar string
      .expect(202);
  });
});
