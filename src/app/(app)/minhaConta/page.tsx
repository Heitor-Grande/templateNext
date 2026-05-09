"use client";

import { Botao } from "@/components/inputs/button";
import { CampoTexto } from "@/components/inputs/input";
import { ModalCarregamento } from "@/components/modals/loading";
import ModalResposta from "@/components/modals/responseModal";
import { requisitarAPI } from "@/utils/api";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { FaSave } from "react-icons/fa";

type DadosMinhaConta = {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    documento: string;
    senha: string;
    confirmarSenha: string;
    ativo: boolean;
    isAdmin: boolean;
    criadoEm: string;
    atualizadoEm: string;
};

type UsuarioMinhaContaApi = {
    id: number;
    nome: string;
    email: string;
    telefone: string | null;
    documento: string | null;
    ativo: boolean;
    isAdmin: boolean;
    criado_em: string;
    atualizado_em: string;
};

const estadoInicialFormulario: DadosMinhaConta = {
    id: "",
    nome: "",
    email: "",
    telefone: "",
    documento: "",
    senha: "",
    confirmarSenha: "",
    ativo: true,
    isAdmin: false,
    criadoEm: "",
    atualizadoEm: "",
};

/**
 * Página de Minha conta.
 * Use como ponto de partida para edição dos dados do usuário autenticado.
 */
export default function PaginaMinhaConta() {
    const [formulario, setFormulario] = useState<DadosMinhaConta>(estadoInicialFormulario);
    const [carregando, setCarregando] = useState(false);
    const [textoCarregamento, setTextoCarregamento] = useState("Processando solicitação...");
    const [mensagemResposta, setMensagemResposta] = useState("");

    function atualizarCampoFormulario(campo: keyof DadosMinhaConta, valor: string | boolean) {
        setFormulario((estadoAtual) => ({
            ...estadoAtual,
            [campo]: valor,
        }));
    }

    const formatarDataHoraLocal = useCallback((valor: string): string => {
        if (!valor) {
            return "";
        }

        const data = new Date(valor);

        if (Number.isNaN(data.getTime())) {
            return "";
        }

        const dataLocal = new Date(data.getTime() - data.getTimezoneOffset() * 60000);

        return dataLocal.toISOString().slice(0, 16);
    }, []);

    const mapearUsuarioParaFormulario = useCallback((usuario: UsuarioMinhaContaApi): DadosMinhaConta => {

        return {
            id: String(usuario.id),
            nome: usuario.nome,
            email: usuario.email,
            telefone: usuario.telefone || "",
            documento: usuario.documento || "",
            senha: "",
            confirmarSenha: "",
            ativo: usuario.ativo,
            isAdmin: usuario.isAdmin,
            criadoEm: formatarDataHoraLocal(usuario.criado_em),
            atualizadoEm: formatarDataHoraLocal(usuario.atualizado_em),
        };
    }, [formatarDataHoraLocal]);

    /**
     * Carrega os dados do usuário autenticado usando o JWT salvo no cookie de sessão.
     */
    const carregarDadosMinhaConta = useCallback(async () => {
        setCarregando(true);
        setTextoCarregamento("Carregando dados da conta...");
        setMensagemResposta("");

        try {
            const resposta = await requisitarAPI("/api/minhaConta", {
                method: "GET",
            });

            const usuario = resposta.dados as UsuarioMinhaContaApi | null;

            if (!usuario) {
                setMensagemResposta("Não foi possível carregar os dados da conta.");
                return;
            }

            setFormulario(mapearUsuarioParaFormulario(usuario));
        } catch (erro) {
            const mensagemErro = erro instanceof Error
                ? erro.message
                : "Não foi possível carregar os dados da conta.";

            setMensagemResposta(mensagemErro);
        } finally {
            setCarregando(false);
        }
    }, [mapearUsuarioParaFormulario]);

    /**
     * Valida o formulário e envia os dados editáveis para a API de usuários.
     */
    async function salvarDadosMinhaConta(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMensagemResposta("");

        if (formulario.senha && formulario.senha !== formulario.confirmarSenha) {
            setMensagemResposta("As senhas informadas não conferem.");
            return;
        }

        setCarregando(true);
        setTextoCarregamento("Salvando dados da conta...");

        try {
            const resposta = await requisitarAPI("/api/minhaConta", {
                method: "PUT",
                body: formulario,
            });

            const mensagem =
                typeof resposta.msg === "string"
                    ? resposta.msg
                    : "Dados da conta atualizados com sucesso.";

            await carregarDadosMinhaConta();
            setMensagemResposta(mensagem);
        } catch (erro) {
            const mensagemErro = erro instanceof Error
                ? erro.message
                : "Não foi possível salvar os dados da conta.";

            setMensagemResposta(mensagemErro);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        const carregamentoInicial = window.setTimeout(() => {
            void carregarDadosMinhaConta();
        }, 0);

        return () => window.clearTimeout(carregamentoInicial);
    }, [carregarDadosMinhaConta]);

    return (
        <div className="container-fluid">
            <div className="page-header">
                <div className="card w-100">
                    <div className="card-body">
                        <h5 className="mb-1">Minha conta</h5>
                        <hr />
                        <p className="text-muted mb-0">
                            Atualize as informações básicas da conta vinculada ao usuário autenticado.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={salvarDadosMinhaConta}>
                <div className="card">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <CampoTexto
                                    id="minha-conta-id"
                                    label="Código"
                                    type="text"
                                    value={formulario.id}
                                    placeholder=""
                                    onChange={(event) => atualizarCampoFormulario("id", event.target.value)}
                                    disabled
                                    required={false}
                                    className="mb-0"
                                />
                            </div>

                            <div className="col-md-4">
                                <CampoTexto
                                    id="minha-conta-nome"
                                    label="Nome"
                                    type="text"
                                    value={formulario.nome}
                                    placeholder="Nome completo"
                                    onChange={(event) => atualizarCampoFormulario("nome", event.target.value)}
                                    disabled={carregando}
                                    required
                                    className="mb-0"
                                />
                            </div>

                            <div className="col-md-4">
                                <CampoTexto
                                    id="minha-conta-email"
                                    label="E-mail"
                                    type="email"
                                    value={formulario.email}
                                    placeholder="usuario@empresa.com"
                                    onChange={(event) => atualizarCampoFormulario("email", event.target.value)}
                                    disabled={carregando}
                                    required
                                    className="mb-0"
                                />
                            </div>

                            <div className="col-md-6">
                                <CampoTexto
                                    id="minha-conta-telefone"
                                    label="Telefone"
                                    type="tel"
                                    value={formulario.telefone}
                                    placeholder="(00) 00000-0000"
                                    onChange={(event) => atualizarCampoFormulario("telefone", event.target.value)}
                                    disabled={carregando}
                                    required={false}
                                    className="mb-0"
                                />
                            </div>

                            <div className="col-md-6">
                                <CampoTexto
                                    id="minha-conta-documento"
                                    label="Documento"
                                    type="text"
                                    value={formulario.documento}
                                    placeholder="CPF ou CNPJ"
                                    onChange={(event) => atualizarCampoFormulario("documento", event.target.value)}
                                    disabled={carregando}
                                    required={false}
                                    className="mb-0"
                                />
                            </div>

                            <div className="col-md-6">
                                <CampoTexto
                                    id="minha-conta-senha"
                                    label="Nova senha"
                                    type="password"
                                    value={formulario.senha}
                                    placeholder="Digite uma nova senha"
                                    onChange={(event) => atualizarCampoFormulario("senha", event.target.value)}
                                    disabled={carregando}
                                    required={false}
                                    className="mb-0"
                                    helpText="Preencha apenas se quiser alterar a senha atual."
                                    classNameHelpText="form-text text-muted"
                                />
                            </div>

                            <div className="col-md-6">
                                <CampoTexto
                                    id="minha-conta-confirmar-senha"
                                    label="Confirmar nova senha"
                                    type="password"
                                    value={formulario.confirmarSenha}
                                    placeholder="Repita a nova senha"
                                    onChange={(event) => atualizarCampoFormulario("confirmarSenha", event.target.value)}
                                    disabled={carregando}
                                    required={Boolean(formulario.senha)}
                                    className="mb-0"
                                />
                            </div>

                            <div className="col-md-6">
                                <CampoTexto
                                    id="minha-conta-criado-em"
                                    label="Criado em"
                                    type="datetime-local"
                                    value={formulario.criadoEm}
                                    placeholder=""
                                    onChange={(event) => atualizarCampoFormulario("criadoEm", event.target.value)}
                                    disabled
                                    required={false}
                                    className="mb-0"
                                />
                            </div>

                            <div className="col-md-6">
                                <CampoTexto
                                    id="minha-conta-atualizado-em"
                                    label="Atualizado em"
                                    type="datetime-local"
                                    value={formulario.atualizadoEm}
                                    placeholder=""
                                    onChange={(event) => atualizarCampoFormulario("atualizadoEm", event.target.value)}
                                    disabled
                                    required={false}
                                    className="mb-0"
                                />
                            </div>

                            <div className="col-md-6">
                                <Form.Check
                                    id="minha-conta-ativo"
                                    type="switch"
                                    label="Usuário ativo"
                                    checked={formulario.ativo}
                                    disabled={carregando}
                                    onChange={(event) => atualizarCampoFormulario("ativo", event.target.checked)}
                                />
                            </div>

                            <div className="col-md-6">
                                <Form.Check
                                    id="minha-conta-admin"
                                    type="switch"
                                    label="Administrador"
                                    checked={formulario.isAdmin}
                                    disabled
                                    onChange={(event) => atualizarCampoFormulario("isAdmin", event.target.checked)}
                                />
                            </div>
                        </div>
                        <hr />
                        <div className="text-end">
                            <Botao
                                size="sm"
                                label="Salvar alterações"
                                icon={<FaSave />}
                                onClick={() => undefined}
                                disabled={false}
                                loading={carregando}
                                variant="outline-primary"
                                type="submit"
                                className=""
                            />
                        </div>
                    </div>
                </div>
            </form>

            <ModalResposta
                isOpen={Boolean(mensagemResposta)}
                message={mensagemResposta}
                onClose={() => setMensagemResposta("")}
            />

            <ModalCarregamento
                show={carregando}
                text={textoCarregamento}
            />
        </div>
    );
}
