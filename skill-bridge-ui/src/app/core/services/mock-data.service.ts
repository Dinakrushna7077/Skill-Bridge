import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import {
  Academician,
  Application,
  ApplicationStatus,
  CandidateView,
  CareerPath,
  CareerPathSkill,
  CareerReadiness,
  College,
  CollegePerformance,
  CurrentLevel,
  Department,
  FdpRecommendation,
  Industry,
  Notification,
  Opportunity,
  OpportunitySkill,
  OpportunitySkillView,
  OpportunityView,
  PlatformStats,
  Placement,
  ProficiencyLevel,
  Skill,
  SkillCategory,
  SkillDemandRow,
  SkillGapRow,
  Student,
  StudentSkill,
  StudentSkillView,
  User,
  VerificationRequest
} from '../models/schema.models';

/** Simulated round-trip latency, in milliseconds. */
const LATENCY = 180;

/**
 * In-memory stand-in for the SkillBridge API.
 *
 * Tables are held in writable signals so that mutations made anywhere in the
 * app (applying to a role, verifying a skill, posting an opportunity) are
 * visible to every other screen without a page reload.
 */
@Injectable({ providedIn: 'root' })
export class MockDataService {
  /* ---------------------------------------------------------------- */
  /* Seed data                                                        */
  /* ---------------------------------------------------------------- */

  private readonly users = signal<User[]>([
    this.user(1, 'Dinakrushna Mohanta', 'dinakrushna@gmail.com', '9861000101', 'Student'),
    this.user(2, 'Monalisha das', 'monalisha@gmail.com', '9861000105', 'Student'),
    this.user(3, 'Debasmita muduli', 'debasmita@gmail.com', '9861000103', 'Student'),
    this.user(4, 'Shrabani pahi', 'shrabani@gmail.com', '9861000104', 'Student'),
    this.user(5, 'Subhalaxmi Beuria', 'subhalaxmi@gmail.com', '9861000102', 'Student'),
    this.user(6, 'Shradhanjali satapathy', 'shradhanjali@gmail.com', '9861000106', 'Student'),
    this.user(7, 'PROF. RAJESWARI CHHUALSINGH', 'rajeswari.rec@gmail.com', '9861000202', 'Academician'), // Fixed email
    this.user(8, 'PROF. Styaranjan Mishra', 'styaranjan@rec.gmail.com', '9861000201', 'Academician'),
    this.user(9, 'Kavita Rath', 'kavita@infosys.support.com', '9861000301', 'Industry'),
    this.user(10, 'Nikhil Yadav', 'nikhil@tcs.support.com', '9861000302', 'Industry'),
    this.user(11, 'Arun Verma', 'arun@loopinteractive.dev', '9861000303', 'Industry'),                  // Added Loop rep
    this.user(12, 'Admin User', 'admin.skillbridge@gmail.com', '9861000401', 'Admin')                  // Moved Admin to 12
  ]);

  private readonly colleges = signal<College[]>([
    {
      CollegeId: 1,
      CollegeName: 'Raajdhani Engineering College, Bhubaneswar',
      Location: 'Bhubaneswar, Odisha',
      Website: 'https://cet.edu.in',
      CreatedAt: '2024-01-12T09:00:00Z'
    },
    {
      CollegeId: 2,
      CollegeName: 'Silicon Institute of Technology',
      Location: 'Bhubaneswar, Odisha',
      Website: 'https://silicon.ac.in',
      CreatedAt: '2024-01-18T09:00:00Z'
    },
    {
      CollegeId: 3,
      CollegeName: 'Veer Surendra Sai University of Technology',
      Location: 'Burla, Odisha',
      Website: 'https://vssut.ac.in',
      CreatedAt: '2024-02-02T09:00:00Z'
    }
  ]);

  private readonly departments = signal<Department[]>([
    { DepartmentId: 1, CollegeId: 1, DepartmentName: 'MCA' },
    { DepartmentId: 2, CollegeId: 1, DepartmentName: 'Information Technology' },
    { DepartmentId: 3, CollegeId: 2, DepartmentName: 'Computer Science & Engineering' },
    { DepartmentId: 4, CollegeId: 2, DepartmentName: 'Electronics & Communication' },
    { DepartmentId: 5, CollegeId: 3, DepartmentName: 'Computer Science & Engineering' }
  ]);

  private readonly students = signal<Student[]>([
    {
      StudentId: 1, UserId: 1, CollegeId: 1, DepartmentId: 1, RollNo: 'REC-MCA-0114',
      GraduationYear: 2026, CGPA: 8.6, CareerGoalId: 1,
      ResumeUrl: 'https://dinakrushna7077.github.io/Dinakrushna-Portfolio/resume.html',
      GithubUrl: 'https://github.com/Dinakrushna7077',
      LinkedInUrl: 'https://www.linkedin.com/in/dinakrushna7077/'
    },
    {
      StudentId: 2, UserId: 2, CollegeId: 1, DepartmentId: 2, RollNo: 'REC-MCA-0237',
      GraduationYear: 2026, CGPA: 7.9, CareerGoalId: 2,
      ResumeUrl: 'https://dinakrushna7077.github.io/Dinakrushna-Portfolio/resume.html',
      GithubUrl: 'https://github.com/Dinakrushna7077', LinkedInUrl: null
    },
    {
      StudentId: 3, UserId: 3, CollegeId: 2, DepartmentId: 3, RollNo: 'SIT-CSE-0088',
      GraduationYear: 2027, CGPA: 9.1, CareerGoalId: 3,
      ResumeUrl: 'https://dinakrushna7077.github.io/Dinakrushna-Portfolio/resume.html',
      GithubUrl: 'https://github.com/Dinakrushna7077',
      LinkedInUrl: 'https://www.linkedin.com/in/dinakrushna7077/'
    },
    {
      StudentId: 4, UserId: 4, CollegeId: 2, DepartmentId: 4, RollNo: 'SIT/ECE/22/0352',
      GraduationYear: 2026, CGPA: 8.2, CareerGoalId: 4,
      ResumeUrl: null, GithubUrl: 'https://github.com/Dinakrushna7077', LinkedInUrl: null
    },
    {
      StudentId: 5, UserId: 5, CollegeId: 3, DepartmentId: 5, RollNo: 'VSSUT/CSE/22/0031',
      GraduationYear: 2026, CGPA: 8.8, CareerGoalId: 1,
      ResumeUrl: 'https://dinakrushna7077.github.io/Dinakrushna-Portfolio/resume.html',
      GithubUrl: 'https://github.com/Dinakrushna7077',
      LinkedInUrl: 'https://www.linkedin.com/in/dinakrushna7077/'
    },
    {
      StudentId: 6, UserId: 6, CollegeId: 1, DepartmentId: 1, RollNo: 'REC-MCA-0125',
      GraduationYear: 2026, CGPA: 8.4, CareerGoalId: 2,
      ResumeUrl: null,
      GithubUrl: 'https://github.com/Dinakrushna7077',
      LinkedInUrl: null
    }
  ]);

  private readonly academicians = signal<Academician[]>([
    {
      AcademicianId: 1, UserId: 7, CollegeId: 1, DepartmentId: 1,
      Designation: 'Professor & Head',
      Expertise: 'Software Engineering, Web Technologies, Training & Placement'
    },
    {
      AcademicianId: 2, UserId: 8, CollegeId: 2, DepartmentId: 3,
      Designation: 'Associate Professor',
      Expertise: 'Distributed Systems, Cloud Computing, DevOps'
    }
  ]);

  private readonly industries = signal<Industry[]>([
    {
      IndustryId: 1, UserId: 9, CompanyName: 'Infosys PVT LTD',
      IndustryType: 'Enterprise Software (.NET)', Location: 'Bhubaneswar, Odisha',
      Website: 'https://infosys.com',
      Description: 'Builds ERP and claims-processing platforms on ASP.NET Core and SQL Server.'
    },
    {
      IndustryId: 2, UserId: 10, CompanyName: 'Tata Consultancy Services',
      IndustryType: 'Cloud & DevOps Consulting', Location: 'Hyderabad, Telangana',
      Website: 'https://tcs.com',
      Description: 'Moves monolithic .NET applications onto Azure.'
    },
    {
      IndustryId: 3, UserId: 11, CompanyName: 'Loop Interactive',
      IndustryType: 'Product & Frontend Studio', Location: 'Bengaluru, Karnataka',
      Website: 'https://loopinteractive.dev',
      Description: 'A product studio shipping Angular and React front ends.'
    }
  ]);

  private readonly skillCategories = signal<SkillCategory[]>([
    { CategoryId: 1, CategoryName: 'Frontend' },
    { CategoryId: 2, CategoryName: 'Backend & APIs' },
    { CategoryId: 3, CategoryName: 'Data & Databases' },
    { CategoryId: 4, CategoryName: 'Cloud & DevOps' },
    { CategoryId: 5, CategoryName: 'Engineering Practices' }
  ]);

  private readonly skills = signal<Skill[]>([
    /* Frontend */
    this.skill(1, 1, 'Angular', 'Components, signals, routing and forms in modern Angular.'),
    this.skill(2, 1, 'React', 'Hooks, component composition and client-side routing.'),
    this.skill(3, 1, 'TypeScript', 'Types, generics and strict-mode discipline.'),
    this.skill(4, 1, 'HTML & CSS', 'Semantic markup, flexbox, grid and responsive layout.'),
    this.skill(5, 1, 'RxJS & State Management', 'Observables, operators and predictable app state.'),
    this.skill(6, 1, 'Bootstrap & Responsive UI', 'Utility-first layout and accessible components.'),
    /* Backend & APIs */
    this.skill(7, 2, 'C# and .NET', 'Language fundamentals, LINQ, async and dependency injection.'),
    this.skill(8, 2, 'ASP.NET Core Web API', 'Controllers, middleware, model binding and validation.'),
    this.skill(9, 2, 'ASP.NET MVC', 'Razor views, filters and the classic MVC request pipeline.'),
    this.skill(10, 2, 'Entity Framework Core', 'Code-first modelling, migrations and query tuning.'),
    this.skill(11, 2, 'Node.js & Express', 'Server-side JavaScript services and middleware.'),
    this.skill(12, 2, 'REST API Design', 'Resource modelling, versioning, auth and error contracts.'),
    /* Data & Databases */
    this.skill(13, 3, 'SQL Server', 'Schema design, indexing and execution-plan reading.'),
    this.skill(14, 3, 'T-SQL & Stored Procedures', 'Set-based queries, procedures and transactions.'),
    this.skill(15, 3, 'MongoDB', 'Document modelling, aggregation pipelines and indexes.'),
    this.skill(16, 3, 'Data Modelling', 'Normalisation, relationships and reporting structures.'),
    /* Cloud & DevOps */
    this.skill(17, 4, 'Microsoft Azure', 'App Service, Key Vault, storage and managed SQL.'),
    this.skill(18, 4, 'Docker', 'Images, multi-stage builds and container orchestration basics.'),
    this.skill(19, 4, 'CI/CD Pipelines', 'Build, test and deploy automation on Azure DevOps or GitHub Actions.'),
    /* Engineering practices */
    this.skill(20, 5, 'Git & Branching', 'Feature branches, rebasing, conflict resolution and PR hygiene.'),
    this.skill(21, 5, 'Unit Testing', 'xUnit, Jasmine and writing tests that survive refactors.'),
    this.skill(22, 5, 'Agile & Code Review', 'Estimation, stand-ups and giving reviewable feedback.')
  ]);

  private readonly studentSkills = signal<StudentSkill[]>([
    /* Ananya — .NET full stack */
    this.studentSkill(1, 1, 7, 4, 2.0, 'Assessment', true),
    this.studentSkill(2, 1, 8, 4, 1.5, 'Assessment', true),
    this.studentSkill(3, 1, 1, 3, 1.0, 'Manual', true),
    this.studentSkill(4, 1, 13, 3, 1.5, 'Assessment', true),
    this.studentSkill(5, 1, 20, 4, 2.0, 'Manual', true),
    this.studentSkill(6, 1, 10, 3, 1.0, 'Manual', false),
    this.studentSkill(7, 1, 3, 3, 1.0, 'Manual', false),
    this.studentSkill(8, 1, 9, 2, 0.5, 'Manual', false),
    this.studentSkill(9, 1, 21, 2, 0.5, 'Manual', false),

    this.studentSkill(10, 2, 1, 4, 2.0, 'Assessment', true),
    this.studentSkill(11, 2, 3, 4, 2.0, 'Assessment', true),
    this.studentSkill(12, 2, 4, 4, 2.5, 'Manual', true),
    this.studentSkill(13, 2, 5, 3, 1.0, 'Assessment', true),
    this.studentSkill(14, 2, 2, 3, 1.0, 'Manual', false),
    this.studentSkill(15, 2, 6, 4, 1.5, 'Manual', false),
    this.studentSkill(16, 2, 20, 3, 1.5, 'Manual', false),

    this.studentSkill(17, 3, 7, 4, 2.0, 'Assessment', true),
    this.studentSkill(18, 3, 8, 4, 2.0, 'Assessment', true),
    this.studentSkill(19, 3, 10, 4, 1.5, 'Manual', true),
    this.studentSkill(20, 3, 13, 4, 2.0, 'Assessment', true),
    this.studentSkill(21, 3, 12, 4, 1.5, 'Manual', true),
    this.studentSkill(22, 3, 20, 3, 1.5, 'Manual', true),
    this.studentSkill(23, 3, 14, 3, 1.0, 'Manual', false),
    this.studentSkill(24, 3, 18, 2, 0.5, 'Manual', false),

    this.studentSkill(25, 4, 18, 4, 1.5, 'Assessment', true),
    this.studentSkill(26, 4, 19, 3, 1.0, 'Assessment', true),
    this.studentSkill(27, 4, 20, 4, 2.0, 'Manual', true),
    this.studentSkill(28, 4, 17, 3, 1.0, 'Manual', false),
    this.studentSkill(29, 4, 11, 2, 0.5, 'Manual', false),
    this.studentSkill(30, 4, 13, 2, 0.5, 'Manual', false),

    this.studentSkill(31, 5, 2, 4, 2.0, 'Assessment', true),
    this.studentSkill(32, 5, 3, 3, 1.5, 'Assessment', true),
    this.studentSkill(33, 5, 11, 3, 1.0, 'Manual', true),
    this.studentSkill(34, 5, 13, 3, 1.0, 'Assessment', true),
    this.studentSkill(35, 5, 20, 4, 2.0, 'Manual', true),
    this.studentSkill(36, 5, 15, 3, 1.0, 'Manual', false),
    this.studentSkill(37, 5, 16, 3, 1.0, 'Manual', false),
    this.studentSkill(38, 5, 21, 2, 0.5, 'Manual', false)
  ]);

  private readonly careerPaths = signal<CareerPath[]>([
    {
      CareerPathId: 1,
      CareerName: '.NET Full Stack Developer',
      Description: 'Owns a feature end to end: Angular front end, Web API backend, SQL Server data.'
    },
    {
      CareerPathId: 2,
      CareerName: 'Angular Frontend Engineer',
      Description: 'Builds and maintains large Angular applications with typed, testable state.'
    },
    {
      CareerPathId: 3,
      CareerName: 'Backend API Engineer',
      Description: 'Designs and hardens .NET services behind well-versioned REST contracts.'
    },
    {
      CareerPathId: 4,
      CareerName: 'Cloud & DevOps Engineer',
      Description: 'Containerises applications and runs the pipelines that ship them to Azure.'
    }
  ]);

  private readonly careerPathSkills = signal<CareerPathSkill[]>([
    /* .NET Full Stack */
    this.cps(1, 1, 7, 4, 5), this.cps(2, 1, 8, 4, 5), this.cps(3, 1, 1, 3, 4),
    this.cps(4, 1, 13, 3, 4), this.cps(5, 1, 10, 3, 3), this.cps(6, 1, 20, 3, 3),
    this.cps(7, 1, 3, 3, 3),
    /* Angular Frontend */
    this.cps(8, 2, 1, 4, 5), this.cps(9, 2, 3, 4, 5), this.cps(10, 2, 5, 3, 4),
    this.cps(11, 2, 4, 4, 4), this.cps(12, 2, 6, 3, 2), this.cps(13, 2, 20, 3, 3),
    this.cps(14, 2, 21, 3, 3),
    /* Backend API */
    this.cps(15, 3, 8, 4, 5), this.cps(16, 3, 12, 4, 5), this.cps(17, 3, 7, 4, 5),
    this.cps(18, 3, 13, 4, 4), this.cps(19, 3, 14, 3, 3), this.cps(20, 3, 21, 3, 3),
    this.cps(21, 3, 10, 3, 3),
    /* Cloud & DevOps */
    this.cps(22, 4, 18, 4, 5), this.cps(23, 4, 19, 4, 5), this.cps(24, 4, 17, 3, 4),
    this.cps(25, 4, 20, 4, 4), this.cps(26, 4, 11, 2, 2), this.cps(27, 4, 13, 2, 2)
  ]);

  private readonly opportunities = signal<Opportunity[]>([
    {
      OpportunityId: 1, IndustryId: 1, Title: '.NET Full Stack Intern', Type: 'Internship',
      Description:
        'Join the claims platform team and ship real features: Angular screens on the front, ' +
        'ASP.NET Core endpoints behind them, and the SQL Server tables underneath. You will ' +
        'raise pull requests from week two and get them reviewed like any other engineer.',
      Location: 'Bhubaneswar, Odisha', DurationMonths: 6, Stipend: 25000,
      SalaryMin: null, SalaryMax: null, Deadline: '2026-10-20', Status: 'Active'
    },
    {
      OpportunityId: 2, IndustryId: 1, Title: 'ASP.NET MVC Developer', Type: 'Job',
      Description:
        'Maintain and extend a long-running MVC application for a logistics client: Razor views, ' +
        'EF Core data access and a fair amount of T-SQL. Good role if you like working inside a ' +
        'mature codebase rather than starting from a blank folder.',
      Location: 'Bhubaneswar, Odisha', DurationMonths: null, Stipend: null,
      SalaryMin: 520000, SalaryMax: 720000, Deadline: '2026-10-05', Status: 'Active'
    },
    {
      OpportunityId: 3, IndustryId: 3, Title: 'Angular Frontend Engineer', Type: 'Job',
      Description:
        'Own feature modules in a large Angular application for a fintech client. Expect typed ' +
        'forms, signal-based state, and a design system you help extend rather than fight.',
      Location: 'Bengaluru, Karnataka', DurationMonths: null, Stipend: null,
      SalaryMin: 700000, SalaryMax: 1000000, Deadline: '2026-09-30', Status: 'Active'
    },
    {
      OpportunityId: 4, IndustryId: 3, Title: 'React UI Intern', Type: 'Internship',
      Description:
        'Build screens in React and TypeScript for a health-tech dashboard, working directly with ' +
        'the designer. Small team, short feedback loop, real users at the end of it.',
      Location: 'Remote', DurationMonths: 4, Stipend: 20000,
      SalaryMin: null, SalaryMax: null, Deadline: '2026-11-15', Status: 'Active'
    },
    {
      OpportunityId: 5, IndustryId: 2, Title: 'Backend API Engineer', Type: 'Job',
      Description:
        'Design and harden .NET services that other teams consume: versioned REST contracts, ' +
        'sensible error handling, and containers that behave the same on a laptop and in Azure.',
      Location: 'Hyderabad, Telangana', DurationMonths: null, Stipend: null,
      SalaryMin: 800000, SalaryMax: 1200000, Deadline: '2026-10-28', Status: 'Active'
    },
    {
      OpportunityId: 6, IndustryId: 2, Title: 'Cloud & DevOps Trainee', Type: 'Internship',
      Description:
        'Learn the delivery side of the house: write Dockerfiles, keep pipelines green, and help ' +
        'migrate two legacy .NET applications onto Azure App Service.',
      Location: 'Hyderabad, Telangana', DurationMonths: 6, Stipend: 22000,
      SalaryMin: null, SalaryMax: null, Deadline: '2026-10-12', Status: 'Active'
    }
  ]);

  private readonly opportunitySkills = signal<OpportunitySkill[]>([
    /* 1 — .NET Full Stack Intern */
    this.os(1, 1, 7, 3, true), this.os(2, 1, 8, 3, true), this.os(3, 1, 1, 2, false),
    this.os(4, 1, 13, 2, false), this.os(5, 1, 20, 3, true),
    /* 2 — ASP.NET MVC Developer */
    this.os(6, 2, 9, 4, true), this.os(7, 2, 7, 4, true), this.os(8, 2, 10, 3, true),
    this.os(9, 2, 14, 3, false), this.os(10, 2, 20, 3, false),
    /* 3 — Angular Frontend Engineer */
    this.os(11, 3, 1, 4, true), this.os(12, 3, 3, 4, true), this.os(13, 3, 5, 3, true),
    this.os(14, 3, 4, 3, false), this.os(15, 3, 20, 3, false), this.os(16, 3, 21, 3, false),
    /* 4 — React UI Intern */
    this.os(17, 4, 2, 3, true), this.os(18, 4, 3, 2, true), this.os(19, 4, 4, 3, false),
    this.os(20, 4, 20, 2, false),
    /* 5 — Backend API Engineer */
    this.os(21, 5, 8, 4, true), this.os(22, 5, 12, 4, true), this.os(23, 5, 7, 4, true),
    this.os(24, 5, 13, 3, false), this.os(25, 5, 18, 3, false), this.os(26, 5, 21, 3, false),
    /* 6 — Cloud & DevOps Trainee */
    this.os(27, 6, 18, 3, true), this.os(28, 6, 19, 3, true), this.os(29, 6, 17, 2, false),
    this.os(30, 6, 20, 4, true)
  ]);

  private readonly applications = signal<Application[]>([
    { ApplicationId: 1, OpportunityId: 1, StudentId: 1, AppliedAt: '2026-08-28T10:12:00Z', Status: 'Shortlisted', MatchScore: 100 },
    { ApplicationId: 2, OpportunityId: 2, StudentId: 1, AppliedAt: '2026-08-30T11:40:00Z', Status: 'Applied', MatchScore: 71 },
    { ApplicationId: 3, OpportunityId: 3, StudentId: 2, AppliedAt: '2026-09-01T08:05:00Z', Status: 'Interview', MatchScore: 88 },
    { ApplicationId: 4, OpportunityId: 4, StudentId: 5, AppliedAt: '2026-09-02T15:20:00Z', Status: 'Selected', MatchScore: 83 },
    { ApplicationId: 5, OpportunityId: 5, StudentId: 3, AppliedAt: '2026-08-25T09:00:00Z', Status: 'Selected', MatchScore: 84 },
    { ApplicationId: 6, OpportunityId: 5, StudentId: 1, AppliedAt: '2026-08-26T09:30:00Z', Status: 'Rejected', MatchScore: 62 },
    { ApplicationId: 7, OpportunityId: 6, StudentId: 4, AppliedAt: '2026-09-03T12:00:00Z', Status: 'Interview', MatchScore: 99 },
    { ApplicationId: 8, OpportunityId: 4, StudentId: 2, AppliedAt: '2026-09-04T16:45:00Z', Status: 'Shortlisted', MatchScore: 95 }
  ]);

  private readonly placements = signal<Placement[]>([
    {
      PlacementId: 1, StudentId: 3, IndustryId: 2, OpportunityId: 5, Package: 950000,
      JoiningDate: '2027-07-01', PlacementDate: '2026-09-05', Status: 'Selected'
    },
    {
      PlacementId: 2, StudentId: 5, IndustryId: 3, OpportunityId: 4, Package: 240000,
      JoiningDate: '2026-11-01', PlacementDate: '2026-09-10', Status: 'Selected'
    },
    {
      PlacementId: 3, StudentId: 2, IndustryId: 3, OpportunityId: 3, Package: 820000,
      JoiningDate: '2026-12-01', PlacementDate: '2026-09-08', Status: 'Selected'
    }
  ]);

  private readonly notifications = signal<Notification[]>([
    {
      NotificationId: 1, UserId: 1, Title: 'You were shortlisted',
      Message: 'Beacon Systems India moved your .NET Full Stack Intern application to shortlisted.',
      IsRead: false, CreatedAt: '2026-09-12T06:30:00Z'
    },
    {
      NotificationId: 2, UserId: 1, Title: 'Four skills still unverified',
      Message: 'Entity Framework Core, TypeScript, ASP.NET MVC and Unit Testing need faculty review.',
      IsRead: false, CreatedAt: '2026-09-11T11:15:00Z'
    },
    {
      NotificationId: 3, UserId: 1, Title: 'One level from a 100% match',
      Message: 'Angular at level 4 would clear every requirement on the Angular Frontend Engineer role.',
      IsRead: true, CreatedAt: '2026-09-09T07:00:00Z'
    },
    {
      NotificationId: 4, UserId: 6, Title: '14 verification requests waiting',
      Message: 'Students from CSE and IT have submitted skills for review.',
      IsRead: false, CreatedAt: '2026-09-13T04:45:00Z'
    },
    {
      NotificationId: 5, UserId: 8, Title: 'New matches for .NET Full Stack Intern',
      Message: 'Two candidates cleared the 85% match threshold this week.',
      IsRead: true, CreatedAt: '2026-09-10T09:00:00Z'
    },
    {
      NotificationId: 6, UserId: 7, Title: 'Placement figures updated',
      Message: 'September numbers are in for all three partner institutions.',
      IsRead: false, CreatedAt: '2026-09-14T03:20:00Z'
    }
  ]);

  /* ---------------------------------------------------------------- */
  /* Seed helpers                                                     */
  /* ---------------------------------------------------------------- */

  private user(
    UserId: number,
    Name: string,
    Email: string,
    PhoneNumber: string,
    Role: User['Role']
  ): User {
    return {
      UserId,
      Name,
      Email,
      PhoneNumber,
      PasswordHash: '$2b$10$mockedhashvalueforlocaldevelopment',
      Role,
      IsActive: true,
      CreatedAt: '2025-07-01T05:00:00Z',
      UpdatedAt: '2026-09-01T05:00:00Z'
    };
  }

  private skill(SkillId: number, CategoryId: number, SkillName: string, Description: string): Skill {
    return { SkillId, CategoryId, SkillName, Description };
  }

  private studentSkill(
    StudentSkillId: number,
    StudentId: number,
    SkillId: number,
    Proficiency: ProficiencyLevel,
    YearsExperience: number,
    Source: StudentSkill['Source'],
    Verified: boolean
  ): StudentSkill {
    return { StudentSkillId, StudentId, SkillId, Proficiency, YearsExperience, Source, Verified };
  }

  private cps(
    CareerPathSkillId: number,
    CareerPathId: number,
    SkillId: number,
    RequiredLevel: ProficiencyLevel,
    Importance: ProficiencyLevel
  ): CareerPathSkill {
    return { CareerPathSkillId, CareerPathId, SkillId, RequiredLevel, Importance };
  }

  private os(
    OpportunitySkillId: number,
    OpportunityId: number,
    SkillId: number,
    RequiredLevel: ProficiencyLevel,
    IsMandatory: boolean
  ): OpportunitySkill {
    return { OpportunitySkillId, OpportunityId, SkillId, RequiredLevel, IsMandatory };
  }

  /* ---------------------------------------------------------------- */
  /* Synchronous lookups (used internally and by templates)           */
  /* ---------------------------------------------------------------- */

  usersSnapshot(): User[] {
    return this.users();
  }

  findUser(userId: number): User | undefined {
    return this.users().find(function (u: User): boolean {
      return u.UserId === userId;
    });
  }

  findUserByEmail(email: string): User | undefined {
    var needle = email.trim().toLowerCase();
    return this.users().find(function (u: User): boolean {
      return u.Email.toLowerCase() === needle;
    });
  }

  findStudentByUserId(userId: number): Student | undefined {
    return this.students().find(function (s: Student): boolean {
      return s.UserId === userId;
    });
  }

  findIndustryByUserId(userId: number): Industry | undefined {
    return this.industries().find(function (i: Industry): boolean {
      return i.UserId === userId;
    });
  }

  findAcademicianByUserId(userId: number): Academician | undefined {
    return this.academicians().find(function (a: Academician): boolean {
      return a.UserId === userId;
    });
  }

  skillName(skillId: number): string {
    var match = this.skills().find(function (s: Skill): boolean {
      return s.SkillId === skillId;
    });
    return match ? match.SkillName : 'Unknown skill';
  }

  categoryNameForSkill(skillId: number): string {
    var self = this;
    var skill = this.skills().find(function (s: Skill): boolean {
      return s.SkillId === skillId;
    });
    if (!skill) {
      return 'Uncategorised';
    }
    var category = self.skillCategories().find(function (c: SkillCategory): boolean {
      return c.CategoryId === skill!.CategoryId;
    });
    return category ? category.CategoryName : 'Uncategorised';
  }

  collegeName(collegeId: number): string {
    var match = this.colleges().find(function (c: College): boolean {
      return c.CollegeId === collegeId;
    });
    return match ? match.CollegeName : '—';
  }

  departmentName(departmentId: number): string {
    var match = this.departments().find(function (d: Department): boolean {
      return d.DepartmentId === departmentId;
    });
    return match ? match.DepartmentName : '—';
  }

  companyName(industryId: number): string {
    var match = this.industries().find(function (i: Industry): boolean {
      return i.IndustryId === industryId;
    });
    return match ? match.CompanyName : '—';
  }

  opportunityTitle(opportunityId: number): string {
    var match = this.opportunities().find(function (o: Opportunity): boolean {
      return o.OpportunityId === opportunityId;
    });
    return match ? match.Title : '—';
  }

  studentName(studentId: number): string {
    var self = this;
    var student = this.students().find(function (s: Student): boolean {
      return s.StudentId === studentId;
    });
    if (!student) {
      return '—';
    }
    var user = self.findUser(student.UserId);
    return user ? user.Name : '—';
  }

  /* ---------------------------------------------------------------- */
  /* Reference data feeds                                             */
  /* ---------------------------------------------------------------- */

  getColleges(): Observable<College[]> {
    return this.feed(this.colleges());
  }

  getDepartments(): Observable<Department[]> {
    return this.feed(this.departments());
  }

  getSkills(): Observable<Skill[]> {
    return this.feed(this.skills());
  }

  getSkillCategories(): Observable<SkillCategory[]> {
    return this.feed(this.skillCategories());
  }

  getCareerPaths(): Observable<CareerPath[]> {
    return this.feed(this.careerPaths());
  }

  getNotifications(userId: number): Observable<Notification[]> {
    var rows = this.notifications().filter(function (n: Notification): boolean {
      return n.UserId === userId;
    });
    return this.feed(rows);
  }

  markNotificationRead(notificationId: number): void {
    this.notifications.update(function (rows: Notification[]): Notification[] {
      return rows.map(function (n: Notification): Notification {
        return n.NotificationId === notificationId ? { ...n, IsRead: true } : n;
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Student-facing reads                                             */
  /* ---------------------------------------------------------------- */

  getStudentSkills(studentId: number): Observable<StudentSkillView[]> {
    var self = this;
    var rows = this.studentSkills()
      .filter(function (ss: StudentSkill): boolean {
        return ss.StudentId === studentId;
      })
      .map(function (ss: StudentSkill): StudentSkillView {
        return {
          ...ss,
          SkillName: self.skillName(ss.SkillId),
          CategoryName: self.categoryNameForSkill(ss.SkillId)
        };
      });
    return this.feed(rows);
  }

  getStudentProfile(studentId: number): Observable<Student | undefined> {
    var row = this.students().find(function (s: Student): boolean {
      return s.StudentId === studentId;
    });
    return this.feed(row);
  }

  getStudentApplications(studentId: number): Observable<Application[]> {
    var rows = this.applications().filter(function (a: Application): boolean {
      return a.StudentId === studentId;
    });
    return this.feed(rows);
  }

  /**
   * Every active opportunity, scored against one student's verified and
   * self-reported skills.
   */
  getOpportunityViews(studentId: number): Observable<OpportunityView[]> {
    var self = this;
    var mySkills = this.studentSkills().filter(function (ss: StudentSkill): boolean {
      return ss.StudentId === studentId;
    });
    var myApplications = this.applications().filter(function (a: Application): boolean {
      return a.StudentId === studentId;
    });

    var rows = this.opportunities()
      .filter(function (o: Opportunity): boolean {
        return o.Status === 'Active';
      })
      .map(function (o: Opportunity): OpportunityView {
        var required = self.opportunitySkills().filter(function (os: OpportunitySkill): boolean {
          return os.OpportunityId === o.OpportunityId;
        });

        var requiredViews = required.map(function (os: OpportunitySkill): OpportunitySkillView {
          var held = mySkills.find(function (ss: StudentSkill): boolean {
            return ss.SkillId === os.SkillId;
          });
          var current: CurrentLevel = held ? held.Proficiency : 0;
          return {
            ...os,
            SkillName: self.skillName(os.SkillId),
            CurrentLevel: current,
            Met: current >= os.RequiredLevel
          };
        });

        var industry = self.industries().find(function (i: Industry): boolean {
          return i.IndustryId === o.IndustryId;
        });

        return {
          ...o,
          CompanyName: industry ? industry.CompanyName : '—',
          IndustryType: industry ? industry.IndustryType : '—',
          RequiredSkills: requiredViews,
          MatchScore: self.scoreAgainstRequirements(mySkills, required),
          HasApplied: myApplications.some(function (a: Application): boolean {
            return a.OpportunityId === o.OpportunityId && a.Status !== 'Withdrawn';
          })
        };
      })
      .sort(function (a: OpportunityView, b: OpportunityView): number {
        return b.MatchScore - a.MatchScore;
      });

    return this.feed(rows);
  }

  /** Readiness against every career path, ordered best-fit first. */
  getCareerReadiness(studentId: number): Observable<CareerReadiness[]> {
    var self = this;
    var mySkills = this.studentSkills().filter(function (ss: StudentSkill): boolean {
      return ss.StudentId === studentId;
    });

    var rows = this.careerPaths()
      .map(function (cp: CareerPath): CareerReadiness {
        var required = self.careerPathSkills().filter(function (cps: CareerPathSkill): boolean {
          return cps.CareerPathId === cp.CareerPathId;
        });

        var weighted = 0;
        var weightTotal = 0;
        var gaps: SkillGapRow[] = [];

        required.forEach(function (cps: CareerPathSkill): void {
          var held = mySkills.find(function (ss: StudentSkill): boolean {
            return ss.SkillId === cps.SkillId;
          });
          var current: CurrentLevel = held ? held.Proficiency : 0;
          var ratio = Math.min(current / cps.RequiredLevel, 1);

          weighted = weighted + ratio * cps.Importance;
          weightTotal = weightTotal + cps.Importance;

          var gap = Math.max(cps.RequiredLevel - current, 0);
          if (gap > 0) {
            gaps.push({
              SkillId: cps.SkillId,
              SkillName: self.skillName(cps.SkillId),
              CurrentLevel: current,
              RequiredLevel: cps.RequiredLevel,
              GapLevel: gap,
              Importance: cps.Importance,
              Recommendation: self.recommendationFor(cps.SkillId, current, cps.RequiredLevel)
            });
          }
        });

        gaps.sort(function (a: SkillGapRow, b: SkillGapRow): number {
          return b.GapLevel * b.Importance - a.GapLevel * a.Importance;
        });

        return {
          CareerPathId: cp.CareerPathId,
          CareerName: cp.CareerName,
          Description: cp.Description,
          MatchPercentage: weightTotal === 0 ? 0 : Math.round((weighted / weightTotal) * 100),
          Gaps: gaps
        };
      })
      .sort(function (a: CareerReadiness, b: CareerReadiness): number {
        return b.MatchPercentage - a.MatchPercentage;
      });

    return this.feed(rows);
  }

  applyToOpportunity(studentId: number, opportunityId: number, matchScore: number): void {
    var exists = this.applications().some(function (a: Application): boolean {
      return a.StudentId === studentId && a.OpportunityId === opportunityId;
    });
    if (exists) {
      return;
    }
    var nextId =
      this.applications().reduce(function (max: number, a: Application): number {
        return Math.max(max, a.ApplicationId);
      }, 0) + 1;

    var row: Application = {
      ApplicationId: nextId,
      OpportunityId: opportunityId,
      StudentId: studentId,
      AppliedAt: new Date().toISOString(),
      Status: 'Applied',
      MatchScore: matchScore
    };
    this.applications.update(function (rows: Application[]): Application[] {
      return rows.concat([row]);
    });
  }

  withdrawApplication(applicationId: number): void {
    this.applications.update(function (rows: Application[]): Application[] {
      return rows.map(function (a: Application): Application {
        return a.ApplicationId === applicationId ? { ...a, Status: 'Withdrawn' } : a;
      });
    });
  }

  addStudentSkill(
    studentId: number,
    skillId: number,
    proficiency: ProficiencyLevel,
    yearsExperience: number
  ): void {
    var nextId =
      this.studentSkills().reduce(function (max: number, ss: StudentSkill): number {
        return Math.max(max, ss.StudentSkillId);
      }, 0) + 1;

    var row: StudentSkill = {
      StudentSkillId: nextId,
      StudentId: studentId,
      SkillId: skillId,
      Proficiency: proficiency,
      YearsExperience: yearsExperience,
      Source: 'Manual',
      Verified: false
    };

    this.studentSkills.update(function (rows: StudentSkill[]): StudentSkill[] {
      return rows.concat([row]);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Industry-facing reads                                            */
  /* ---------------------------------------------------------------- */

  getIndustryOpportunities(industryId: number): Observable<Opportunity[]> {
    var rows = this.opportunities().filter(function (o: Opportunity): boolean {
      return o.IndustryId === industryId;
    });
    return this.feed(rows);
  }

  /**
   * Candidates for one opportunity: everyone who applied, plus strong
   * unapplied matches so recruiters can reach out first.
   */
  getCandidatePipeline(opportunityId: number): Observable<CandidateView[]> {
    var self = this;
    var required = this.opportunitySkills().filter(function (os: OpportunitySkill): boolean {
      return os.OpportunityId === opportunityId;
    });

    var rows = this.students()
      .map(function (s: Student): CandidateView {
        var mySkills = self.studentSkills().filter(function (ss: StudentSkill): boolean {
          return ss.StudentId === s.StudentId;
        });
        var application = self.applications().find(function (a: Application): boolean {
          return a.StudentId === s.StudentId && a.OpportunityId === opportunityId;
        });
        var user = self.findUser(s.UserId);

        return {
          StudentId: s.StudentId,
          Name: user ? user.Name : '—',
          Email: user ? user.Email : '—',
          RollNo: s.RollNo,
          CollegeName: self.collegeName(s.CollegeId),
          DepartmentName: self.departmentName(s.DepartmentId),
          CGPA: s.CGPA,
          GraduationYear: s.GraduationYear,
          MatchScore: self.scoreAgainstRequirements(mySkills, required),
          VerifiedSkillCount: mySkills.filter(function (ss: StudentSkill): boolean {
            return ss.Verified;
          }).length,
          Application: application ? application : null
        };
      })
      .sort(function (a: CandidateView, b: CandidateView): number {
        return b.MatchScore - a.MatchScore;
      });

    return this.feed(rows);
  }

  updateApplicationStatus(applicationId: number, status: ApplicationStatus): void {
    this.applications.update(function (rows: Application[]): Application[] {
      return rows.map(function (a: Application): Application {
        return a.ApplicationId === applicationId ? { ...a, Status: status } : a;
      });
    });
  }

  createOpportunity(
    opportunity: Omit<Opportunity, 'OpportunityId'>,
    requirements: Array<{ SkillId: number; RequiredLevel: ProficiencyLevel; IsMandatory: boolean }>
  ): number {
    var nextId =
      this.opportunities().reduce(function (max: number, o: Opportunity): number {
        return Math.max(max, o.OpportunityId);
      }, 0) + 1;

    var row: Opportunity = { OpportunityId: nextId, ...opportunity };
    this.opportunities.update(function (rows: Opportunity[]): Opportunity[] {
      return rows.concat([row]);
    });

    var nextSkillId =
      this.opportunitySkills().reduce(function (max: number, os: OpportunitySkill): number {
        return Math.max(max, os.OpportunitySkillId);
      }, 0) + 1;

    var mapped = requirements.map(function (
      r: { SkillId: number; RequiredLevel: ProficiencyLevel; IsMandatory: boolean },
      index: number
    ): OpportunitySkill {
      return {
        OpportunitySkillId: nextSkillId + index,
        OpportunityId: nextId,
        SkillId: r.SkillId,
        RequiredLevel: r.RequiredLevel,
        IsMandatory: r.IsMandatory
      };
    });

    this.opportunitySkills.update(function (rows: OpportunitySkill[]): OpportunitySkill[] {
      return rows.concat(mapped);
    });

    return nextId;
  }

  /* ---------------------------------------------------------------- */
  /* Academician-facing reads                                         */
  /* ---------------------------------------------------------------- */

  getVerificationQueue(collegeId: number): Observable<VerificationRequest[]> {
    var self = this;
    var collegeStudents = this.students().filter(function (s: Student): boolean {
      return s.CollegeId === collegeId;
    });

    var rows: VerificationRequest[] = [];
    collegeStudents.forEach(function (s: Student): void {
      var user = self.findUser(s.UserId);
      var mine = self.studentSkills().filter(function (ss: StudentSkill): boolean {
        return ss.StudentId === s.StudentId;
      });
      mine.forEach(function (ss: StudentSkill): void {
        rows.push({
          StudentSkillId: ss.StudentSkillId,
          StudentId: s.StudentId,
          StudentName: user ? user.Name : '—',
          RollNo: s.RollNo,
          DepartmentName: self.departmentName(s.DepartmentId),
          SkillId: ss.SkillId,
          SkillName: self.skillName(ss.SkillId),
          Proficiency: ss.Proficiency,
          YearsExperience: ss.YearsExperience,
          Source: ss.Source,
          Verified: ss.Verified
        });
      });
    });

    rows.sort(function (a: VerificationRequest, b: VerificationRequest): number {
      if (a.Verified === b.Verified) {
        return a.StudentName.localeCompare(b.StudentName);
      }
      return a.Verified ? 1 : -1;
    });

    return this.feed(rows);
  }

  setSkillVerification(studentSkillId: number, verified: boolean): void {
    this.studentSkills.update(function (rows: StudentSkill[]): StudentSkill[] {
      return rows.map(function (ss: StudentSkill): StudentSkill {
        return ss.StudentSkillId === studentSkillId ? { ...ss, Verified: verified } : ss;
      });
    });
  }

  /**
   * Faculty development priorities: skills industry asks for that few
   * students in the system can currently supply at the required level.
   */
  getFdpRecommendations(): Observable<FdpRecommendation[]> {
    var self = this;
    var demand = this.opportunitySkills();
    var studentCount = this.students().length;

    var bySkill = new Map<number, { demand: number; required: number }>();
    demand.forEach(function (os: OpportunitySkill): void {
      var current = bySkill.get(os.SkillId);
      if (current) {
        current.demand = current.demand + 1;
        current.required = Math.max(current.required, os.RequiredLevel);
      } else {
        bySkill.set(os.SkillId, { demand: 1, required: os.RequiredLevel });
      }
    });

    var rows: FdpRecommendation[] = [];
    bySkill.forEach(function (value: { demand: number; required: number }, skillId: number): void {
      var ready = self.studentSkills().filter(function (ss: StudentSkill): boolean {
        return ss.SkillId === skillId && ss.Proficiency >= value.required;
      }).length;

      var coverage = studentCount === 0 ? 0 : Math.round((ready / studentCount) * 100);
      var priority: FdpRecommendation['Priority'];
      if (coverage < 25) {
        priority = 'Critical';
      } else if (coverage < 50) {
        priority = 'High';
      } else {
        priority = 'Moderate';
      }

      rows.push({
        SkillId: skillId,
        SkillName: self.skillName(skillId),
        CategoryName: self.categoryNameForSkill(skillId),
        DemandCount: value.demand,
        ReadyStudents: ready,
        CoverageShare: coverage,
        Priority: priority,
        SuggestedFormat: self.formatFor(priority)
      });
    });

    rows.sort(function (a: FdpRecommendation, b: FdpRecommendation): number {
      return b.DemandCount - a.DemandCount || a.CoverageShare - b.CoverageShare;
    });

    return this.feed(rows);
  }

  /* ---------------------------------------------------------------- */
  /* Administrator reads                                              */
  /* ---------------------------------------------------------------- */

  getPlatformStats(): Observable<PlatformStats> {
    var studentCount = this.students().length;
    var placementCount = this.placements().length;

    var packageTotal = this.placements().reduce(function (sum: number, p: Placement): number {
      return sum + p.Package;
    }, 0);

    var verified = this.studentSkills().filter(function (ss: StudentSkill): boolean {
      return ss.Verified;
    }).length;

    var stats: PlatformStats = {
      TotalStudents: studentCount,
      TotalColleges: this.colleges().length,
      TotalIndustries: this.industries().length,
      ActiveOpportunities: this.opportunities().filter(function (o: Opportunity): boolean {
        return o.Status === 'Active';
      }).length,
      TotalApplications: this.applications().length,
      TotalPlacements: placementCount,
      PlacementRate: studentCount === 0 ? 0 : Math.round((placementCount / studentCount) * 100),
      AveragePackage: placementCount === 0 ? 0 : Math.round(packageTotal / placementCount),
      VerifiedSkillShare:
        this.studentSkills().length === 0
          ? 0
          : Math.round((verified / this.studentSkills().length) * 100)
    };

    return this.feed(stats);
  }

  getCollegePerformance(): Observable<CollegePerformance[]> {
    var self = this;
    var rows = this.colleges().map(function (c: College): CollegePerformance {
      var enrolled = self.students().filter(function (s: Student): boolean {
        return s.CollegeId === c.CollegeId;
      });
      var placed = enrolled.filter(function (s: Student): boolean {
        return self.placements().some(function (p: Placement): boolean {
          return p.StudentId === s.StudentId;
        });
      });
      var cgpaTotal = enrolled.reduce(function (sum: number, s: Student): number {
        return sum + s.CGPA;
      }, 0);

      return {
        CollegeId: c.CollegeId,
        CollegeName: c.CollegeName,
        Location: c.Location,
        StudentCount: enrolled.length,
        PlacedCount: placed.length,
        PlacementRate: enrolled.length === 0 ? 0 : Math.round((placed.length / enrolled.length) * 100),
        AverageCGPA: enrolled.length === 0 ? 0 : Math.round((cgpaTotal / enrolled.length) * 100) / 100
      };
    });

    return this.feed(rows);
  }

  getSkillDemand(): Observable<SkillDemandRow[]> {
    var self = this;
    var rows = this.skills()
      .map(function (s: Skill): SkillDemandRow {
        var demand = self.opportunitySkills().filter(function (os: OpportunitySkill): boolean {
          return os.SkillId === s.SkillId;
        }).length;
        var supply = self.studentSkills().filter(function (ss: StudentSkill): boolean {
          return ss.SkillId === s.SkillId && ss.Proficiency >= 3;
        }).length;

        return {
          SkillId: s.SkillId,
          SkillName: s.SkillName,
          CategoryName: self.categoryNameForSkill(s.SkillId),
          DemandCount: demand,
          SupplyCount: supply,
          GapIndex: demand - supply
        };
      })
      .filter(function (r: SkillDemandRow): boolean {
        return r.DemandCount > 0;
      })
      .sort(function (a: SkillDemandRow, b: SkillDemandRow): number {
        return b.GapIndex - a.GapIndex || b.DemandCount - a.DemandCount;
      });

    return this.feed(rows);
  }

  getRecentPlacements(): Observable<Placement[]> {
    var rows = this.placements()
      .slice()
      .sort(function (a: Placement, b: Placement): number {
        return b.PlacementDate.localeCompare(a.PlacementDate);
      });
    return this.feed(rows);
  }

  /* ---------------------------------------------------------------- */
  /* Scoring                                                          */
  /* ---------------------------------------------------------------- */

  /**
   * Weighted coverage of a requirement set. Mandatory requirements count
   * double, and a level above the requirement never earns bonus credit.
   */
  private scoreAgainstRequirements(
    held: StudentSkill[],
    required: OpportunitySkill[]
  ): number {
    if (required.length === 0) {
      return 0;
    }

    var earned = 0;
    var possible = 0;

    required.forEach(function (os: OpportunitySkill): void {
      var weight = os.IsMandatory ? 2 : 1;
      var match = held.find(function (ss: StudentSkill): boolean {
        return ss.SkillId === os.SkillId;
      });
      var current = match ? match.Proficiency : 0;
      var credit = Math.min(current / os.RequiredLevel, 1);

      /* A verified skill is trusted at face value; an unverified one is
         discounted slightly so verification has visible value. */
      if (match && !match.Verified) {
        credit = credit * 0.9;
      }

      earned = earned + credit * weight;
      possible = possible + weight;
    });

    return Math.round((earned / possible) * 100);
  }

  private recommendationFor(skillId: number, current: number, requiredLevel: number): string {
    var name = this.skillName(skillId);
    if (current === 0) {
      return 'Start ' + name + ' from scratch — finish a guided course and push one project to GitHub.';
    }
    if (requiredLevel - current >= 2) {
      return 'Two levels to cover in ' + name + ' — build a non-trivial feature with it and get the code reviewed.';
    }
    return 'One level to go in ' + name + ' — ask a faculty mentor to assess your work and verify you.';
  }

  private formatFor(priority: FdpRecommendation['Priority']): string {
    if (priority === 'Critical') {
      return 'Semester-long elective, co-taught with an industry engineer';
    }
    if (priority === 'High') {
      return 'Five-day hands-on bootcamp ending in a reviewed project';
    }
    return 'Half-day refresher workshop each semester';
  }

  /** Wraps a value as a delayed observable so components behave as they would against a real API. */
  private feed<T>(value: T): Observable<T> {
    return of(value).pipe(delay(LATENCY));
  }

  registerStudent(payload: {
  name: string;
  email: string;
  phoneNumber: string;
  collegeId: number;
  departmentId: number;
  rollNo: string;
  graduationYear: number;
  cgpa: number;
  careerGoalId: number | null;
  githubUrl: string | null;
  linkedInUrl: string | null;
}): { ok: boolean; message: string; user?: User } {
  var self = this;
  var emailClean = payload.email.trim().toLowerCase();

  var existing = this.users().find(function (u: User): boolean {
    return u.Email.toLowerCase() === emailClean;
  });

  if (existing) {
    return { ok: false, message: 'An account with this email already exists.' };
  }

  var nextUserId = this.users().reduce(function (max: number, u: User): number {
    return Math.max(max, u.UserId);
  }, 0) + 1;

  var newUser: User = {
    UserId: nextUserId,
    Name: payload.name.trim(),
    Email: emailClean,
    PhoneNumber: payload.phoneNumber ? payload.phoneNumber.trim() : '',
    PasswordHash: '$2b$10$mockedregistrationhashforlocaldev',
    Role: 'Student',
    IsActive: true,
    CreatedAt: new Date().toISOString(),
    UpdatedAt: ''
  };

  var nextStudentId = this.students().reduce(function (max: number, s: Student): number {
    return Math.max(max, s.StudentId);
  }, 0) + 1;

  var newStudent: Student = {
    StudentId: nextStudentId,
    UserId: nextUserId,
    CollegeId: payload.collegeId,
    DepartmentId: payload.departmentId,
    RollNo: payload.rollNo.trim(),
    GraduationYear: payload.graduationYear,
    CGPA: payload.cgpa,
    CareerGoalId: payload.careerGoalId,
    ResumeUrl: null,
    GithubUrl: payload.githubUrl ? payload.githubUrl.trim() : null,
    LinkedInUrl: payload.linkedInUrl ? payload.linkedInUrl.trim() : null
  };

  this.users.update(function (rows: User[]): User[] {
    return rows.concat([newUser]);
  });

  this.students.update(function (rows: Student[]): Student[] {
    return rows.concat([newStudent]);
  });

  return { ok: true, message: 'Account registered successfully.', user: newUser };
}

addUser(user: User): void {
    this.users.update(function (rows: User[]): User[] {
      return rows.concat([user]);
    });
  }

  addStudent(student: Student): void {
    this.students.update(function (rows: Student[]): Student[] {
      return rows.concat([student]);
    });
  }
}
