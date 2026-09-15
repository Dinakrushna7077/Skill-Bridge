import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { VerificationRequest } from '../../core/models/schema.models';
import { AuthService } from '../../core/services/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';

type QueueFilter = 'Pending' | 'Verified' | 'All';

@Component({
  selector: 'sb-verify-skills',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row g-3 mb-3">
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body py-3">
            <p class="small text-secondary mb-1">Waiting on you</p>
            <p class="h4 mb-0">{{ pendingCount() }}</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body py-3">
            <p class="small text-secondary mb-1">Verified so far</p>
            <p class="h4 mb-0">{{ verifiedCount() }}</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body py-3">
            <p class="small text-secondary mb-1">Students in queue</p>
            <p class="h4 mb-0">{{ studentCount() }}</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body py-3">
            <p class="small text-secondary mb-1">From assessments</p>
            <p class="h4 mb-0">{{ assessmentCount() }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white border-0 pt-3">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <h2 class="h6 mb-0">Skill verification queue</h2>
            <p class="small text-secondary mb-0">
              Verifying a claim raises the student's match score for every open role.
            </p>
          </div>

          <div class="d-flex gap-2">
            <select class="form-select form-select-sm" [ngModel]="filter()" (ngModelChange)="setFilter($event)">
              <option value="Pending">Pending review</option>
              <option value="Verified">Already verified</option>
              <option value="All">Everything</option>
            </select>
            <select
              class="form-select form-select-sm"
              [ngModel]="departmentFilter()"
              (ngModelChange)="setDepartmentFilter($event)"
            >
              <option value="All">All departments</option>
              @for (name of departments(); track name) {
                <option [value]="name">{{ name }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <div class="card-body pt-2">
        @if (visible().length === 0) {
          <p class="small text-secondary mb-0">
            Nothing in this view. Switch the filter to see verified claims.
          </p>
        } @else {
          <div class="table-responsive">
            <table class="table align-middle mb-0">
              <thead>
                <tr class="small text-secondary">
                  <th scope="col">Student</th>
                  <th scope="col">Department</th>
                  <th scope="col">Skill</th>
                  <th scope="col">Claimed level</th>
                  <th scope="col">Experience</th>
                  <th scope="col">Source</th>
                  <th scope="col" class="text-end">Decision</th>
                </tr>
              </thead>
              <tbody>
                @for (row of visible(); track row.StudentSkillId) {
                  <tr>
                    <td>
                      <div class="small fw-semibold">{{ row.StudentName }}</div>
                      <div class="small text-secondary">{{ row.RollNo }}</div>
                    </td>
                    <td class="small text-secondary">{{ row.DepartmentName }}</td>
                    <td class="small">{{ row.SkillName }}</td>
                    <td>
                      <div class="sb-levels">
                        @for (step of levelSteps; track step) {
                          <span class="sb-level" [class.filled]="step <= row.Proficiency"></span>
                        }
                      </div>
                      <small class="text-secondary">{{ levelLabel(row.Proficiency) }}</small>
                    </td>
                    <td class="small text-secondary">{{ row.YearsExperience }} yrs</td>
                    <td>
                      <span
                        class="badge"
                        [class]="row.Source === 'Assessment' ? 'text-bg-primary' : 'text-bg-light border text-secondary'"
                      >
                        {{ row.Source }}
                      </span>
                    </td>
                    <td class="text-end">
                      @if (row.Verified) {
                        <span class="badge text-bg-success me-2">
                          <i class="bi bi-patch-check"></i> Verified
                        </span>
                        <button class="btn btn-sm btn-link text-danger p-0" type="button" (click)="revoke(row)">
                          Revoke
                        </button>
                      } @else {
                        <button class="btn btn-sm btn-success" type="button" (click)="verify(row)">
                          Verify
                        </button>
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
  `,
  styles: [
    `
      .sb-levels {
        display: flex;
        gap: 3px;
      }
      .sb-level {
        height: 6px;
        width: 18px;
        border-radius: 3px;
        background: #e4e9e5;
      }
      .sb-level.filled {
        background: var(--sb-ink);
      }
    `
  ]
})
export class VerifySkills {
  private readonly auth = inject(AuthService);
  private readonly data = inject(MockDataService);

  protected readonly levelSteps = [1, 2, 3, 4, 5];

  protected readonly queue = signal<VerificationRequest[]>([]);
  protected readonly filter = signal<QueueFilter>('Pending');
  protected readonly departmentFilter = signal<string>('All');

  protected readonly departments = computed<string[]>(
    function (this: VerifySkills): string[] {
      var names: string[] = [];
      this.queue().forEach(function (row: VerificationRequest): void {
        if (names.indexOf(row.DepartmentName) === -1) {
          names.push(row.DepartmentName);
        }
      });
      return names;
    }.bind(this)
  );

  protected readonly visible = computed<VerificationRequest[]>(
    function (this: VerifySkills): VerificationRequest[] {
      var mode = this.filter();
      var department = this.departmentFilter();

      return this.queue().filter(function (row: VerificationRequest): boolean {
        if (department !== 'All' && row.DepartmentName !== department) {
          return false;
        }
        if (mode === 'Pending') {
          return !row.Verified;
        }
        if (mode === 'Verified') {
          return row.Verified;
        }
        return true;
      });
    }.bind(this)
  );

  protected readonly pendingCount = computed<number>(
    function (this: VerifySkills): number {
      return this.queue().filter(function (row: VerificationRequest): boolean {
        return !row.Verified;
      }).length;
    }.bind(this)
  );

  protected readonly verifiedCount = computed<number>(
    function (this: VerifySkills): number {
      return this.queue().filter(function (row: VerificationRequest): boolean {
        return row.Verified;
      }).length;
    }.bind(this)
  );

  protected readonly assessmentCount = computed<number>(
    function (this: VerifySkills): number {
      return this.queue().filter(function (row: VerificationRequest): boolean {
        return row.Source === 'Assessment';
      }).length;
    }.bind(this)
  );

  protected readonly studentCount = computed<number>(
    function (this: VerifySkills): number {
      var ids: number[] = [];
      this.queue().forEach(function (row: VerificationRequest): void {
        if (ids.indexOf(row.StudentId) === -1) {
          ids.push(row.StudentId);
        }
      });
      return ids.length;
    }.bind(this)
  );

  constructor() {
    this.load();
  }

  protected setFilter(value: QueueFilter): void {
    this.filter.set(value);
  }

  protected setDepartmentFilter(value: string): void {
    this.departmentFilter.set(value);
  }

  protected verify(row: VerificationRequest): void {
    this.data.setSkillVerification(row.StudentSkillId, true);
    this.load();
  }

  protected revoke(row: VerificationRequest): void {
    this.data.setSkillVerification(row.StudentSkillId, false);
    this.load();
  }

  protected levelLabel(level: number): string {
    switch (level) {
      case 1:
        return 'Aware';
      case 2:
        return 'Assisted';
      case 3:
        return 'Independent';
      case 4:
        return 'Proficient';
      default:
        return 'Expert';
    }
  }

  private load(): void {
    var self = this;
    var collegeId = this.auth.collegeId();
    if (collegeId === null) {
      return;
    }
    this.data.getVerificationQueue(collegeId).subscribe(function (rows: VerificationRequest[]): void {
      self.queue.set(rows);
    });
  }
}
