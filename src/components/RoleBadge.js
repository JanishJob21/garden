import React from 'react';

const RoleBadge = ({ role }) => {
  return <span className={`badge ${role.toLowerCase()}`}>{role}</span>;
};

export default RoleBadge;
