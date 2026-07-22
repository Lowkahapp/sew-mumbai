import { useEffect, useState } from 'react';
import api from '../services/api';

export default function LocalitySelect({ value, onChange, includeAll = false, className = '' }) {
  const [localities, setLocalities] = useState([]);

  useEffect(() => {
    api
      .get('/localities')
      .then(({ data }) => setLocalities(data.localities || []))
      .catch(() => setLocalities([]));
  }, []);

  return (
    <select
      className={`input ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {includeAll ? <option value="">All localities</option> : <option value="">Select locality</option>}
      {localities.map((loc) => (
        <option key={loc} value={loc}>
          {loc}
        </option>
      ))}
    </select>
  );
}
