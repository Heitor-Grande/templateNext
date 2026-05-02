/**
 * Confirma se um valor desconhecido e uma string com conteudo.
 * Use para campos obrigatorios recebidos de formularios, APIs ou JSON externo antes de chamar trim(), toLowerCase() ou salvar no banco.
 * Nao use para campos opcionais quando string vazia deve virar null; nesse caso, use normalizarCampoOpcional.
 */
export function validarStringComConteudo(valor: unknown): valor is string {
    return typeof valor === "string" && valor.trim().length > 0;
}

/**
 * Valida o formato basico de um e-mail.
 * Use depois de confirmar que o valor e string, em fluxos de cadastro, login e recuperacao de senha.
 * Nao use como unica validacao de existencia de usuario; ela valida apenas formato.
 */
export function validarEmail(valor: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

/**
 * Normaliza campos opcionais para salvar no banco.
 * Use quando o campo pode ficar vazio, como telefone, documento, complemento ou observacao.
 * Retorna a string sem espacos quando preenchida, ou null quando estiver vazia ou vier em tipo invalido.
 */
export function normalizarCampoOpcional(valor: unknown): string | null {
    return validarStringComConteudo(valor) ? valor.trim() : null;
}
