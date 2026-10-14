// Mock do cliente Base44 para desenvolvimento local offline
export const base44 = {
  auth: {
    me: async () => ({ id: "user-1", name: "Operador ViaForte" }),
    login: async () => true,
  },
  entities: {
    Locomotive: {
      list: async () => [],
    },
  },
};