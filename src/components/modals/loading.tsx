"use client";

import { Modal } from "react-bootstrap";

interface LoadingModalProps {
    show: boolean;
    text?: string;
}

/**
 * Modal bloqueante de carregamento.
 * Use durante chamadas de API ou processos assincronos para impedir nova interacao ate a conclusao.
 */
export function ModalCarregamento({
    show,
    text = "Processando solicitacao...",
}: LoadingModalProps) {
    return (
        <Modal
            show={show}
            centered
            backdrop="static"
            keyboard={false}
            size="sm"
            contentClassName="loading-modal"
        >
            <Modal.Body className="loading-modal-body">
                <div className="loading-modal-spinner">
                    <span className="spinner-border" role="status" aria-hidden="true" />
                </div>

                <p className="loading-modal-title">Aguarde</p>
                <p className="loading-modal-text">{text}</p>
            </Modal.Body>
        </Modal>
    );
}
