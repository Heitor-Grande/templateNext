"use client";

import { ReactNode } from "react";
import { Modal } from "react-bootstrap";
import { Botao } from "../inputs/button";

interface ConfirmModalProps {
    isOpen: boolean;
    message: string;
    icon: ReactNode;

    onConfirm: () => void;
    onCancel: () => void;

    confirmLabel: string;
    cancelLabel: string;
}

/**
 * Modal generico de confirmacao.
 * Use antes de acoes destrutivas ou irreversiveis, delegando a regra de negocio para onConfirm/onCancel.
 */
export default function ModalConfirmacao({
    isOpen,
    message,
    icon,

    onConfirm,
    onCancel,

    confirmLabel,
    cancelLabel,
}: ConfirmModalProps) {
    return (
        <Modal show={isOpen} onHide={onCancel} centered size="sm">
            <Modal.Body>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12 text-center">
                            {icon && (
                                <div>
                                    {icon}
                                </div>
                            )}
                        </div>
                        <div className="col-12 text-center mt-2">
                            <p className="mb-0">
                                <b>{message}</b>
                            </p>
                        </div>
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-6 text-center">
                            <Botao
                                size="sm"
                                label={cancelLabel}
                                onClick={onCancel}
                                disabled={false}
                                loading={false}
                                variant="primary"
                                type="button"
                                className="w-100"
                            />
                        </div>
                        <div className="col-lg-6 text-center">
                            <Botao
                                size="sm"
                                label={confirmLabel}
                                onClick={onConfirm}
                                disabled={false}
                                loading={false}
                                variant="danger"
                                type="button"
                                className="w-100"
                            />
                        </div>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
}
