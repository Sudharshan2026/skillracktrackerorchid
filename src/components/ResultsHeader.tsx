import { Button, buttonVariants } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';

export interface ResultsHeaderProps {
  analyzedUrl: string;
  onGoHome: () => void;
  showPlan?: boolean;
  onLogout?: () => void;
}

export function ResultsHeader({ onGoHome, showPlan = false, onLogout }: ResultsHeaderProps) {
  const links = [
    { label: 'Statistics', href: '#stats' },
    { label: 'Goal Planning', href: '#goals' },
    ...(showPlan ? [{ label: 'Plan', href: '#plan' }] : []),
  ];

  return (
    <header className="sticky top-4 z-50 w-full" data-testid="results-header">
      <div className="mx-auto flex w-full max-w-5xl items-center rounded-lg border bg-background/90 px-4 py-3 shadow backdrop-blur supports-[backdrop-filter]:bg-background/80">
        {/* Left: Brand/Back */}
        <div className="flex items-center shrink-0">
          <Button variant="outline" size="sm" onClick={onGoHome} className="btn-white">
            SkillRack Tracker
          </Button>
        </div>

        {/* Center: Section links (always visible, scrollable on small screens) */}
        <nav className="flex items-center gap-x-4 overflow-x-auto mx-4 flex-1 justify-center">
          {links.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              size="sm"
              onClick={() => {
                const element = document.querySelector(link.href);
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 btn-white"
            >
              {link.label}
            </Button>
          ))}
        </nav>

        {/* Right: Logout */}
        <div className="flex items-center justify-end gap-3 shrink-0">
          <ThemeToggle />
          <button
            className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' btn-white'}
            onClick={onLogout ?? onGoHome}
            type="button"
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default ResultsHeader;


