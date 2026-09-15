import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig).catch(function (error: unknown): void {
  console.error('SkillBridge failed to start', error);
});
