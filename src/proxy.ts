import { NextRequest, NextResponse } from "next/server";
import { consultarBancoDados } from "@/services/database";
import { obterIdUsuarioAutenticado } from "@/utils/autenticacao";
import { criarRespostaApi } from "@/utils/respostaApi";

const ROTAS_PUBLICAS = ["/", "/api/auth/login"];

type UsuarioSessao = {
    id: number;
};

// Verifica se o caminho da requisição é uma rota pública.
function rotaPublica(caminho: string): boolean {
    return ROTAS_PUBLICAS.includes(caminho);
}

/**
 * Confirma se o usuário da sessão ainda existe e permanece ativo.
 * Use no proxy para impedir acesso com JWT válido de usuário desativado.
 */
async function usuarioEstaAtivo(idUsuario: number): Promise<boolean> {
    const resultado = await consultarBancoDados<UsuarioSessao>(
        `
            select
                id
            from usuarios
            where id = $1
              and ativo = true
            limit 1
        `,
        [idUsuario]
    );

    return Boolean(resultado.rows[0]);
}

/**
 * Proxy global de autenticação.
 * Use para bloquear rotas protegidas quando o cookie de sessão não possuir JWT válido ou o usuário estiver inativo.
 */
export async function proxy(request: NextRequest) {
    const caminho = request.nextUrl.pathname;

    if (rotaPublica(caminho)) {
        return NextResponse.next();
    }

    const idUsuario = obterIdUsuarioAutenticado(request);

    if (idUsuario && await usuarioEstaAtivo(idUsuario)) {
        return NextResponse.next();
    }

    if (caminho.startsWith("/api")) {
        return criarRespostaApi(false, "Sessão inválida ou expirada.", null, 401);
    }

    return NextResponse.redirect(new URL("/", request.url));
}

// Não aplica o proxy para rotas públicas, arquivos estáticos e assets.
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
    ],
};
