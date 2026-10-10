// Runs only in Vitest Browser Mode (npm run test:browser). These tests rely on things
// jsdom cannot do: real keyboard/mouse input, real focus, real CSS and real layout.
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { page, userEvent } from 'vitest/browser';
import { Login } from './login';

describe('Login (real browser)', () => {
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([])],
    }).compileComponents();

    router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
  });

  // Locators find elements the way a user would: by label text and role, not CSS selectors.
  const userIdInput = () => page.getByLabelText('User ID');
  const passwordInput = () => page.getByLabelText('Password');
  const loginButton = () => page.getByRole('button', { name: 'Log in' });

  it('logs in by really typing and clicking', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    // userEvent sends real key presses and mouse clicks through the browser.
    await userEvent.type(userIdInput(), 'testuser');
    await userEvent.type(passwordInput(), 'secret');
    await userEvent.click(loginButton());

    await expect.poll(() => navigateSpy).toHaveBeenCalledWith(['/home']);
  });

  it('shows the User ID error after tabbing away from an empty field', async () => {
    await userEvent.click(userIdInput()); // focus the field
    await userEvent.tab(); // real Tab key: focus moves, the field is blurred and marked touched

    // expect.element retries until the assertion passes (or times out).
    await expect.element(page.getByText('User ID is required')).toBeVisible();
    await expect.element(passwordInput()).toHaveFocus();
    await expect.element(page.getByText('Password is required')).not.toBeInTheDocument();
  });

  it('applies the real Tailwind styles to the Log in button', async () => {
    const button = loginButton().element() as HTMLElement;
    const style = getComputedStyle(button);

    // In jsdom there is no stylesheet, so these would be empty/transparent.
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(style.color).toBe('rgb(255, 255, 255)');
  });

  it('lays out the card centered on the page', async () => {
    const form = document.querySelector('form')!;
    const box = form.getBoundingClientRect();

    // jsdom has no layout engine: every size and position would be 0.
    expect(box.width).toBeGreaterThan(0);
    expect(box.width).toBeLessThanOrEqual(384); // Tailwind max-w-sm = 24rem = 384px
    const leftGap = box.left;
    const rightGap = window.innerWidth - box.right;
    expect(Math.abs(leftGap - rightGap)).toBeLessThan(2);
  });
});
