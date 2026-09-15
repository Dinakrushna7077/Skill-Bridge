import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Academician, Industry, Student, User, UserRole } from '../models/schema.models';
import { MockDataService } from './mock-data.service';

const SESSION_KEY = 'skillbridge.session';


export interface Session {
  user: User;
  studentId: number | null;
  industryId: number | null;
  academicianId: number | null;
  collegeId: number | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly data = inject(MockDataService);
  private readonly router = inject(Router);

  private readonly session = signal<Session | null>(null);

  readonly currentUser = computed<User | null>(
    function (this: AuthService): User | null {
      var s = this.session();
      return s ? s.user : null;
    }.bind(this)
  );

  readonly role = computed<UserRole | null>(
    function (this: AuthService): UserRole | null {
      var s = this.session();
      return s ? s.user.Role : null;
    }.bind(this)
  );

  readonly isSignedIn = computed<boolean>(
    function (this: AuthService): boolean {
      return this.session() !== null;
    }.bind(this)
  );

  readonly studentId = computed<number | null>(
    function (this: AuthService): number | null {
      var s = this.session();
      return s ? s.studentId : null;
    }.bind(this)
  );

  readonly industryId = computed<number | null>(
    function (this: AuthService): number | null {
      var s = this.session();
      return s ? s.industryId : null;
    }.bind(this)
  );

  readonly academicianId = computed<number | null>(
    function (this: AuthService): number | null {
      var s = this.session();
      return s ? s.academicianId : null;
    }.bind(this)
  );

  readonly collegeId = computed<number | null>(
    function (this: AuthService): number | null {
      var s = this.session();
      return s ? s.collegeId : null;
    }.bind(this)
  );

  /** Landing route for the signed-in role. */
  readonly homeRoute = computed<string>(
    function (this: AuthService): string {
      var role = this.role();
      switch (role) {
        case 'Student':
          return '/student/dashboard';
        case 'Industry':
          return '/industry/pipeline';
        case 'Academician':
          return '/academician/verify-skills';
        case 'Admin':
          return '/admin/overview';
        default:
          return '/sign-in';
      }
    }.bind(this)
  );

  constructor() {
    this.restore();
  }

  /**
   * Mock sign-in. Any password is accepted for a known, active email; the
   * real service will exchange credentials for a token here.
   */
  signIn(email: string, password: string): { ok: boolean; message: string } {
    if (!email || !password) {
      return { ok: false, message: 'Enter both an email address and a password.' };
    }

    var user = this.data.findUserByEmail(email);
    if (!user) {
      return { ok: false, message: 'No account uses that email address.' };
    }
    if (!user.IsActive) {
      return { ok: false, message: 'This account is deactivated. Contact your administrator.' };
    }

    this.session.set(this.buildSession(user));
    this.persist();
    return { ok: true, message: 'Signed in.' };
  }

  signOut(): void {
    this.session.set(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* storage unavailable — the in-memory signal is still the source of truth */
    }
    this.router.navigateByUrl('/sign-in');
  }

  hasAnyRole(roles: UserRole[]): boolean {
    var current = this.role();
    if (current === null) {
      return false;
    }
    return roles.some(function (r: UserRole): boolean {
      return r === current;
    });
  }

  private buildSession(user: User): Session {
    var student: Student | undefined = this.data.findStudentByUserId(user.UserId);
    var industry: Industry | undefined = this.data.findIndustryByUserId(user.UserId);
    var academician: Academician | undefined = this.data.findAcademicianByUserId(user.UserId);

    var collegeId: number | null = null;
    if (student) {
      collegeId = student.CollegeId;
    } else if (academician) {
      collegeId = academician.CollegeId;
    }

    return {
      user: user,
      studentId: student ? student.StudentId : null,
      industryId: industry ? industry.IndustryId : null,
      academicianId: academician ? academician.AcademicianId : null,
      collegeId: collegeId
    };
  }

  private persist(): void {
    var s = this.session();
    if (!s) {
      return;
    }
    try {
      sessionStorage.setItem(SESSION_KEY, String(s.user.UserId));
    } catch {
      /* ignore */
    }
  }

  private restore(): void {
    var raw: string | null = null;
    try {
      raw = sessionStorage.getItem(SESSION_KEY);
    } catch {
      raw = null;
    }
    if (!raw) {
      return;
    }
    var user = this.data.findUser(Number(raw));
    if (user) {
      this.session.set(this.buildSession(user));
    }
  }
}
