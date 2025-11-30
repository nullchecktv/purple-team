import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from './page';
import fc from 'fast-check';

// Mock fetch
global.fetch = jest.fn();

describe('ProfilePage Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://test-api';
  });

  // **Feature: user-profile, Property 11: UI displays all profile fields**
  test('Property 11: For any profile data, UI should render name, email, and bio', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.emailAddress(),
        fc.string({ maxLength: 500 }),
        async (name, email, bio) => {
          const mockProfile = {
            userId: 'test-user',
            name,
            email,
            bio,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => mockProfile
          });

          const { container } = render(<ProfilePage />);

          await waitFor(() => {
            expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
          });

          // Verify all fields are displayed
          expect(container.textContent).toContain(name);
          expect(container.textContent).toContain(email);
          if (bio) {
            expect(container.textContent).toContain(bio);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // **Feature: user-profile, Property 12: Edit form pre-fills current values**
  test('Property 12: For any profile in edit mode, form should pre-fill current values', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.emailAddress(),
        fc.string({ maxLength: 500 }),
        async (name, email, bio) => {
          const mockProfile = {
            userId: 'test-user',
            name,
            email,
            bio,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => mockProfile
          });

          const { container } = render(<ProfilePage />);

          await waitFor(() => {
            expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
          });

          // Click edit button
          const editButton = screen.getByText(/edit profile/i);
          editButton.click();

          await waitFor(() => {
            const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
            const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
            const bioInput = screen.getByLabelText(/bio/i) as HTMLTextAreaElement;

            expect(nameInput.value).toBe(name);
            expect(emailInput.value).toBe(email);
            expect(bioInput.value).toBe(bio);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // **Feature: user-profile, Property 13: UI updates after successful save**
  test('Property 13: For any successful update, UI should display updated data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.emailAddress(),
        fc.string({ maxLength: 500 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        async (originalName, email, bio, updatedName) => {
          const originalProfile = {
            userId: 'test-user',
            name: originalName,
            email,
            bio,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          const updatedProfile = {
            ...originalProfile,
            name: updatedName,
            updatedAt: new Date().toISOString()
          };

          // Mock initial fetch
          (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => originalProfile
          });

          const { container } = render(<ProfilePage />);

          await waitFor(() => {
            expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
          });

          // Click edit
          const editButton = screen.getByText(/edit profile/i);
          editButton.click();

          await waitFor(() => {
            expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
          });

          // Mock update request
          (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => updatedProfile
          });

          // Change name and save
          const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
          nameInput.value = updatedName;
          nameInput.dispatchEvent(new Event('change', { bubbles: true }));

          const saveButton = screen.getByText(/save profile/i);
          saveButton.click();

          await waitFor(() => {
            expect(container.textContent).toContain(updatedName);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
