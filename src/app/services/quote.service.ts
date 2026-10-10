import { Injectable } from '@angular/core';
import { httpResource, HttpResourceRef } from '@angular/common/http';

export interface Quote {
  id: number;
  quote: string;
  author: string;
}

@Injectable({ providedIn: 'root' })
export class QuoteService {
  // Free public API, no key required: https://dummyjson.com/docs/quotes
  private readonly randomQuoteUrl = 'https://dummyjson.com/quotes/random';

  // httpResource() injects HttpClient internally, so call this from a field initializer
  // or constructor (an injection context).
  randomQuote(): HttpResourceRef<Quote | undefined>{
    return httpResource<Quote>(() => this.randomQuoteUrl);
  }
}
