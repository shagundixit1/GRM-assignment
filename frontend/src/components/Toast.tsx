'use client';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  body?: string;
}

interface Props {
  toasts: ToastItem[];
}

export default function Toast({ toasts }: Props) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <div className="toast-title">
            {t.type === 'success' ? '✓ ' : t.type === 'error' ? '✕ ' : 'ℹ '}
            {t.title}
          </div>
          {t.body && <div className="toast-body">{t.body}</div>}
        </div>
      ))}
    </div>
  );
}
