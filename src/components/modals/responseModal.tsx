"use client";

import { Modal } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import { Botao } from "../inputs/button";

interface ResponseModalProps {
    isOpen: boolean;
    message: string;
    title?: string;
    onClose: () => void;
};

/**
 * Modal generico de resposta ao usuario.
 * Use para exibir mensagens de sucesso, erro ou aviso retornadas por fluxos da aplicacao.
 */
export default function ModalResposta({
    isOpen,
    message,
    title = "Aviso",
    onClose,
}: ResponseModalProps) {

    return (
        <Modal show={isOpen} onHide={onClose} centered size="sm" contentClassName="response-modal">
            <Modal.Header closeButton className="response-modal-header">
                <Modal.Title className="fs-5">{title}</Modal.Title>
            </Modal.Header>

            <Modal.Body className="response-modal-body">
                <span className="response-modal-icon">
                    <FaInfoCircle />
                </span>

                <p className="response-modal-message">
                    {message}
                </p>
            </Modal.Body>

            <Modal.Footer className="response-modal-footer">
                <Botao
                    size="sm"
                    label="Entendi"
                    onClick={onClose}
                    disabled={false}
                    loading={false}
                    variant="primary"
                    type="button"
                    className="w-100"
                />
            </Modal.Footer>
        </Modal>
    );
}
