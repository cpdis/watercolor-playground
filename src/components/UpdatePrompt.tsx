import { useState } from 'preact/hooks';
import { useApp } from '../app/context';
import { applyUpdate, dismissUpdate, updateReady } from '../app/pwa';

/**
 * Offers a waiting new version (see src/app/pwa.ts). Reloading clears the paper, so with
 * paint on it the first tap only warns, the same way Clear asks twice.
 */
export function UpdatePrompt() {
  const app = useApp();
  const [armed, setArmed] = useState(false);
  if (!updateReady.value) return null;
  const painted = app.canUndo.value;
  const reload = () => { if (painted && !armed) setArmed(true); else void applyUpdate(); };
  const later = () => { setArmed(false); dismissUpdate(); };
  return (
    <div class="update" role="status">
      <span>{armed ? 'Reloading clears the paper. Save first?' : 'A new version is ready'}</span>
      <button class="primary" onClick={reload}>{armed ? 'Reload anyway' : 'Reload'}</button>
      <button onClick={later}>Later</button>
    </div>
  );
}
