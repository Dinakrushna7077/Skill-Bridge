export type UserRole = 'Student' | 'Academician' | 'Industry' | 'Admin';

export type OpportunityType = 'Job' | 'Internship';

export type OpportunityStatus = 'Active' | 'Closed' | 'Draft';

export type ApplicationStatus =
  | 'Applied'
  | 'Shortlisted'
  | 'Interview'
  | 'Selected'
  | 'Rejected'
  | 'Withdrawn';

export type SkillSource = 'Manual' | 'Assessment';

export type PlacementStatus = 'Selected';

export type ProficiencyLevel = 1 | 2 | 3 | 4 | 5;

export type CurrentLevel = 0 | ProficiencyLevel;


/* Identity & organisation       */

export interface User {
  UserId: number;
  Name: string;
  Email: string;
  PhoneNumber: string;
  PasswordHash: string;
  Role: UserRole;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface College {
  CollegeId: number;
  CollegeName: string;
  Location: string;
  Website: string;
  CreatedAt: string;
}

export interface Department {
  DepartmentId: number;
  CollegeId: number;
  DepartmentName: string;
}

export interface Student {
  StudentId: number;
  UserId: number;
  CollegeId: number;
  DepartmentId: number;
  RollNo: string;
  GraduationYear: number;
  CGPA: number;
  CareerGoalId: number | null;
  ResumeUrl: string | null;
  GithubUrl: string | null;
  LinkedInUrl: string | null;
}

export interface Academician {
  AcademicianId: number;
  UserId: number;
  CollegeId: number;
  DepartmentId: number;
  Designation: string;
  Expertise: string;
}

export interface Industry {
  IndustryId: number;
  UserId: number;
  CompanyName: string;
  IndustryType: string;
  Location: string;
  Website: string;
  Description: string;
}


/* Skill taxonomy*/

export interface SkillCategory {
  CategoryId: number;
  CategoryName: string;
}

export interface Skill {
  SkillId: number;
  CategoryId: number;
  SkillName: string;
  Description: string;
}

export interface StudentSkill {
  StudentSkillId: number;
  StudentId: number;
  SkillId: number;
  Proficiency: ProficiencyLevel;
  YearsExperience: number;
  Source: SkillSource;
  Verified: boolean;
}

export interface CareerPath {
  CareerPathId: number;
  CareerName: string;
  Description: string;
}

export interface CareerPathSkill {
  CareerPathSkillId: number;
  CareerPathId: number;
  SkillId: number;
  RequiredLevel: ProficiencyLevel;
  Importance: ProficiencyLevel;
}


/* Opportunities & hiring                                             */


export interface Opportunity {
  OpportunityId: number;
  IndustryId: number;
  Title: string;
  Type: OpportunityType;
  Description: string;
  Location: string;
  DurationMonths: number | null;
  Stipend: number | null;
  SalaryMin: number | null;
  SalaryMax: number | null;
  Deadline: string;
  Status: OpportunityStatus;
}

export interface OpportunitySkill {
  OpportunitySkillId: number;
  OpportunityId: number;
  SkillId: number;
  RequiredLevel: ProficiencyLevel;
  IsMandatory: boolean;
}

export interface Application {
  ApplicationId: number;
  OpportunityId: number;
  StudentId: number;
  AppliedAt: string;
  Status: ApplicationStatus;
  MatchScore: number;
}

export interface Placement {
  PlacementId: number;
  StudentId: number;
  IndustryId: number;
  OpportunityId: number;
  Package: number;
  JoiningDate: string;
  PlacementDate: string;
  Status: PlacementStatus;
}


/* Skill gap analytics  */


export interface SkillGapReport {
  ReportId: number;
  StudentId: number;
  CareerPathId: number | null;
  OpportunityId: number | null;
  MatchPercentage: number;
  GeneratedAt: string;
}

export interface SkillGapDetail {
  DetailId: number;
  ReportId: number;
  SkillId: number;
  CurrentLevel: CurrentLevel;
  RequiredLevel: ProficiencyLevel;
  GapLevel: number;
  Recommendation: string;
}

export interface Notification {
  NotificationId: number;
  UserId: number;
  Title: string;
  Message: string;
  IsRead: boolean;
  CreatedAt: string;
}


/* Read models — projections assembled for the UI only.               */
/* They never leave the client and never hit the database.            */

export interface OpportunityView extends Opportunity {
  CompanyName: string;
  IndustryType: string;
  RequiredSkills: OpportunitySkillView[];
  MatchScore: number;
  HasApplied: boolean;
}

export interface OpportunitySkillView extends OpportunitySkill {
  SkillName: string;
  CurrentLevel: CurrentLevel;
  Met: boolean;
}

export interface StudentSkillView extends StudentSkill {
  SkillName: string;
  CategoryName: string;
}

export interface CandidateView {
  StudentId: number;
  Name: string;
  Email: string;
  RollNo: string;
  CollegeName: string;
  DepartmentName: string;
  CGPA: number;
  GraduationYear: number;
  MatchScore: number;
  VerifiedSkillCount: number;
  Application: Application | null;
}

export interface VerificationRequest {
  StudentSkillId: number;
  StudentId: number;
  StudentName: string;
  RollNo: string;
  DepartmentName: string;
  SkillId: number;
  SkillName: string;
  Proficiency: ProficiencyLevel;
  YearsExperience: number;
  Source: SkillSource;
  Verified: boolean;
}

export interface SkillGapRow {
  SkillId: number;
  SkillName: string;
  CurrentLevel: CurrentLevel;
  RequiredLevel: ProficiencyLevel;
  GapLevel: number;
  Importance: ProficiencyLevel;
  Recommendation: string;
}

export interface CareerReadiness {
  CareerPathId: number;
  CareerName: string;
  Description: string;
  MatchPercentage: number;
  Gaps: SkillGapRow[];
}

/** Rolled-up figures for the administrator overview. */
export interface PlatformStats {
  TotalStudents: number;
  TotalColleges: number;
  TotalIndustries: number;
  ActiveOpportunities: number;
  TotalApplications: number;
  TotalPlacements: number;
  PlacementRate: number;
  AveragePackage: number;
  VerifiedSkillShare: number;
}

export interface CollegePerformance {
  CollegeId: number;
  CollegeName: string;
  Location: string;
  StudentCount: number;
  PlacedCount: number;
  PlacementRate: number;
  AverageCGPA: number;
}

export interface SkillDemandRow {
  SkillId: number;
  SkillName: string;
  CategoryName: string;
  DemandCount: number;
  SupplyCount: number;
  GapIndex: number;
}

/** Faculty development programme — derived from unmet industry demand. */
export interface FdpRecommendation {
  SkillId: number;
  SkillName: string;
  CategoryName: string;
  DemandCount: number;
  ReadyStudents: number;
  CoverageShare: number;
  Priority: 'Critical' | 'High' | 'Moderate';
  SuggestedFormat: string;
}
