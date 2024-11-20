import React from "react";

const ActionButtons = ({ onCancel, onUpdate }) => {
  return (
    <div className="text-right">
      <button type="button" className="btn-secondary" onClick={onCancel}>CANCEL</button>
      <button type="button" className="btn-primary" onClick={onUpdate}>UPDATE</button>
    </div>
  );
};

export default ActionButtons;
