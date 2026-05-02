import jwt from "jsonwebtoken";
import type { JwtPayload, SignOptions } from "jsonwebtoken";

type PayloadJWT = JwtPayload & {
    idUsuario: string;
    dataLogin: string;
};

/**
 * Cria um JWT com id do usuario e data de login.
 * Use para gerar o valor do cookie de sessao da aplicacao.
 */
export function criarJWT(idUsuario: string): string {
    const segredo = obterSegredoJWT();
    const validade = (process.env.JWT_VALIDADE) as SignOptions["expiresIn"];

    return jwt.sign(
        {
            idUsuario: idUsuario,
            dataLogin: new Date().toISOString(),
        },
        segredo,
        {
            expiresIn: validade,
        }
    );
}

/**
 * Valida se o JWT informado possui assinatura correta e ainda nao expirou.
 * Retorna true para tokens validos e false para tokens invalidos ou expirados.
 */
export function validarJWT(token: string): boolean {
    try {
        const payload = jwt.verify(token, obterSegredoJWT()) as PayloadJWT;

        return typeof payload.idUsuario === "string" && typeof payload.dataLogin === "string";
    } catch {
        return false;
    }
}

function obterSegredoJWT(): string {
    const segredo = process.env.JWT_SECRET;

    if (!segredo) {
        throw new Error("JWT_SECRET nao configurado.");
    }

    return segredo;
}
