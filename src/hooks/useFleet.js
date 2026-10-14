import { useState } from "react";

const mockLocomotive = {
  id: "L-4027",
  code: "L-4027",
  model: "AC44",
  yard: "Pátio de Araraquara / Linha 04",
  status: "Ativa",
  lastRead: "última leitura há 8 dias",
  totalOdometer: 842615,
  componentsCount: 4,
  onScheduleCount: 2,
  attentionCount: 0,
  criticalCount: 2,
  components: [
    {
      id: "comp-1",
      name: "Compressor de ar",
      type: "Compressor de Ar",
      rfid: "ME1498772",
      protheusCode: "ME1498772",
      kmSinceInstall: 31488,
      remainingLife: 79.8,
      status: "Normal",
    },
    {
      id: "comp-2",
      name: "Governador de potência",
      type: "Governador de Potência",
      rfid: "ME3088477",
      protheusCode: "ME3088477",
      kmSinceInstall: 42635,
      remainingLife: 57.4,
      status: "Normal",
    },
    {
      id: "comp-3",
      name: "Injetor de combustível",
      type: "Injetor de Combustível",
      rfid: "A23258204",
      protheusCode: "A23258204",
      kmSinceInstall: 376615,
      remainingLife: 3.9,
      status: "Crítico",
    },
    {
      id: "comp-4",
      name: "Turbo alimentador",
      type: "Turboalimentador",
      rfid: "12345678",
      protheusCode: "ME1800507",
      kmSinceInstall: 188415,
      remainingLife: 0.0,
      status: "Crítico",
    },
  ],
};

export function useFleet() {
  const [selectedLoco, setSelectedLoco] = useState(mockLocomotive);

  return {
    locomotives: [mockLocomotive],
    selectedLocomotive: selectedLoco,
    setSelectedLocomotive: setSelectedLoco,
    isLoading: false,
    error: null,
    refetch: () => {},
  };
}

export function useLocomotives() {
  return useFleet();
}

export function useSelectedLoco() {
  const { selectedLocomotive } = useFleet();
  return { selectedLoco: selectedLocomotive, isLoading: false };
}

export function useComponents() {
  return {
    components: mockLocomotive.components,
    isLoading: false,
    error: null,
  };
}

export function useRefresh() {
  return {
    refresh: () => {},
    isRefreshing: false,
  };
}