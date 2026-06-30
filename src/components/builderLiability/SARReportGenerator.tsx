"use client";

/**
 * SARReportGenerator
 * ------------------
 * Builds and opens a print-ready Survey Assessment Report (SAR) in a new
 * browser window from the data saved on a BuilderLiabilityPolicy.
 * The user can print (Ctrl+P / Cmd+P) or use "Save as PDF" in the browser
 * print dialog — no external PDF library required.
 */

import { BuilderLiabilityPolicy } from '@/types/builderLiabilityPolicy.types';

// ─── Helpers ────────────────────────────────────────────────────────────────

const na = (v: unknown, fallback = 'N/A'): string => {
    if (v === null || v === undefined) return fallback;
    const s = String(v).trim();
    return s === '' ? fallback : s;
};

const fmtDate = (d: string | Date | undefined | null): string => {
    if (!d) return 'N/A';
    try {
        return new Date(d).toLocaleDateString('en-NG', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    } catch { return 'N/A'; }
};

const fmtCurrency = (v: number | string | undefined | null): string => {
    const n = Number(v);
    if (!isFinite(n)) return 'N/A';
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(n);
};

const boolText = (v: unknown): string => {
    if (v === true || v === 'Yes' || v === 'yes' || v === 1) return 'Yes';
    if (v === false || v === 'No' || v === 'no' || v === 0) return 'No';
    return 'N/A';
};

const slopeLabel: Record<string, string> = {
    below_5: 'Below 5% (Relatively Flat)',
    '5_8': '5% – 8% (Sloppy)',
    '8_12': '8% – 12% (Steep)',
    '12_18': '12% – 18% (Very Steep)',
    above_18: 'Above 18% (Hilly)',
};

const recommendationLabel: Record<string, string> = {
    approve: 'Recommend for Approval',
    reject: 'Recommend for Rejection',
    request_more_info: 'Recommend for Further Inspection / More Information',
};

const riskLevelLabel: Record<string, string> = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
    critical: 'Critical Risk',
};

// ─── HTML Builder ────────────────────────────────────────────────────────────

function row(label: string, value: string): string {
    return `
      <tr>
        <td class="label">${label}</td>
        <td class="value">${value}</td>
      </tr>`;
}

function section(title: string, body: string): string {
    return `
    <div class="section">
      <div class="section-title">${title}</div>
      <table>${body}</table>
    </div>`;
}

function buildHTML(policy: BuilderLiabilityPolicy): string {
    const p = policy as any; // access dynamic survey fields
    const rawSd = p.surveyDetails || {};
    const sd: Record<string, any> = {
        ...rawSd,
        plotNumber: rawSd.locationDetails?.plotNumber,
        district: rawSd.locationDetails?.district,
        cadastralZone: rawSd.locationDetails?.cadastralZone,
        landUse: rawSd.locationDetails?.landUse,
        purpose: rawSd.locationDetails?.purpose,
        plotSize: rawSd.locationDetails?.plotSize,
        dateOfApproval: rawSd.locationDetails?.dateOfApproval,
        streetName: rawSd.locationDetails?.streetName,
        buildingType: rawSd.locationDetails?.buildingType,
        proposedBuildingDescription: rawSd.locationDetails?.proposedBuildingDescription,
        
        naturePlotWellDrained: rawSd.siteDetails?.naturePlot?.wellDrained,
        naturePlotRocky: rawSd.siteDetails?.naturePlot?.rocky,
        naturePlotWaterLogged: rawSd.siteDetails?.naturePlot?.waterLogged,
        naturePlotOther: rawSd.siteDetails?.naturePlot?.other,
        naturePlotOtherDescription: rawSd.siteDetails?.naturePlot?.otherDescription,
        estimatedSlope: rawSd.siteDetails?.estimatedSlope,
        vacancyStatus: rawSd.siteDetails?.vacancyStatus,
        developmentDescription: rawSd.siteDetails?.developmentDescription,
        previouslyApproved: rawSd.siteDetails?.previouslyApproved,

        conformsWithApproval: rawSd.conformity?.conformsWithApproval,
        nonConformityDescription: rawSd.conformity?.nonConformityDescription,
        levelOfService: rawSd.conformity?.levelOfService,

        contractorPresentOnSite: rawSd.contractor?.presentOnSite,
        contractorName: rawSd.contractor?.name,
        contractorCategory: rawSd.contractor?.category,

        assessorName: rawSd.consultant?.name,
        assessorCategory: rawSd.consultant?.category,

        agentMetOnSite: rawSd.agent?.metOnSite,
        agentName: rawSd.agent?.name,
        agentDesignation: rawSd.agent?.designation,
        agentPhone: rawSd.agent?.phone,
        agentEmail: rawSd.agent?.email,

        structuralCondition: rawSd.structuralAssessmentDetails?.condition,
        visibleCracks: rawSd.structuralAssessmentDetails?.visibleCracks,
        foundationStatus: rawSd.structuralAssessmentDetails?.foundationStatus,
    };

    const proj = policy.project || {} as any;
    const builder = policy.builder || {} as any;
    const client = policy.client || {} as any;
    const org = policy.organization || {} as any;

    // SAR fields can be stored at the root level of the policy or inside surveyDetails
    const get = (...keys: string[]) => {
        for (const k of keys) {
            const v = p[k] ?? sd[k];
            if (v !== null && v !== undefined && String(v).trim() !== '') return v;
        }
        return undefined;
    };

    // Nature of plot checkboxes → readable string
    const natureParts: string[] = [];
    if (get('naturePlotWellDrained')) natureParts.push('Well Drained');
    if (get('naturePlotRocky')) natureParts.push('Rocky');
    if (get('naturePlotWaterLogged')) natureParts.push('Water Logged / Marshy');
    if (get('naturePlotOther')) {
        const desc = na(get('naturePlotOtherDescription'), '');
        natureParts.push(desc ? `Other: ${desc}` : 'Other');
    }

    // Surveyor recommendation
    const recValue = na(get('surveyorRecommendation'));
    const recLabel = recommendationLabel[recValue] || recValue;

    const reportDate = fmtDate(p.surveyedAt || p.updatedAt);
    const policyNo = na(policy.policyNumber);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SAR – ${policyNo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      color: #1a1a1a;
      background: #fff;
      padding: 0;
    }

    /* ── Cover Header ── */
    .cover {
      background: linear-gradient(135deg, #028835 0%, #025c24 100%);
      color: #fff;
      padding: 36px 48px 28px;
    }
    .cover-logo {
      font-size: 20pt;
      font-weight: 800;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .cover-subtitle {
      font-size: 9pt;
      opacity: 0.8;
      margin-bottom: 20px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .cover-title {
      font-size: 18pt;
      font-weight: 700;
      border-top: 2px solid rgba(255,255,255,0.3);
      padding-top: 14px;
      margin-top: 14px;
    }
    .cover-meta {
      margin-top: 10px;
      font-size: 10pt;
      opacity: 0.85;
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
    }
    .cover-meta span { display: flex; flex-direction: column; }
    .cover-meta .ml { font-weight: 600; font-size: 11pt; opacity: 1; }

    /* ── Body ── */
    .body { padding: 24px 48px 48px; }

    /* ── Section ── */
    .section {
      margin-bottom: 22px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      overflow: hidden;
      break-inside: avoid;
    }
    .section-title {
      background: #f0f9f4;
      border-bottom: 2px solid #028835;
      padding: 8px 14px;
      font-size: 10.5pt;
      font-weight: 700;
      color: #025c24;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    table { width: 100%; border-collapse: collapse; }
    tr:nth-child(even) td { background: #f9fafb; }
    td { padding: 6px 14px; vertical-align: top; }
    td.label {
      width: 36%;
      font-weight: 600;
      color: #555;
      font-size: 10pt;
      border-right: 1px solid #eee;
    }
    td.value { font-size: 10.5pt; color: #1a1a1a; }

    /* ── Recommendation box ── */
    .rec-box {
      margin-bottom: 22px;
      padding: 14px 18px;
      border-radius: 8px;
      border-left: 5px solid #028835;
      background: #f0f9f4;
      break-inside: avoid;
    }
    .rec-box.reject { border-color: #dc2626; background: #fef2f2; }
    .rec-box.info   { border-color: #d97706; background: #fffbeb; }
    .rec-label { font-size: 9pt; text-transform: uppercase; letter-spacing: 0.5px; color: #555; margin-bottom: 4px; }
    .rec-value { font-size: 13pt; font-weight: 700; color: #028835; }
    .rec-box.reject .rec-value { color: #dc2626; }
    .rec-box.info .rec-value   { color: #d97706; }
    .rec-notes { margin-top: 8px; font-size: 10pt; color: #555; }

    /* ── Footer ── */
    .footer {
      margin-top: 32px;
      padding-top: 14px;
      border-top: 1px solid #ccc;
      font-size: 8.5pt;
      color: #888;
      display: flex;
      justify-content: space-between;
    }

    @media print {
      body { padding: 0; }
      .body { padding: 16px 36px 36px; }
      .cover { padding: 24px 36px 20px; }
      @page { margin: 12mm; size: A4; }
    }
  </style>
</head>
<body>

<!-- ════ COVER HEADER ════ -->
<div class="cover">
  <div class="cover-logo">Builders Liability Scheme</div>
  <div class="cover-title">Survey Assessment Report (SAR)</div>
  <div class="cover-meta">
    <span>Policy Number <span class="ml">${policyNo}</span></span>
    <span>Report Date <span class="ml">${reportDate}</span></span>
    <span>Status <span class="ml">${na(get('surveyorRecommendation') ? recLabel : policy.status)}</span></span>
  </div>
</div>

<div class="body">

<!-- ════ 1. LOCATION DETAILS ════ -->
${section('1. Location Details', [
    row('Plot Number', na(get('plotNumber', 'surveyorPlotNumber') ?? proj.plotNumber ?? proj.agisNo)),
    row('District', na(get('district', 'surveyorDistrict') ?? proj.district ?? proj.projectDistrict)),
    row('Cadastral Zone', na(get('cadastralZone', 'surveyorCadastralZone') ?? proj.cadastralZone)),
    row('Land Use', na(get('landUse', 'surveyorLandUse'))),
    row('Purpose', na(get('purpose', 'surveyorPurpose'))),
    row('Plot Size', na(get('plotSize', 'surveyorPlotSize'))),
    row('Date of Approval / Validity', fmtDate(get('dateOfApproval', 'surveyorDateOfApproval'))),
    row('Street Name', na(get('streetName', 'surveyorStreetName'))),
    row('Building Type', na(get('buildingType', 'surveyorBuildingType'))),
    row('Proposed Building Description', na(get('proposedBuildingDescription', 'surveyorBuildingDescription'))),
].join(''))}

<!-- ════ 2. SITE DETAILS ════ -->
${section('2. Site Details', [
    row('Nature of Plot', na(natureParts.join(', '), 'Not recorded')),
    row('Estimated Slope', na(slopeLabel[na(get('estimatedSlope', 'surveyorEstimatedSlope'))] ?? get('estimatedSlope', 'surveyorEstimatedSlope'))),
    row('Vacancy Status', na(get('vacancyStatus', 'surveyorVacancyStatus'))),
    row('Description of Development on Site', na(get('developmentDescription', 'surveyorDevelopmentDescription'))),
    row('Development Previously Approved?', boolText(get('previouslyApproved', 'surveyorPreviouslyApproved'))),
].join(''))}

<!-- ════ 3. DEVELOPMENT CONFORMITY ════ -->
${section('3. Development Conformity', [
    row('Does Development Conform with Approved Submission?', boolText(get('conformsWithApproval', 'surveyorConformsWithApproval'))),
    row('Nature of Non-Conformity', na(get('nonConformityDescription', 'surveyorNonConformityDescription'))),
    row('Level of Service', na(get('levelOfService', 'surveyorLevelOfService'))),
].join(''))}

<!-- ════ 4. CONTRACTOR & ASSESSOR ════ -->
${section('4. Contractor & Assessor Information', [
    row('Contractor Present on Site?', boolText(get('contractorPresentOnSite', 'surveyorContractorPresentOnSite'))),
    row('Contractor Name', na(get('contractorName', 'surveyorContractorName'))),
    row('Contractor Category', na(get('contractorCategory', 'surveyorContractorCategory'))),
    row('Assessor Name', na(get('assessorName') ?? org.assessorName)),
    row('Assessor Category', na(get('assessorCategory', 'surveyorConsultantCategory'))),
].join(''))}

<!-- ════ 5. AGENT / DEVELOPER MET ON SITE ════ -->
${section('5. Agent / Developer', [
    row('Agent Met on Site?', boolText(get('agentMetOnSite', 'surveyorAgentMetOnSite'))),
    row('Agent / Developer Name', na(get('agentName', 'surveyorAgentName'))),
    row('Designation', na(get('agentDesignation', 'surveyorAgentDesignation'))),
    row('Phone Number', na(get('agentPhone', 'surveyorAgentPhone'))),
    row('Email', na(get('agentEmail', 'surveyorAgentEmail'))),
].join(''))}

<!-- ════ 6. STRUCTURAL ASSESSMENT ════ -->
${section('6. Structural Assessment', [
    row('Structural Condition', na(get('structuralCondition', 'surveyorStructuralCondition'))),
    row('Visible Cracks?', boolText(get('visibleCracks', 'surveyorVisibleCracks'))),
    row('Foundation Status', na(get('foundationStatus', 'surveyorFoundationStatus'))),
    row('General Structural Remarks', na(get('generalStructuralRemarks', 'surveyorStructuralRemarks'))),
].join(''))}

<!-- ════ 7. PROPERTY VALUATION ════ -->
${section('7. Property Valuation', [
    row('Estimated Property Value (₦)', fmtCurrency(get('surveyorEstimatedValue', 'estimatedPropertyValue', 'surveyorEstimatedPropertyValue'))),
    row('Valuation Basis', na(get('valuationBasis', 'surveyorValuationBasis'))),
    row('Valuation Remarks', na(get('valuationRemarks', 'surveyorValuationRemarks'))),
].join(''))}

<!-- ════ 8. RISK ASSESSMENT ════ -->
${section('8. Risk Assessment', [
    row('Risk Level', na(riskLevelLabel[na(get('riskLevel', 'surveyorRiskLevel'))] ?? get('riskLevel', 'surveyorRiskLevel'))),
    row('Risk Remarks', na(get('riskRemarks', 'surveyorRiskRemarks'))),
].join(''))}

<!-- ════ 9. POLICY REFERENCE ════ -->
${section('9. Policy Reference', [
    row('Policy Number', policyNo),
    row('Project Title', na((proj as any).projectTitle ?? (proj as any).projectName)),
    row('Project Address', na((proj as any).address ?? (proj as any).projectAddress)),
    row('Project LGA', na((proj as any).lga ?? (proj as any).projectLga)),
    row('Client Name', na(client.name)),
    row('Contractor / Builder', na(builder.nameOfBuilder)),
    row('Submission Date', reportDate),
    row('Survey Notes', na(p.surveyNotes)),
].join(''))}

<!-- ════ 10. RECOMMENDATION ════ -->
<div class="rec-box${recValue === 'reject' ? ' reject' : recValue === 'request_more_info' ? ' info' : ''}">
  <div class="rec-label">Surveyor Recommendation</div>
  <div class="rec-value">${recLabel}</div>
  ${p.surveyNotes ? `<div class="rec-notes">${p.surveyNotes}</div>` : ''}
</div>

<!-- ════ FOOTER ════ -->
<div class="footer">
  <span>Builders Liability Scheme — Survey Assessment Report</span>
  <span>Policy #${policyNo} | Generated ${new Date().toLocaleString('en-NG')}</span>
</div>

</div><!-- /body -->
</body>
</html>`;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Opens the SAR in a new window and triggers the browser print dialog.
 * The user can choose "Save as PDF" from the print destination to get a PDF file.
 */
export function openSARReport(policy: BuilderLiabilityPolicy): void {
    const html = buildHTML(policy);
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) {
        alert('Could not open report window. Please allow pop-ups for this site.');
        return;
    }
    win.document.write(html);
    win.document.close();
    // Small delay so styles fully load before print dialog
    setTimeout(() => win.print(), 600);
}

/**
 * Downloads the SAR as a standalone .html file that can be opened and
 * printed / saved-as-PDF at any time — useful when pop-ups are blocked.
 */
export function downloadSARReport(policy: BuilderLiabilityPolicy): void {
    const html = buildHTML(policy);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAR-${policy.policyNumber || 'report'}-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
