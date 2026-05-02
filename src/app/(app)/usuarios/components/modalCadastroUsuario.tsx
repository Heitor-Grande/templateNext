"use client";

import { Botao } from "@/components/inputs/button";
import { CampoTexto } from "@/components/inputs/input";
import { ModalCarregamento } from "@/components/modals/loading";
import ModalResposta from "@/components/modals/responseModal";
import { requisitarAPI } from "@/utils/api";
import { FormEvent, useState } from "react";
import { Modal } from "react-bootstrap";
import { FaSave, FaTimes } from "react-icons/fa";

type DadosCadastroUsuario = {
    nome: string;
    email: string;
    telefone: string;
    documento: string;
    senha: string;
    confirmarSenha: string;
};

interface ModalCadastroUsuarioProps {
    aberto: boolean;
    aoFechar: () => void;
}

const estadoInicialFormulario: DadosCadastroUsuario = {
    nome: "",
    email: "",
    telefone: "",
    documento: "",
    senha: "",
    confirmarSenha: "",
};

/**
 * Modal local de cadastro de usuario.
 * Use apenas no fluxo de usuarios para coletar os dados basicos antes de enviar para a API.
 */
export default function ModalCadastroUsuario({
    aberto,
    aoFechar,
}: ModalCadastroUsuarioProps) {
    const [formulario, setFormulario] = useState<DadosCadastroUsuario>(estadoInicialFormulario);
    const [carregando, setCarregando] = useState(false);
    const [mensagemResposta, setMensagemResposta] = useState("");

    function atualizarCampoFormulario(campo: keyof DadosCadastroUsuario, valor: string) {
        setFormulario((estadoAtual) => ({
            ...estadoAtual,
            [campo]: valor,
        }));
    }

    /**
     * Executa a regra de cadastro do usuario dentro do proprio modal.
     * Use esta funcao para validar, chamar API e tratar resposta do fluxo de inclusao.
     */
    async function cadastrarUsuario(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMensagemResposta("");

        if (formulario.senha !== formulario.confirmarSenha) {
            setMensagemResposta("As senhas informadas nao conferem.");
            return;
        }

        setCarregando(true);

        try {
            const resposta = await requisitarAPI("/api/usuarios", {
                method: "POST",
                body: formulario,
            });

            const mensagem =
                typeof resposta.msg === "string"
                    ? resposta.msg
                    : "Nao foi possivel cadastrar o usuario.";

            setMensagemResposta(mensagem);
            setFormulario(estadoInicialFormulario);
            aoFechar();
        } catch (erro) {
            const mensagemErro = erro instanceof Error
                ? erro.message
                : "Nao foi possivel conectar ao servidor.";

            setMensagemResposta(mensagemErro);
        } finally {
            setCarregando(false);
        }
    }

    /**
     * Fecha o modal e limpa o formulario para uma nova inclusao.
     */
    function fecharModalCadastroUsuario() {
        setFormulario(estadoInicialFormulario);
        setMensagemResposta("");
        setCarregando(false);
        aoFechar();
    }

    return (
        <>
            <Modal show={aberto} onHide={fecharModalCadastroUsuario} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="fs-5">Novo usuario</Modal.Title>
                </Modal.Header>

                <form onSubmit={cadastrarUsuario}>
                    <Modal.Body>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <CampoTexto
                                    id="usuario-nome"
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

                            <div className="col-md-6">
                                <CampoTexto
                                    id="usuario-email"
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
                                    id="usuario-telefone"
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
                                    id="usuario-documento"
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
                                    id="usuario-senha"
                                    label="Senha"
                                    type="password"
                                    value={formulario.senha}
                                    placeholder="Senha inicial"
                                    onChange={(event) => atualizarCampoFormulario("senha", event.target.value)}
                                    disabled={carregando}
                                    required
                                    className="mb-0"
                                    helpText="A senha deve ter pelo menos 6 caracteres."
                                    classNameHelpText="form-text text-muted"
                                />
                            </div>

                            <div className="col-md-6">
                                <CampoTexto
                                    id="usuario-confirmar-senha"
                                    label="Confirmar senha"
                                    type="password"
                                    value={formulario.confirmarSenha}
                                    placeholder="Repita a senha inicial"
                                    onChange={(event) => atualizarCampoFormulario("confirmarSenha", event.target.value)}
                                    disabled={carregando}
                                    required
                                    className="mb-0"
                                />
                            </div>
                        </div>
                    </Modal.Body>

                    <Modal.Footer>
                        <Botao
                            size="sm"
                            label="Cancelar"
                            icon={<FaTimes />}
                            onClick={fecharModalCadastroUsuario}
                            disabled={carregando}
                            loading={false}
                            variant="outline-secondary"
                            type="button"
                            className=""
                        />

                        <Botao
                            size="sm"
                            label="Salvar usuario"
                            icon={<FaSave />}
                            onClick={() => undefined}
                            disabled={false}
                            loading={carregando}
                            variant="outline-primary"
                            type="submit"
                            className=""
                        />
                    </Modal.Footer>
                </form>
            </Modal>

            <ModalCarregamento
                show={carregando}
                text="Cadastrando usuario..."
            />

            <ModalResposta
                isOpen={Boolean(mensagemResposta)}
                message={mensagemResposta}
                onClose={() => setMensagemResposta("")}
            />
        </>
    );
}
