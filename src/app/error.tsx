'use client';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error caught by global boundary:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: '2rem', color: 'red' }}>
          <h2>Something went wrong!</h2>
          <p>{error.message}</p>
          <button onClick={() => reset()}>Try again</button>
        </div>
      </body>
    </html>
  );
}
