import { useState } from "react";
import html2pdf from "html2pdf.js";
import {
  Train,
  LayoutDashboard,
  Cpu,
  Wrench,
  Gauge,
  BarChart3,
  Users,
  Code2,
  LogOut,
  Plus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Boxes,
  Clock,
  X,
  ChevronDown,
  Radio,
  PlusCircle,
  Mail,
  Calendar,
  Phone,
  Loader2
} from "lucide-react";

// --- DADOS MOCKADOS INICIAIS ---
const initialLocomotives = [
  { id: "L-4027", name: "Locomotiva L-4027 - AC4", model: "AC44", yard: "Pátio de Araraquara / Linha 04", odometer: 842615, status: "Ativa" },
  { id: "L-4028", name: "Locomotiva L-4028 - AC44", model: "AC44", yard: "Pátio de Araraquara / Linha 02", odometer: 612400, status: "Ativa" },
  { id: "L-2015", name: "Locomotiva L-2015 - C44", model: "C44-EMi", yard: "Pátio de Tubarão / Linha 01", odometer: 520100, status: "Em Manutenção" }
];

const initialComponents = [
  {
    id: "comp-1",
    name: "Injetor de combustível",
    type: "Injetor de Combustível",
    rfid: "JFJFJFJ",
    protheusCode: "MD2100904",
    installedKm: 842615,
    kmSinceInstall: 0,
    maxLife: 180000,
    remainingLife: 100.0,
    consumedPercent: 0.0,
    status: "Normal",
    lastRead: "—"
  },
  {
    id: "comp-2",
    name: "Turbo alimentador",
    type: "Turboalimentador",
    rfid: "9GHRHSUS",
    protheusCode: "NE1800507",
    installedKm: 842615,
    kmSinceInstall: 0,
    maxLife: 120000,
    remainingLife: 100.0,
    consumedPercent: 0.0,
    status: "Normal",
    lastRead: "—"
  },
  {
    id: "comp-3",
    name: "Governador de potência",
    type: "Governador de Potência",
    rfid: "4A8B9C10",
    protheusCode: "NE1400447",
    installedKm: 800000,
    kmSinceInstall: 42615,
    maxLife: 100000,
    remainingLife: 57.4,
    consumedPercent: 42.6,
    status: "Normal",
    lastRead: "há 16 dias"
  },
  {
    id: "comp-4",
    name: "Compressor de ar",
    type: "Compressor de Ar",
    rfid: "F5E607CB",
    protheusCode: "ME1400772",
    installedKm: 811135,
    kmSinceInstall: 31480,
    maxLife: 150000,
    remainingLife: 79.0,
    consumedPercent: 21.0,
    status: "Normal",
    lastRead: "há 16 dias"
  }
];

const initialOrders = [
  {
    id: "OS-508164",
    date: "02/10/2026 09:41",
    type: "Substituição - Turbo alimentador",
    details: "Substituição preventiva recomendada. Solicitação: SC-2499720 - Protheus: ME1800507",
    responsible: "Sem responsável - SC-3093307",
    priority: "Prioridade Alta",
    status: "Em andamento"
  },
  {
    id: "OS-955553",
    date: "27/09/2026 11:20",
    type: "Substituição - Injetor de combustível",
    details: "Substituição urgente recomendada. Solicitação: SC-3953307 - Protheus: ME1800504",
    responsible: "Responsável: SC-3953307",
    priority: "Prioridade Alta",
    status: "Concluída"
  }
];

const historyEvents = [
  { id: 1, type: "solicitacao", text: "Solicitação ERP: SC-2499720", detail: "Substituição - Turbo alimentador", date: "02/10/2026 09:41" },
  { id: 2, type: "os", text: "OS-955553 concluída", detail: "Injetor de combustível", date: "27/09/2026 11:20" },
  { id: 3, type: "inspeção", text: "Inspeção concluída: Compressor de ar", detail: "Aprovado sem restrições - Carlos Mendes", date: "22/09/2026 10:15" }
];

const initialTeamMembers = [
  { id: "MT-1042", name: "Carlos Mendes", role: "Supervisor de Manutenção", spec: "Motores diesel", team: "Manhã", phone: "(16) 99812-3301", initials: "CM" },
  { id: "MT-1187", name: "Juliana Rocha", role: "Técnica Eletromecânica", spec: "Sistemas de injeção", team: "Tarde", phone: "(16) 99745-2210", initials: "JR" },
  { id: "MT-1203", name: "Rafael Lima", role: "Mecânico Ferroviário", spec: "Turbo e compressores", team: "Noite", phone: "(16) 99633-7788", initials: "RL" }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("equipe");
  const [compTab, setCompTab] = useState("instalados");
  const [osFilter, setOsFilter] = useState("Todas");

  // Estado das Locomotivas
  const [locomotives, setLocomotives] = useState(initialLocomotives);
  const [selectedLocoId, setSelectedLocoId] = useState("L-4027");

  const currentLoco = locomotives.find((l) => l.id === selectedLocoId) || locomotives[0];

  // Modais
  const [showVincularModal, setShowVincularModal] = useState(false);
  const [showNovaLocoModal, setShowNovaLocoModal] = useState(false);
  const [showSubstituirModal, setShowSubstituirModal] = useState(false);
  const [selectedCompForSub, setSelectedCompForSub] = useState(null);
  const [showNovaOsModal, setShowNovaOsModal] = useState(false);
  const [showNovoTecnicoModal, setShowNovoTecnicoModal] = useState(false);

  // Estados dos Dados
  const [components, setComponents] = useState(initialComponents);
  const [orders, setOrders] = useState(initialOrders);
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);

  // Estados do Relatório (Envio Manual e Programado)
  const [reportEmail, setReportEmail] = useState("helber.lima@docente.senai.br");
  const [autoDate, setAutoDate] = useState("2026-10-20");
  const [autoFrequency, setAutoFrequency] = useState("Semanal");
  const [scheduledReports, setScheduledReports] = useState([
    { id: 1, email: "helber.lima@docente.senai.br", date: "2026-10-20", frequency: "Semanal", status: "Ativo" }
  ]);
  const [isSending, setIsSending] = useState(false);

  // Form de Vincular Componente
  const [newCompData, setNewCompData] = useState({
    type: "Governador de Potência",
    name: "Governador de Potência",
    rfid: "",
    protheusCode: "",
    installedKm: currentLoco.odometer,
    maxLife: 100000
  });

  // Form de Nova Locomotiva
  const [newLocoData, setNewLocoData] = useState({
    code: "",
    model: "AC44",
    yard: "Pátio de Araraquara / Linha 01",
    odometer: 0
  });

  // Form de Novo Técnico
  const [newTecnicoData, setNewTecnicoData] = useState({
    name: "",
    role: "",
    spec: "",
    matricula: "",
    phone: "",
    team: "Manhã"
  });

  // Form de Nova Ordem de Serviço
  const [newOsData, setNewOsData] = useState({
    component: "Injetor de combustível",
    type: "Inspeção Preventiva",
    responsible: "Sem responsável - Atribuição Pendente",
    priority: "Prioridade Alta"
  });

  // Odômetro
  const [odometerInput, setOdometerInput] = useState(currentLoco.odometer.toString());

  const handleStatusChange = (id, newStatus) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
  };

  const handleVincularComponente = () => {
    if (!newCompData.rfid) {
      alert("Por favor, preencha a Tag RFID!");
      return;
    }
    const newComp = {
      id: `comp-${Date.now()}`,
      name: newCompData.name,
      type: newCompData.type,
      rfid: newCompData.rfid,
      protheusCode: newCompData.protheusCode || "NE1400000",
      installedKm: Number(newCompData.installedKm),
      kmSinceInstall: 0,
      maxLife: Number(newCompData.maxLife),
      remainingLife: 100.0,
      consumedPercent: 0.0,
      status: "Normal",
      lastRead: "Agora mesmo"
    };
    setComponents([...components, newComp]);
    setShowVincularModal(false);
    setNewCompData({
      type: "Governador de Potência",
      name: "Governador de Potência",
      rfid: "",
      protheusCode: "",
      installedKm: currentLoco.odometer,
      maxLife: 100000
    });
  };

  const handleCadastrarLocomotiva = () => {
    if (!newLocoData.code) {
      alert("Por favor, insira o código da locomotiva!");
      return;
    }
    const newLoco = {
      id: newLocoData.code,
      name: `Locomotiva ${newLocoData.code} - ${newLocoData.model}`,
      model: newLocoData.model,
      yard: newLocoData.yard,
      odometer: Number(newLocoData.odometer) || 0,
      status: "Ativa"
    };
    setLocomotives([...locomotives, newLoco]);
    setSelectedLocoId(newLoco.id);
    setShowNovaLocoModal(false);
    setNewLocoData({ code: "", model: "AC44", yard: "Pátio de Araraquara / Linha 01", odometer: 0 });
  };

  const handleCadastrarTecnico = () => {
    if (!newTecnicoData.name) {
      alert("Por favor, preencha o nome do técnico!");
      return;
    }
    const initials = newTecnicoData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

    const newMember = {
      id: newTecnicoData.matricula || `MT-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newTecnicoData.name,
      role: newTecnicoData.role || "Técnico de Manutenção",
      spec: newTecnicoData.spec || "Geral",
      team: newTecnicoData.team,
      phone: newTecnicoData.phone || "(16) 99999-0000",
      initials: initials || "TK"
    };

    setTeamMembers([...teamMembers, newMember]);
    setShowNovoTecnicoModal(false);
    setNewTecnicoData({ name: "", role: "", spec: "", matricula: "", phone: "", team: "Manhã" });
  };

  const handleCriarNovaOS = () => {
    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}`;

    const newOS = {
      id: `OS-${Math.floor(100000 + Math.random() * 900000)}`,
      date: dateFormatted,
      type: `${newOsData.type} - ${newOsData.component}`,
      details: `Manutenção solicitada para o componente ${newOsData.component}.`,
      responsible: newOsData.responsible,
      priority: newOsData.priority,
      status: "Aberta"
    };

    setOrders([newOS, ...orders]);
    setShowNovaOsModal(false);
    alert(`✅ Ordem de serviço ${newOS.id} gerada com sucesso!`);
  };

  const handleUpdateOdometer = () => {
    const val = Number(odometerInput);
    setLocomotives(locomotives.map((l) => (l.id === currentLoco.id ? { ...l, odometer: val } : l)));
    alert("Odômetro atualizado com sucesso!");
  };

  const handleSendManualPDF = async () => {
    if (!reportEmail) {
      alert("Por favor, insira um e-mail válido!");
      return;
    }

    setIsSending(true);

    try {
      // 1. Elemento do relatório para converter em PDF
      const element = document.getElementById("report-content") || document.body;

      // 2. Configurações de exportação do PDF
      const opt = {
        margin: 10,
        filename: `Relatorio_Status_${currentLoco.id}_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };

      // 3. Geração e download imediato do ficheiro PDF
      await html2pdf().set(opt).from(element).save();

      // 4. Abertura do cliente de e-mail com dados pré-preenchidos
      const subject = encodeURIComponent(`Relatório de Status - ${currentLoco.name}`);
      const body = encodeURIComponent(
        `Olá,\n\nSegue o relatório atualizado da ${currentLoco.name}.\n\n` +
        `• Odômetro: ${currentLoco.odometer.toLocaleString("pt-BR")} km\n` +
        `• Componentes Ativos: ${components.length}\n` +
        `• Status do Ativo: ${currentLoco.status}\n\n` +
        `O ficheiro PDF do relatório foi gerado e descarregado para o seu dispositivo. Anexe-o a esta mensagem para concluir o envio.\n\n` +
        `Atenciosamente,\nSistema ViaForte`
      );

      window.location.href = `mailto:${reportEmail}?subject=${subject}&body=${body}`;

      alert(`✅ PDF gerado com sucesso!\n\nFoi efetuado o download do ficheiro no seu dispositivo e aberto o seu cliente de e-mail preenchido para: ${reportEmail}`);
    } catch (error) {
      console.error("Erro ao gerar/enviar PDF:", error);
      alert("⚠️ Ocorreu um erro ao gerar o PDF. Verifique se o módulo html2pdf.js está devidamente carregado.");
    } finally {
      setIsSending(false);
    }
  };

  const handleScheduleAutoReport = () => {
    if (!reportEmail || !autoDate) {
      alert("Preencha o e-mail e a data de envio!");
      return;
    }
    const newSchedule = {
      id: Date.now(),
      email: reportEmail,
      date: autoDate,
      frequency: autoFrequency,
      status: "Ativo"
    };
    setScheduledReports([...scheduledReports, newSchedule]);
    alert(`📅 Envio automático registrado para ${autoDate} (${autoFrequency})!`);
  };

  return (
    <div className="flex h-screen bg-[#0b111e] text-slate-100 font-sans overflow-hidden">
      {/* SIDEBAR NAVEGAÇÃO LATERAL */}
      <aside className="w-72 bg-[#0f172a] border-r border-slate-800/80 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-5 border-b border-slate-800/80 flex items-center gap-3.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Train className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-xl tracking-wide">ViaForte</h1>
              <p className="text-xs text-emerald-400 font-mono tracking-wider">AUTOTAG • RFID</p>
            </div>
          </div>

          <nav className="p-4 space-y-7">
            <div>
              <p className="px-3 text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Operação</p>
              <div className="space-y-1.5">
                <button
                  onClick={() => setActiveTab("painel")}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-bold transition ${
                    activeTab === "painel"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Painel Operacional
                </button>

                <button
                  onClick={() => setActiveTab("componentes")}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-bold transition ${
                    activeTab === "componentes"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Cpu className="w-5 h-5" />
                  Componentes Rastreados
                </button>

                <button
                  onClick={() => setActiveTab("ordens")}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-bold transition ${
                    activeTab === "ordens"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Wrench className="w-5 h-5" />
                  Ordens de Serviço
                </button>

                <button
                  onClick={() => setActiveTab("odometro")}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-bold transition ${
                    activeTab === "odometro"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Gauge className="w-5 h-5" />
                  Odômetro / Quilometragem
                </button>
              </div>
            </div>

            <div>
              <p className="px-3 text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Gestão</p>
              <div className="space-y-1.5">
                <button
                  onClick={() => setActiveTab("relatorios")}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-bold transition ${
                    activeTab === "relatorios"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  Relatórios
                </button>

                <button
                  onClick={() => setActiveTab("equipe")}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-bold transition ${
                    activeTab === "equipe"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Users className="w-5 h-5" />
                  Equipe Técnica
                </button>

                <button
                  onClick={() => setActiveTab("api")}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-bold transition ${
                    activeTab === "api"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Code2 className="w-5 h-5" />
                  API / Pórticos
                </button>
              </div>
            </div>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/80">
          <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-bold text-slate-400 hover:text-rose-400 transition">
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-y-auto" id="report-content">
        <header className="bg-[#0f172a] border-b border-slate-800/80 px-8 py-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider font-extrabold text-slate-300 bg-slate-800 px-3 py-1 rounded-md">
                Ativo Monitorado
              </span>
              <h2 className="text-2xl font-black text-white">Locomotiva {currentLoco.id}</h2>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-300 mt-2.5 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="relative inline-block">
                  <select
                    value={selectedLocoId}
                    onChange={(e) => setSelectedLocoId(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-100 text-sm font-extrabold rounded-xl pl-3.5 pr-9 py-2 appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {locomotives.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>

                <button
                  onClick={() => setShowNovaLocoModal(true)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 px-3 py-2 rounded-xl text-sm font-extrabold transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Nova Locomotiva</span>
                </button>
              </div>

              <span>•</span>
              <span>Modelo <strong className="text-white font-bold">{currentLoco.model}</strong></span>
              <span>•</span>
              <span>{currentLoco.yard}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">● {currentLoco.status}</span>
              <span className="text-slate-400">última leitura há 16 dias</span>
            </div>
          </div>

          <div className="text-right bg-slate-900/90 border border-slate-800 px-6 py-3 rounded-2xl">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Odômetro Total</p>
            <p className="text-3xl font-black text-white tracking-tight mt-0.5">
              {currentLoco.odometer.toLocaleString("pt-BR")}{" "}
              <span className="text-sm font-bold text-slate-400">km</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">FSV padrão: 1x • Média 820 km/dia</p>
          </div>
        </header>

        {/* CONTEÚDO DINÂMICO */}
        <div className="p-8 flex-1">
          {/* TAB 1: PAINEL OPERACIONAL */}
          {activeTab === "painel" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <div className="grid grid-cols-4 gap-5">
                  <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <Boxes className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-4xl font-black text-white">{components.length}</p>
                      <p className="text-sm font-semibold text-slate-300 mt-1">Componentes cadastrados</p>
                    </div>
                  </div>

                  <div className="bg-[#0f172a] border border-emerald-500/30 p-5 rounded-2xl bg-emerald-500/5 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-4xl font-black text-emerald-400">{components.length}</p>
                      <p className="text-sm font-semibold text-slate-300 mt-1">Dentro do prazo</p>
                    </div>
                  </div>

                  <div className="bg-[#0f172a] border border-amber-500/30 p-5 rounded-2xl bg-amber-500/5 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-4xl font-black text-amber-400">0</p>
                      <p className="text-sm font-semibold text-slate-300 mt-1">Atenção programada</p>
                    </div>
                  </div>

                  <div className="bg-[#0f172a] border border-rose-500/30 p-5 rounded-2xl bg-rose-500/5 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                      <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-4xl font-black text-rose-400">0</p>
                      <p className="text-sm font-semibold text-slate-300 mt-1">Intervenção crítica</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-md">
                  <div className="p-5 border-b border-slate-800">
                    <h3 className="font-extrabold text-white text-base">Rastreabilidade de Componentes</h3>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#0b111e] text-slate-300 uppercase text-xs font-extrabold tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="p-4">Componente</th>
                        <th className="p-4">Tag RFID (UIC)</th>
                        <th className="p-4">Código Protheus</th>
                        <th className="p-4">KM Desde Instalação</th>
                        <th className="p-4">Vida Útil Restante</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {components.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-800/30 transition">
                          <td className="p-4 font-bold text-white text-base">{c.name}</td>
                          <td className="p-4 font-mono text-emerald-400 font-bold">{c.rfid}</td>
                          <td className="p-4 font-mono text-slate-300">{c.protheusCode}</td>
                          <td className="p-4 font-bold text-slate-100">{c.kmSinceInstall.toLocaleString("pt-BR")} km</td>
                          <td className="p-4">
                            <span className="font-extrabold text-slate-200 text-base">{c.remainingLife}%</span>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-3">
                  Histórico recente de eventos
                </h3>
                <div className="space-y-4">
                  {historyEvents.map((ev) => (
                    <div key={ev.id} className="flex items-start gap-3.5 text-sm border-b border-slate-800/50 pb-3.5 last:border-0">
                      <div className="p-2 rounded-xl shrink-0 bg-blue-500/10 text-blue-400 mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-100">{ev.text}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{ev.detail}</p>
                        <span className="text-xs text-slate-500 font-mono mt-1 block">{ev.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPONENTES RASTREADOS */}
          {activeTab === "componentes" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">OPERAÇÃO</span>
                  <h3 className="text-3xl font-black text-white mt-1">Componentes Rastreados</h3>
                  <p className="text-sm text-slate-300 mt-1">
                    Peças com Tag RFID vinculadas à locomotiva e histórico de substituições.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => alert("Iniciando varredura via Sensor RFID na linha...")}
                    className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition"
                  >
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    Registrar via sensor RFID
                  </button>

                  <button
                    onClick={() => setShowVincularModal(true)}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-lg shadow-emerald-500/10"
                  >
                    <Plus className="w-5 h-5" />
                    Vincular componente
                  </button>
                </div>
              </div>

              <div className="flex gap-3 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setCompTab("instalados")}
                  className={`px-5 py-2 rounded-xl text-sm font-extrabold transition ${
                    compTab === "instalados" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Instalados
                </button>
                <button
                  onClick={() => setCompTab("historico")}
                  className={`px-5 py-2 rounded-xl text-sm font-extrabold transition ${
                    compTab === "historico" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Histórico / Auditoria
                </button>
              </div>

              {compTab === "instalados" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {components.map((c) => (
                    <div key={c.id} className="bg-[#0f172a] border border-slate-800/90 p-6 rounded-2xl space-y-5 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="p-2.5 bg-slate-900 border border-slate-800 text-emerald-400 rounded-xl">
                            <Cpu className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-white text-base">{c.name}</h4>
                            <span className="font-mono text-sm text-emerald-400 font-bold">{c.rfid}</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ● {c.status}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-emerald-400 text-base">{c.remainingLife.toFixed(1)}%</span>
                          <span className="text-slate-400 text-xs">restante</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.remainingLife}%` }} />
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Código Protheus</span>
                          <span className="font-mono font-bold text-slate-100">{c.protheusCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Instalado aos</span>
                          <span className="font-bold text-slate-100">{c.installedKm.toLocaleString("pt-BR")} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Desgaste efetivo (FSV)</span>
                          <span className="font-bold text-slate-100">
                            {c.kmSinceInstall.toLocaleString("pt-BR")} km / {c.maxLife.toLocaleString("pt-BR")} km
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Última leitura RFID</span>
                          <span className="text-slate-400">{c.lastRead}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCompForSub(c);
                          setShowSubstituirModal(true);
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 py-2.5 rounded-xl text-xs font-bold transition border border-slate-800 flex items-center justify-center gap-2"
                      >
                        Substituir peça
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
                  <div className="border border-slate-800 rounded-xl p-5 bg-slate-900/50 max-w-lg space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <h4 className="font-extrabold text-white text-base">Turbo alimentador</h4>
                      <span className="font-mono text-slate-300 font-bold">9GHRHSUS</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-300 text-xs">
                      <p>Código Protheus: <strong className="text-slate-100">NE1800507</strong></p>
                      <p>Instalado aos: <strong className="text-slate-100">724.200 km</strong></p>
                      <p>Desgaste efetivo (FSV): <strong className="text-slate-100">188.415 km / 120.000 km</strong></p>
                      <p>Removido aos: <strong className="text-slate-100">842.615 km</strong></p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ORDENS DE SERVIÇO */}
          {activeTab === "ordens" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-black text-white">Ordens de Serviço</h3>
                  <p className="text-sm text-slate-300 mt-1">Inspeções, substituições e solicitações geradas a partir de alertas.</p>
                </div>
                <button
                  onClick={() => setShowNovaOsModal(true)}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl text-sm font-bold transition"
                >
                  <Plus className="w-5 h-5" />
                  Nova OS
                </button>
              </div>

              <div className="flex gap-2 border-b border-slate-800 pb-3">
                {["Todas", "Aberta", "Em andamento", "Concluída"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setOsFilter(filter)}
                    className={`px-4 py-2 rounded-xl text-sm font-extrabold transition ${
                      osFilter === filter ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {orders
                  .filter((o) => osFilter === "Todas" || o.status === osFilter)
                  .map((o) => (
                    <div key={o.id} className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-6 shadow-md">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-white text-base">{o.id}</span>
                          <span className="text-xs font-mono text-slate-400">{o.date}</span>
                        </div>
                        <p className="font-bold text-slate-100 text-sm">{o.type}</p>
                        <p className="text-xs text-slate-300">{o.details}</p>
                        <span className="text-xs text-slate-400 block font-medium">{o.responsible}</span>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-extrabold border border-rose-500/30">
                          {o.priority}
                        </span>
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-slate-100 text-xs font-bold rounded-xl px-3 py-2 focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="Aberta">Aberta</option>
                          <option value="Em andamento">Em andamento</option>
                          <option value="Concluída">Concluída</option>
                        </select>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: ODÔMETRO */}
          {activeTab === "odometro" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-black text-white">Odômetro / Quilometragem</h3>
                <p className="text-sm text-slate-300 mt-1">Cada KM percorrido é convertido em desgaste conforme o Fator de Severidade da Via.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl space-y-4 max-w-lg">
                  <h4 className="font-extrabold text-white text-base">Registrar leitura de odômetro</h4>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Nova quilometragem total (km)</label>
                    <input
                      type="number"
                      value={odometerInput}
                      onChange={(e) => setOdometerInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono font-bold text-base focus:border-emerald-500"
                    />
                  </div>
                  <button
                    onClick={handleUpdateOdometer}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl text-sm transition"
                  >
                    Atualizar odômetro
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RELATÓRIOS */}
          {activeTab === "relatorios" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">GESTÃO</span>
                  <h3 className="text-3xl font-black text-white mt-1">Relatórios</h3>
                  <p className="text-sm text-slate-300 mt-1">
                    Consumo de vida útil, distribuição de status e auditoria de substituições.
                  </p>
                </div>

                <div className="relative inline-block">
                  <select
                    value={selectedLocoId}
                    onChange={(e) => setSelectedLocoId(e.target.value)}
                    className="bg-[#0f172a] border border-slate-800 text-slate-100 text-sm font-bold rounded-xl pl-4 pr-10 py-2.5 appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {locomotives.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-[#0f172a] border border-slate-800/80 p-6 rounded-2xl">
                  <p className="text-4xl font-black text-white">4</p>
                  <p className="text-sm font-semibold text-slate-300 mt-1">Componentes ativos</p>
                </div>

                <div className="bg-[#0f172a] border border-slate-800/80 p-6 rounded-2xl">
                  <p className="text-4xl font-black text-white">2</p>
                  <p className="text-sm font-semibold text-slate-300 mt-1">Substituições registradas</p>
                </div>

                <div className="bg-[#0f172a] border border-slate-800/80 p-6 rounded-2xl">
                  <p className="text-4xl font-black text-white">1</p>
                  <p className="text-sm font-semibold text-slate-300 mt-1">Leituras RFID</p>
                </div>
              </div>

              <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-5 border-b border-slate-800/80">
                  <h4 className="font-extrabold text-white text-base">Relatório de status por email (PDF)</h4>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-end">
                    <div className="lg:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-2">Enviar para</label>
                      <input
                        type="email"
                        value={reportEmail}
                        onChange={(e) => setReportEmail(e.target.value)}
                        className="w-full bg-[#0b111e] border border-slate-800 rounded-xl p-3.5 text-sm text-white font-medium focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <button
                        onClick={handleSendManualPDF}
                        disabled={isSending}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3.5 px-5 rounded-xl text-sm transition flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                      >
                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                        {isSending ? "Enviando..." : "Gerar e enviar PDF"}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 flex items-center gap-2 font-medium">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Gera um PDF com o status, consumo de vida útil e previsão de troca de cada componente e envia por email.
                  </p>

                  <div className="border-t border-slate-800/80 pt-5 mt-5">
                    <h5 className="font-extrabold text-white text-sm mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-400" />
                      Programar Envio Automático do Relatório
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Data do Primeiro Envio</label>
                        <input
                          type="date"
                          value={autoDate}
                          onChange={(e) => setAutoDate(e.target.value)}
                          className="w-full bg-[#0b111e] border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:border-emerald-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Frequência</label>
                        <select
                          value={autoFrequency}
                          onChange={(e) => setAutoFrequency(e.target.value)}
                          className="w-full bg-[#0b111e] border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:border-emerald-500 font-medium"
                        >
                          <option value="Diário">Diário</option>
                          <option value="Semanal">Semanal</option>
                          <option value="Mensal">Mensal</option>
                        </select>
                      </div>

                      <button
                        onClick={handleScheduleAutoReport}
                        className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-extrabold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Registrar Envio Automático
                      </button>
                    </div>

                    {scheduledReports.length > 0 && (
                      <div className="mt-5 space-y-2.5">
                        <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Agendamentos Ativos</p>
                        <div className="space-y-2">
                          {scheduledReports.map((item) => (
                            <div key={item.id} className="bg-[#0b111e] p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-medium">
                              <span className="text-slate-200 text-sm">{item.email}</span>
                              <div className="flex items-center gap-4 text-slate-300">
                                <span>Data: <strong className="text-white">{item.date}</strong></span>
                                <span>Freq: <strong className="text-white">{item.frequency}</strong></span>
                                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{item.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800/80 rounded-2xl p-6 space-y-6">
                  <h4 className="font-extrabold text-white text-sm uppercase tracking-wider border-b border-slate-800/80 pb-3">
                    Vida útil consumida (%)
                  </h4>

                  <div className="h-52 relative flex items-end justify-between px-6 pt-6 border-b border-slate-800/80">
                    <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-slate-400 font-mono font-bold">
                      <span>100</span>
                      <span>75</span>
                      <span>50</span>
                      <span>25</span>
                      <span>0</span>
                    </div>

                    <div className="flex-1 flex items-end justify-around pl-8 h-full">
                      {components.map((c) => (
                        <div key={c.id} className="flex flex-col items-center gap-2 h-full justify-end group">
                          <div
                            className="w-16 bg-emerald-400 rounded-t-md transition-all duration-300 hover:bg-emerald-300"
                            style={{ height: `${Math.max(c.consumedPercent, 4)}%` }}
                            title={`${c.name}: ${c.consumedPercent}%`}
                          />
                          <span className="text-xs text-slate-300 font-bold text-center truncate max-w-[100px]">
                            {c.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
                  <h4 className="font-extrabold text-white text-sm uppercase tracking-wider border-b border-slate-800/80 pb-3">
                    Distribuição de status
                  </h4>

                  <div className="my-6 flex items-center justify-center">
                    <div className="w-40 h-40 rounded-full border-[16px] border-emerald-400 flex items-center justify-center">
                      <span className="text-sm font-black text-emerald-400">100% Normal</span>
                    </div>
                  </div>

                  <div className="flex justify-center items-center gap-2 text-sm font-extrabold text-emerald-400">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                    <span>Normal ({components.length})</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: EQUIPE TÉCNICA */}
          {activeTab === "equipe" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">GESTÃO</span>
                  <h3 className="text-3xl font-black text-white mt-1">Equipe Técnica</h3>
                  <p className="text-sm text-slate-300 mt-1">
                    Técnicos responsáveis pelas inspeções e substituições.
                  </p>
                </div>

                <button
                  onClick={() => setShowNovoTecnicoModal(true)}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-lg shadow-emerald-500/10"
                >
                  <Plus className="w-5 h-5" />
                  Novo técnico
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {teamMembers.map((m) => (
                  <div key={m.id} className="bg-[#0f172a] border border-slate-800/90 p-6 rounded-2xl space-y-5 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center font-black text-emerald-400 text-base shrink-0">
                        {m.initials}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-lg tracking-tight">{m.name}</h4>
                        <p className="text-xs font-semibold text-slate-400">{m.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
                      <span className="bg-slate-900 text-slate-200 border border-slate-800/80 px-3 py-1.5 rounded-xl">
                        {m.spec}
                      </span>
                      <span className="bg-slate-900 text-slate-200 border border-slate-800/80 px-3 py-1.5 rounded-xl">
                        Turno {m.team}
                      </span>
                      <span className="bg-slate-900 text-slate-300 border border-slate-800/80 px-3 py-1.5 rounded-xl font-mono">
                        {m.id}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2.5 text-sm font-semibold text-slate-300">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{m.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: API */}
          {activeTab === "api" && (
            <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-2xl space-y-4 max-w-2xl">
              <h3 className="text-xl font-black text-white">API & Integrações</h3>
              <p className="text-sm text-slate-300">Conexão REST ativa com TOTVS Protheus ERP.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAIS DO SISTEMA --- */}

      {/* MODAL 1: VINCULAR COMPONENTE */}
      {showVincularModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800/90 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h3 className="font-black text-white text-lg">Vincular componente à {currentLoco.id}</h3>
              <button
                onClick={() => setShowVincularModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-300 mb-1.5">Tipo</label>
                <div className="relative">
                  <select
                    value={newCompData.type}
                    onChange={(e) =>
                      setNewCompData({ ...newCompData, type: e.target.value, name: e.target.value })
                    }
                    className="w-full bg-[#0b111e] border border-slate-800 rounded-xl p-3.5 text-slate-200 text-sm font-semibold appearance-none focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Governador de Potência">Governador de Potência</option>
                    <option value="Turboalimentador">Turboalimentador</option>
                    <option value="Injetor de Combustível">Injetor de Combustível</option>
                    <option value="Compressor de Ar">Compressor de Ar</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-4 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5">Nome</label>
                <input
                  type="text"
                  value={newCompData.name}
                  onChange={(e) => setNewCompData({ ...newCompData, name: e.target.value })}
                  className="w-full bg-[#0b111e] border border-slate-800 rounded-xl p-3.5 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1.5">Tag RFID</label>
                  <input
                    type="text"
                    placeholder="Ex: 4A8B9C10"
                    value={newCompData.rfid}
                    onChange={(e) => setNewCompData({ ...newCompData, rfid: e.target.value })}
                    className="w-full bg-[#0b111e] border border-slate-800 rounded-xl p-3.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1.5">Código Protheus</label>
                  <input
                    type="text"
                    placeholder="Ex: NE1400447"
                    value={newCompData.protheusCode}
                    onChange={(e) => setNewCompData({ ...newCompData, protheusCode: e.target.value })}
                    className="w-full bg-[#0b111e] border border-slate-800 rounded-xl p-3.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleVincularComponente}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3.5 rounded-xl text-sm transition shadow-lg shadow-emerald-500/10 mt-2"
            >
              Vincular componente
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: CADASTRAR NOVA LOCOMOTIVA */}
      {showNovaLocoModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800/90 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h3 className="font-black text-white text-lg">Cadastrar Nova Locomotiva</h3>
              <button
                onClick={() => setShowNovaLocoModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-300 mb-1.5">Código da Locomotiva</label>
                <input
                  type="text"
                  placeholder="Ex: L-5012"
                  value={newLocoData.code}
                  onChange={(e) => setNewLocoData({ ...newLocoData, code: e.target.value })}
                  className="w-full bg-[#0b111e] border border-slate-800 rounded-xl p-3.5 text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5">Modelo</label>
                <select
                  value={newLocoData.model}
                  onChange={(e) => setNewLocoData({ ...newLocoData, model: e.target.value })}
                  className="w-full bg-[#0b111e] border border-slate-800 rounded-xl p-3.5 text-slate-200 text-sm font-semibold"
                >
                  <option value="AC44">AC44</option>
                  <option value="C44-EMi">C44-EMi</option>
                  <option value="SD70">SD70</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCadastrarLocomotiva}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3.5 rounded-xl text-sm transition"
            >
              Adicionar Locomotiva
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: NOVO TÉCNICO */}
      {showNovoTecnicoModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800/90 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h3 className="font-black text-white text-lg">Novo técnico</h3>
              <button
                onClick={() => setShowNovoTecnicoModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-300 mb-1.5">Nome</label>
                <input
                  type="text"
                  value={newTecnicoData.name}
                  onChange={(e) => setNewTecnicoData({ ...newTecnicoData, name: e.target.value })}
                  className="w-full bg-[#0b111e] border border-slate-800 rounded-xl p-3.5 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1.5">Cargo</label>
                  <input
                    type="text"
                    value={newTecnicoData.role}
                    onChange={(e) => setNewTecnicoData({ ...newTecnicoData, role: e.target.value })}
                    className="w-full bg-[#0b111e] border border-slate-800 rounded-xl p-3.5 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1.5">Especialidade</label>
                  <input
                    type="text"
                    value={newTecnicoData.spec}
                    onChange={(e) => setNewTecnicoData({ ...newTecnicoData, spec: e.target.value })}
                    className="w-full bg-[#0b111e] border border-slate-800 rounded-xl p-3.5 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1.5">Matrícula</label>
                  <input
                    type="text"
                    value={newTecnicoData.matricula}
                    onChange={(e) => setNewTecnicoData({ ...newTecnicoData, matricula: e.target.value })}
                    className="w-full bg-[#0b111e] border border-slate-800 rounded-xl p-3.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1.5">Telefone</label>
                  <input
                    type="text"
                    value={newTecnicoData.phone}
                    onChange={(e) => setNewTecnicoData({ ...newTecnicoData, phone: e.target.value })}
                    className="w-full bg-[#0b111e] border border-slate-800 rounded-xl p-3.5 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5">Turno</label>
                <div className="relative">
                  <select
                    value={newTecnicoData.team}
                    onChange={(e) => setNewTecnicoData({ ...newTecnicoData, team: e.target.value })}
                    className="w-full bg-[#0b111e] border border-slate-800 rounded-xl p-3.5 text-slate-200 text-sm font-semibold appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noite">Noite</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-4 pointer-events-none" />
                </div>
              </div>
            </div>

            <button
              onClick={handleCadastrarTecnico}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3.5 rounded-xl text-sm transition shadow-lg shadow-emerald-500/10 mt-2"
            >
              Adicionar técnico
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: NOVA O.S. */}
      {showNovaOsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800/90 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h3 className="font-black text-white text-lg">Abrir Nova Ordem de Serviço</h3>
              <button
                onClick={() => setShowNovaOsModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-300 mb-1.5">Componente Alvo</label>
                <div className="relative">
                  <select
                    value={newOsData.component}
                    onChange={(e) => setNewOsData({ ...newOsData, component: e.target.value })}
                    className="w-full bg-[#0b111e] border border-slate-800 rounded-xl p-3.5 text-slate-200 text-sm font-semibold appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {components.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-4 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5">Tipo de Serviço</label>
                <input
                  type="text"
                  value={newOsData.type}
                  onChange={(e) => setNewOsData({ ...newOsData, type: e.target.value })}
                  placeholder="Ex: Substituição, Inspeção Preventiva"
                  className="w-full bg-[#0b111e] border border-slate-800 rounded-xl p-3.5 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1.5">Prioridade</label>
                  <div className="relative">
                    <select
                      value={newOsData.priority}
                      onChange={(e) => setNewOsData({ ...newOsData, priority: e.target.value })}
                      className="w-full bg-[#0b111e] border border-slate-800 rounded-xl p-3.5 text-slate-200 text-sm font-semibold appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Prioridade Alta">Prioridade Alta</option>
                      <option value="Prioridade Média">Prioridade Média</option>
                      <option value="Prioridade Baixa">Prioridade Baixa</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-4 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1.5">Responsável</label>
                  <input
                    type="text"
                    value={newOsData.responsible}
                    onChange={(e) => setNewOsData({ ...newOsData, responsible: e.target.value })}
                    className="w-full bg-[#0b111e] border border-slate-800 rounded-xl p-3.5 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleCriarNovaOS}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3.5 rounded-xl text-sm transition shadow-lg shadow-emerald-500/10 mt-2"
            >
              Criar O.S.
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: SUBSTITUIR PEÇA */}
      {showSubstituirModal && selectedCompForSub && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-base">Substituir Peça: {selectedCompForSub.name}</h3>
              <button onClick={() => setShowSubstituirModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <button
              onClick={() => {
                alert("Peça substituída!");
                setShowSubstituirModal(false);
              }}
              className="w-full bg-emerald-500 text-slate-950 font-extrabold py-3 rounded-xl text-sm"
            >
              Confirmar Substituição
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
