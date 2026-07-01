import { helperHippo } from './helperhippo.js';
import { help } from './help.js';
import { weather } from './weather.js';
import { ticket } from './ticket.js';
import { joke } from './joke.js';
import { audit } from './audit.js';

export default function registerCommands(app) {
  helperHippo(app);
  help(app);
  weather(app);
  joke(app);
  ticket(app);
  audit(app);
}