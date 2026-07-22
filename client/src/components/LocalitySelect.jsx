import { useEffect, useState } from 'react';
import api from '../services/api';

export default function LocalitySelect({ value, onChange, includeAll = false, className = '' }) {
  const [byZone, setByZone] = useState([]);

  useEffect(() => {
    api
      .get('/neighborhoods')
      .then(({ data }) => setByZone(data.byZone || []))
      .catch(() =>
        api.get('/localities').then(({ data }) => {
          setByZone([{ zone: 'Mumbai', neighborhoods: (data.localities || []).map((l) => ({ id: l, label: l })) }]);
        })
      );
  }, []);

  return (
    <select
      className={`input ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {includeAll ? <option value="">All neighborhoods</option> : <option value="">Select neighborhood</option>}
      {byZone.map(({ zone, neighborhoods }) => (
        <optgroup key={zone} label={zone}>
          {neighborhoods.map((n) => (
            <option key={n.id || n.label} value={n.label}>
              {n.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
