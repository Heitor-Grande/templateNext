"use client";
import { Modal } from "react-bootstrap";

interface LoadingModalProps {
    show: boolean;
    text: string;
}

export function LoadingModal({
    show,
    text,
}: LoadingModalProps) {
    return (
        <Modal
            show={show}
            centered
            backdrop="static"
            keyboard={false}
        >
            <Modal.Body>
                <div className="container-fluid text-center">
                    <div className="row">
                        <div className="col-sm col-md-12 col-lg-12">
                            <span className="spinner-border spinner-border-sm fs-4" />
                        </div>
                        <span>{text}</span>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
}