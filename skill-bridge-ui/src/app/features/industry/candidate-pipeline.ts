import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ApplicationStatus,
  CandidateView,
  Opportunity
} from '../../core/models/schema.models';
import { AuthService } from '../../core/services/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'sb-candidate-pipeline',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (openings().length === 0) {
      <div class="card border-0 shadow-sm">
        <div class="card-body text-center py-5">
          <i class="bi bi-inbox fs-3 text-secondary"></i>
          <p class="fw-semibold mt-2 mb-1">No openings posted yet</p>
          <p class="small text-secondary mb-0">
            Post a role and SkillBridge will rank matching students against it straight away.
          </p>
        </div>
      </div>
    } @else {
      <!-- Opening picker -->
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body">
          <div class="row g-2 align-items-end">
            <div class="col-12 col-lg-6">
              <label class="form-label small mb-1" for="opening">Opening</label>
              <select
                id="opening"
                class="form-select form-select-sm"
                [ngModel]="selectedId()"
                (ngModelChange)="selectOpening($event)"
              >
                @for (opening of openings(); track opening.OpportunityId) {
                  <option [ngValue]="opening.OpportunityId">
                    {{ opening.Title }} — {{ opening.Type }}, {{ opening.Location }}
                  </option>
                }
              </select>
            </div>
            <div class="col-6 col-lg-3">
              <label class="form-label small mb-1" for="floor">
                Minimum match: {{ minMatch() }}%
              </label>
              <input
                id="floor"
                class="form-range"
                type="range"
                min="0"
                max="100"
                step="5"
                [ngModel]="minMatch()"
                (ngModelChange)="setMinMatch($event)"
              />
            </div>
            <div class="col-6 col-lg-3 text-lg-end">
              <div class="form-check d-inline-flex align-items-center gap-2">
                <input
                  id="applicants"
                  class="form-check-input mt-0"
                  type="checkbox"
                  [ngModel]="applicantsOnly()"
                  (ngModelChange)="setApplicantsOnly($event)"
                />
                <label class="form-check-label small" for="applicants">Applicants only</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stage counts -->
      <div class="row g-3 mb-3">
        @for (stage of stageSummary(); track stage.label) {
          <div class="col-6 col-lg-3">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body py-3">
                <p class="small text-secondary mb-1">{{ stage.label }}</p>
                <p class="h4 mb-0">{{ stage.count }}</p>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Candidates -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white border-0 pt-3">
          <h2 class="h6 mb-0">Candidates</h2>
          <p class="small text-secondary mb-0">
            Ranked by weighted skill match. Verified skills count at full weight.
          </p>
        </div>
        <div class="card-body pt-2">
          @if (visible().length === 0) {
            <p class="small text-secondary mb-0">
              Nobody clears that threshold yet. Lower the minimum match to widen the pool.
            </p>
          } @else {
            <div class="table-responsive">
              <table class="table align-middle mb-0">
                <thead>
                  <tr class="small text-secondary">
                    <th scope="col">Candidate</th>
                    <th scope="col">College</th>
                    <th scope="col">CGPA</th>
                    <th scope="col">Verified</th>
                    <th scope="col" style="min-width: 140px;">Match</th>
                    <th scope="col">Stage</th>
                    <th scope="col" class="text-end">Move to</th>
                  </tr>
                </thead>
                <tbody>
                  @for (candidate of visible(); track candidate.StudentId) {
                    <tr>
                      <td>
                        <div class="small fw-semibold">{{ candidate.Name }}</div>
                        <div class="small text-secondary">
                          {{ candidate.RollNo }} · class of {{ candidate.GraduationYear }}
                        </div>
                      </td>
                      <td class="small text-secondary">
                        {{ candidate.CollegeName }}
                        <div>{{ candidate.DepartmentName }}</div>
                      </td>
                      <td class="small">{{ candidate.CGPA }}</td>
                      <td class="small">{{ candidate.VerifiedSkillCount }}</td>
                      <td>
                        <div class="progress" style="height: 6px;">
                          <div
                            class="progress-bar"
                            [class]="matchBar(candidate.MatchScore)"
                            [style.width.%]="candidate.MatchScore"
                          ></div>
                        </div>
                        <small class="text-secondary">{{ candidate.MatchScore }}%</small>
                      </td>
                      <td>
                        @if (candidate.Application) {
                          <span class="badge rounded-pill" [class]="statusBadge(candidate.Application.Status)">
                            {{ candidate.Application.Status }}
                          </span>
                        } @else {
                          <span class="badge rounded-pill text-bg-light border text-secondary">
                            Not applied
                          </span>
                        }
                      </td>
                      <td class="text-end">
                        @if (candidate.Application) {
                          <div class="btn-group btn-group-sm">
                            @for (stage of moveTargets; track stage) {
                              <button
                                class="btn btn-outline-dark"
                                type="button"
                                [disabled]="candidate.Application.Status === stage"
                                (click)="move(candidate, stage)"
                              >
                                {{ shortLabel(stage) }}
                              </button>
                            }
                          </div>
                        } @else {
                          <span class="small text-secondary">Awaiting application</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class CandidatePipeline {
  private readonly auth = inject(AuthService);
  private readonly data = inject(MockDataService);

  protected readonly moveTargets: ApplicationStatus[] = [
    'Shortlisted',
    'Interview',
    'Selected',
    'Rejected'
  ];

  protected readonly openings = signal<Opportunity[]>([]);
  protected readonly candidates = signal<CandidateView[]>([]);
  protected readonly selectedId = signal<number | null>(null);
  protected readonly minMatch = signal(40);
  protected readonly applicantsOnly = signal(false);

  protected readonly visible = computed<CandidateView[]>(
    function (this: CandidatePipeline): CandidateView[] {
      var floor = this.minMatch();
      var onlyApplicants = this.applicantsOnly();

      return this.candidates().filter(function (c: CandidateView): boolean {
        if (onlyApplicants && c.Application === null) {
          return false;
        }
        return c.MatchScore >= floor;
      });
    }.bind(this)
  );

  protected readonly stageSummary = computed<Array<{ label: string; count: number }>>(
    function (this: CandidatePipeline): Array<{ label: string; count: number }> {
      var rows = this.candidates();
      function countOf(status: ApplicationStatus): number {
        return rows.filter(function (c: CandidateView): boolean {
          return c.Application !== null && c.Application.Status === status;
        }).length;
      }
      return [
        { label: 'Applied', count: countOf('Applied') },
        { label: 'Shortlisted', count: countOf('Shortlisted') },
        { label: 'Interview', count: countOf('Interview') },
        { label: 'Selected', count: countOf('Selected') }
      ];
    }.bind(this)
  );

  constructor() {
    this.loadOpenings();
  }

  protected selectOpening(opportunityId: number): void {
    this.selectedId.set(Number(opportunityId));
    this.loadCandidates();
  }

  protected setMinMatch(value: number): void {
    this.minMatch.set(Number(value));
  }

  protected setApplicantsOnly(value: boolean): void {
    this.applicantsOnly.set(value);
  }

  protected move(candidate: CandidateView, status: ApplicationStatus): void {
    if (!candidate.Application) {
      return;
    }
    this.data.updateApplicationStatus(candidate.Application.ApplicationId, status);
    this.loadCandidates();
  }

  protected shortLabel(status: ApplicationStatus): string {
    switch (status) {
      case 'Shortlisted':
        return 'Shortlist';
      case 'Interview':
        return 'Interview';
      case 'Selected':
        return 'Select';
      default:
        return 'Reject';
    }
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
        return 'text-bg-light border text-secondary';
    }
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

  private loadOpenings(): void {
    var self = this;
    var industryId = this.auth.industryId();
    if (industryId === null) {
      return;
    }
    this.data.getIndustryOpportunities(industryId).subscribe(function (rows: Opportunity[]): void {
      self.openings.set(rows);
      if (rows.length > 0) {
        self.selectedId.set(rows[0].OpportunityId);
        self.loadCandidates();
      }
    });
  }

  private loadCandidates(): void {
    var self = this;
    var opportunityId = this.selectedId();
    if (opportunityId === null) {
      return;
    }
    this.data.getCandidatePipeline(opportunityId).subscribe(function (rows: CandidateView[]): void {
      self.candidates.set(rows);
    });
  }
}
