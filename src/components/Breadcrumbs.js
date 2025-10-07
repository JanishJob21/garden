import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="breadcrumbs">
      {items.map((it, idx) => (
        <span key={idx} className="crumb">
          {it.to ? <Link to={it.to}>{it.label}</Link> : <span>{it.label}</span>}
          {idx < items.length - 1 && <span className="sep">/</span>}
        </span>
      ))}
    </div>
  );
}
