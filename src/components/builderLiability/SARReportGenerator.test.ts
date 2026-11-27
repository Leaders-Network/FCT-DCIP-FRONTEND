/**
 * P0-20: stored XSS in the Survey Assessment Report (docs/IMPLEMENTATION_MANUAL.md).
 *
 * Surveyor-entered fields (surveyNotes, surveyDetails.*) used to be interpolated
 * into raw HTML and written into a same-origin popup with document.write, so a
 * surveyor could run script in the viewer's session (admin or citizen).
 *
 * The fix has three layers, each tested here:
 *   1. every value is HTML-escaped (renders as text);
 *   2. the report carries a CSP with no script source;
 *   3. the popup is a fixed shell; the report loads from a blob URL inside an
 *      iframe sandboxed without allow-scripts.
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  downloadSARReport,
  escapeHtml,
  openSARReport,
  REPORT_FRAME_SANDBOX,
} from './SARReportGenerator';
import type { BuilderLiabilityPolicy } from '@/types/builderLiabilityPolicy.types';

const PAYLOAD = '<img src=x onerror="alert(document.cookie)">';
const BLOB_URL = 'blob:http://localhost/sar-test';

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

const normalPolicy = {
  ...maliciousPolicy,
  surveyNotes: 'Site inspected; structure sound.',
  surveyDetails: {
    locationDetails: { plotNumber: 'PLOT-12A' },
    agent: { name: 'Jane Agent' },
  },
} as unknown as BuilderLiabilityPolicy;

const readBlob = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });

let blobs: Blob[];
let revoked: string[];

beforeEach(() => {
  blobs = [];
  revoked = [];
  // jsdom has no object URLs; record what the generator hands over instead.
  Object.assign(URL, {
    createObjectURL: vi.fn((blob: Blob) => {
      blobs.push(blob);
      return BLOB_URL;
    }),
    revokeObjectURL: vi.fn((url: string) => revoked.push(url)),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// Opens the report against a fake popup backed by a real (detached) document.
const openReport = async (policy: BuilderLiabilityPolicy) => {
  const listeners: Record<string, () => void> = {};
  const popup = {
    document: document.implementation.createHTMLDocument(''),
    print: vi.fn(),
    addEventListener: vi.fn((type: string, fn: () => void) => {
      listeners[type] = fn;
    }),
  };
  vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);

  openSARReport(policy);

  expect(blobs).toHaveLength(1);
  const html = await readBlob(blobs[0]);
  // After reading: jsdom's FileReader itself runs on timers.
  vi.useFakeTimers();
  return { popup, listeners, html };
};

// Parses the generated report the way a browser would and reports what executes.
const inspect = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return {
    doc,
    injectedElements: doc.querySelectorAll('img, [onerror], script').length,
    visibleText: doc.body.textContent ?? '',
  };
};

describe('escapeHtml', () => {
  test('escapes the five HTML-significant characters', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;'
    );
  });

  test('handles non-strings and empty values', () => {
    expect(escapeHtml(42)).toBe('42');
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});

describe('P0-20 stored XSS in SARReportGenerator', () => {
  test('surveyor input is escaped and shown as text', async () => {
    const { html } = await openReport(maliciousPolicy);
    const { injectedElements, visibleText } = inspect(html);

    expect(injectedElements).toBe(0);
    expect(html).not.toContain(PAYLOAD);
    expect(visibleText).toContain(PAYLOAD);
  });

  test('a payload in the policy number cannot break out of <title>', async () => {
    const { html } = await openReport({
      ...normalPolicy,
      policyNumber: `</title>${PAYLOAD}`,
    } as unknown as BuilderLiabilityPolicy);

    expect(inspect(html).injectedElements).toBe(0);
    expect(html).not.toContain('</title><img');
  });

  test('the report carries a CSP that allows no scripts', async () => {
    const { html } = await openReport(normalPolicy);
    const meta = inspect(html).doc.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const csp = meta?.getAttribute('content') ?? '';

    expect(csp).toContain("default-src 'none'");
    expect(csp).not.toMatch(/script-src/);
    expect(csp).not.toMatch(/unsafe-eval/);
  });

  test('the popup is never given the report HTML; it gets a sandboxed blob iframe', async () => {
    const { popup } = await openReport(maliciousPolicy);
    const shell = popup.document;
    const frame = shell.querySelector('iframe');

    expect(frame).not.toBeNull();
    expect(frame!.getAttribute('src')).toBe(BLOB_URL);
    const sandbox = frame!.getAttribute('sandbox')!.split(/\s+/);
    expect(sandbox.sort()).toEqual(REPORT_FRAME_SANDBOX.split(' ').sort());
    expect(sandbox).not.toContain('allow-scripts');
    expect(sandbox).not.toContain('allow-top-navigation');
    expect(sandbox).not.toContain('allow-popups');

    const shellHtml = shell.documentElement.outerHTML;
    expect(shellHtml).not.toContain('onerror');
    expect(shellHtml).not.toContain('<img');
    expect(shell.querySelectorAll('script')).toHaveLength(0);
  });

  test('the print dialog opens once the report frame has loaded', async () => {
    const { popup } = await openReport(normalPolicy);
    const frame = popup.document.querySelector('iframe')!;

    expect(popup.print).not.toHaveBeenCalled();
    frame.dispatchEvent(new Event('load'));
    vi.advanceTimersByTime(300);
    // The detached test document has no frame window, so the shell fallback runs.
    expect(popup.print).toHaveBeenCalledTimes(1);
  });

  test('the shell has a Print / Save as PDF button', async () => {
    const { popup } = await openReport(normalPolicy);
    const button = popup.document.querySelector('button');

    expect(button?.textContent).toBe('Print / Save as PDF');
    button!.click();
    expect(popup.print).toHaveBeenCalledTimes(1);
  });

  test('the blob URL is released when the popup closes', async () => {
    const { listeners } = await openReport(normalPolicy);

    expect(revoked).toEqual([]);
    listeners.pagehide();
    expect(revoked).toEqual([BLOB_URL]);
  });

  test('a blocked pop-up shows the existing message and creates no blob', () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'open').mockReturnValue(null);

    openSARReport(maliciousPolicy);

    expect(alert).toHaveBeenCalledWith('Could not open report window. Please allow pop-ups for this site.');
    expect(blobs).toHaveLength(0);
  });

  test('the downloaded .html file is escaped and carries the CSP too', async () => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    downloadSARReport(maliciousPolicy);

    const html = await readBlob(blobs[0]);
    expect(inspect(html).injectedElements).toBe(0);
    expect(html).toContain('Content-Security-Policy');
    expect(inspect(html).visibleText).toContain(PAYLOAD);
  });

  test('characterization: a normal report still renders its sections and values', async () => {
    const { html } = await openReport(normalPolicy);
    const { visibleText } = inspect(html);

    expect(visibleText).toContain('Survey Assessment Report (SAR)');
    expect(visibleText).toContain('BLD-TEST-0001');
    expect(visibleText).toContain('PLOT-12A');
    expect(visibleText).toContain('Jane Agent');
    expect(visibleText).toContain('Site inspected; structure sound.');
    expect(visibleText).toContain('Recommend for Approval');
    expect(visibleText).toContain('1. Location Details');
    // Section titles with "&" still read correctly after escaping.
    expect(visibleText).toContain('4. Contractor & Assessor Information');
    expect(visibleText).toContain('Estimated Property Value (₦)');
  });
});
