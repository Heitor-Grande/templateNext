"use client";

import { useEffect, useState, ReactNode } from "react";
import { Modal } from "react-bootstrap";
import { Button } from "../inputs/button";

interface ConfirmModalProps {
    isOpen: boolean;
    message: string;
    icon: ReactNode;

    onConfirm: () => void;
    onCancel: () => void;

    confirmLabel: string;
    cancelLabel: string;
}

export default function ConfirmModal({
    isOpen,
    message,
    icon,

    onConfirm,
    onCancel,

    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
}: ConfirmModalProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <Modal show={isOpen} onHide={onCancel} centered size="sm">
            <Modal.Body>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12 text-center">
                            {/* Ícone */}
                            {icon && (
                                <div>
                                    {icon}
                                </div>
                            )}
                        </div>
                        <div className="col-12 text-center mt-2">
                            {/* Mensagem */}
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
                            {/* Cancelar (vermelho) */}
                            <Button
                                size="sm"
                                label={cancelLabel}
                                onClick={onCancel}
                                disabled={false}
                                loading={false}
                                variant="danger"
                                type="button"
                                className="w-100"
                            />
                        </div>
                        <div className="col-lg-6 text-center">
                            {/* Confirmar (azul) */}
                            <Button
                                size="sm"
                                label={confirmLabel}
                                onClick={onConfirm}
                                disabled={false}
                                loading={false}
                                variant="primary"
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