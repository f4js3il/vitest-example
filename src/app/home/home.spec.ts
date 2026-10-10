import { signal } from '@angular/core';
import { HttpResourceRef } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';
import { Quote, QuoteService } from '../services/quote.service';

// A fake resource with the same signals the template reads. The tests set these
// signals directly to put the page into a loading, error or loaded state.
function createFakeQuoteResource() {
  const value = signal<Quote | undefined>(undefined);
  const isLoading = signal(false);
  const error = signal<Error | undefined>(undefined);

  return {
    value,
    isLoading,
    error,
    hasValue: () => value() !== undefined,
    reload: vi.fn(),
  };
}

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let element: HTMLElement;
  let fakeQuote: ReturnType<typeof createFakeQuoteResource>;

  beforeEach(async () => {
    fakeQuote = createFakeQuoteResource();

    // Replace the real QuoteService: randomQuote() returns our fake instead of calling the API.
    const mockQuoteService = {
      randomQuote: vi
        .fn()
        .mockReturnValue(fakeQuote as unknown as HttpResourceRef<Quote | undefined>),
    };

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([]), { provide: QuoteService, useValue: mockQuoteService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    element = fixture.nativeElement;
  });

  const text = () => element.textContent ?? '';
  const newQuoteButton = () =>
    [...element.querySelectorAll('button')].find((b) => b.textContent?.includes('New quote'))!;

  it('asks the service for a quote once when created', async () => {
    await fixture.whenStable();

    expect(TestBed.inject(QuoteService).randomQuote).toHaveBeenCalledOnce();
  });

  it('shows a loading message and disables the button while loading', async () => {
    fakeQuote.isLoading.set(true);
    await fixture.whenStable();

    expect(text()).toContain('Loading...');
    expect(newQuoteButton().disabled).toBe(true);
  });

  it('shows the quote and author when loaded', async () => {
    fakeQuote.value.set({ id: 1, quote: 'Test quote text', author: 'Test Author' });
    await fixture.whenStable();

    expect(element.querySelector('blockquote p')?.textContent).toContain('Test quote text');
    expect(element.querySelector('blockquote footer')?.textContent).toContain('Test Author');
    expect(newQuoteButton().disabled).toBe(false);
  });

  it('shows an error message when the request fails', async () => {
    fakeQuote.error.set(new Error('Network down'));
    await fixture.whenStable();

    expect(text()).toContain('Could not load a quote');
    expect(element.querySelector('blockquote')).toBeNull();
  });

  it('reloads the quote when "New quote" is clicked', async () => {
    fakeQuote.value.set({ id: 1, quote: 'First', author: 'Someone' });
    await fixture.whenStable();

    newQuoteButton().click();

    expect(fakeQuote.reload).toHaveBeenCalledOnce();
  });

  it('has a Log out link back to /login', async () => {
    await fixture.whenStable();

    const logout = [...element.querySelectorAll('a')].find((a) => a.textContent?.includes('Log out'));
    expect(logout?.getAttribute('href')).toBe('/login');
  });
});
