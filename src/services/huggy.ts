// Função para obter headers atualizados
const getHuggyHeaders = () => {
  const HUGGY_TOKEN = process.env.NEXT_PUBLIC_ACCESS_TOKEN_V3 || "";
  console.log("🔑 Token Huggy carregado:", HUGGY_TOKEN ? `${HUGGY_TOKEN.substring(0, 20)}...` : "TOKEN NÃO ENCONTRADO");
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${HUGGY_TOKEN}`);
  headers.append("Accept", "application/json");
  headers.append("Content-Type", "application/json");
  headers.append("Accept-Language", "pt-br");
  return headers;
};

export const execFlowVariablesV3 = {
  uuid: "dedae4f0-8275-4d9d-abb6-66af99730b73", // CHANNEL UUID
  flowId: 259215,
  whenInChat: true,
  whenWaitForChat: false,
  whenInAuto: true,
};

export const getContact = async (phone: string) => {
  const HUGGY_URL = process.env.HUGGY_V3_URL || "https://api.huggy.app/v3";
  try {
    const response = await fetch(
      `${HUGGY_URL}/contacts?phone=${phone}`,
      {
        method: "GET",
        headers: getHuggyHeaders(),
      }
    );

    if (!response.ok) throw new Error("Erro HTTP ao buscar por usuário");

    const data = await response.json();

    return data;
  } catch (error) {
    console.log("get contact error: ", error);
    return [];
  }
};

export type FormContactType = {
  nome: string;
  telefone: string;
  email: string;
};

export type GetContactType = {
  name: string;
  phone: string;
  email: string;
};

export type PutContactType = {
  name: string;
  phone: string;
  email: string;
  mobile?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  obs?: string;
};

export const postContact = async (lead: FormContactType) => {
  const HUGGY_URL = process.env.HUGGY_V3_URL || "https://api.huggy.app/v3";
  try {
    const response = await fetch(`${HUGGY_URL}/contacts`, {
      method: "POST",
      headers: getHuggyHeaders(),
      body: JSON.stringify({
        name: lead.nome,
        phone: lead.telefone,
      }),
    });

    if (!response.ok) throw new Error("Erro HTTP ao criar usuário");

    const data = await response.json();

    console.log(data);

    return data;
  } catch (error) {
    console.log("post contact error: ", error);
  }
};

export const putContact = async (lead: PutContactType, id: string) => {
  const modifiedLead = {
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    mobile: lead.phone,
  };

  const HUGGY_URL = process.env.HUGGY_V3_URL || "https://api.huggy.app/v3";
  try {
    const response = await fetch(`${HUGGY_URL}/contacts/${id}`, {
      method: "PUT",
      headers: getHuggyHeaders(),
      body: JSON.stringify(modifiedLead),
    });

    if (!response.ok) throw new Error("Erro HTTP ao modificar o usuário");
  } catch (error) {
    console.log("put contact error: ", error);
  }
};

interface ContextVariables {
  [chave: string]: string;
}

export const putContactFlow = async (
  contactId: number,
  variables: {
    flowId: string;
    uuid: string;
    variables: { chave: string; valor: string }[];
  }
) => {
  try {
    const contextVariables: ContextVariables = {};

    variables.variables.forEach((variable) => {
      contextVariables[variable.chave] = variable.valor;
    });

    const HUGGY_URL = process.env.HUGGY_V3_URL || "https://api.huggy.app/v3";
    const response = await fetch(
      `${HUGGY_URL}/contacts/${contactId}/execFlow`,
      {
        method: "PUT",
        headers: getHuggyHeaders(),
        body: JSON.stringify({
          uuid: variables.uuid,
          flowId: variables.flowId,
          variables: contextVariables,
          whenInChat: true,
          whenWaitForChat: false,
          whenInAuto: true,
        }),
      }
    );

    if (!response.ok) {
      console.log(response);
      throw new Error("HTTP ERROR");
    }

    const text = await response.text();

    console.log(text);

    return text;
  } catch (error) {
    console.log(error);
  }
};
