import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  CandidateView,
  Opportunity,
  OpportunityType,
  ProficiencyLevel,
  Skill
} from '../../core/models/schema.models';
import { AuthService } from '../../core/services/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';

interface RequirementDraft {
  SkillId: number;
  RequiredLevel: ProficiencyLevel;
  IsMandatory: boolean;
}

@Component({
  selector: 'sb-post-opportunity',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row g-3">
      <div class="col-12 col-xl-8">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-0 pt-3">
            <h2 class="h6 mb-0">Post an opportunity</h2>
            <p class="small text-secondary mb-0">
              Skill requirements drive matching, so be specific about the level you need.
            </p>
          </div>

          <div class="card-body pt-2">
            @if (posted()) {
              <div class="alert alert-success py-2 small">
                {{ posted() }} is live. Students see it on their opportunities page immediately.
              </div>
            }
            @if (error()) {
              <div class="alert alert-danger py-2 small">{{ error() }}</div>
            }

            <div class="row g-3">
              <div class="col-12 col-md-8">
                <label class="form-label small mb-1" for="title">Role title</label>
                <input
                  id="title"
                  class="form-control form-control-sm"
                  type="text"
                  placeholder="Formulation R&D Intern"
                  [(ngModel)]="title"
                />
              </div>

              <div class="col-12 col-md-4">
                <label class="form-label small mb-1" for="type">Type</label>
                <select id="type" class="form-select form-select-sm" [(ngModel)]="type">
                  <option value="Internship">Internship</option>
                  <option value="Job">Job</option>
                </select>
              </div>

              <div class="col-12">
                <label class="form-label small mb-1" for="description">What the role involves</label>
                <textarea
                  id="description"
                  class="form-control form-control-sm"
                  rows="3"
                  placeholder="Describe the work, the team and what the student will walk away knowing."
                  [(ngModel)]="description"
                ></textarea>
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label small mb-1" for="location">Location</label>
                <input
                  id="location"
                  class="form-control form-control-sm"
                  type="text"
                  placeholder="Bhubaneswar, Odisha or Remote"
                  [(ngModel)]="location"
                />
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label small mb-1" for="deadline">Applications close</label>
                <input id="deadline" class="form-control form-control-sm" type="date" [(ngModel)]="deadline" />
              </div>

              @if (type === 'Internship') {
                <div class="col-6 col-md-4">
                  <label class="form-label small mb-1" for="duration">Duration (months)</label>
                  <input
                    id="duration"
                    class="form-control form-control-sm"
                    type="number"
                    min="1"
                    [(ngModel)]="durationMonths"
                  />
                </div>
                <div class="col-6 col-md-4">
                  <label class="form-label small mb-1" for="stipend">Stipend (₹ per month)</label>
                  <input
                    id="stipend"
                    class="form-control form-control-sm"
                    type="number"
                    min="0"
                    step="1000"
                    [(ngModel)]="stipend"
                  />
                </div>
              } @else {
                <div class="col-6 col-md-4">
                  <label class="form-label small mb-1" for="salaryMin">Salary floor (₹ per year)</label>
                  <input
                    id="salaryMin"
                    class="form-control form-control-sm"
                    type="number"
                    min="0"
                    step="10000"
                    [(ngModel)]="salaryMin"
                  />
                </div>
                <div class="col-6 col-md-4">
                  <label class="form-label small mb-1" for="salaryMax">Salary ceiling (₹ per year)</label>
                  <input
                    id="salaryMax"
                    class="form-control form-control-sm"
                    type="number"
                    min="0"
                    step="10000"
                    [(ngModel)]="salaryMax"
                  />
                </div>
              }
            </div>

            <hr class="my-4" />

            <div class="d-flex justify-content-between align-items-center mb-2">
              <h3 class="h6 mb-0">Skill requirements</h3>
              <button class="btn btn-sm btn-outline-dark" type="button" (click)="addRequirement()">
                <i class="bi bi-plus-lg"></i> Add requirement
              </button>
            </div>

            @if (requirements().length === 0) {
              <p class="small text-secondary">
                Add at least one requirement. Without it, nobody can be matched to this role.
              </p>
            } @else {
              <div class="table-responsive">
                <table class="table table-sm align-middle">
                  <thead>
                    <tr class="small text-secondary">
                      <th scope="col" style="width: 45%;">Skill</th>
                      <th scope="col">Level needed</th>
                      <th scope="col">Mandatory</th>
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (requirement of requirements(); track $index; let i = $index) {
                      <tr>
                        <td>
                          <select
                            class="form-select form-select-sm"
                            [ngModel]="requirement.SkillId"
                            (ngModelChange)="setSkill(i, $event)"
                          >
                            <option [ngValue]="0">Choose a skill…</option>
                            @for (skill of allSkills(); track skill.SkillId) {
                              <option [ngValue]="skill.SkillId">{{ skill.SkillName }}</option>
                            }
                          </select>
                        </td>
                        <td>
                          <select
                            class="form-select form-select-sm"
                            [ngModel]="requirement.RequiredLevel"
                            (ngModelChange)="setLevel(i, $event)"
                          >
                            @for (level of levels; track level) {
                              <option [ngValue]="level">{{ level }} — {{ levelLabel(level) }}</option>
                            }
                          </select>
                        </td>
                        <td>
                          <input
                            class="form-check-input"
                            type="checkbox"
                            [ngModel]="requirement.IsMandatory"
                            (ngModelChange)="setMandatory(i, $event)"
                          />
                        </td>
                        <td class="text-end">
                          <button
                            class="btn btn-sm btn-link text-danger p-0"
                            type="button"
                            (click)="removeRequirement(i)"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-success" type="button" (click)="publish()">Publish opening</button>
              <button class="btn btn-outline-secondary" type="button" (click)="reset()">Clear form</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Live preview -->
      <div class="col-12 col-xl-4">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-0 pt-3">
            <h2 class="h6 mb-0">Who this would reach</h2>
            <p class="small text-secondary mb-0">
              Updated as you change requirements, using the latest verified skill data.
            </p>
          </div>
          <div class="card-body pt-2">
            @if (previewCandidates().length === 0) {
              <p class="small text-secondary mb-0">
                Add requirements to see which students already clear them.
              </p>
            } @else {
              @for (candidate of previewCandidates(); track candidate.StudentId) {
                <div class="d-flex justify-content-between align-items-center py-2 border-top">
                  <div class="min-w-0">
                    <div class="small fw-semibold text-truncate">{{ candidate.Name }}</div>
                    <div class="small text-secondary text-truncate">{{ candidate.CollegeName }}</div>
                  </div>
                  <span class="badge" [class]="candidate.MatchScore >= 80 ? 'text-bg-success' : 'text-bg-light border text-secondary'">
                    {{ candidate.MatchScore }}%
                  </span>
                </div>
              }
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .min-w-0 {
        min-width: 0;
      }
    `
  ]
})
export class PostOpportunity {
  private readonly auth = inject(AuthService);
  private readonly data = inject(MockDataService);

  protected readonly levels: ProficiencyLevel[] = [1, 2, 3, 4, 5];

  protected title = '';
  protected type: OpportunityType = 'Internship';
  protected description = '';
  protected location = '';
  protected deadline = '';
  protected durationMonths: number | null = 6;
  protected stipend: number | null = 15000;
  protected salaryMin: number | null = 400000;
  protected salaryMax: number | null = 600000;

  protected readonly allSkills = signal<Skill[]>([]);
  protected readonly requirements = signal<RequirementDraft[]>([
    { SkillId: 0, RequiredLevel: 3, IsMandatory: true }
  ]);
  protected readonly posted = signal('');
  protected readonly error = signal('');
  protected readonly previewCandidates = signal<CandidateView[]>([]);

  protected readonly validRequirements = computed<RequirementDraft[]>(
    function (this: PostOpportunity): RequirementDraft[] {
      return this.requirements().filter(function (r: RequirementDraft): boolean {
        return r.SkillId > 0;
      });
    }.bind(this)
  );

  constructor() {
    var self = this;
    this.data.getSkills().subscribe(function (rows: Skill[]): void {
      self.allSkills.set(rows);
    });
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

  protected addRequirement(): void {
    this.requirements.update(function (rows: RequirementDraft[]): RequirementDraft[] {
      return rows.concat([{ SkillId: 0, RequiredLevel: 3, IsMandatory: false }]);
    });
  }

  protected removeRequirement(index: number): void {
    this.requirements.update(function (rows: RequirementDraft[]): RequirementDraft[] {
      return rows.filter(function (_row: RequirementDraft, i: number): boolean {
        return i !== index;
      });
    });
    this.refreshPreview();
  }

  protected setSkill(index: number, skillId: number): void {
    this.patch(index, { SkillId: Number(skillId) });
    this.refreshPreview();
  }

  protected setLevel(index: number, level: ProficiencyLevel): void {
    this.patch(index, { RequiredLevel: Number(level) as ProficiencyLevel });
    this.refreshPreview();
  }

  protected setMandatory(index: number, mandatory: boolean): void {
    this.patch(index, { IsMandatory: mandatory });
    this.refreshPreview();
  }

  protected publish(): void {
    var self = this;
    var industryId = this.auth.industryId();
    if (industryId === null) {
      return;
    }

    var problem = this.firstProblem();
    if (problem !== '') {
      this.error.set(problem);
      this.posted.set('');
      return;
    }

    var draft: Omit<Opportunity, 'OpportunityId'> = {
      IndustryId: industryId,
      Title: this.title.trim(),
      Type: this.type,
      Description: this.description.trim(),
      Location: this.location.trim(),
      DurationMonths: this.type === 'Internship' ? Number(this.durationMonths) : null,
      Stipend: this.type === 'Internship' ? Number(this.stipend) : null,
      SalaryMin: this.type === 'Job' ? Number(this.salaryMin) : null,
      SalaryMax: this.type === 'Job' ? Number(this.salaryMax) : null,
      Deadline: this.deadline,
      Status: 'Active'
    };

    var newId = this.data.createOpportunity(draft, this.validRequirements());
    this.error.set('');
    this.posted.set(draft.Title);

    this.data.getCandidatePipeline(newId).subscribe(function (rows: CandidateView[]): void {
      self.previewCandidates.set(rows.slice(0, 5));
    });
  }

  protected reset(): void {
    this.title = '';
    this.description = '';
    this.location = '';
    this.deadline = '';
    this.type = 'Internship';
    this.durationMonths = 6;
    this.stipend = 15000;
    this.salaryMin = 400000;
    this.salaryMax = 600000;
    this.requirements.set([{ SkillId: 0, RequiredLevel: 3, IsMandatory: true }]);
    this.previewCandidates.set([]);
    this.posted.set('');
    this.error.set('');
  }

  private patch(index: number, changes: Partial<RequirementDraft>): void {
    this.requirements.update(function (rows: RequirementDraft[]): RequirementDraft[] {
      return rows.map(function (row: RequirementDraft, i: number): RequirementDraft {
        return i === index ? { ...row, ...changes } : row;
      });
    });
  }

  /**
   * Preview scoring reuses the pipeline query against a throwaway opening so
   * recruiters see the real matching logic, not an approximation.
   */
  private refreshPreview(): void {
    var self = this;
    var industryId = this.auth.industryId();
    var requirements = this.validRequirements();
    if (industryId === null || requirements.length === 0) {
      this.previewCandidates.set([]);
      return;
    }

    var draftId = this.data.createOpportunity(
      {
        IndustryId: industryId,
        Title: '__preview__',
        Type: this.type,
        Description: '',
        Location: this.location,
        DurationMonths: null,
        Stipend: null,
        SalaryMin: null,
        SalaryMax: null,
        Deadline: this.deadline,
        Status: 'Draft'
      },
      requirements
    );

    this.data.getCandidatePipeline(draftId).subscribe(function (rows: CandidateView[]): void {
      self.previewCandidates.set(rows.slice(0, 5));
    });
  }

  private firstProblem(): string {
    if (this.title.trim() === '') {
      return 'Give the role a title students will recognise.';
    }
    if (this.description.trim().length < 20) {
      return 'Describe the role in a sentence or two so students know what they are applying to.';
    }
    if (this.location.trim() === '') {
      return 'Add a location, or write Remote.';
    }
    if (this.deadline === '') {
      return 'Set a closing date for applications.';
    }
    if (this.validRequirements().length === 0) {
      return 'Add at least one skill requirement so candidates can be matched.';
    }
    if (this.type === 'Job' && Number(this.salaryMax) < Number(this.salaryMin)) {
      return 'The salary ceiling is below the floor.';
    }
    return '';
  }
}
