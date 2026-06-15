interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const cls = `badge badge-${status}`;
  const labels: Record<string, string> = {
    running: 'Running',
    completed: 'Completed',
    failed: 'Failed',
    draft: 'Draft',
    delivered: 'Delivered',
    sent: 'Sent',
    opened: 'Opened',
    clicked: 'Clicked',
    queued: 'Queued',
  };
  return <span className={cls}>{labels[status] ?? status}</span>;
}
