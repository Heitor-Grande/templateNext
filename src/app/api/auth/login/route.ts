import { NextRequest } from "next/server";
import { consultarBancoDados } from "@/services/database";
import { validarHash } from "@/utils/criptografia";
import { criarJWT } from "@/utils/jwt";
import { criarRespostaApi } from "@/utils/respostaApi";
import { validarEmail, validarStringComConteudo } from "@/utils/validacoes";

const MAX_AGE_COOKIE_PADRAO_SEGUNDOS = 60 * 60 * 24 * 7;

type LoginBody = {
    email?: unknown;
    password?: unknown;
};

type UsuarioLogin = {
    id: string;
    email: string;
    senha_hash: string;
    salt: string;
    ativo: boolean;
};

/**
 * Retorna a validade do cookie de sessão em segundos.
 * Use a variavel MAXAGE_COOKIE para manter o cookie alinhado com a validade do JWT.
 */
function obterMaxAgeCookieSessao(): number {
    const maxAgeCookie = Number(process.env.MAXAGE_COOKIE);

    return Number.isFinite(maxAgeCookie) && maxAgeCookie > 0 ? maxAgeCookie : MAX_AGE_COOKIE_PADRAO_SEGUNDOS;
}

/**
 * Resposta padronizada para falhas de autenticação.
 * Use mensagem genérica para não revelar se o e-mail existe ou qual campo falhou.
 */
function criarRespostaCredenciaisInvalidas() {
    return criarRespostaApi(false, "E-mail ou senha inválidos.", null, 401);
}

/**
 * Endpoint POST de login.
 * Valida entrada, autentica pelo banco e grava a sessão em cookie httpOnly sem retornar token ao front.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as LoginBody;
        const email = validarStringComConteudo(body.email) ? body.email.trim().toLowerCase() : "";
        const password = validarStringComConteudo(body.password) ? body.password : "";

        if (!validarEmail(email) || !password) {
            return criarRespostaCredenciaisInvalidas();
        }

        const resultadoUsuario = await consultarBancoDados<UsuarioLogin>(
            `
                select
                    id,
                    email,
                    senha_hash,
                    salt,
                    ativo
                from usuarios
                where lower(email) = $1
                limit 1
            `,
            [email]
        );

        const usuario = resultadoUsuario.rows[0];

        if (!usuario || !usuario.ativo || !validarHash(password, usuario.senha_hash, usuario.salt)) {
            return criarRespostaCredenciaisInvalidas();
        }

        const resposta = criarRespostaApi(true, "Login realizado com sucesso.", null);

        resposta.cookies.set("app_session", criarJWT(usuario.id), {
            httpOnly: true,
            secure: process.env.AMBIENTE === "PROD",
            sameSite: "lax",
            path: "/",
            maxAge: obterMaxAgeCookieSessao(),
        });

        return resposta;
    } catch (erro) {
        if (erro instanceof SyntaxError) {
            return criarRespostaApi(false, "Requisição inválida.", null, 400);
        }

        return criarRespostaApi(false, "Não foi possível realizar o login.", null, 500);
    }
}
