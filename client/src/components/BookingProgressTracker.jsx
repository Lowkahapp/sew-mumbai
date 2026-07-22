import {
  PROGRESS_STEPS,
  canShowProgressTracker,
  getProgressStepCount,
} from '../constants/bookingProgress';

export default function BookingProgressTracker({ booking, compact = false }) {
  if (!canShowProgressTracker(booking)) return null;

  const completed = getProgressStepCount(booking);
  const isRequested = booking.status === 'requested';
  const isCompleted = booking.status === 'completed';

  return (
    <div className={compact ? 'mt-3' : 'mt-4'} aria-label="Order progress">
      {isRequested && (
        <p className="mb-2 text-xs text-amber-700">
          Awaiting tailor acceptance — tracking starts once accepted.
        </p>
      )}

      <ol className="grid grid-cols-4 gap-1 sm:gap-2">
        {PROGRESS_STEPS.map((step, index) => {
          const done = !isRequested && (isCompleted || completed > index);
          const current =
            !isRequested &&
            !isCompleted &&
            booking.status === 'accepted' &&
            completed === index &&
            index > 0;

          let circleClass = 'border-navy/15 bg-white text-navy/35';
          if (done) circleClass = 'border-emerald-500 bg-emerald-500 text-white';
          else if (current) circleClass = 'border-saffron bg-saffron text-white shadow-sm';

          return (
            <li key={step.key} className="min-w-0 text-center">
              <div className="relative flex justify-center">
                {index > 0 && (
                  <span
                    className={`absolute right-1/2 top-3.5 -z-10 h-0.5 w-full translate-x-[-50%] ${
                      completed > index || isCompleted ? 'bg-emerald-400' : 'bg-navy/10'
                    }`}
                    style={{ width: 'calc(100% + 0.5rem)', left: '-50%' }}
                  />
                )}
                <span
                  className={`relative flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold sm:h-8 sm:w-8 sm:text-xs ${circleClass}`}
                >
                  {done ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 sm:h-4 sm:w-4">
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
              </div>
              <p
                className={`mt-1.5 leading-tight ${
                  compact ? 'text-[9px]' : 'text-[10px] sm:text-xs'
                } ${done ? 'font-semibold text-emerald-800' : current ? 'font-semibold text-saffron-700' : 'text-navy/45'}`}
              >
                {step.shortLabel}
              </p>
              {!compact && (
                <p className="mt-0.5 hidden text-[10px] leading-snug text-navy/40 sm:block">
                  {step.label}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {isCompleted && (
        <p className="mt-2 text-center text-xs font-medium text-emerald-700 sm:text-left">
          Job completed — thank you for using SewMumbai
        </p>
      )}
    </div>
  );
}
