import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  OpportunitySkillView,
  OpportunityType,
  OpportunityView
} from '../../core/models/schema.models';
import { AuthService } from '../../core/services/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';

type TypeFilter = 'All' | OpportunityType;

@Component({
  selector: 'sb-student-opportunities',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-12 col-lg-5">
            <label class="form-label small mb-1" for="search">Search roles, companies, places</label>
            <input
              id="search"
              class="form-control form-control-sm"
              type="search"
              placeholder="Angular, .NET, Web API, Bhubaneswar…"
              [ngModel]="query()"
              (ngModelChange)="setQuery($event)"
            />
          </div>

          <div class="col-6 col-lg-3">
            <label class="form-label small mb-1" for="type">Type</label>
            <select
              id="type"
              class="form-select form-select-sm"
              [ngModel]="typeFilter()"
              (ngModelChange)="setTypeFilter($event)"
            >
              <option value="All">All openings</option>
              <option value="Internship">Internships</option>
              <option value="Job">Jobs</option>
            </select>
          </div>

          <div class="col-6 col-lg-4">
            <label class="form-label small mb-1" for="match">
              Minimum match: {{ minMatch() }}%
            </label>
            <input
              id="match"
              class="form-range"
              type="range"
              min="0"
              max="100"
              step="5"
              [ngModel]="minMatch()"
              (ngModelChange)="setMinMatch($event)"
            />
          </div>
        </div>
      </div>
    </div>

    @if (loading()) {
      <p class="text-secondary small">Scoring openings against your skill profile…</p>
    } @else if (visible().length === 0) {
      <div class="card border-0 shadow-sm">
        <div class="card-body text-center py-5">
          <i class="bi bi-search fs-3 text-secondary"></i>
          <p class="mb-1 mt-2 fw-semibold">No openings match those filters</p>
          <p class="small text-secondary mb-3">
            Lower the match threshold or clear the search to see everything that is open.
          </p>
          <button class="btn btn-sm btn-outline-success" type="button" (click)="resetFilters()">
            Clear filters
          </button>
        </div>
      </div>
    } @else {
      <div class="d-flex flex-column gap-3">
        @for (opportunity of visible(); track opportunity.OpportunityId) {
          <article class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                <div>
                  <div class="d-flex align-items-center gap-2 mb-1">
                    <h2 class="h6 mb-0">{{ opportunity.Title }}</h2>
                    <span class="badge text-bg-light border">{{ opportunity.Type }}</span>
                    @if (opportunity.HasApplied) {
                      <span class="badge text-bg-info">Applied</span>
                    }
                  </div>
                  <p class="small text-secondary mb-2">
                    {{ opportunity.CompanyName }} · {{ opportunity.IndustryType }} ·
                    <i class="bi bi-geo-alt"></i> {{ opportunity.Location }}
                  </p>
                </div>

                <div class="text-end">
                  <div class="h4 mb-0" [class]="matchText(opportunity.MatchScore)">
                    {{ opportunity.MatchScore }}%
                  </div>
                  <small class="text-secondary">skill match</small>
                </div>
              </div>

              <p class="small mb-3">{{ opportunity.Description }}</p>

              <div class="d-flex flex-wrap gap-3 small text-secondary mb-3">
                @if (opportunity.Stipend) {
                  <span><i class="bi bi-cash-coin"></i> ₹{{ opportunity.Stipend | number }}/month</span>
                }
                @if (opportunity.DurationMonths) {
                  <span><i class="bi bi-calendar3"></i> {{ opportunity.DurationMonths }} months</span>
                }
                @if (opportunity.SalaryMin) {
                  <span>
                    <i class="bi bi-cash-coin"></i>
                    ₹{{ opportunity.SalaryMin | number }}–{{ opportunity.SalaryMax | number }} per year
                  </span>
                }
                <span>
                  <i class="bi bi-hourglass-split"></i>
                  Closes {{ opportunity.Deadline | date: 'd MMM yyyy' }}
                </span>
              </div>

              <div class="d-flex flex-wrap gap-2 mb-3">
                @for (skill of opportunity.RequiredSkills; track skill.OpportunitySkillId) {
                  <span
                    class="badge rounded-pill"
                    [class]="skill.Met ? 'text-bg-success' : 'text-bg-light border text-secondary'"
                  >
                    @if (skill.Met) {
                      <i class="bi bi-check2"></i>
                    }
                    {{ skill.SkillName }} · L{{ skill.RequiredLevel }}
                    @if (skill.IsMandatory) {
                      <span class="ms-1">(required)</span>
                    }
                  </span>
                }
              </div>

              <div class="d-flex gap-2">
                <button
                  class="btn btn-sm"
                  [class]="opportunity.HasApplied ? 'btn-outline-secondary' : 'btn-success'"
                  type="button"
                  [disabled]="opportunity.HasApplied"
                  (click)="apply(opportunity)"
                >
                  {{ opportunity.HasApplied ? 'Application sent' : 'Apply' }}
                </button>
                <button class="btn btn-sm btn-outline-dark" type="button" (click)="toggle(opportunity.OpportunityId)">
                  {{ expandedId() === opportunity.OpportunityId ? 'Hide gap detail' : 'See what you are missing' }}
                </button>
              </div>

              @if (expandedId() === opportunity.OpportunityId) {
                <div class="table-responsive mt-3">
                  <table class="table table-sm align-middle mb-0">
                    <thead>
                      <tr class="small text-secondary">
                        <th scope="col">Skill</th>
                        <th scope="col">You</th>
                        <th scope="col">Needed</th>
                        <th scope="col">Gap</th>
                        <th scope="col">Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (skill of opportunity.RequiredSkills; track skill.OpportunitySkillId) {
                        <tr>
                          <td class="small">{{ skill.SkillName }}</td>
                          <td class="small">{{ skill.CurrentLevel }}</td>
                          <td class="small">{{ skill.RequiredLevel }}</td>
                          <td class="small">
                            @if (skill.Met) {
                              <span class="text-success">Met</span>
                            } @else {
                              <span class="text-danger">
                                {{ skill.RequiredLevel - skill.CurrentLevel }} level(s)
                              </span>
                            }
                          </td>
                          <td class="small text-secondary">
                            {{ skill.IsMandatory ? 'Mandatory' : 'Preferred' }}
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </article>
        }
      </div>
    }
  `,
  styles: [
    `
      .sb-match-high {
        color: #1b7a4b;
      }
      .sb-match-mid {
        color: #9a6b00;
      }
      .sb-match-low {
        color: #6b7b70;
      }
    `
  ]
})
export class StudentOpportunities {
  private readonly auth = inject(AuthService);
  private readonly data = inject(MockDataService);

  protected readonly loading = signal(true);
  protected readonly opportunities = signal<OpportunityView[]>([]);
  protected readonly query = signal('');
  protected readonly typeFilter = signal<TypeFilter>('All');
  protected readonly minMatch = signal(0);
  protected readonly expandedId = signal<number | null>(null);

  protected readonly visible = computed<OpportunityView[]>(
    function (this: StudentOpportunities): OpportunityView[] {
      var needle = this.query().trim().toLowerCase();
      var type = this.typeFilter();
      var floor = this.minMatch();

      return this.opportunities().filter(function (o: OpportunityView): boolean {
        if (o.MatchScore < floor) {
          return false;
        }
        if (type !== 'All' && o.Type !== type) {
          return false;
        }
        if (needle === '') {
          return true;
        }
        var haystack = [o.Title, o.CompanyName, o.Location, o.IndustryType, o.Description]
          .join(' ')
          .toLowerCase();
        if (haystack.indexOf(needle) !== -1) {
          return true;
        }
        return o.RequiredSkills.some(function (s: OpportunitySkillView): boolean {
          return s.SkillName.toLowerCase().indexOf(needle) !== -1;
        });
      });
    }.bind(this)
  );

  constructor() {
    this.load();
  }

  protected setQuery(value: string): void {
    this.query.set(value);
  }

  protected setTypeFilter(value: TypeFilter): void {
    this.typeFilter.set(value);
  }

  protected setMinMatch(value: number): void {
    this.minMatch.set(Number(value));
  }

  protected resetFilters(): void {
    this.query.set('');
    this.typeFilter.set('All');
    this.minMatch.set(0);
  }

  protected toggle(opportunityId: number): void {
    this.expandedId.update(function (current: number | null): number | null {
      return current === opportunityId ? null : opportunityId;
    });
  }

  protected apply(opportunity: OpportunityView): void {
    var studentId = this.auth.studentId();
    if (studentId === null || opportunity.HasApplied) {
      return;
    }
    this.data.applyToOpportunity(studentId, opportunity.OpportunityId, opportunity.MatchScore);
    this.load();
  }

  protected matchText(score: number): string {
    if (score >= 80) {
      return 'sb-match-high';
    }
    if (score >= 60) {
      return 'sb-match-mid';
    }
    return 'sb-match-low';
  }

  private load(): void {
    var self = this;
    var studentId = this.auth.studentId();
    if (studentId === null) {
      this.loading.set(false);
      return;
    }
    this.data.getOpportunityViews(studentId).subscribe(function (rows: OpportunityView[]): void {
      self.opportunities.set(rows);
      self.loading.set(false);
    });
  }
}
