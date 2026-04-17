import React from 'react';
import { createPortal } from 'react-dom';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onCancel}>✕</button>
                <h3>{title || 'Подтверждение'}</h3>
                <p>{message || 'Вы уверены?'}</p>
                <div className="modal-actions">
                    <button className="secondary" onClick={onCancel}>Отмена</button>
                    <button className="danger" onClick={onConfirm}>Удалить</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmModal;