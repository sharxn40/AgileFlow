import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="confirmation-modal">
                <div className="modal-header warning">
                    <h2><FaExclamationTriangle /> {title}</h2>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-danger" onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
