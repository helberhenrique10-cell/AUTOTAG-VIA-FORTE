import { base44 } from "@/api/base44Client";
import { lifeStats, fmtKm } from "./maintenance";

const E = base44.entities;
const now = () => new Date().toISOString();

export const logEvent = (data) => E.MaintenanceEvent.create(data);

export async function applyOdometer(loco, newKm, fsv = 1, section = "", source = "manual") {
  const delta = newKm - loco.odometer_km;
  if (delta <= 0) throw new Error("A nova quilometragem deve ser maior que a atual.");
  const effective = delta * fsv;
  const comps = await E.Component.filter({ locomotive_id: loco.id, active: true });
  const updates = comps.map((c) => ({ id: c.id, wear_km: (c.wear_km || 0) + effective }));
  if (updates.length) await E.Component.bulkUpdate(updates);

  const events = [];
  comps.forEach((c, i) => {
    const before = lifeStats(c).status;
    const after = lifeStats({ ...c, wear_km: updates[i].wear_km });
    if (before !== after.status && after.status !== "normal") {
      const crit = after.status === "critico";
      events.push({
        type: crit ? "alerta_critico" : "alerta_atencao",
        title: crit ? `Substituição imediata: ${c.name}` : `Agendar inspeção: ${c.name}`,
        description: `${after.pct.toFixed(1)}% da vida útil consumida · Tag ${c.rfid_tag}`,
        locomotive_id: loco.id, component_id: c.id, km: newKm,
      });
    }
  });

  await E.Locomotive.update(loco.id, { odometer_km: newKm, last_reading_at: now() });
  await E.OdometerLog.create({ locomotive_id: loco.id, previous_km: loco.odometer_km, new_km: newKm, delta_km: delta, fsv, effective_km: effective, section, source });
  events.push({
    type: "odometro", title: `Odômetro atualizado para ${fmtKm(newKm)}`,
    description: `+${fmtKm(delta)} · FSV ${fsv}x${section ? ` · ${section}` : ""}`,
    locomotive_id: loco.id, km: newKm,
  });
  await E.MaintenanceEvent.bulkCreate(events);
}

export async function processRfidReading(gantry, loco, tags, km, fsv, section) {
  if (km > loco.odometer_km) await applyOdometer(loco, km, fsv, section, "portico");
  else await E.Locomotive.update(loco.id, { last_reading_at: now() });
  const comps = await E.Component.filter({ locomotive_id: loco.id, active: true });
  const known = comps.filter((c) => tags.includes(c.rfid_tag));
  const unknown = tags.filter((t) => !comps.some((c) => c.rfid_tag === t));
  if (known.length) await E.Component.bulkUpdate(known.map((c) => ({ id: c.id, last_read_at: now() })));
  await E.RfidReading.create({ gantry_id: gantry.id, gantry_name: gantry.name, locomotive_id: loco.id, locomotive_code: loco.code, tags, unknown_tags: unknown, km: Math.max(km, loco.odometer_km), read_at: now() });
  await E.Gantry.update(gantry.id, { last_seen_at: now(), status: "online" });
  await logEvent({
    type: "leitura_rfid", title: `Leitura RFID · ${gantry.name}`,
    description: `${known.length} tag(s) reconhecida(s)${unknown.length ? ` · ${unknown.length} desconhecida(s)` : ""}`,
    locomotive_id: loco.id, km: Math.max(km, loco.odometer_km),
  });
  return { known: known.length, unknown };
}

export async function replaceComponent(old, loco, { rfid_tag, protheus_code, life_km, notes }) {
  const dup = await E.Component.filter({ rfid_tag, active: true });
  if (dup.length) throw new Error("Esta Tag RFID já está vinculada a outro componente ativo.");
  const created = await E.Component.create({
    name: old.name, type: old.type, locomotive_id: loco.id, rfid_tag, protheus_code, life_km,
    installed_at_km: loco.odometer_km, installed_date: now(), wear_km: 0, active: true,
    previous_component_id: old.id, notes,
  });
  await E.Component.update(old.id, { active: false, removed_at_km: loco.odometer_km, removed_date: now(), replaced_by_id: created.id });
  await logEvent({
    type: "substituicao", title: `Peça substituída: ${old.name}`,
    description: `Tag ${old.rfid_tag} → ${rfid_tag} · odômetro da peça zerado`,
    locomotive_id: loco.id, component_id: created.id, km: loco.odometer_km,
  });
}

export async function requestErp(comp, loco) {
  const code = `SC-${Date.now().toString().slice(-7)}`;
  await E.Component.update(comp.id, { erp_request_code: code });
  await E.ServiceOrder.create({
    number: `OS-${Date.now().toString().slice(-6)}`, locomotive_id: loco.id, component_id: comp.id,
    component_name: comp.name, type: "substituicao", priority: "alta", status: "aberta", erp_request_code: code,
    description: `Substituição imediata recomendada. Solicitação ${code} · Protheus ${comp.protheus_code}`,
  });
  await logEvent({ type: "erp", title: `Solicitação ERP ${code}`, description: `${comp.name} · Protheus ${comp.protheus_code}`, locomotive_id: loco.id, component_id: comp.id, km: loco.odometer_km });
  return code;
}