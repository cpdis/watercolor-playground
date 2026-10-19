import { render } from 'preact';
import { App } from './app/App';
import './app/pwa';   // registers the offline service worker (a no-op in `npm run dev`)
import './styles.css';

render(<App />, document.getElementById('root')!);
