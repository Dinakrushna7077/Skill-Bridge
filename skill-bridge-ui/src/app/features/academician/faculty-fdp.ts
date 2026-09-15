import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { FdpRecommendation, SkillDemandRow } from '../../core/models/schema.models';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'sb-faculty-fdp',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row g-3">
      <!-- Priorities -->
      <div class="col-12 col-xl-7">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-0 pt-3">
            <h2 class="h6 mb-0">Training priorities this term</h2>
            <p class="small text-secondary mb-0">
              Ranked by how often industry asks for a skill against how many students can supply it.
            </p>
          </div>

          <div class="card-body pt-2">
            @if (recommendations().length === 0) {
              <p class="small text-secondary mb-0">Loading demand signals…</p>
            } @else {
              @for (row of recommendations(); track row.SkillId) {
                <div class="sb-priority">
                  <div class="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <span class="fw-semibold small">{{ row.SkillName }}</span>
                      <div class="small text-secondary">{{ row.CategoryName }}</div>
                    </div>
                    <span class="badge" [class]="priorityBadge(row.Priority)">{{ row.Priority }}</span>
                  </div>

                  <div class="d-flex align-items-center gap-2 mt-2">
                    <div class="progress flex-grow-1" style="height: 6px;">
                      <div
                        class="progress-bar"
                        [class]="priorityBar(row.Priority)"
                        [style.width.%]="row.CoverageShare"
                      ></div>
                    </div>
                    <small class="text-secondary" style="min-width: 108px;">
                      {{ row.ReadyStudents }} of {{ row.DemandCount }} openings covered
                    </small>
                  </div>

                  <p class="small text-secondary mt-2 mb-0">
                    <i class="bi bi-mortarboard"></i> {{ row.SuggestedFormat }}
                  </p>
                </div>
              }
            }
          </div>
        </div>
      </div>

      <!-- Demand vs supply -->
      <div class="col-12 col-xl-5">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-0 pt-3">
            <h2 class="h6 mb-0">Demand against supply</h2>
            <p class="small text-secondary mb-0">
              Supply counts students at level 3 or higher, verified or not.
            </p>
          </div>
          <div class="card-body pt-2">
            <div class="table-responsive">
              <table class="table table-sm align-middle mb-0">
                <thead>
                  <tr class="small text-secondary">
                    <th scope="col">Skill</th>
                    <th scope="col" class="text-center">Asked for</th>
                    <th scope="col" class="text-center">Ready</th>
                    <th scope="col" class="text-center">Shortfall</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of demand(); track row.SkillId) {
                    <tr>
                      <td class="small">
                        {{ row.SkillName }}
                        <div class="text-secondary">{{ row.CategoryName }}</div>
                      </td>
                      <td class="small text-center">{{ row.DemandCount }}</td>
                      <td class="small text-center">{{ row.SupplyCount }}</td>
                      <td class="text-center">
                        @if (row.GapIndex > 0) {
                          <span class="badge text-bg-danger">+{{ row.GapIndex }}</span>
                        } @else {
                          <span class="badge text-bg-success">covered</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Curriculum note -->
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h2 class="h6 mb-1">What to take to the board of studies</h2>
            <p class="small text-secondary mb-3">
              {{ criticalCount() }} skills sit below a quarter coverage while employers keep asking
              for them. These are the candidates for an elective or a co-taught module next semester.
            </p>
            <div class="d-flex flex-wrap gap-2">
              @for (row of criticalSkills(); track row.SkillId) {
                <span class="badge rounded-pill text-bg-light border">
                  {{ row.SkillName }} · {{ row.CoverageShare }}% ready
                </span>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .sb-priority {
        padding: 0.8rem 0;
        border-top: 1px solid var(--sb-line);
      }
      .sb-priority:first-child {
        border-top: 0;
        padding-top: 0;
      }
    `
  ]
})
export class FacultyFdp {
  private readonly data = inject(MockDataService);

  protected readonly recommendations = signal<FdpRecommendation[]>([]);
  protected readonly demand = signal<SkillDemandRow[]>([]);

  protected readonly criticalSkills = computed<FdpRecommendation[]>(
    function (this: FacultyFdp): FdpRecommendation[] {
      return this.recommendations().filter(function (r: FdpRecommendation): boolean {
        return r.Priority === 'Critical';
      });
    }.bind(this)
  );

  protected readonly criticalCount = computed<number>(
    function (this: FacultyFdp): number {
      return this.criticalSkills().length;
    }.bind(this)
  );

  constructor() {
    var self = this;

    this.data.getFdpRecommendations().subscribe(function (rows: FdpRecommendation[]): void {
      self.recommendations.set(rows);
    });

    this.data.getSkillDemand().subscribe(function (rows: SkillDemandRow[]): void {
      self.demand.set(rows);
    });
  }

  protected priorityBadge(priority: FdpRecommendation['Priority']): string {
    if (priority === 'Critical') {
      return 'text-bg-danger';
    }
    if (priority === 'High') {
      return 'text-bg-warning';
    }
    return 'text-bg-secondary';
  }

  protected priorityBar(priority: FdpRecommendation['Priority']): string {
    if (priority === 'Critical') {
      return 'bg-danger';
    }
    if (priority === 'High') {
      return 'bg-warning';
    }
    return 'bg-success';
  }
}
