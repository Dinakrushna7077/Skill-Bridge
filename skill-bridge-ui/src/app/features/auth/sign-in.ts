import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router,RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

interface DemoAccount {
  role: string;
  name: string;
  email: string;
  blurb: string;
  icon: string;
}

@Component({
  selector: 'sb-sign-in',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sb-auth">
      <section class="sb-auth-panel">
        <div class="sb-auth-form">
          <div class="d-flex align-items-center gap-2 mb-4">
            <span class="sb-mark"><i class="bi bi-diagram-3-fill"></i></span>
            <div>
              <div class="fw-semibold">SkillBridge</div>
              <small class="text-secondary">Skill mapping, internships and placements</small>
            </div>
          </div>

          <h1 class="h4 mb-1 text-center">Login</h1>
          <!-- <p class="text-secondary small mb-4">
            Use one of the demo accounts below. Any password works while the API is mocked.
          </p> -->

          @if (error()) {
            <div class="alert alert-danger py-2 small" role="alert">{{ error() }}</div>
          }

          <div class="mb-3">
            <label class="form-label small" for="email">Email</label>
            <input
              id="email"
              class="form-control"
              type="email"
              autocomplete="username"
              [(ngModel)]="email"
              (keyup.enter)="submit()"
            />
          </div>

          <div class="mb-4">
            <label class="form-label small" for="password">Password</label>
            <input
              id="password"
              class="form-control"
              type="password"
              autocomplete="current-password"
              [(ngModel)]="password"
              (keyup.enter)="submit()"
            />
          </div>

          <button class="btn btn-brand w-100" type="button" (click)="submit()">Login</button>
          <div class="text-center pt-2 border-top">
            <span class="small text-secondary">New student to SkillBridge? </span>
            <a routerLink="/sign-up" class="small fw-semibold text-decoration-none">
              Create an account <i class="bi bi-arrow-right-short"></i>
            </a>
          </div>
        </div>
      </section>

      <section class="sb-auth-side">
        <h2 class="h6 text-uppercase-none mb-1">Pick a role to explore</h2>
        <p class="small text-secondary mb-3">
          Each account lands on a different workspace with its own data.
        </p>

        <div class="d-grid gap-2">
          @for (account of demoAccounts; track account.email) {
            <button class="sb-demo" type="button" (click)="useAccount(account.email)">
              <i class="bi {{ account.icon }}"></i>
              <span>
                <span class="d-block fw-semibold">{{ account.role }} — {{ account.name }}</span>
                <small class="text-secondary">{{ account.blurb }}</small>
              </span>
            </button>
          }
        </div>
      </section>
    </div>
  `,
  styles: [
    `
    .btn-brand {
        background-color: #3b72a6 !important;
        border-color: #2f5170 !important;
        color: #ffffff !important;
        transition: background-color 0.2s ease, transform 0.1s ease;
      }

      .btn-brand:hover,
      .btn-brand:focus {
        background-color: #2f4d6b !important;
        border-color: #142230 !important;
        color: #ffffff !important;
      }

      .btn-brand:active {
        background-color: #264b75 !important;
        border-color: #0e1721 !important;
        transform: scale(0.99);
      }
      .sb-auth {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 1.05fr 0.95fr;
        background: var(--sb-canvas);
      }
      .sb-auth-panel {
        display: grid;
        place-items: center;
        padding: 2rem;
        background: #fff;
      }
      .sb-auth-form {
        width: min(380px, 100%);
      }
      .sb-mark {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: grid;
        place-items: center;
        background: var(--sb-ink);
        color: var(--sb-accent);
      }
      .sb-auth-side {
        padding: 2rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .sb-demo {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        text-align: left;
        background: #fff;
        border: 1px solid var(--sb-line);
        border-radius: 12px;
        padding: 0.75rem 0.9rem;
        font-size: 0.9rem;
      }
      .sb-demo:hover {
        border-color: var(--sb-ink);
      }
      .sb-demo i {
        color: var(--sb-ink);
        margin-top: 0.15rem;
      }
      @media (max-width: 767.98px) {
        .sb-auth {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class SignIn {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected password = 'SIH@2026';
  protected readonly error = signal<string>('');

  protected readonly demoAccounts: DemoAccount[] = [
    {
      role: 'Student',
      name: 'Dinakrushna Mohanta',
      email: 'dinakrushna@gmail.com',
      blurb: 'Final-year MCA Student, aiming at .NET full stack',
      icon: 'bi-mortarboard'
    },
    
    {
      role: 'Industry',
      name: 'Infosys PVT LTD',
      email: 'kavita@infosys.support.com',
      blurb: 'Hiring .NET and Angular engineers at Beacon Systems',
      icon: 'bi-building'
    },
    {
      role: 'Academician',
      name: 'PROF. RAJESWARI CHHUALSINGH',
      email: 'rajeswari.rec@gmail.com',
      blurb: 'Verifies student skills for CSE and IT at CET',
      icon: 'bi-patch-check'
    },
    {
      role: 'Admin',
      name: 'Admin User',
      email: 'admin.skillbridge@gmail.com',
      blurb: 'Network-wide placement and skill-gap figures',
      icon: 'bi-shield-check'
    }
  ];

  protected useAccount(email: string): void {
    this.email = email;
    this.submit();
  }

  protected submit(): void {
    var result = this.auth.signIn(this.email, this.password);
    if (!result.ok) {
      this.error.set(result.message);
      return;
    }
    this.error.set('');
    this.router.navigateByUrl(this.auth.homeRoute());
  }
}
