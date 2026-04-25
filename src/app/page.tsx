"use client"
import ConfirmModal from "@/components/modals/confirmModal";
import { useState } from "react";
import { FaExclamation } from "react-icons/fa";


export default function Home() {

  const [open, setOpen] = useState(false);

  function handleConfirm() {
    console.log("Confirmado!");
    setOpen(false);
  }

  function handleCancel() {
    setOpen(false);
  }

  return (
    <div className="container-fluid">

      <button onClick={() => setOpen(true)}>
        Abrir confirmação
      </button>

      <ConfirmModal
        isOpen={open}
        message="Tem certeza que deseja excluir este item?"
        icon={<FaExclamation color="red" />}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmLabel="Sim"
        cancelLabel="Não"
      />
    </div>
  );
}
