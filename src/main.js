import './styles/theme.css';
import './styles/layout.css';
import './styles/timeline.css';
import './styles/inspector.css';
import './styles/atmosphere.css';

import { initTimeline } from './timeline.js';
import { initScene } from './scene/memorySkyline.js';

initTimeline();
initScene();
