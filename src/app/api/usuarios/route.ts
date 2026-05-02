import { NextRequest } from "next/server";
import { consultarBancoDados } from "@/services/database";
import { normalizarCampoOpcional, validarEmail, validarStringComConteudo } from "@/utils/validacoes";
import { criarHash } from "@/utils/criptografia";
import { criarRespostaApi } from "@/utils/respostaApi";

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
 * Endpoint GET de usuários.
 * Use para alimentar tabelas de listagem sem retornar dados sensíveis como senha_hash.
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

        return criarRespostaApi(true, "Usuários listados com sucesso.", resultado.rows);
    } catch {
        return criarRespostaApi<UsuarioListado[]>(false, "Não foi possível listar os usuários.", [], 500);
    }
}

/**
 * Endpoint POST de usuários.
 * Valida dados básicos, cria hash da senha e cadastra o usuário sem retornar dados sensíveis.
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
            return criarRespostaApi(false, "Informe nome, e-mail válido e senha com pelo menos 6 caracteres.", null, 400);
        }

        if (senha !== confirmarSenha) {
            return criarRespostaApi(false, "As senhas informadas não conferem.", null, 400);
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

        return criarRespostaApi(true, "Usuário cadastrado com sucesso.", null, 201);
    } catch (erro) {
        if (erro instanceof SyntaxError) {
            return criarRespostaApi(false, "Requisição inválida.", null, 400);
        }

        if (erro instanceof Error && "code" in erro && erro.code === "23505") {
            return criarRespostaApi(false, "Já existe um usuário cadastrado com este e-mail.", null, 409);
        }

        return criarRespostaApi(false, "Não foi possível cadastrar o usuário.", null, 500);
    }
}
