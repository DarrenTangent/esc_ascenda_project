// client/__tests__/SupportPage.form.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js router/search hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({ push: jest.fn() }),
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
}));
import { useSearchParams } from 'next/navigation';

// Import your Support page (adjust the path if your file lives elsewhere)
import SupportPage from '../app/support/page';

// --- helpers ---------------------------------------------------------------

/** Build a stub for URLSearchParams-like get() */
const makeSearchParams = (m: Record<string, string | null>) => ({
  get: (k: string) => (k in m ? m[k] : null),
});

/** Non-throwing queries used in waitFor */
function queryEmailField(): HTMLInputElement | null {
  const byLabel = screen.queryByLabelText(/email/i) as HTMLInputElement | null;
  if (byLabel) return byLabel;
  const byName = document.querySelector('input[type="email"], input[name="email"]') as HTMLInputElement | null;
  return byName;
}
function queryMessageField(): HTMLTextAreaElement | null {
  const byLabel = screen.queryByLabelText(/message|how can we help|describe/i) as HTMLTextAreaElement | null;
  if (byLabel) return byLabel;
  const byName = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement | null;
  if (byName) return byName;
  // fallback: first textarea on the page
  return document.querySelector('textarea') as HTMLTextAreaElement | null;
}
function querySubmitButton(): HTMLButtonElement | null {
  const byRole =
    screen.queryByRole('button', { name: /send|submit|contact|support/i }) as HTMLButtonElement | null;
  if (byRole) return byRole;
  const byType = document.querySelector('button[type="submit"]') as HTMLButtonElement | null;
  if (byType) return byType;
  // last resort: any button
  const anyBtn = document.querySelector('button') as HTMLButtonElement | null;
  return anyBtn;
}

/** Throwing getters used in the tests for clear failure messages */
function getEmailField(): HTMLInputElement {
  const el = queryEmailField();
  if (!el) throw new Error('Email field not found');
  return el;
}
function getMessageField(): HTMLTextAreaElement {
  const el = queryMessageField();
  if (!el) throw new Error('Message field not found');
  return el;
}
function getSubmit(): HTMLButtonElement {
  const el = querySubmitButton();
  if (!el) throw new Error('Submit button not found');
  return el;
}

// Silence alert if the page uses it
beforeAll(() => {
  Object.defineProperty(window, 'alert', { value: jest.fn(), writable: true });
});

// Reset fetch & search params before each test
beforeEach(() => {
  jest.clearAllMocks();
  (global.fetch as any) = jest.fn();
});

// --- tests ----------------------------------------------------------------

describe('SupportPage - submit flows', () => {
  test('UT404 + UT402/UT403: submits booking support with bookingId', async () => {
    // URL contains bookingId -> booking-related support
    (useSearchParams as jest.Mock).mockReturnValue(
      makeSearchParams({
        bookingId: 'bkg_123',
      })
    );

    // Mock support endpoint
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    render(<SupportPage />);

    // Wait until form inputs are present
    await waitFor(() => expect(queryEmailField()).toBeTruthy());
    await waitFor(() => expect(queryMessageField()).toBeTruthy());

    // Fill fields
    fireEvent.change(getEmailField(), { target: { value: 'alice@example.com' } });
    fireEvent.change(getMessageField(), { target: { value: 'Need help with my booking' } });

    // Submit
    fireEvent.click(getSubmit());

    // Assert POST body
    await waitFor(() => expect((global.fetch as jest.Mock).mock.calls.length).toBe(1));
    const [url, opts] = (global.fetch as jest.Mock).mock.calls[0];

    expect(String(url)).toMatch(/support/i);
    expect(opts?.method).toBe('POST');
    const body = JSON.parse((opts as any).body);

    // Core assertions
    expect(body).toEqual(
      expect.objectContaining({
        email: 'alice@example.com',
        message: 'Need help with my booking',
      })
    );
    expect(body.bookingId).toBe('bkg_123'); // should include bookingId when present
  });

  test('UT409: submits general inquiry when no bookingId present', async () => {
    // No bookingId in URL -> general support
    (useSearchParams as jest.Mock).mockReturnValue(makeSearchParams({}));

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    render(<SupportPage />);

    await waitFor(() => expect(queryEmailField()).toBeTruthy());
    await waitFor(() => expect(queryMessageField()).toBeTruthy());

    fireEvent.change(getEmailField(), { target: { value: 'bob@example.com' } });
    fireEvent.change(getMessageField(), { target: { value: 'General question' } });

    fireEvent.click(getSubmit());

    await waitFor(() => expect((global.fetch as jest.Mock).mock.calls.length).toBe(1));
    const [url, opts] = (global.fetch as jest.Mock).mock.calls[0];

    expect(String(url)).toMatch(/support/i);
    expect(opts?.method).toBe('POST');
    const body = JSON.parse((opts as any).body);

    // bookingId may be undefined OR empty string: accept either
    const id = body.bookingId;
    expect(id === undefined || id === null || String(id).trim() === '').toBe(true);

    expect(body).toEqual(
      expect.objectContaining({
        email: 'bob@example.com',
        message: 'General question',
      })
    );
  });
});
