import { consultarBancoDados } from "@/services/database";
import { criarRespostaApi } from "@/utils/respostaApi";
import { validarEmail, validarStringComConteudo } from "@/utils/validacoes";

type ConfiguracaoAplicacao = {
    id: number;
    fantasia: string;
    cnpj: string;
    email_suporte_contato: string;
    contato: string;
    disponibilidade: string;
    criado_em: Date;
    atualizado_em: Date;
};

type AtualizacaoConfiguracaoBody = {
    fantasia?: unknown;
    cnpj?: unknown;
    emailSuporteContato?: unknown;
    contato?: unknown;
    disponibilidade?: unknown;
};

const DISPONIBILIDADES_VALIDAS = [
    "disponivel",
    "bloqueado_manutencao",
    "bloqueado_pagamento",
];

/**
 * Endpoint GET de configurações da aplicação.
 * Use para carregar o único registro de configuração disponível no sistema.
 */
export async function GET() {
    try {
        const resultado = await consultarBancoDados<ConfiguracaoAplicacao>(
            `
                select
                    id,
                    fantasia,
                    cnpj,
                    email_suporte_contato,
                    contato,
                    disponibilidade,
                    criado_em,
                    atualizado_em
                from configuracao
                limit 1
            `
        );

        return criarRespostaApi(true, "Configurações carregadas com sucesso.", resultado.rows[0] ?? null);
    } catch {
        return criarRespostaApi(false, "Não foi possível carregar as configurações.", null, 500);
    }
}

/**
 * Endpoint PUT de configurações da aplicação.
 * Atualiza o único registro de configuração existente sem criar novos registros.
 */
export async function PUT(request: Request) {
    try {
        const body = await request.json() as AtualizacaoConfiguracaoBody;

        const fantasia = validarStringComConteudo(body.fantasia) ? body.fantasia.trim() : "";
        const cnpj = validarStringComConteudo(body.cnpj) ? body.cnpj.trim() : "";
        const emailSuporteContato = validarStringComConteudo(body.emailSuporteContato)
            ? body.emailSuporteContato.trim().toLowerCase()
            : "";
        const contato = validarStringComConteudo(body.contato) ? body.contato.trim() : "";
        const disponibilidade = validarStringComConteudo(body.disponibilidade) ? body.disponibilidade.trim() : "";

        if (
            !fantasia
            || fantasia.length > 120
            || !cnpj
            || cnpj.length > 20
            || !validarEmail(emailSuporteContato)
            || emailSuporteContato.length > 180
            || !contato
            || contato.length > 120
            || !DISPONIBILIDADES_VALIDAS.includes(disponibilidade)
        ) {
            return criarRespostaApi(false, "Informe os dados de configuração dentro do limite permitido.", null, 400);
        }

        const resultado = await consultarBancoDados<ConfiguracaoAplicacao>(
            `
                update configuracao
                set
                    fantasia = $1,
                    cnpj = $2,
                    email_suporte_contato = $3,
                    contato = $4,
                    disponibilidade = $5,
                    atualizado_em = now()
                where id = (
                    select id
                    from configuracao
                    order by id
                    limit 1
                )
                returning
                    id,
                    fantasia,
                    cnpj,
                    email_suporte_contato,
                    contato,
                    disponibilidade,
                    criado_em,
                    atualizado_em
            `,
            [
                fantasia,
                cnpj,
                emailSuporteContato,
                contato,
                disponibilidade,
            ]
        );

        const configuracao = resultado.rows[0];

        if (!configuracao) {
            return criarRespostaApi(false, "Configuração não encontrada.", null, 404);
        }

        return criarRespostaApi(true, "Configurações atualizadas com sucesso.", configuracao);
    } catch (erro) {
        if (erro instanceof SyntaxError) {
            return criarRespostaApi(false, "Requisição inválida.", null, 400);
        }

        if (erro instanceof Error && "code" in erro && erro.code === "23505") {
            return criarRespostaApi(false, "Já existe uma configuração com este CNPJ.", null, 409);
        }

        return criarRespostaApi(false, "Não foi possível atualizar as configurações.", null, 500);
    }
}
