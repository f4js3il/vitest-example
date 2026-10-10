import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let element: HTMLElement;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([])],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Login);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  // Helpers that act like a user would in the simulated (jsdom) browser.
  const input = (id: string) => element.querySelector<HTMLInputElement>(`#${id}`)!;
  const submitButton = () => element.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const errorMessages = () =>
    [...element.querySelectorAll('p.text-red-600')].map((p) => p.textContent?.trim());

  function typeInto(id: string, value: string) {
    input(id).value = value;
    input(id).dispatchEvent(new Event('input')); // signal forms listen for the input event
  }

  it('renders the user ID and password fields', () => {
    expect(input('userId')).toBeTruthy();
    expect(input('password').type).toBe('password');
    expect(submitButton().textContent).toContain('Log in');
  });

  it('shows no errors before the user interacts', () => {
    expect(errorMessages()).toEqual([]);
  });

  it('shows required errors and does not navigate when submitted empty', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    submitButton().click();
    await fixture.whenStable();

    expect(errorMessages()).toEqual(['User ID is required', 'Password is required']);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('navigates to /home when both fields are filled in', async () => {
    // mockResolvedValue: pretend navigation succeeded without actually routing anywhere
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    typeInto('userId', 'testuser');
    typeInto('password', 'secret');
    submitButton().click();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
    expect(errorMessages()).toEqual([]);
  });
});
