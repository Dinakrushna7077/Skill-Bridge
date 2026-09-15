import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { Notification } from '../../core/models/schema.models';
import { AuthService } from '../../core/services/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';

interface NavItem {
  label: string;
  hint: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'sb-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sb-shell">
      <!-- Sidebar -->
      <aside class="sb-sidebar" [class.open]="sidebarOpen()">
        <a class="sb-brand" routerLink="/">
          <span class="sb-brand-mark"><i class="bi bi-diagram-3-fill"></i></span>
          <span>
            <span class="sb-brand-name">SkillBridge</span>
            <span class="sb-brand-sub">Academia · Industry · Careers</span>
          </span>
        </a>

        <nav class="sb-nav">
          @for (item of navItems(); track item.route) {
            <a
              class="sb-nav-link"
              [routerLink]="item.route"
              routerLinkActive="active"
              (click)="closeSidebar()"
            >
              <i class="bi" [class]="item.icon"></i>
              <span class="flex-grow-1">
                <span class="d-block">{{ item.label }}</span>
                <small class="sb-nav-hint">{{ item.hint }}</small>
              </span>
            </a>
          }
        </nav>

        <div class="sb-sidebar-foot">
          <p class="mb-2 small">
            Signed in as <strong>{{ auth.currentUser()?.Name }}</strong>
          </p>
          <button class="btn btn-sm btn-outline-light w-100" type="button" (click)="signOut()">
            <i class="bi bi-box-arrow-right me-1"></i> Sign out
          </button>
        </div>
      </aside>

      @if (sidebarOpen()) {
        <div class="sb-scrim d-lg-none" (click)="closeSidebar()"></div>
      }

      <!-- Main column -->
      <div class="sb-main">
        <header class="sb-topbar">
          <button
            class="btn btn-sm btn-outline-secondary d-lg-none"
            type="button"
            (click)="toggleSidebar()"
            aria-label="Open navigation"
          >
            <i class="bi bi-list"></i>
          </button>

          <div class="flex-grow-1">
            <h1 class="sb-topbar-title">{{ roleTitle() }}</h1>
            <p class="sb-topbar-sub">{{ roleSubtitle() }}</p>
          </div>

          <div class="dropdown">
            <button
              class="btn btn-sm btn-light position-relative"
              type="button"
              (click)="toggleNotifications()"
            >
              <i class="bi bi-bell"></i>
              @if (unreadCount() > 0) {
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-danger">
                  {{ unreadCount() }}
                </span>
              }
            </button>

            @if (notificationsOpen()) {
              <div class="sb-notify-panel shadow">
                <div class="d-flex justify-content-between align-items-center px-3 pt-3 pb-2">
                  <strong class="small">Notifications</strong>
                  <button class="btn btn-sm btn-link p-0" type="button" (click)="closeNotifications()">
                    Close
                  </button>
                </div>
                @if (notifications().length === 0) {
                  <p class="px-3 pb-3 mb-0 text-secondary small">
                    Nothing yet. Updates on applications and verifications land here.
                  </p>
                } @else {
                  <ul class="list-unstyled mb-0">
                    @for (note of notifications(); track note.NotificationId) {
                      <li
                        class="sb-notify-item"
                        [class.unread]="!note.IsRead"
                        (click)="markRead(note.NotificationId)"
                      >
                        <div class="d-flex justify-content-between gap-2">
                          <strong class="small">{{ note.Title }}</strong>
                          <small class="text-secondary">{{ note.CreatedAt | date: 'd MMM' }}</small>
                        </div>
                        <p class="mb-0 small text-secondary">{{ note.Message }}</p>
                      </li>
                    }
                  </ul>
                }
              </div>
            }
          </div>

          <div class="sb-avatar" [title]="auth.currentUser()?.Email ?? ''">
            {{ initials() }}
          </div>
        </header>

        <main class="sb-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .sb-shell {
        display: flex;
        min-height: 100vh;
        background: var(--sb-canvas);
      }
      .sb-sidebar {
        width: 264px;
        flex: 0 0 264px;
        background: var(--sb-ink);
        color: #e9efe9;
        display: flex;
        flex-direction: column;
        padding: 1.25rem 0.875rem;
        position: sticky;
        top: 0;
        height: 100vh;
      }
      .sb-brand {
        display: flex;
        gap: 0.7rem;
        align-items: center;
        text-decoration: none;
        color: inherit;
        padding: 0 0.5rem 1.25rem;
      }
      .sb-brand-mark {
        width: 38px;
        height: 38px;
        border-radius: 11px;
        display: grid;
        place-items: center;
        background: var(--sb-accent);
        color: #273151;
        font-size: 1.1rem;
      }
      .sb-brand-name {
        display: block;
        font-weight: 650;
        letter-spacing: -0.01em;
      }
      .sb-brand-sub {
        display: block;
        font-size: 0.7rem;
        color: #deedfa;
      }
      .sb-nav {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        flex-grow: 1;
      }
      .sb-nav-link {
        display: flex;
        gap: 0.7rem;
        align-items: flex-start;
        padding: 0.6rem 0.75rem;
        border-radius: 9px;
        color: #e7f3ff;
        text-decoration: none;
        font-size: 0.9rem;
        line-height: 1.2;
        font-weight: 700;
      }
      .sb-nav-link i {
        margin-top: 0.15rem;
      }
      .sb-nav-link:hover {
        background: rgba(255, 255, 255, 0.07);
        color: #fff;
      }
      .sb-nav-link.active {
        background: var(--sb-accent);
        color: #070707;
      }
      .sb-nav-link.active .sb-nav-hint {
        color: #5e667e;
      }
      .sb-nav-hint {
        font-size: 0.70rem;
        color: #bbc3cc;
        font-weight: 500;
      }
      .sb-sidebar-foot {
        border-top: 1px solid rgba(255, 255, 255, 0.12);
        padding-top: 0.9rem;
        color: #c7d5cb;
      }
      .sb-main {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .sb-topbar {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        padding: 0.9rem 1.5rem;
        background: #fff;
        border-bottom: 1px solid var(--sb-line);
        position: sticky;
        top: 0;
        z-index: 20;
      }
      .sb-topbar-title {
        font-size: 1.05rem;
        font-weight: 640;
        margin: 0;
      }
      .sb-topbar-sub {
        margin: 0;
        font-size: 0.78rem;
        color: #2d354b;
      }
      .sb-avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: var(--sb-ink);
        color: #fff;
        font-size: 0.8rem;
        font-weight: 600;
      }
      .sb-content {
        padding: 1.5rem;
        flex-grow: 1;
      }
      .sb-notify-panel {
        position: absolute;
        right: 0;
        top: calc(100% + 0.5rem);
        width: min(340px, 84vw);
        background: #fff;
        border: 1px solid var(--sb-line);
        border-radius: 12px;
        z-index: 40;
        max-height: 60vh;
        overflow-y: auto;
      }
      .sb-notify-item {
        padding: 0.65rem 1rem;
        border-top: 1px solid var(--sb-line);
        cursor: pointer;
      }
      .sb-notify-item.unread {
        background: #f3f8f4;
      }
      .sb-scrim {
        position: fixed;
        inset: 0;
        background: rgba(12, 24, 18, 0.45);
        z-index: 25;
      }
      @media (max-width: 991.98px) {
        .sb-sidebar {
          position: fixed;
          z-index: 30;
          transform: translateX(-100%);
          transition: transform 0.18s ease;
        }
        .sb-sidebar.open {
          transform: translateX(0);
        }
        .sb-content {
          padding: 1rem;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .sb-sidebar {
          transition: none;
        }
      }
    `
  ]
})
export class DashboardLayout {
  protected readonly auth = inject(AuthService);
  private readonly data = inject(MockDataService);

  protected readonly sidebarOpen = signal(false);
  protected readonly notificationsOpen = signal(false);
  protected readonly notifications = signal<Notification[]>([]);

  protected readonly unreadCount = computed<number>(
    function (this: DashboardLayout): number {
      return this.notifications().filter(function (n: Notification): boolean {
        return !n.IsRead;
      }).length;
    }.bind(this)
  );

  protected readonly initials = computed<string>(
    function (this: DashboardLayout): string {
      var user = this.auth.currentUser();
      if (!user) {
        return '—';
      }
      var parts = user.Name.replace('Dr. ', '').split(' ');
      var letters = parts.map(function (p: string): string {
        return p.charAt(0);
      });
      return letters.slice(0, 2).join('').toUpperCase();
    }.bind(this)
  );

  protected readonly navItems = computed<NavItem[]>(
    function (this: DashboardLayout): NavItem[] {
      switch (this.auth.role()) {
        case 'Student':
          return [
            {
              label: 'Dashboard',
              hint: 'Readiness and applications',
              icon: 'bi-speedometer2',
              route: '/student/dashboard'
            },
            {
              label: 'Opportunities',
              hint: 'Jobs and internships',
              icon: 'bi-briefcase',
              route: '/student/opportunities'
            },
            {
              label: 'Skill portfolio',
              hint: 'Your verified skills',
              icon: 'bi-person-badge',
              route: '/student/portfolio'
            }
          ];
        case 'Industry':
          return [
            {
              label: 'Candidate pipeline',
              hint: 'Matches and applications',
              icon: 'bi-people',
              route: '/industry/pipeline'
            },
            {
              label: 'Post an opportunity',
              hint: 'Define the role and skills',
              icon: 'bi-plus-square',
              route: '/industry/post-opportunity'
            }
          ];
        case 'Academician':
          return [
            {
              label: 'Verify skills',
              hint: 'Student claims to review',
              icon: 'bi-patch-check',
              route: '/academician/verify-skills'
            },
            {
              label: 'Training priorities',
              hint: 'Where demand outruns supply',
              icon: 'bi-mortarboard',
              route: '/academician/faculty-fdp'
            }
          ];
        case 'Admin':
          return [
            {
              label: 'Platform overview',
              hint: 'Colleges, placements, gaps',
              icon: 'bi-graph-up-arrow',
              route: '/admin/overview'
            }
          ];
        default:
          return [];
      }
    }.bind(this)
  );

  protected readonly roleTitle = computed<string>(
    function (this: DashboardLayout): string {
      switch (this.auth.role()) {
        case 'Student':
          return 'Student workspace';
        case 'Industry':
          return 'Recruiter workspace';
        case 'Academician':
          return 'Faculty workspace';
        case 'Admin':
          return 'Administration';
        default:
          return 'SkillBridge';
      }
    }.bind(this)
  );

  protected readonly roleSubtitle = computed<string>(
    function (this: DashboardLayout): string {
      switch (this.auth.role()) {
        case 'Student':
          return 'Map your skills, close the gaps, apply where you already fit.';
        case 'Industry':
          return 'Find candidates whose verified skills match the role you posted.';
        case 'Academician':
          return 'Verify what students claim and see what the curriculum is missing.';
        case 'Admin':
          return 'Placement, participation and skill-gap figures across the network.';
        default:
          return '';
      }
    }.bind(this)
  );

  constructor() {
    this.loadNotifications();
  }

  protected toggleSidebar(): void {
    this.sidebarOpen.update(function (open: boolean): boolean {
      return !open;
    });
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected toggleNotifications(): void {
    this.notificationsOpen.update(function (open: boolean): boolean {
      return !open;
    });
  }

  protected closeNotifications(): void {
    this.notificationsOpen.set(false);
  }

  protected markRead(notificationId: number): void {
    this.data.markNotificationRead(notificationId);
    this.loadNotifications();
  }

  protected signOut(): void {
    this.auth.signOut();
  }

  private loadNotifications(): void {
    var self = this;
    var user = this.auth.currentUser();
    if (!user) {
      return;
    }
    this.data.getNotifications(user.UserId).subscribe(function (rows: Notification[]): void {
      self.notifications.set(rows);
    });
  }
}
