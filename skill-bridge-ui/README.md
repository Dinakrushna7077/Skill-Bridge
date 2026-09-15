# SkillBridge

A centralised portal connecting engineering institutions and industry: students map and verify their
skills, faculty validate those claims, employers post openings and see ranked candidates, and
administrators watch placement and skill-gap figures across the network.

Angular 21, zoneless, signal state, native control flow, Bootstrap 5 and Bootstrap Icons.

## Running it

```bash
npm install
npm start          # http://localhost:4200
```

There is no backend. `MockDataService` holds every table in writable signals, so a change made on
one screen (applying to a role, verifying a skill, posting an opening) is visible on the others
without a reload.

Sign in with any password using one of:

| Role | Email |
| --- | --- |
| Student | `ananya@student.skillbridge.in` |
| Industry | `kavita@beaconsystems.in` |
| Academician | `sanjukta@cet.edu.in` |
| Admin | `admin@skillbridge.gov.in` |

The sign-in screen lists all four as one-click buttons.

## Structure

```text
src/app/
├── core/
│   ├── guards/role.guard.ts        authGuard, roleGuard(roles), homeRedirectGuard
│   ├── models/schema.models.ts     1:1 with the SQL Server DDL, plus UI-only read models
│   └── services/
│       ├── auth.service.ts         signal session, role-derived home route
│       └── mock-data.service.ts    seeded tables, derived views, match scoring
├── layouts/dashboard-layout/
│   └── dashboard-layout.ts         sidebar, top bar, notification tray, router-outlet
├── features/
│   ├── auth/sign-in.ts
│   ├── student/
│   │   ├── student-dashboard.ts    readiness, priority gaps, applications, top matches
│   │   ├── student-opportunities.ts filters, per-skill gap breakdown, apply
│   │   └── student-portfolio.ts    grouped skills, verification status, add a skill
│   ├── industry/
│   │   ├── candidate-pipeline.ts   ranked candidates, stage movement
│   │   └── post-opportunity.ts     role form, dynamic requirements, live match preview
│   ├── academician/
│   │   ├── verify-skills.ts        verification queue with filters
│   │   └── faculty-fdp.ts          training priorities from unmet demand
│   └── admin/admin-overview.ts     platform stats, college performance, skill gaps
└── app.routes.ts                   lazy routes behind role guards
```

Files carry no `.component` / `.layout` suffix, matching the brief.

## Conventions

**No arrow functions.** Every callback, subscription handler and array iteration uses a classic
function expression. Where a callback needs the component instance, it captures it first:

```typescript
var self = this;
this.data.getStudentSkills(studentId).subscribe(function (rows: StudentSkillView[]): void {
  self.skills.set(rows);
});
```

Computed signals declared as class fields use an explicit `this` parameter plus `.bind(this)`,
which keeps them arrow-free while still reading instance state:

```typescript
protected readonly verifiedCount = computed<number>(
  function (this: StudentPortfolio): number {
    return this.skills().filter(function (s: StudentSkillView): boolean {
      return s.Verified;
    }).length;
  }.bind(this)
);
```

**Schema fidelity.** Model properties keep the database's PascalCase column names, so API payloads
need no translation layer. UI-only projections (`OpportunityView`, `CandidateView`,
`VerificationRequest`, `SkillGapRow`, …) are grouped separately at the bottom of
`schema.models.ts` and never travel back to the server.

**State.** Components hold `signal()` for data and `computed()` for anything derived. Change
detection is `OnPush` everywhere and the app is zoneless, so nothing re-renders unless a signal it
reads actually changed.

## How matching works

`MockDataService.scoreAgainstRequirements` scores a student against a requirement set:

- each requirement contributes `min(currentLevel / requiredLevel, 1)` — exceeding a requirement
  earns no bonus, so breadth beats over-specialisation;
- mandatory requirements count double;
- an unverified claim is discounted by 10%, which gives faculty verification visible value.

Career readiness uses the same shape but weights by `CareerPathSkills.Importance` instead, and
returns the unmet skills ordered by `gap × importance` so the student sees what to fix first.

Faculty training priorities invert the same data: a skill that appears often in
`OpportunitySkills` but that few students hold at the required level is flagged Critical, High or
Moderate, each with a suggested delivery format.

## Swapping in a real API

`MockDataService` is the only file that knows data is fake. Every method already returns an
`Observable`, so replacing the bodies with `HttpClient` calls — and adding
`provideHttpClient(withInterceptors([...]))` in `app.config.ts` for the auth token — leaves every
component untouched. `AuthService.signIn` is the second seam: swap the local lookup for a token
exchange and keep the `Session` shape.
