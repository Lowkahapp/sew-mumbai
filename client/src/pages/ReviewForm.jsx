import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import StarRating from '../components/StarRating';

export default function ReviewForm() {
  const { bookingId } = useParams();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/reviews', { bookingId, rating, comment });
      setDone(true);
      setMessage('Thanks for your review!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card-surface p-6 sm:p-8">
        <h1 className="font-display text-3xl font-bold text-navy">Rate your tailor</h1>
        <p className="mt-1 text-sm text-navy/60">Share how the stitching and fit went</p>
        {done ? (
          <div className="mt-6 space-y-4">
            <p className="text-emerald-700">{message}</p>
            <Link to="/dashboard" className="btn-primary inline-flex">
              Back to dashboard
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Rating</label>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
            <div>
              <label className="label">Comment</label>
              <textarea
                className="input min-h-[120px]"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Fit quality, communication, timing…"
              />
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button type="submit" className="btn-primary w-full">
              Submit review
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
