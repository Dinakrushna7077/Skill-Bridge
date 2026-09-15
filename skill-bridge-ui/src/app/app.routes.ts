import { Routes } from '@angular/router';

import { authGuard, homeRedirectGuard, roleGuard } from './core/guards/role.guard';

/**
 * Every feature screen is lazily loaded. The dashboard shell is loaded once
 * and stays mounted, so moving between screens only fetches the leaf chunk.
 */
export const routes: Routes = [
  {
    path: 'sign-in',
    title: 'Sign in · SkillBridge',
    loadComponent: function () {
      return import('./features/auth/sign-in').then(function (m) {
        return m.SignIn;
      });
    }
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: function () {
      return import('./layouts/dashboard-layout/dashboard-layout').then(function (m) {
        return m.DashboardLayout;
      });
    },
    children: [
      /* ---------------------------- Student ---------------------------- */
      {
        path: 'student',
        canActivate: [roleGuard(['Student'])],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
          {
            path: 'dashboard',
            title: 'Dashboard · SkillBridge',
            loadComponent: function () {
              return import('./features/student/student-dashboard').then(function (m) {
                return m.StudentDashboard;
              });
            }
          },
          {
            path: 'opportunities',
            title: 'Opportunities · SkillBridge',
            loadComponent: function () {
              return import('./features/student/student-opportunities').then(function (m) {
                return m.StudentOpportunities;
              });
            }
          },
          {
            path: 'portfolio',
            title: 'Skill portfolio · SkillBridge',
            loadComponent: function () {
              return import('./features/student/student-portfolio').then(function (m) {
                return m.StudentPortfolio;
              });
            }
          }
        ]
      },

      /* ---------------------------- Industry --------------------------- */
      {
        path: 'industry',
        canActivate: [roleGuard(['Industry'])],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'pipeline' },
          {
            path: 'pipeline',
            title: 'Candidate pipeline · SkillBridge',
            loadComponent: function () {
              return import('./features/industry/candidate-pipeline').then(function (m) {
                return m.CandidatePipeline;
              });
            }
          },
          {
            path: 'post-opportunity',
            title: 'Post an opportunity · SkillBridge',
            loadComponent: function () {
              return import('./features/industry/post-opportunity').then(function (m) {
                return m.PostOpportunity;
              });
            }
          }
        ]
      },

      /* -------------------------- Academician -------------------------- */
      {
        path: 'academician',
        canActivate: [roleGuard(['Academician'])],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'verify-skills' },
          {
            path: 'verify-skills',
            title: 'Verify skills · SkillBridge',
            loadComponent: function () {
              return import('./features/academician/verify-skills').then(function (m) {
                return m.VerifySkills;
              });
            }
          },
          {
            path: 'faculty-fdp',
            title: 'Training priorities · SkillBridge',
            loadComponent: function () {
              return import('./features/academician/faculty-fdp').then(function (m) {
                return m.FacultyFdp;
              });
            }
          }
        ]
      },

      /* ----------------------------- Admin ----------------------------- */
      {
        path: 'admin',
        canActivate: [roleGuard(['Admin'])],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'overview' },
          {
            path: 'overview',
            title: 'Platform overview · SkillBridge',
            loadComponent: function () {
              return import('./features/admin/admin-overview').then(function (m) {
                return m.AdminOverview;
              });
            }
          }
        ]
      },

      /* The landing screen depends on the signed-in role, so it is resolved
         by a guard rather than a static redirectTo. */
      { path: '', pathMatch: 'full', canActivate: [homeRedirectGuard], children: [] }
    ]
  },

  { path: '**', redirectTo: 'sign-in' }
];
