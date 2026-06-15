'use client';

interface Props {
  icon: string;
  name: string;
  description: string;
  loading: boolean;
  onTrigger: () => void;
}

export default function CampaignTriggerCard({ icon, name, description, loading, onTrigger }: Props) {
  return (
    <div className="campaign-trigger-card">
      <div className="campaign-trigger-icon">{icon}</div>
      <div className="campaign-trigger-name">{name}</div>
      <div className="campaign-trigger-desc">{description}</div>
      <button className="btn btn-primary" onClick={onTrigger} disabled={loading}>
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
            Launching...
          </span>
        ) : (
          `Launch ${name}`
        )}
      </button>
    </div>
  );
}
