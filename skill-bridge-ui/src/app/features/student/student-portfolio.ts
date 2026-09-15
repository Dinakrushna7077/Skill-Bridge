import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ProficiencyLevel,
  Skill,
  Student,
  StudentSkillView
} from '../../core/models/schema.models';
import { AuthService } from '../../core/services/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';

interface SkillGroup {
  CategoryName: string;
  Items: StudentSkillView[];
}

@Component({
  selector: 'sb-student-portfolio',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row g-3">
      <!-- Profile -->
      <div class="col-12 col-lg-4">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h2 class="h6 mb-3">Profile</h2>
            <p class="mb-1 fw-semibold">{{ auth.currentUser()?.Name }}</p>
            <p class="small text-secondary mb-3">{{ auth.currentUser()?.Email }}</p>

            <dl class="row small mb-0">
              <dt class="col-5 text-secondary fw-normal">Roll number</dt>
              <dd class="col-7">{{ profile()?.RollNo ?? '—' }}</dd>

              <dt class="col-5 text-secondary fw-normal">College</dt>
              <dd class="col-7">{{ collegeName() }}</dd>

              <dt class="col-5 text-secondary fw-normal">Department</dt>
              <dd class="col-7">{{ departmentName() }}</dd>

              <dt class="col-5 text-secondary fw-normal">Graduating</dt>
              <dd class="col-7">{{ profile()?.GraduationYear ?? '—' }}</dd>

              <dt class="col-5 text-secondary fw-normal">CGPA</dt>
              <dd class="col-7">{{ profile()?.CGPA ?? '—' }}</dd>
            </dl>

            <hr />

            <div class="d-flex flex-wrap gap-2">
              @if (profile()?.ResumeUrl) {
                <a class="btn btn-sm btn-outline-dark" [href]="profile()?.ResumeUrl" target="_blank" rel="noopener">
                  <i class="bi bi-file-earmark-text"></i> Résumé
                </a>
              }
              @if (profile()?.GithubUrl) {
                <a class="btn btn-sm btn-outline-dark" [href]="profile()?.GithubUrl" target="_blank" rel="noopener">
                  <i class="bi bi-github"></i> GitHub
                </a>
              }
              @if (profile()?.LinkedInUrl) {
                <a class="btn btn-sm btn-outline-dark" [href]="profile()?.LinkedInUrl" target="_blank" rel="noopener">
                  <i class="bi bi-linkedin"></i> LinkedIn
                </a>
              }
            </div>
          </div>
        </div>

        <!-- Add a skill -->
        <div class="card border-0 shadow-sm mt-3">
          <div class="card-body">
            <h2 class="h6 mb-1">Add a skill</h2>
            <p class="small text-secondary mb-3">
              New entries stay unverified until a faculty member reviews them.
            </p>

            @if (message()) {
              <div class="alert alert-success py-2 small mb-3">{{ message() }}</div>
            }

            <div class="mb-2">
              <label class="form-label small mb-1" for="skill">Skill</label>
              <select id="skill" class="form-select form-select-sm" [(ngModel)]="newSkillId">
                <option [ngValue]="0">Choose a skill…</option>
                @for (skill of addableSkills(); track skill.SkillId) {
                  <option [ngValue]="skill.SkillId">{{ skill.SkillName }}</option>
                }
              </select>
            </div>

            <div class="mb-2">
              <label class="form-label small mb-1" for="level">
                Proficiency: {{ levelLabel(newProficiency) }}
              </label>
              <input
                id="level"
                class="form-range"
                type="range"
                min="1"
                max="5"
                step="1"
                [(ngModel)]="newProficiency"
              />
            </div>

            <div class="mb-3">
              <label class="form-label small mb-1" for="years">Years of hands-on experience</label>
              <input
                id="years"
                class="form-control form-control-sm"
                type="number"
                min="0"
                step="0.5"
                [(ngModel)]="newYears"
              />
            </div>

            <button
              class="btn btn-sm btn-success w-100"
              type="button"
              [disabled]="newSkillId === 0"
              (click)="addSkill()"
            >
              Add to portfolio
            </button>
          </div>
        </div>
      </div>

      <!-- Skills -->
      <div class="col-12 col-lg-8">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
            <div>
              <h2 class="h6 mb-0">Skill portfolio</h2>
              <p class="small text-secondary mb-0">
                {{ verifiedCount() }} of {{ skills().length }} verified by faculty.
              </p>
            </div>
            <div class="progress" style="width: 130px; height: 7px;">
              <div class="progress-bar bg-success" [style.width.%]="verifiedShare()"></div>
            </div>
          </div>

          <div class="card-body pt-2">
            @if (skills().length === 0) {
              <p class="small text-secondary mb-0">
                Nothing here yet. Add your first skill from the panel on the left.
              </p>
            } @else {
              @for (group of grouped(); track group.CategoryName) {
                <h3 class="small text-secondary fw-semibold mt-3 mb-2">{{ group.CategoryName }}</h3>
                <div class="table-responsive">
                  <table class="table table-sm align-middle mb-0">
                    <tbody>
                      @for (skill of group.Items; track skill.StudentSkillId) {
                        <tr>
                          <td class="small fw-semibold" style="width: 34%;">{{ skill.SkillName }}</td>
                          <td style="width: 30%;">
                            <div class="progress" style="height: 6px;">
                              <div
                                class="progress-bar bg-dark"
                                [style.width.%]="skill.Proficiency * 20"
                              ></div>
                            </div>
                            <small class="text-secondary">{{ levelLabel(skill.Proficiency) }}</small>
                          </td>
                          <td class="small text-secondary">{{ skill.YearsExperience }} yrs</td>
                          <td class="small text-secondary">{{ skill.Source }}</td>
                          <td class="text-end">
                            @if (skill.Verified) {
                              <span class="badge text-bg-success">
                                <i class="bi bi-patch-check"></i> Verified
                              </span>
                            } @else {
                              <span class="badge text-bg-light border text-secondary">
                                Awaiting review
                              </span>
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class StudentPortfolio {
  protected readonly auth = inject(AuthService);
  private readonly data = inject(MockDataService);

  protected readonly skills = signal<StudentSkillView[]>([]);
  protected readonly profile = signal<Student | undefined>(undefined);
  protected readonly allSkills = signal<Skill[]>([]);
  protected readonly message = signal('');

  protected newSkillId = 0;
  protected newProficiency: ProficiencyLevel = 3;
  protected newYears = 0.5;

  protected readonly verifiedCount = computed<number>(
    function (this: StudentPortfolio): number {
      return this.skills().filter(function (s: StudentSkillView): boolean {
        return s.Verified;
      }).length;
    }.bind(this)
  );

  protected readonly verifiedShare = computed<number>(
    function (this: StudentPortfolio): number {
      var total = this.skills().length;
      return total === 0 ? 0 : Math.round((this.verifiedCount() / total) * 100);
    }.bind(this)
  );

  protected readonly grouped = computed<SkillGroup[]>(
    function (this: StudentPortfolio): SkillGroup[] {
      var buckets: SkillGroup[] = [];
      this.skills().forEach(function (skill: StudentSkillView): void {
        var bucket = buckets.find(function (g: SkillGroup): boolean {
          return g.CategoryName === skill.CategoryName;
        });
        if (bucket) {
          bucket.Items.push(skill);
        } else {
          buckets.push({ CategoryName: skill.CategoryName, Items: [skill] });
        }
      });
      buckets.forEach(function (g: SkillGroup): void {
        g.Items.sort(function (a: StudentSkillView, b: StudentSkillView): number {
          return b.Proficiency - a.Proficiency;
        });
      });
      return buckets;
    }.bind(this)
  );

  /** Skills the student has not already claimed. */
  protected readonly addableSkills = computed<Skill[]>(
    function (this: StudentPortfolio): Skill[] {
      var held = this.skills();
      return this.allSkills().filter(function (s: Skill): boolean {
        return !held.some(function (h: StudentSkillView): boolean {
          return h.SkillId === s.SkillId;
        });
      });
    }.bind(this)
  );

  constructor() {
    this.load();
  }

  protected collegeName(): string {
    var p = this.profile();
    return p ? this.data.collegeName(p.CollegeId) : '—';
  }

  protected departmentName(): string {
    var p = this.profile();
    return p ? this.data.departmentName(p.DepartmentId) : '—';
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

  protected addSkill(): void {
    var self = this;
    var studentId = this.auth.studentId();
    if (studentId === null || this.newSkillId === 0) {
      return;
    }

    var name = this.data.skillName(this.newSkillId);
    this.data.addStudentSkill(
      studentId,
      Number(this.newSkillId),
      Number(this.newProficiency) as ProficiencyLevel,
      Number(this.newYears)
    );

    this.newSkillId = 0;
    this.newProficiency = 3;
    this.newYears = 0.5;
    this.message.set(name + ' added. Your faculty mentor will see it in the review queue.');

    window.setTimeout(function (): void {
      self.message.set('');
    }, 4000);

    this.load();
  }

  private load(): void {
    var self = this;
    var studentId = this.auth.studentId();
    if (studentId === null) {
      return;
    }

    this.data.getStudentSkills(studentId).subscribe(function (rows: StudentSkillView[]): void {
      self.skills.set(rows);
    });

    this.data.getStudentProfile(studentId).subscribe(function (row: Student | undefined): void {
      self.profile.set(row);
    });

    this.data.getSkills().subscribe(function (rows: Skill[]): void {
      self.allSkills.set(rows);
    });
  }
}
