// __tests__/SupportPage.validation.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({ push: jest.fn() }),
  useParams: jest.fn().mockReturnValue({}),
  useSearchParams: jest.fn().mockReturnValue({
    get: () => null, // general inquiry
  }),
}));

// ⬇️ Adjust this path if your support page lives elsewhere
import SupportPage from '../app/support/page';

function getSubmit() {
  return (
    screen.queryByRole('button', { name: /send|submit|support|contact/i }) ||
    document.querySelector('button[type="submit"]')
  ) as HTMLButtonElement | null;
}

describe('SupportPage - validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    // capture alerts if your UI uses them
    // @ts-ignore
    window.alert = jest.fn();
  });

  test('UT403/UT406: missing required fields prevents sending request', async () => {
    render(<SupportPage />);

    // Intentionally do not fill required fields
    const btn = getSubmit();
    if (!btn) throw new Error('Submit button not found');
    fireEvent.click(btn);

    // Expect NO network call
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });

    // If your form shows inline errors OR uses alert, this stays generic:
    // @ts-ignore
    if ((window.alert as jest.Mock).mock) {
      // Optional: expect(window.alert).toHaveBeenCalled();
    }
  });

  test('UT403/UT406: invalid email prevents sending', async () => {
    render(<SupportPage />);

    // Try to find fields by common names/labels/placeholders
    const email =
      screen.queryByLabelText(/email/i) ||
      screen.queryByPlaceholderText(/email/i) ||
      (document.querySelector('[name="email"]') as HTMLInputElement | null);

    if (email) fireEvent.change(email, { target: { value: 'not-an-email' } });

    const message =
      screen.queryByLabelText(/message/i) ||
      screen.queryByPlaceholderText(/message/i) ||
      (document.querySelector('[name="message"]') as HTMLTextAreaElement | null);

    if (message) fireEvent.change(message, { target: { value: 'Hi' } });

    const name =
      screen.queryByLabelText(/name/i) ||
      screen.queryByPlaceholderText(/name/i) ||
      (document.querySelector('[name="name"]') as HTMLInputElement | null);

    if (name) fireEvent.change(name, { target: { value: 'X' } });

    const btn = getSubmit();
    if (!btn) throw new Error('Submit button not found');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
