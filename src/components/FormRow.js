import React from 'react';

const FormRow = ({ label, children, hint }) => {
  return (
    <div className="row">
      <label>{label}</label>
      <div className="control">{children}</div>
      {hint && <small>{hint}</small>}
    </div>
  );
};

export default FormRow;