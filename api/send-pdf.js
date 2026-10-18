import { Resend } from "resend";
import { Buffer } from "node:buffer";
import process from "node:process";

const MAX_PDF_BYTES = 3_000_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};

export default async function sendPdf(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não permitido." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "RESEND_API_KEY não está configurada na Vercel." });
  }

  const { to, pdfBase64, filename, locomotiveName } = req.body || {};
  if (typeof to !== "string" || !EMAIL_PATTERN.test(to.trim())) {
    return res.status(400).json({ error: "Informe um email destinatário válido." });
  }
  if (typeof pdfBase64 !== "string" || !pdfBase64) {
    return res.status(400).json({ error: "O conteúdo do PDF está ausente." });
  }

  const base64 = pdfBase64.replace(/^data:application\/pdf;base64,/i, "").replace(/\s/g, "");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64) || base64.length % 4 !== 0) {
    return res.status(400).json({ error: "O conteúdo do PDF não está em Base64 válido." });
  }

  const pdfBuffer = Buffer.from(base64, "base64");
  if (pdfBuffer.length === 0 || pdfBuffer.length > MAX_PDF_BYTES || pdfBuffer.subarray(0, 5).toString() !== "%PDF-") {
    return res.status(400).json({ error: "PDF inválido ou acima do limite de 3 MB." });
  }

  const safeFilename = typeof filename === "string" && filename.trim()
    ? filename.replace(/[^a-zA-Z0-9_.-]/g, "_").replace(/\.(pdf)?$/i, "") + ".pdf"
    : "relatorio-status.pdf";
  const activeName = typeof locomotiveName === "string"
    ? locomotiveName.replace(/[\r\n]+/g, " ").slice(0, 120)
    : "locomotiva";
  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "ViaForte <onboarding@resend.dev>",
      to: [to.trim()],
      subject: `Relatório de status - ${activeName}`,
      text: `Segue em anexo o relatório de status da ${activeName}.`,
      attachments: [{ filename: safeFilename, content: pdfBuffer }],
    });

    if (error) {
      console.error("Resend recusou o envio do relatório:", error.message);
      return res.status(502).json({ error: error.message || "O serviço de email recusou o envio." });
    }

    return res.status(200).json({ id: data?.id });
  } catch (error) {
    console.error("Falha ao enviar relatório via Resend:", error);
    return res.status(502).json({ error: "Falha ao enviar o relatório. Verifique o remetente e a configuração do Resend." });
  }
}
