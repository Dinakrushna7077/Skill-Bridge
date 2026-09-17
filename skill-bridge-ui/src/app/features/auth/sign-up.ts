import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CareerPath, College, Department, Student, User } from '../../core/models/schema.models';
import { AuthService } from '../../core/services/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'sb-sign-up',
  standalone: true,
  imports: [FormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      /* Custom Brand Theme (#1c2f41) */
      .bg-brand {
        background-color: #1c2f41 !important;
        color: #ffffff !important;
      }

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

      .brand-badge {
        background-color: rgba(28, 47, 65, 0.08) !important;
        color: #1c2f41 !important;
        border: 1px solid rgba(28, 47, 65, 0.2) !important;
      }

      /* Focus rings for inputs matching the brand color */
      .form-control:focus,
      .form-select:focus {
        border-color: #1c2f41 !important;
        box-shadow: 0 0 0 0.25rem rgba(28, 47, 65, 0.15) !important;
      }
    `
  ],
  template: `
    <div class="container-fluid min-vh-100 d-flex flex-column justify-content-center bg-light py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-md-11 col-lg-9 col-xl-8">
          
          <div class="mb-3 d-flex justify-content-between align-items-center">
            <a routerLink="/sign-in" class="text-decoration-none text-secondary small d-inline-flex align-items-center gap-1">
              <i class="bi bi-arrow-left"></i> Already have an account? Registration
            </a>
            <span class="badge brand-badge bg-opacity-10 text-primary border border-primary border-opacity-25">
              Academic Onboarding
            </span>
          </div>

          <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white p-4 p-md-5">
            <div class="d-flex align-items-center gap-2 mb-3">
              <div class="bg-brand text-white rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
                <i class="bi bi-person-plus-fill fs-5"></i>
              </div>
              <div>
                <h4 class="fw-bold mb-0 lh-1">Create Student Profile</h4>
                <small class="text-muted">SkillBridge unified academia-industry placement network</small>
              </div>
            </div>

            <p class="text-secondary small mb-4">
              Register your verified credentials to match internships, auto-generate your skill passport, and identify curriculum gaps.
            </p>

            @if (errorMessage()) {
              <div class="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-4" role="alert">
                <i class="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                <div>{{ errorMessage() }}</div>
              </div>
            }

            <form (ngSubmit)="submit()">
              <!-- Basic Identity (Users Table) -->
              <h6 class="text-uppercase text-secondary fw-bold small border-bottom pb-2 mb-3">
                1. Account Credentials
              </h6>

              <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                  <label class="form-label small fw-semibold text-secondary" for="name">Full Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    class="form-control"
                    placeholder="e.g. Soumya Ranjan Das"
                    [(ngModel)]="form.name"
                    required
                  />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label small fw-semibold text-secondary" for="email">Email ID *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    class="form-control"
                    placeholder="e.g. soumya@rec.edu.in"
                    [(ngModel)]="form.email"
                    required
                  />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label small fw-semibold text-secondary" for="phone">Phone Number *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    class="form-control"
                    placeholder="e.g. 9861000999"
                    [(ngModel)]="form.phoneNumber"
                    required
                  />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label small fw-semibold text-secondary" for="password">Password *</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    class="form-control"
                    placeholder="Choose a password"
                    [(ngModel)]="form.password"
                    required
                  />
                </div>
              </div>

              <!-- Academic Record (Students Table) -->
              <h6 class="text-uppercase text-secondary fw-bold small border-bottom pb-2 mb-3">
                2. College & Academic Affiliation
              </h6>

              <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                  <label class="form-label small fw-semibold text-secondary" for="college">Institution / College *</label>
                  <select
                    id="college"
                    name="college"
                    class="form-select"
                    [(ngModel)]="form.collegeId"
                    (change)="onCollegeChange()"
                    required
                  >
                    <option [ngValue]="0" disabled>Select college</option>
                    @for (c of colleges(); track c.CollegeId) {
                      <option [ngValue]="c.CollegeId">{{ c.CollegeName }}</option>
                    }
                  </select>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label small fw-semibold text-secondary" for="department">Department / Branch *</label>
                  <select
                    id="department"
                    name="department"
                    class="form-select"
                    [(ngModel)]="form.departmentId"
                    [disabled]="form.collegeId === 0"
                    required
                  >
                    <option [ngValue]="0" disabled>Select branch</option>
                    @for (d of filteredDepartments(); track d.DepartmentId) {
                      <option [ngValue]="d.DepartmentId">{{ d.DepartmentName }}</option>
                    }
                  </select>
                </div>

                <div class="col-12 col-md-4">
                  <label class="form-label small fw-semibold text-secondary" for="rollNo">Registration / Roll No *</label>
                  <input
                    id="rollNo"
                    name="rollNo"
                    type="text"
                    class="form-control"
                    placeholder="e.g. REC-MCA-099"
                    [(ngModel)]="form.rollNo"
                    required
                  />
                </div>

                <div class="col-12 col-md-4">
                  <label class="form-label small fw-semibold text-secondary" for="gradYear">Graduation Year *</label>
                  <select id="gradYear" name="gradYear" class="form-select" [(ngModel)]="form.graduationYear">
                    <option [ngValue]="2025">2025</option>
                    <option [ngValue]="2026">2026</option>
                    <option [ngValue]="2027">2027</option>
                    <option [ngValue]="2028">2028</option>
                  </select>
                </div>

                <div class="col-12 col-md-4">
                  <label class="form-label small fw-semibold text-secondary" for="cgpa">Current CGPA (out of 10) *</label>
                  <input
                    id="cgpa"
                    name="cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    class="form-control"
                    placeholder="8.50"
                    [(ngModel)]="form.cgpa"
                    required
                  />
                </div>
              </div>

              <!-- Career & Digital Footprint -->
              <h6 class="text-uppercase text-secondary fw-bold small border-bottom pb-2 mb-3">
                3. Career Target & Portfolio Links
              </h6>

              <div class="row g-3 mb-4">
                <div class="col-12">
                  <label class="form-label small fw-semibold text-secondary" for="careerGoal">Target Career Specialisation *</label>
                  <select id="careerGoal" name="careerGoal" class="form-select" [(ngModel)]="form.careerGoalId" required>
                    <option [ngValue]="0" disabled>Select target industry path</option>
                    @for (cp of careerPaths(); track cp.CareerPathId) {
                      <option [ngValue]="cp.CareerPathId">{{ cp.CareerName }}</option>
                    }
                  </select>
                  <div class="form-text small">Used by the skill gap diagnostic engine to calculate your initial match score.</div>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label small fw-semibold text-secondary" for="github">GitHub Profile URL</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light text-muted"><i class="bi bi-github"></i></span>
                    <input
                      id="github"
                      name="github"
                      type="url"
                      class="form-control"
                      placeholder="https://github.com/username"
                      [(ngModel)]="form.githubUrl"
                    />
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label small fw-semibold text-secondary" for="linkedin">LinkedIn Profile URL</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light text-muted"><i class="bi bi-linkedin"></i></span>
                    <input
                      id="linkedin"
                      name="linkedin"
                      type="url"
                      class="form-control"
                      placeholder="https://linkedin.com/in/username"
                      [(ngModel)]="form.linkedInUrl"
                    />
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex flex-column flex-sm-row justify-content-end gap-2 pt-3 border-top">
                <button routerLink="/sign-in" type="button" class="btn btn-outline-secondary px-4">
                  Cancel
                </button>
                <button type="submit" class="btn btn-brand px-5 fw-semibold d-inline-flex align-items-center justify-content-center gap-2">
                  Complete Registration <i class="bi bi-check-circle-fill"></i>
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  `
})
export class SignUp implements OnInit {
  private readonly mockData = inject(MockDataService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly colleges = signal<College[]>([]);
  protected readonly allDepartments = signal<Department[]>([]);
  protected readonly filteredDepartments = signal<Department[]>([]);
  protected readonly careerPaths = signal<CareerPath[]>([]);
  protected readonly errorMessage = signal<string>('');

  protected form = {
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    collegeId: 0,
    departmentId: 0,
    rollNo: '',
    graduationYear: 2026,
    cgpa: null as number | null,
    careerGoalId: 0,
    githubUrl: '',
    linkedInUrl: ''
  };

  ngOnInit(): void {
    var self = this;

    this.mockData.getColleges().subscribe(function (cols: College[]): void {
      self.colleges.set(cols);
    });

    this.mockData.getDepartments().subscribe(function (deps: Department[]): void {
      self.allDepartments.set(deps);
    });

    this.mockData.getCareerPaths().subscribe(function (paths: CareerPath[]): void {
      self.careerPaths.set(paths);
    });
  }

  protected onCollegeChange(): void {
    var self = this;
    var selectedCollegeId = Number(this.form.collegeId);
    this.form.departmentId = 0;

    var filtered = this.allDepartments().filter(function (d: Department): boolean {
      return d.CollegeId === selectedCollegeId;
    });

    self.filteredDepartments.set(filtered);
  }

  protected submit(): void {
    var self = this;

    /* Mandatory field check */
    if (!this.form.name || !this.form.email || !this.form.password || !this.form.rollNo) {
      this.errorMessage.set('Please fill out all mandatory fields marked with an asterisk (*).');
      return;
    }

    if (this.form.collegeId === 0 || this.form.departmentId === 0) {
      this.errorMessage.set('Please select your institution and department.');
      return;
    }

    if (this.form.careerGoalId === 0) {
      this.errorMessage.set('Please select a target career path.');
      return;
    }

    if (this.form.cgpa === null || this.form.cgpa < 0 || this.form.cgpa > 10) {
      this.errorMessage.set('Enter a valid CGPA between 0.00 and 10.00.');
      return;
    }

    var cleanEmail = this.form.email.trim().toLowerCase();

    /* Duplicate check against active users in mock service */
    var existingUser = this.mockData.findUserByEmail(cleanEmail);
    if (existingUser) {
      this.errorMessage.set('An account with this email address already exists.');
      return;
    }

    /* Derive next unique primary keys */
    var currentUsers = this.mockData.usersSnapshot();
    var nextUserId = currentUsers.reduce(function (max: number, u: User): number {
      return Math.max(max, u.UserId);
    }, 0) + 1;

    /* Build User model conforming strictly to interface User */
    var nowIso = new Date().toISOString();
    var newUser: User = {
      UserId: nextUserId,
      Name: this.form.name.trim(),
      Email: cleanEmail,
      PhoneNumber: this.form.phoneNumber ? this.form.phoneNumber.trim() : '',
      PasswordHash: '$2b$10$mockedregistrationhashforlocaldev',
      Role: 'Student',
      IsActive: true,
      CreatedAt: nowIso,
      UpdatedAt: nowIso
    };

    /* Build Student model conforming strictly to interface Student */
    var newStudent: Student = {
      StudentId: nextUserId,
      UserId: nextUserId,
      CollegeId: Number(this.form.collegeId),
      DepartmentId: Number(this.form.departmentId),
      RollNo: this.form.rollNo.trim(),
      GraduationYear: Number(this.form.graduationYear),
      CGPA: Number(this.form.cgpa),
      CareerGoalId: Number(this.form.careerGoalId),
      ResumeUrl: null,
      GithubUrl: this.form.githubUrl ? this.form.githubUrl.trim() : null,
      LinkedInUrl: this.form.linkedInUrl ? this.form.linkedInUrl.trim() : null
    };

    /* Append to MockDataService store */
    this.mockData.addUser(newUser);
    this.mockData.addStudent(newStudent);

    /* Direct login & route to student dashboard */
    var loginResult = this.auth.signIn(this.form.email, this.form.password);
    if (loginResult.ok) {
      self.errorMessage.set('');
      self.router.navigateByUrl('/student/dashboard');
    } else {
      self.router.navigateByUrl('/sign-in');
    }
  }
}