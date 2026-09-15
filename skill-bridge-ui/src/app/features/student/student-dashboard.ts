import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  Application,
  ApplicationStatus,
  CareerReadiness,
  OpportunityView,
  SkillGapRow,
  StudentSkillView
} from '../../core/models/schema.models';
import { AuthService } from '../../core/services/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'sb-student-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Headline figures -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <p class="text-secondary small mb-1">Skills on record</p>
            <p class="h3 mb-0">{{ skills().length }}</p>
            <p class="small text-secondary mb-0">{{ verifiedCount() }} verified by faculty</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <p class="text-secondary small mb-1">Best career fit</p>
            <p class="h3 mb-0">{{ topCareer()?.MatchPercentage ?? 0 }}%</p>
            <p class="small text-secondary mb-0 text-truncate">
              {{ topCareer()?.CareerName ?? 'Set a career goal' }}
            </p>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <p class="text-secondary small mb-1">Applications</p>
            <p class="h3 mb-0">{{ applications().length }}</p>
            <p class="small text-secondary mb-0">{{ activeApplications() }} still in play</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <p class="text-secondary small mb-1">Roles you already fit</p>
            <p class="h3 mb-0">{{ strongMatches().length }}</p>
            <p class="small text-secondary mb-0">80% match or better</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <!-- Career readiness -->
      <div class="col-12 col-xl-7">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-0 pt-3">
            <h2 class="h6 mb-0">Career readiness</h2>
            <p class="small text-secondary mb-0">
              Your levels weighed against what each path needs.
            </p>
          </div>
          <div class="card-body pt-2">
            @if (loading()) {
              <p class="text-secondary small mb-0">Loading your skill map…</p>
            } @else {
              @for (path of careers(); track path.CareerPathId) {
                <div class="mb-3">
                  <div class="d-flex justify-content-between align-items-baseline mb-1">
                    <span class="fw-semibold small">{{ path.CareerName }}</span>
                    <span class="badge" [class]="matchBadge(path.MatchPercentage)">
                      {{ path.MatchPercentage }}%
                    </span>
                  </div>
                  <div class="progress" style="height: 7px;">
                    <div
                      class="progress-bar"
                      [class]="matchBar(path.MatchPercentage)"
                      [style.width.%]="path.MatchPercentage"
                    ></div>
                  </div>
                  <p class="small text-secondary mt-1 mb-0">{{ path.Description }}</p>
                </div>
              }
            }
          </div>
        </div>
      </div>

      <!-- Closest gaps -->
      <div class="col-12 col-xl-5">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-0 pt-3">
            <h2 class="h6 mb-0">Close these first</h2>
            <p class="small text-secondary mb-0">
              Highest-impact gaps for {{ topCareer()?.CareerName ?? 'your goal' }}.
            </p>
          </div>
          <div class="card-body pt-2">
            @if (topGaps().length === 0) {
              <p class="small text-secondary mb-0">
                No gaps on your best-fit path. Aim at a harder one from the opportunities page.
              </p>
            } @else {
              @for (gap of topGaps(); track gap.SkillId) {
                <div class="sb-gap">
                  <div class="d-flex justify-content-between align-items-baseline">
                    <span class="small fw-semibold">{{ gap.SkillName }}</span>
                    <span class="small text-secondary">
                      {{ gap.CurrentLevel }} → {{ gap.RequiredLevel }}
                    </span>
                  </div>
                  <div class="sb-levels" role="img" [attr.aria-label]="gap.CurrentLevel + ' of ' + gap.RequiredLevel">
                    @for (step of levelSteps; track step) {
                      <span
                        class="sb-level"
                        [class.filled]="step <= gap.CurrentLevel"
                        [class.needed]="step > gap.CurrentLevel && step <= gap.RequiredLevel"
                      ></span>
                    }
                  </div>
                  <p class="small text-secondary mb-0">{{ gap.Recommendation }}</p>
                </div>
              }
            }
          </div>
        </div>
      </div>

      <!-- Applications -->
      <div class="col-12 col-xl-7">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
            <div>
              <h2 class="h6 mb-0">Your applications</h2>
              <p class="small text-secondary mb-0">Status updates arrive in your notifications.</p>
            </div>
            <a class="btn btn-sm btn-outline-success" routerLink="/student/opportunities">
              Browse roles
            </a>
          </div>
          <div class="card-body pt-2">
            @if (applications().length === 0) {
              <p class="small text-secondary mb-0">
                You have not applied anywhere yet. Start with a role above 80% match.
              </p>
            } @else {
              <div class="table-responsive">
                <table class="table table-sm align-middle mb-0">
                  <thead>
                    <tr class="small text-secondary">
                      <th scope="col">Role</th>
                      <th scope="col">Company</th>
                      <th scope="col">Applied</th>
                      <th scope="col">Match</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (app of applications(); track app.ApplicationId) {
                      <tr>
                        <td class="small fw-semibold">{{ titleFor(app.OpportunityId) }}</td>
                        <td class="small text-secondary">{{ companyFor(app.OpportunityId) }}</td>
                        <td class="small text-secondary">{{ app.AppliedAt | date: 'd MMM' }}</td>
                        <td class="small">{{ app.MatchScore }}%</td>
                        <td>
                          <span class="badge rounded-pill" [class]="statusBadge(app.Status)">
                            {{ app.Status }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Top matches -->
      <div class="col-12 col-xl-5">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-0 pt-3">
            <h2 class="h6 mb-0">Where you fit best today</h2>
            <p class="small text-secondary mb-0">Scored on verified and self-reported levels.</p>
          </div>
          <ul class="list-group list-group-flush">
            @for (opportunity of topMatches(); track opportunity.OpportunityId) {
              <li class="list-group-item">
                <div class="d-flex justify-content-between gap-2">
                  <div class="min-w-0">
                    <p class="small fw-semibold mb-0 text-truncate">{{ opportunity.Title }}</p>
                    <p class="small text-secondary mb-0 text-truncate">
                      {{ opportunity.CompanyName }} · {{ opportunity.Location }}
                    </p>
                  </div>
                  <span class="badge align-self-start" [class]="matchBadge(opportunity.MatchScore)">
                    {{ opportunity.MatchScore }}%
                  </span>
                </div>
                @if (opportunity.Stipend) {
                  <small class="text-secondary">
                    ₹{{ opportunity.Stipend | number }}/month · {{ opportunity.DurationMonths }} months
                  </small>
                } @else if (opportunity.SalaryMin) {
                  <small class="text-secondary">
                    ₹{{ opportunity.SalaryMin | number }}–{{ opportunity.SalaryMax | number }} per year
                  </small>
                }
              </li>
            }
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .sb-gap {
        padding: 0.65rem 0;
        border-top: 1px solid var(--sb-line);
      }
      .sb-gap:first-child {
        border-top: 0;
        padding-top: 0;
      }
      .sb-levels {
        display: flex;
        gap: 3px;
        margin: 0.35rem 0;
      }
      .sb-level {
        height: 6px;
        width: 26px;
        border-radius: 3px;
        background: #e4e9e5;
      }
      .sb-level.filled {
        background: var(--sb-ink);
      }
      .sb-level.needed {
        background: repeating-linear-gradient(
          45deg,
          #c9d6cd,
          #c9d6cd 3px,
          #eef2ef 3px,
          #eef2ef 6px
        );
      }
      .min-w-0 {
        min-width: 0;
      }
    `
  ]
})
export class StudentDashboard {
  private readonly auth = inject(AuthService);
  private readonly data = inject(MockDataService);

  protected readonly levelSteps = [1, 2, 3, 4, 5];

  protected readonly loading = signal(true);
  protected readonly skills = signal<StudentSkillView[]>([]);
  protected readonly careers = signal<CareerReadiness[]>([]);
  protected readonly applications = signal<Application[]>([]);
  protected readonly opportunities = signal<OpportunityView[]>([]);

  protected readonly verifiedCount = computed<number>(
    function (this: StudentDashboard): number {
      return this.skills().filter(function (s: StudentSkillView): boolean {
        return s.Verified;
      }).length;
    }.bind(this)
  );

  protected readonly topCareer = computed<CareerReadiness | null>(
    function (this: StudentDashboard): CareerReadiness | null {
      var rows = this.careers();
      return rows.length > 0 ? rows[0] : null;
    }.bind(this)
  );

  protected readonly topGaps = computed<SkillGapRow[]>(
    function (this: StudentDashboard): SkillGapRow[] {
      var best = this.topCareer();
      return best ? best.Gaps.slice(0, 4) : [];
    }.bind(this)
  );

  protected readonly activeApplications = computed<number>(
    function (this: StudentDashboard): number {
      return this.applications().filter(function (a: Application): boolean {
        return a.Status !== 'Rejected' && a.Status !== 'Withdrawn';
      }).length;
    }.bind(this)
  );

  protected readonly strongMatches = computed<OpportunityView[]>(
    function (this: StudentDashboard): OpportunityView[] {
      return this.opportunities().filter(function (o: OpportunityView): boolean {
        return o.MatchScore >= 80;
      });
    }.bind(this)
  );

  protected readonly topMatches = computed<OpportunityView[]>(
    function (this: StudentDashboard): OpportunityView[] {
      return this.opportunities().slice(0, 4);
    }.bind(this)
  );

  constructor() {
    this.load();
  }

  protected titleFor(opportunityId: number): string {
    return this.data.opportunityTitle(opportunityId);
  }

  protected companyFor(opportunityId: number): string {
    var match = this.opportunities().find(function (o: OpportunityView): boolean {
      return o.OpportunityId === opportunityId;
    });
    return match ? match.CompanyName : '—';
  }

  protected matchBadge(score: number): string {
    if (score >= 80) {
      return 'text-bg-success';
    }
    if (score >= 60) {
      return 'text-bg-warning';
    }
    return 'text-bg-secondary';
  }

  protected matchBar(score: number): string {
    if (score >= 80) {
      return 'bg-success';
    }
    if (score >= 60) {
      return 'bg-warning';
    }
    return 'bg-secondary';
  }

  protected statusBadge(status: ApplicationStatus): string {
    switch (status) {
      case 'Selected':
        return 'text-bg-success';
      case 'Interview':
        return 'text-bg-primary';
      case 'Shortlisted':
        return 'text-bg-info';
      case 'Rejected':
        return 'text-bg-danger';
      case 'Withdrawn':
        return 'text-bg-secondary';
      default:
        return 'text-bg-light border';
    }
  }

  private load(): void {
    var self = this;
    var studentId = this.auth.studentId();
    if (studentId === null) {
      this.loading.set(false);
      return;
    }

    this.data.getStudentSkills(studentId).subscribe(function (rows: StudentSkillView[]): void {
      self.skills.set(rows);
    });

    this.data.getCareerReadiness(studentId).subscribe(function (rows: CareerReadiness[]): void {
      self.careers.set(rows);
      self.loading.set(false);
    });

    this.data.getStudentApplications(studentId).subscribe(function (rows: Application[]): void {
      self.applications.set(rows);
    });

    this.data.getOpportunityViews(studentId).subscribe(function (rows: OpportunityView[]): void {
      self.opportunities.set(rows);
    });
  }
}
