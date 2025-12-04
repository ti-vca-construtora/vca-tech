export type PhoneValidationResult = {
  phone: string;
  isValid: boolean;
  isBrazilian: boolean;
  originalPhone: string;
  issues: string[];
};

/**
 * Normaliza um número de telefone removendo tudo que não for dígito
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Valida se o número está no padrão brasileiro esperado:
 * - 13 dígitos
 * - Começa com 55 (código do Brasil)
 * - 3º dígito diferente de 0
 * - 5º dígito igual a 9 (celular)
 */
export function validateBrazilianPhone(
  normalizedPhone: string
): PhoneValidationResult {
  const issues: string[] = [];
  let isValid = true;
  let isBrazilian = true;

  // Verifica se tem 13 dígitos
  if (normalizedPhone.length !== 13) {
    issues.push(
      `Tamanho inválido (${normalizedPhone.length} dígitos, esperado 13)`
    );
    isValid = false;
  }

  // Verifica se começa com 55
  if (!normalizedPhone.startsWith("55")) {
    issues.push("Não começa com código brasileiro (55)");
    isBrazilian = false;
    isValid = false;
  }

  // Verifica se o 3º dígito é diferente de 0 (DDD válido)
  if (normalizedPhone.length >= 3 && normalizedPhone[2] === "0") {
    issues.push("DDD inválido (3º dígito é 0)");
    isValid = false;
  }

  // Verifica se o 5º dígito é 9 (celular)
  if (normalizedPhone.length >= 5 && normalizedPhone[4] !== "9") {
    issues.push("Não é número de celular (5º dígito deve ser 9)");
    isValid = false;
  }

  return {
    phone: normalizedPhone,
    isValid,
    isBrazilian,
    originalPhone: normalizedPhone,
    issues,
  };
}

/**
 * Valida uma lista de telefones
 */
export function validatePhoneList(phones: string[]): PhoneValidationResult[] {
  return phones.map((phone) => validateBrazilianPhone(phone));
}

/**
 * Identifica números estrangeiros (que não começam com 55)
 */
export function identifyForeignNumbers(
  validationResults: PhoneValidationResult[]
): PhoneValidationResult[] {
  return validationResults.filter((result) => !result.isBrazilian || !result.isValid);
}
