export const customHeadersV3 = new Headers();

customHeadersV3.append(
  "Authorization",
  `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjM4NDkzMzMwZDc4MTIzYWFhZjYwNGY0MDlmZjhmODY2ZmJmNjgyZGJjOTlmMWRkNjlhODhmNDUwYWI2NDJjNjI4NmU5NjBlNjBmMTgzZTMwIn0.eyJhdWQiOiJBUFAtMzlmY2UxMjQtY2NkNS00ZGE2LWEwNGItYzIyY2Q3ZTU2ODY1IiwianRpIjoiMzg0OTMzMzBkNzgxMjNhYWFmNjA0ZjQwOWZmOGY4NjZmYmY2ODJkYmM5OWYxZGQ2OWE4OGY0NTBhYjY0MmM2Mjg2ZTk2MGU2MGYxODNlMzAiLCJpYXQiOjE3MzIwNDc5MDksIm5iZiI6MTczMjA0NzkwOSwiZXhwIjoxNzQ3Njg2MzA5LCJzdWIiOiIxMzEzOTIiLCJzY29wZXMiOlsiaW5zdGFsbF9hcHAiLCJyZWFkX2FnZW50X3Byb2ZpbGUiXX0.gI2nP0j6YRUMqcZNvQ1-7ivLsKOioypoFapoffe-SwHW-bP_h5ohVsTUjNfkVIkw7u_ia0aVggpR7N_FRl-Pf8MCu7mxLa_Gk2Ozy13tUMza-bNGG4b63ztUNBt8iHyNYOHhmJd9_B2MkeXaPlua9yNbKdUiiOg7LJAnqqU3U78`
);
customHeadersV3.append("Accept", "application/json");
customHeadersV3.append("Content-Type", "application/json");
customHeadersV3.append("Accept-Language", "pt-br");

export const execFlowVariablesV3 = {
  uuid: "dedae4f0-8275-4d9d-abb6-66af99730b73", //CHANNEL UUID
  flowId: 259215,
  whenInChat: true,
  whenWaitForChat: false,
  whenInAuto: true,
};

export const getContact = async (phone: string, email: string) => {
  try {
    const response = await fetch(
      `https://api.huggy.app/v3/contacts?phone=${phone}`,
      {
        method: "GET",
        headers: customHeadersV3,
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
  try {
    const response = await fetch(`https://api.huggy.app/v3/contacts`, {
      method: "POST",
      headers: customHeadersV3,
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

  try {
    const response = await fetch(`https://api.huggy.app/v3/contacts/${id}`, {
      method: "PUT",
      headers: customHeadersV3,
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
    let contextVariables: ContextVariables = {};

    variables.variables.forEach((variable) => {
      contextVariables[variable.chave] = variable.valor;
    });

    const response = await fetch(
      `https://api.huggy.app/v3/contacts/${contactId}/execFlow`,
      {
        method: "PUT",
        headers: customHeadersV3,
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
