import { NextRequest } from "next/server";
import { consultarBancoDados } from "@/services/database";
import { obterIdUsuarioAutenticado } from "@/utils/autenticacao";
import { criarRespostaApi } from "@/utils/respostaApi";

type VerificacaoSideBar = {
    usuario_ativo: boolean;
    disponibilidade: string | null;
    fantasia: string | null;
};

type DadosVerificacaoSideBar = {
    acessoPermitido: boolean;
    fantasiaEmpresa: string;
};

/**
 * Endpoint GET de verificação da sidebar.
 * Use para confirmar acesso interno e carregar dados mínimos do layout, como fantasia da empresa.
 */
export async function GET(request: NextRequest) {
    try {
        const idUsuario = obterIdUsuarioAutenticado(request);

        if (!idUsuario) {
            return criarRespostaApi<DadosVerificacaoSideBar>(
                false,
                "Sessão inválida ou expirada.",
                {
                    acessoPermitido: false,
                    fantasiaEmpresa: "",
                },
                401
            );
        }

        const resultado = await consultarBancoDados<VerificacaoSideBar>(
            `
                select
                    coalesce(u.ativo, false) as usuario_ativo,
                    c.disponibilidade,
                    c.fantasia
                from usuarios u
                cross join lateral (
                    select
                        disponibilidade,
                        fantasia
                    from configuracao
                    limit 1
                ) c
                where u.id = $1
                limit 1
            `,
            [idUsuario]
        );

        const verificacao = resultado.rows[0];
        const acessoPermitido = Boolean(
            verificacao?.usuario_ativo
            && verificacao.disponibilidade === "disponivel"
        );

        if (!acessoPermitido) {
            return criarRespostaApi<DadosVerificacaoSideBar>(
                false,
                "Usuário inativo ou aplicação indisponível.",
                {
                    acessoPermitido: false,
                    fantasiaEmpresa: verificacao?.fantasia ?? "",
                },
                403
            );
        }

        return criarRespostaApi<DadosVerificacaoSideBar>(
            true,
            "Acesso liberado.",
            {
                acessoPermitido: true,
                fantasiaEmpresa: verificacao.fantasia ?? "Template",
            }
        );
    } catch {
        return criarRespostaApi<DadosVerificacaoSideBar>(
            false,
            "Não foi possível verificar o acesso.",
            {
                acessoPermitido: false,
                fantasiaEmpresa: "",
            },
            500
        );
    }
}
