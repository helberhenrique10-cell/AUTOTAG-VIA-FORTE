import { jsPDF } from "jspdf";
import { fmtKm, COMPONENT_TYPES, STATUS } from "./maintenance";

export function buildStatusPdf(loco, stats) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(15, 23, 42);
  doc.text("ViaForte | AutoTag — Relatório de Status dos Componentes", 14, 16);
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(71, 85, 105);
  doc.text(`Locomotiva ${loco.code} · ${loco.model} · ${loco.yard} / ${loco.line}`, 14, 23);
  doc.text(`Odômetro: ${fmtKm(loco.odometer_km)} · Gerado em ${new Date().toLocaleString("pt-BR")}`, 14, 28);
  doc.setFontSize(9);
  doc.text("Regras: Normal 0–70% · Atenção 71–89% · Crítico >= 90% da vida útil consumida (desgaste com FSV aplicado).", 14, 33);

  const cols = [["Componente", 14], ["Tipo", 66], ["Tag RFID", 106], ["Protheus", 136], ["KM desde inst.", 164], ["Consumo", 192], ["Restante", 214], ["Previsão", 236], ["Status", 258]];
  const y0 = 40;
  doc.setFillColor(30, 41, 59); doc.rect(12, y0 - 6, 273, 8, "F");
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
  cols.forEach(([t, x]) => doc.text(t, x, y0));
  doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "normal");

  let y = y0 + 9;
  stats.forEach(({ c, s }, i) => {
    if (i % 2) { doc.setFillColor(241, 245, 249); doc.rect(12, y - 5, 273, 7, "F"); }
    const cells = [c.name, COMPONENT_TYPES[c.type]?.label || "", c.rfid_tag, c.protheus_code || "—", fmtKm(loco.odometer_km - c.installed_at_km), `${s.pct.toFixed(1)}%`, fmtKm(s.remaining), `${s.days} dias`];
    cells.forEach((t, j) => doc.text(String(t), cols[j][1], y));
    const col = s.status === "critico" ? [225, 29, 72] : s.status === "atencao" ? [217, 119, 6] : [5, 150, 105];
    doc.setTextColor(...col); doc.text(STATUS[s.status].label, cols[8][1], y); doc.setTextColor(15, 23, 42);
    y += 7;
  });

  const bytes = new Uint8Array(doc.output("arraybuffer"));
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}