/**
 * P0-20: stored XSS in the Survey Assessment Report (docs/IMPLEMENTATION_MANUAL.md).
 *
 * Surveyor-entered fields (surveyNotes, surveyDetails.*) are interpolated into
 * raw HTML and written into a same-origin popup with document.write, so a
 * surveyor can run script in the viewer's session (admin or citizen).
 *
 * Same pattern as the backend P0 tests:
 *   - "today:"     asserts the vulnerable output that exists now.
 *   - "after fix:" a test.fails asserting the secure output. It passes while the
 *                  bug exists and starts failing once the fix lands.
 * When P0-20 is fixed: delete the "today:" tests and turn test.fails into test.
 * If the fix moves rendering to a sandboxed blob URL instead of document.write,
 * update renderReport() below to capture the HTML from the Blob instead.
 */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { openSARReport } from './SARReportGenerator';
import type { BuilderLiabilityPolicy } from '@/types/builderLiabilityPolicy.types';

const PAYLOAD = '<img src=x onerror="alert(document.cookie)">';

const maliciousPolicy = {
  policyNumber: 'BLD-TEST-0001',
  status: 'approved',
  surveyorRecommendation: 'approve',
  surveyNotes: PAYLOAD,
  surveyDetails: {
    locationDetails: { plotNumber: PAYLOAD },
    agent: { name: PAYLOAD },
  },
  project: {},
  builder: {},
  client: {},
  organization: {},
} as unknown as BuilderLiabilityPolicy;

// Opens the report against a fake popup and returns the HTML it was given.
const renderReport = (policy: BuilderLiabilityPolicy) => {
  vi.useFakeTimers();
  const written: string[] = [];
  const popup = {
    document: { write: (html: string) => written.push(html), close: vi.fn() },
    print: vi.fn(),
  };
  vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);

  openSARReport(policy);

  return written.join('');
};

// Parses the generated report the way a browser would and reports what executes.
const inspect = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return {
    injectedElements: doc.querySelectorAll('img[onerror]').length,
    visibleText: doc.body.textContent ?? '',
  };
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('P0-20 stored XSS in SARReportGenerator', () => {
  test('today: surveyor input is written into the popup as live HTML', () => {
    const html = renderReport(maliciousPolicy);

    expect(html).toContain(PAYLOAD);
    // surveyNotes appears twice (policy reference + recommendation box),
    // plus the plot number and agent name.
    expect(inspect(html).injectedElements).toBe(4);
  });

  test.fails('after fix: surveyor input is escaped and shown as text', () => {
    const html = renderReport(maliciousPolicy);
    const { injectedElements, visibleText } = inspect(html);

    expect(injectedElements).toBe(0);
    expect(html).not.toContain(PAYLOAD);
    expect(visibleText).toContain(PAYLOAD);
  });

  test('characterization: a normal report still renders its sections and values', () => {
    const html = renderReport({
      ...maliciousPolicy,
      surveyNotes: 'Site inspected; structure sound.',
      surveyDetails: {
        locationDetails: { plotNumber: 'PLOT-12A' },
        agent: { name: 'Jane Agent' },
      },
    } as unknown as BuilderLiabilityPolicy);
    const { visibleText } = inspect(html);

    expect(visibleText).toContain('Survey Assessment Report (SAR)');
    expect(visibleText).toContain('BLD-TEST-0001');
    expect(visibleText).toContain('PLOT-12A');
    expect(visibleText).toContain('Jane Agent');
    expect(visibleText).toContain('Site inspected; structure sound.');
    expect(visibleText).toContain('Recommend for Approval');
  });
});
