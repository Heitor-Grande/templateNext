import { NextRequest } from "next/server";
import { consultarBancoDados } from "@/services/database";
import { obterIdUsuarioAutenticado } from "@/utils/autenticacao";
import { verificarPermissaoAPI } from "@/utils/permissoes";
import { criarRespostaApi } from "@/utils/respostaApi";
import { normalizarCampoOpcional, validarEmail, validarStringComConteudo } from "@/utils/validacoes";

type EmpresaListada = {
    id: number;
    fantasia: string;
    cnpj: string;
    email: string | null;
    telefone: string | null;
    superior_id: number | null;
    superior_fantasia: string | null;
    ativo: boolean;
    criado_em: Date;
    atualizado_em: Date;
};

type EmpresaArvoreBanco = {
    id: number;
    fantasia: string;
    superior_id: number | null;
};

type EmpresaArvoreNo = EmpresaArvoreBanco & {
    children: EmpresaArvoreNo[];
};

type CadastroEmpresaBody = {
    id?: unknown;
    fantasia?: unknown;
    cnpj?: unknown;
    email?: unknown;
    telefone?: unknown;
    superiorId?: unknown;
    ativo?: unknown;
};

function normalizarCnpj(valor: unknown): string {
    return validarStringComConteudo(valor) ? valor.replace(/\D/g, "") : "";
}

function normalizarSuperiorId(valor: unknown): number | null {
    if (valor === null || valor === "" || typeof valor === "undefined") {
        return null;
    }

    return Number(valor);
}

/**
 * Confirma se a empresa superior informada pode ser usada pelo usuário autenticado.
 * Use antes de salvar superior_id para manter vínculo, status ativo e hierarquia raiz.
 */
async function verificarSuperiorValido({
    idSuperior,
    idUsuario,
    idEmpresaAtual,
}: {
    idSuperior: number | null;
    idUsuario: number | string;
    idEmpresaAtual?: number;
}): Promise<boolean> {
    if (idSuperior === null) {
        return true;
    }

    if (!Number.isInteger(idSuperior) || idSuperior <= 0 || idSuperior === idEmpresaAtual) {
        return false;
    }

    const resultado = await consultarBancoDados<{ id: number }>(
        `
            select e.id
            from empresas e
            inner join usuarios_empresas ue on ue.empresa_id = e.id
            where e.id = $1
                and ue.usuario_id = $2
                and e.ativo = true
                and e.superior_id is null
            limit 1
        `,
        [idSuperior, idUsuario]
    );

    return Boolean(resultado.rows[0]);
}

/**
 * Monta a árvore de empresas sem confiar em recursão infinita quando houver hierarquia inconsistente.
 * Use para converter a lista retornada pelo SQL recursivo no contrato da visualização em árvore.
 */
function montarArvoreEmpresas(empresas: EmpresaArvoreBanco[]): EmpresaArvoreNo[] {
    const empresasPorId = new Map<number, EmpresaArvoreNo>();
    const idsComPaiRenderizado = new Set<number>();

    const criariaCiclo = (idEmpresa: number, idSuperior: number | null): boolean => {
        const idsVisitados = new Set<number>();
        let idAtual: number | null = idSuperior;

        while (idAtual) {
            if (idAtual === idEmpresa) {
                return true;
            }

            if (idsVisitados.has(idAtual)) {
                return true;
            }

            idsVisitados.add(idAtual);
            idAtual = empresasPorId.get(idAtual)?.superior_id ?? null;
        }

        return false;
    };

    empresas.forEach((empresa) => {
        empresasPorId.set(empresa.id, {
            ...empresa,
            children: [],
        });
    });

    empresasPorId.forEach((empresa) => {
        if (!empresa.superior_id || empresa.superior_id === empresa.id) {
            return;
        }

        const superior = empresasPorId.get(empresa.superior_id);

        if (!superior) {
            return;
        }

        if (criariaCiclo(empresa.id, empresa.superior_id)) {
            return;
        }

        superior.children.push(empresa);
        idsComPaiRenderizado.add(empresa.id);
    });

    const ordenarNos = (nos: EmpresaArvoreNo[]) => {
        nos.sort((empresaAtual, proximaEmpresa) => empresaAtual.fantasia.localeCompare(proximaEmpresa.fantasia, "pt-BR"));
        nos.forEach((empresa) => ordenarNos(empresa.children));
    };

    const raizes = Array.from(empresasPorId.values()).filter((empresa) => !idsComPaiRenderizado.has(empresa.id));

    ordenarNos(raizes);

    return raizes;
}

/**
 * Endpoint DELETE de empresas.
 * Remove os vínculos com usuários e exclui a empresa informada na query string.
 */
export async function DELETE(request: NextRequest) {
    try {
        const respostaPermissao = await verificarPermissaoAPI({
            request: request,
            recurso: "empresa",
            acao: "deletar",
        });

        if (respostaPermissao) {
            return respostaPermissao;
        }

        const idUsuario = obterIdUsuarioAutenticado(request);

        if (!idUsuario) {
            return criarRespostaApi(false, "Sessão inválida ou expirada.", null, 401);
        }

        const id = Number(request.nextUrl.searchParams.get("id"));

        if (!Number.isInteger(id) || id <= 0) {
            return criarRespostaApi(false, "Informe uma empresa válida para exclusão.", null, 400);
        }

        const resultado = await consultarBancoDados<EmpresaListada>(
            `
                with vinculos_removidos as (
                    delete from usuarios_empresas
                    where empresa_id = $1
                )
                delete from empresas
                where id = $1
                returning id,
                    fantasia,
                    cnpj,
                    email,
                    telefone,
                    superior_id,
                    null::varchar as superior_fantasia,
                    ativo,
                    criado_em,
                    atualizado_em
            `,
            [id]
        );

        if (!resultado.rows[0]) {
            return criarRespostaApi(false, "Empresa não encontrada.", null, 404);
        }

        return criarRespostaApi(true, "Empresa excluída com sucesso.", null);
    } catch {
        return criarRespostaApi(false, "Não foi possível excluir a empresa.", null, 500);
    }
}

function obterBooleanoAtivo(valor: unknown): boolean {
    return typeof valor === "boolean" ? valor : true;
}

/**
 * Endpoint GET de empresas.
 * Use para listar empresas ou carregar uma empresa pelo id informado na query string.
 */
export async function GET(request: NextRequest) {
    try {
        const respostaPermissao = await verificarPermissaoAPI({
            request: request,
            recurso: "empresa",
            acao: "visualizar",
        });

        if (respostaPermissao) {
            return respostaPermissao;
        }

        const idUsuario = obterIdUsuarioAutenticado(request);
        const listarSuperiores = request.nextUrl.searchParams.get("superiores") === "true";
        const listarArvore = request.nextUrl.searchParams.get("arvore") === "true";
        const id = Number(request.nextUrl.searchParams.get("id"));

        if (!idUsuario) {
            return criarRespostaApi(false, "Sessão inválida ou expirada.", null, 401);
        }

        if (Number.isInteger(id) && id > 0) {
            const resultadoEmpresa = await consultarBancoDados<EmpresaListada>(
                `
                    select
                        e.id,
                        e.fantasia,
                        e.cnpj,
                        e.email,
                        e.telefone,
                        e.superior_id,
                        superior.fantasia as superior_fantasia,
                        e.ativo,
                        e.criado_em,
                        e.atualizado_em
                    from empresas e
                    left join empresas superior on superior.id = e.superior_id
                    where e.id = $1
                    limit 1
                `,
                [id]
            );

            const empresa = resultadoEmpresa.rows[0];

            if (!empresa) {
                return criarRespostaApi(false, "Empresa não encontrada.", null, 404);
            }

            return criarRespostaApi(true, "Empresa carregada com sucesso.", empresa);
        }

        if (listarSuperiores) {
            const idEmpresaAtual = Number(request.nextUrl.searchParams.get("empresaAtualId"));
            const possuiEmpresaAtual = Number.isInteger(idEmpresaAtual) && idEmpresaAtual > 0;

            const resultadoSuperiores = await consultarBancoDados<EmpresaListada>(
                `
                    select
                        e.id,
                        e.fantasia,
                        e.cnpj,
                        e.email,
                        e.telefone,
                        e.superior_id,
                        null::varchar as superior_fantasia,
                        e.ativo,
                        e.criado_em,
                        e.atualizado_em
                    from empresas e
                    inner join usuarios_empresas ue on ue.empresa_id = e.id
                    where ue.usuario_id = $1
                        and e.ativo = true
                        and e.superior_id is null
                        and ($2::bigint is null or e.id <> $2)
                    order by e.fantasia asc
                `,
                [idUsuario, possuiEmpresaAtual ? idEmpresaAtual : null]
            );

            return criarRespostaApi(true, "Empresas superiores listadas com sucesso.", resultadoSuperiores.rows);
        }

        if (listarArvore) {
            const resultadoArvore = await consultarBancoDados<EmpresaArvoreBanco>(
                `
                    with recursive empresas_vinculadas as (
                        select
                            e.id,
                            e.fantasia,
                            e.superior_id
                        from empresas e
                        inner join usuarios_empresas ue on ue.empresa_id = e.id
                        where ue.usuario_id = $1
                    ),
                    empresas_arvore as (
                        select
                            ev.id,
                            ev.fantasia,
                            ev.superior_id,
                            array[ev.id] as caminho
                        from empresas_vinculadas ev

                        union

                        select
                            superior.id,
                            superior.fantasia,
                            superior.superior_id,
                            empresas_arvore.caminho || superior.id
                        from empresas superior
                        inner join empresas_arvore on empresas_arvore.superior_id = superior.id
                        where not superior.id = any(empresas_arvore.caminho)
                    )
                    select distinct
                        id,
                        fantasia,
                        superior_id
                    from empresas_arvore
                    order by superior_id nulls first,
                        fantasia asc
                `,
                [idUsuario]
            );

            return criarRespostaApi(true, "Árvore de empresas carregada com sucesso.", montarArvoreEmpresas(resultadoArvore.rows));
        }

        const resultado = await consultarBancoDados<EmpresaListada>(
            `
                select
                    e.id,
                    e.fantasia,
                    e.cnpj,
                    e.email,
                    e.telefone,
                    e.superior_id,
                    superior.fantasia as superior_fantasia,
                    e.ativo,
                    e.criado_em,
                    e.atualizado_em
                from empresas e
                left join empresas superior on superior.id = e.superior_id
                inner join usuarios_empresas ue on ue.empresa_id = e.id
                where ue.usuario_id = $1
                order by e.criado_em desc
            `,
            [idUsuario]
        );

        return criarRespostaApi(true, "Empresas listadas com sucesso.", resultado.rows);
    } catch {
        return criarRespostaApi<EmpresaListada[]>(false, "Não foi possível listar as empresas.", [], 500);
    }
}

/**
 * Endpoint POST de empresas.
 * Valida os dados obrigatórios e cadastra uma empresa vinculando o usuário autenticado como criador.
 */
export async function POST(request: NextRequest) {
    try {
        const respostaPermissao = await verificarPermissaoAPI({
            request: request,
            recurso: "empresa",
            acao: "criar",
        });

        if (respostaPermissao) {
            return respostaPermissao;
        }

        const idUsuario = obterIdUsuarioAutenticado(request);

        if (!idUsuario) {
            return criarRespostaApi(false, "Sessão inválida ou expirada.", null, 401);
        }

        const body = await request.json() as CadastroEmpresaBody;
        const fantasia = validarStringComConteudo(body.fantasia) ? body.fantasia.trim() : "";
        const cnpj = normalizarCnpj(body.cnpj);
        const email = normalizarCampoOpcional(body.email)?.toLowerCase() ?? null;
        const telefone = normalizarCampoOpcional(body.telefone);
        const superiorId = normalizarSuperiorId(body.superiorId);
        const ativo = obterBooleanoAtivo(body.ativo);

        if (!fantasia || fantasia.length > 160 || cnpj.length !== 14) {
            return criarRespostaApi(false, "Informe nome da empresa e CNPJ com 14 dígitos.", null, 400);
        }

        if (email && (!validarEmail(email) || email.length > 180)) {
            return criarRespostaApi(false, "Informe um e-mail válido para a empresa.", null, 400);
        }

        if (telefone && telefone.length > 20) {
            return criarRespostaApi(false, "Telefone deve respeitar o limite de caracteres.", null, 400);
        }

        const superiorValido = await verificarSuperiorValido({
            idSuperior: superiorId,
            idUsuario: idUsuario,
        });

        if (!superiorValido) {
            return criarRespostaApi(false, "Informe uma empresa superior válida.", null, 400);
        }

        const resultado = await consultarBancoDados<EmpresaListada>(
            `
                insert into empresas (
                    fantasia,
                    cnpj,
                    email,
                    telefone,
                    superior_id,
                    ativo,
                    criado_por
                )
                values ($1, $2, $3, $4, $5, $6, $7)
                returning id,
                    fantasia,
                    cnpj,
                    email,
                    telefone,
                    superior_id,
                    null::varchar as superior_fantasia,
                    ativo,
                    criado_em,
                    atualizado_em
            `,
            [fantasia, cnpj, email, telefone, superiorId, ativo, idUsuario]
        );

        await consultarBancoDados(
            `
                insert into usuarios_empresas (
                    usuario_id,
                    empresa_id,
                    criado_por
                )
                values ($1, $2, $3)
                on conflict (usuario_id, empresa_id) do nothing
            `,
            [idUsuario, resultado.rows[0].id, idUsuario]
        );

        return criarRespostaApi(true, "Empresa cadastrada com sucesso.", resultado.rows[0], 201);
    } catch (erro) {
        if (erro instanceof SyntaxError) {
            return criarRespostaApi(false, "Requisição inválida.", null, 400);
        }

        if (erro instanceof Error && "code" in erro && erro.code === "23505") {
            return criarRespostaApi(false, "Já existe uma empresa cadastrada com este CNPJ.", null, 409);
        }

        return criarRespostaApi(false, "Não foi possível cadastrar a empresa.", null, 500);
    }
}

/**
 * Endpoint PUT de empresas.
 * Atualiza dados cadastrais e registra o usuário autenticado como responsável pela última alteração.
 */
export async function PUT(request: NextRequest) {
    try {
        const respostaPermissao = await verificarPermissaoAPI({
            request: request,
            recurso: "empresa",
            acao: "atualizar",
        });

        if (respostaPermissao) {
            return respostaPermissao;
        }

        const idUsuario = obterIdUsuarioAutenticado(request);

        if (!idUsuario) {
            return criarRespostaApi(false, "Sessão inválida ou expirada.", null, 401);
        }

        const body = await request.json() as CadastroEmpresaBody;
        const id = typeof body.id === "number" ? body.id : Number(body.id);
        const fantasia = validarStringComConteudo(body.fantasia) ? body.fantasia.trim() : "";
        const cnpj = normalizarCnpj(body.cnpj);
        const email = normalizarCampoOpcional(body.email)?.toLowerCase() ?? null;
        const telefone = normalizarCampoOpcional(body.telefone);
        const superiorId = normalizarSuperiorId(body.superiorId);
        const ativo = obterBooleanoAtivo(body.ativo);

        if (!Number.isInteger(id) || id <= 0) {
            return criarRespostaApi(false, "Informe uma empresa válida para atualização.", null, 400);
        }

        if (!fantasia || fantasia.length > 160 || cnpj.length !== 14) {
            return criarRespostaApi(false, "Informe nome da empresa e CNPJ com 14 dígitos.", null, 400);
        }

        if (email && (!validarEmail(email) || email.length > 180)) {
            return criarRespostaApi(false, "Informe um e-mail válido para a empresa.", null, 400);
        }

        if (telefone && telefone.length > 20) {
            return criarRespostaApi(false, "Telefone deve respeitar o limite de caracteres.", null, 400);
        }

        const superiorValido = await verificarSuperiorValido({
            idSuperior: superiorId,
            idUsuario: idUsuario,
            idEmpresaAtual: id,
        });

        if (!superiorValido) {
            return criarRespostaApi(false, "Informe uma empresa superior válida.", null, 400);
        }

        const resultado = await consultarBancoDados<EmpresaListada>(
            `
                update empresas
                set
                    fantasia = $1,
                    cnpj = $2,
                    email = $3,
                    telefone = $4,
                    superior_id = $5,
                    ativo = $6,
                    atualizado_por = $7,
                    atualizado_em = now()
                where id = $8
                returning id,
                    fantasia,
                    cnpj,
                    email,
                    telefone,
                    superior_id,
                    null::varchar as superior_fantasia,
                    ativo,
                    criado_em,
                    atualizado_em
            `,
            [fantasia, cnpj, email, telefone, superiorId, ativo, idUsuario, id]
        );

        if (!resultado.rows[0]) {
            return criarRespostaApi(false, "Empresa não encontrada.", null, 404);
        }

        return criarRespostaApi(true, "Empresa atualizada com sucesso.", resultado.rows[0]);
    } catch (erro) {
        if (erro instanceof SyntaxError) {
            return criarRespostaApi(false, "Requisição inválida.", null, 400);
        }

        if (erro instanceof Error && "code" in erro && erro.code === "23505") {
            return criarRespostaApi(false, "Já existe uma empresa cadastrada com este CNPJ.", null, 409);
        }

        return criarRespostaApi(false, "Não foi possível atualizar a empresa.", null, 500);
    }
}
