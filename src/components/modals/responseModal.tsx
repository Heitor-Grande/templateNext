"use client";

import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";

interface ResponseModalProps {
    isOpen: boolean;
    message: string;
    onClose: () => void;
};

export default function ResponseModal({
    isOpen,
    message,
    onClose,
}: ResponseModalProps) {

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;


    return (
        <Modal show={isOpen} onHide={onClose} centered size="sm">
            <Modal.Header closeButton>
            </Modal.Header>

            <Modal.Body>
                <p className="mb-0 text-center">
                    <b>
                        {message}
                    </b>
                </p>
            </Modal.Body>

            <Modal.Footer className="py-3">

            </Modal.Footer>
        </Modal>
    );
}