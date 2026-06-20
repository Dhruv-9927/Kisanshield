import './ModuleCard.css';

interface ModuleCardProps {
  icon: string;
  name: string;
  name_hindi: string;
  description: string;
  color: string;
  isLive?: boolean;
  lastActivity?: string;
  onClick: () => void;
  id: string;
}

export const ModuleCard = ({ icon, name, name_hindi, description, color, isLive, lastActivity, onClick, id }: ModuleCardProps) => {
  return (
    <button
      id={id}
      className="module-card"
      onClick={onClick}
      style={{ '--module-color': color } as React.CSSProperties}
      aria-label={`Open ${name} module`}
    >
      <div className="module-card-left">
        <div className="module-icon-circle">
          <span className="module-icon">{icon}</span>
        </div>
        <div className="module-card-text">
          <span className="module-name-hindi">{name_hindi}</span>
          <span className="module-name">{name}</span>
          <span className="module-description">{description}</span>
        </div>
      </div>
      <div className="module-card-right">
        {isLive && (
          <span className="badge badge-live">
            <span className="pulse-dot" />
            LIVE
          </span>
        )}
        {lastActivity && (
          <span className="module-last-activity">{lastActivity}</span>
        )}
        <svg className="module-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </button>
  );
};
