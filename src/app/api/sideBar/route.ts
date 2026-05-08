import { NextRequest } from "next/server";
import { consultarBancoDados } from "@/services/database";
import { obterIdUsuarioAutenticado } from "@/utils/autenticacao";
import { criarRespostaApi } from "@/utils/respostaApi";

type VerificacaoSideBar = {
    usuario_ativo: boolean;
    disponibilidade: string | null;
};

type DadosVerificacaoSideBar = {
    acessoPermitido: boolean;
};

/**
 * Endpoint GET de verificação da sidebar.
 * Use para confirmar se o usuário logado continua ativo e se a aplicação está disponível.
 */
export async function GET(request: NextRequest) {
    try {
        const idUsuario = obterIdUsuarioAutenticado(request);

        if (!idUsuario) {
            return criarRespostaApi<DadosVerificacaoSideBar>(
                false,
                "Sessão inválida ou expirada.",
                { acessoPermitido: false },
                401
            );
        }

        const resultado = await consultarBancoDados<VerificacaoSideBar>(
            `
                select
                    coalesce(u.ativo, false) as usuario_ativo,
                    c.disponibilidade
                from usuarios u
                cross join lateral (
                    select disponibilidade
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
            return criarRespostaApi(
                false,
                "Usuário inativo ou aplicação indisponível.",
                { acessoPermitido: false },
                403
            );
        }

        return criarRespostaApi(true, "Acesso liberado.", { acessoPermitido: true });
    } catch {
        return criarRespostaApi<DadosVerificacaoSideBar>(
            false,
            "Não foi possível verificar o acesso.",
            { acessoPermitido: false },
            500
        );
    }
}
