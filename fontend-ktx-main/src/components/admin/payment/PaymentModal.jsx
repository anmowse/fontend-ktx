import React from "react";
import ReactDOM from "react-dom";
import CreatePayment from "./CreatePayment";

const PaymentModal = ({ isOpen, onClose, contractId }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-h-[90vh] overflow-y-auto">
          <CreatePayment contractId={contractId} onSuccess={onClose} />

          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="fixed inset-0 z-[-1]" onClick={onClose} />
    </div>,
    document.body
  );
};

export default PaymentModal;
