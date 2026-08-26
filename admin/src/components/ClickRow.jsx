import { useNavigate } from 'react-router-dom';

export default function ClickRow({ to, className = '', children }) {
  const navigate = useNavigate();
  if (!to) return <tr className={className}>{children}</tr>;

  return (
    <tr
      className={`is-click ${className}`.trim()}
      onClick={() => navigate(to)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(to);
        }
      }}
      tabIndex={0}
      role="link"
    >
      {children}
    </tr>
  );
}
