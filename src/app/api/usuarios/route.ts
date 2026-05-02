import { NextRequest, NextResponse } from "next/server";
import { consultarBancoDados } from "@/services/database";
import { normalizarCampoOpcional, validarEmail, validarStringComConteudo } from "@/utils/validacoes";
import { criarHash } from "@/utils/criptografia";

type UsuarioListado = {
    id: number;
    nome: string;
    email: string;
    telefone: string | null;
    documento: string | null;
    ativo: boolean;
    criado_em: Date;
};

type CadastroUsuarioBody = {
    nome?: string;
    email?: string;
    senha?: string;
    confirmarSenha?: string;
    telefone?: string;
    documento?: string;
};

/**
 * Endpoint GET de usuarios.
 * Use para alimentar tabelas de listagem sem retornar dados sensiveis como senha_hash.
 */
export async function GET() {
    try {
        const resultado = await consultarBancoDados<UsuarioListado>(
            `
                select
                    id,
                    nome,
                    email,
                    telefone,
                    documento,
                    ativo,
                    criado_em
                from usuarios
                order by criado_em desc
            `
        );

        return NextResponse.json({
            success: true,
            usuarios: resultado.rows,
        });
    } catch {
        return NextResponse.json(
            {
                success: false,
                message: "Nao foi possivel listar os usuarios.",
                usuarios: [],
            },
            { status: 500 }
        );
    }
}

/**
 * Endpoint POST de usuarios.
 * Valida dados basicos, cria hash da senha e cadastra o usuario sem retornar dados sensiveis.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as CadastroUsuarioBody;

        const nome = validarStringComConteudo(body.nome) ? body.nome.trim() : "";
        const email = validarStringComConteudo(body.email) ? body.email.trim().toLowerCase() : "";
        const senha = validarStringComConteudo(body.senha) ? body.senha : "";
        const confirmarSenha = validarStringComConteudo(body.confirmarSenha) ? body.confirmarSenha : "";
        const telefone = normalizarCampoOpcional(body.telefone);
        const documento = normalizarCampoOpcional(body.documento);

        if (!nome || !validarEmail(email) || senha.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Informe nome, e-mail valido e senha com pelo menos 6 caracteres.",
                },
                { status: 400 }
            );
        }

        if (senha !== confirmarSenha) {
            return NextResponse.json(
                {
                    success: false,
                    message: "As senhas informadas nao conferem.",
                },
                { status: 400 }
            );
        }

        const senhaCriptografada = criarHash(senha);

        await consultarBancoDados(
            `
                insert into usuarios (
                    nome,
                    email,
                    senha_hash,
                    salt,
                    telefone,
                    documento
                )
                values ($1, $2, $3, $4, $5, $6)
            `,
            [
                nome,
                email,
                senhaCriptografada.hash,
                senhaCriptografada.salt,
                telefone,
                documento,
            ]
        );

        return NextResponse.json(
            {
                success: true,
                message: "Usuario cadastrado com sucesso.",
            },
            { status: 201 }
        );
    } catch (erro) {
        if (erro instanceof SyntaxError) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Requisicao invalida.",
                },
                { status: 400 }
            );
        }

        if (erro instanceof Error && "code" in erro && erro.code === "23505") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Ja existe um usuario cadastrado com este e-mail.",
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Nao foi possivel cadastrar o usuario.",
            },
            { status: 500 }
        );
    }
}
