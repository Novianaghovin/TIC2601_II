import React from "react";

const ActionButtons = ({ onCancel, onUpdate }) => {
  return (
    <div className="text-right">
      <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
      <button type="button" className="btn-primary" onClick={onUpdate}>Update</button>
    </div>
  );
};

export default ActionButtons;
