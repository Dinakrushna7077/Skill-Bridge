import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';

import {
  CollegePerformance,
  Placement,
  PlatformStats,
  SkillDemandRow
} from '../../core/models/schema.models';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'sb-admin-overview',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <p class="small text-secondary mb-1">Students registered</p>
            <p class="h3 mb-0">{{ stats()?.TotalStudents ?? 0 }}</p>
            <p class="small text-secondary mb-0">
              across {{ stats()?.TotalColleges ?? 0 }} institutions
            </p>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <p class="small text-secondary mb-1">Placement rate</p>
            <p class="h3 mb-0">{{ stats()?.PlacementRate ?? 0 }}%</p>
            <p class="small text-secondary mb-0">{{ stats()?.TotalPlacements ?? 0 }} placed this cycle</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <p class="small text-secondary mb-1">Average package</p>
            <p class="h3 mb-0">₹{{ (stats()?.AveragePackage ?? 0) | number }}</p>
            <p class="small text-secondary mb-0">including internship stipends</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <p class="small text-secondary mb-1">Skills verified</p>
            <p class="h3 mb-0">{{ stats()?.VerifiedSkillShare ?? 0 }}%</p>
            <p class="small text-secondary mb-0">of all claims on the platform</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-12 col-xl-7">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-0 pt-3">
            <h2 class="h6 mb-0">Institution performance</h2>
            <p class="small text-secondary mb-0">Placement outcomes by partner college.</p>
          </div>
          <div class="card-body pt-2">
            <div class="table-responsive">
              <table class="table align-middle mb-0">
                <thead>
                  <tr class="small text-secondary">
                    <th scope="col">College</th>
                    <th scope="col" class="text-center">Students</th>
                    <th scope="col" class="text-center">Placed</th>
                    <th scope="col" style="min-width: 150px;">Placement rate</th>
                    <th scope="col" class="text-center">Avg CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of colleges(); track row.CollegeId) {
                    <tr>
                      <td class="small">
                        <span class="fw-semibold">{{ row.CollegeName }}</span>
                        <div class="text-secondary">{{ row.Location }}</div>
                      </td>
                      <td class="small text-center">{{ row.StudentCount }}</td>
                      <td class="small text-center">{{ row.PlacedCount }}</td>
                      <td>
                        <div class="progress" style="height: 6px;">
                          <div class="progress-bar bg-success" [style.width.%]="row.PlacementRate"></div>
                        </div>
                        <small class="text-secondary">{{ row.PlacementRate }}%</small>
                      </td>
                      <td class="small text-center">{{ row.AverageCGPA }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Participation -->
      <div class="col-12 col-xl-5">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-0 pt-3">
            <h2 class="h6 mb-0">Participation</h2>
            <p class="small text-secondary mb-0">Where the funnel currently stands.</p>
          </div>
          <div class="card-body pt-2">
            <dl class="row small mb-0">
              <dt class="col-8 fw-normal text-secondary">Industry partners</dt>
              <dd class="col-4 text-end mb-2">{{ stats()?.TotalIndustries ?? 0 }}</dd>

              <dt class="col-8 fw-normal text-secondary">Active openings</dt>
              <dd class="col-4 text-end mb-2">{{ stats()?.ActiveOpportunities ?? 0 }}</dd>

              <dt class="col-8 fw-normal text-secondary">Applications submitted</dt>
              <dd class="col-4 text-end mb-2">{{ stats()?.TotalApplications ?? 0 }}</dd>

              <dt class="col-8 fw-normal text-secondary">Applications per opening</dt>
              <dd class="col-4 text-end mb-2">{{ applicationsPerOpening() }}</dd>

              <dt class="col-8 fw-normal text-secondary">Offers converted</dt>
              <dd class="col-4 text-end mb-0">{{ stats()?.TotalPlacements ?? 0 }}</dd>
            </dl>

            <hr />

            <h3 class="h6 mb-2">Recent placements</h3>
            @for (placement of placements(); track placement.PlacementId) {
              <div class="d-flex justify-content-between align-items-start py-2 border-top">
                <div class="min-w-0">
                  <div class="small fw-semibold text-truncate">
                    {{ studentName(placement.StudentId) }}
                  </div>
                  <div class="small text-secondary text-truncate">
                    {{ companyName(placement.IndustryId) }} ·
                    {{ opportunityTitle(placement.OpportunityId) }}
                  </div>
                </div>
                <div class="text-end">
                  <div class="small fw-semibold">₹{{ placement.Package | number }}</div>
                  <div class="small text-secondary">
                    {{ placement.PlacementDate | date: 'd MMM' }}
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Skill gap -->
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-0 pt-3">
            <h2 class="h6 mb-0">Network-wide skill gaps</h2>
            <p class="small text-secondary mb-0">
              Skills industry asks for most, against how many students can supply them at level 3 or
              above. Use this to steer curriculum and FDP funding.
            </p>
          </div>
          <div class="card-body pt-2">
            <div class="table-responsive">
              <table class="table table-sm align-middle mb-0">
                <thead>
                  <tr class="small text-secondary">
                    <th scope="col" style="min-width: 200px;">Skill</th>
                    <th scope="col">Category</th>
                    <th scope="col" style="min-width: 180px;">Demand vs supply</th>
                    <th scope="col" class="text-center">Shortfall</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of demand(); track row.SkillId) {
                    <tr>
                      <td class="small fw-semibold">{{ row.SkillName }}</td>
                      <td class="small text-secondary">{{ row.CategoryName }}</td>
                      <td>
                        <div class="d-flex align-items-center gap-2">
                          <div class="progress flex-grow-1" style="height: 6px;">
                            <div
                              class="progress-bar bg-dark"
                              [style.width.%]="barWidth(row.DemandCount)"
                            ></div>
                          </div>
                          <small class="text-secondary" style="min-width: 74px;">
                            {{ row.DemandCount }} / {{ row.SupplyCount }}
                          </small>
                        </div>
                      </td>
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
export class AdminOverview {
  private readonly data = inject(MockDataService);

  protected readonly stats = signal<PlatformStats | null>(null);
  protected readonly colleges = signal<CollegePerformance[]>([]);
  protected readonly demand = signal<SkillDemandRow[]>([]);
  protected readonly placements = signal<Placement[]>([]);

  protected readonly applicationsPerOpening = computed<string>(
    function (this: AdminOverview): string {
      var s = this.stats();
      if (!s || s.ActiveOpportunities === 0) {
        return '—';
      }
      return (Math.round((s.TotalApplications / s.ActiveOpportunities) * 10) / 10).toFixed(1);
    }.bind(this)
  );

  private readonly peakDemand = computed<number>(
    function (this: AdminOverview): number {
      return this.demand().reduce(function (max: number, row: SkillDemandRow): number {
        return Math.max(max, row.DemandCount);
      }, 1);
    }.bind(this)
  );

  constructor() {
    var self = this;

    this.data.getPlatformStats().subscribe(function (row: PlatformStats): void {
      self.stats.set(row);
    });

    this.data.getCollegePerformance().subscribe(function (rows: CollegePerformance[]): void {
      self.colleges.set(rows);
    });

    this.data.getSkillDemand().subscribe(function (rows: SkillDemandRow[]): void {
      self.demand.set(rows);
    });

    this.data.getRecentPlacements().subscribe(function (rows: Placement[]): void {
      self.placements.set(rows);
    });
  }

  protected barWidth(demandCount: number): number {
    return Math.round((demandCount / this.peakDemand()) * 100);
  }

  protected studentName(studentId: number): string {
    return this.data.studentName(studentId);
  }

  protected companyName(industryId: number): string {
    return this.data.companyName(industryId);
  }

  protected opportunityTitle(opportunityId: number): string {
    return this.data.opportunityTitle(opportunityId);
  }
}
