import { NextRequest, NextResponse } from "next/server";
import { validarJWT } from "@/utils/jwt";

const NOME_COOKIE_SESSAO = "app_session";
const ROTAS_PUBLICAS = ["/", "/api/auth/login"];

// Verifica se o caminho da requisição é uma rota pública.
function rotaPublica(caminho: string): boolean {
    return ROTAS_PUBLICAS.includes(caminho);
}

/**
 * Proxy global de autenticacao.
 * Use para bloquear rotas protegidas quando o cookie de sessao nao possuir um JWT valido.
 */
export function proxy(request: NextRequest) {
    const caminho = request.nextUrl.pathname;

    if (rotaPublica(caminho)) {
        return NextResponse.next();
    }

    const token = request.cookies.get(NOME_COOKIE_SESSAO)?.value;

    if (token && validarJWT(token)) {
        return NextResponse.next();
    }

    if (caminho.startsWith("/api")) {
        return NextResponse.json(
            {
                success: false,
                message: "Sessao invalida ou expirada.",
            },
            { status: 401 }
        );
    }

    return NextResponse.redirect(new URL("/", request.url));
}

// Não aplica o proxy para os caminhos do array de rotas públicas, arquivos estáticos e assets.
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
    ],
};
