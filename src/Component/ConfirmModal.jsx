import React from "react";
import ReactDOM from "react-dom";

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
        <p className="mb-4 text-gray-800">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Yes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
