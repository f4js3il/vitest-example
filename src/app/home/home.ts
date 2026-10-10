import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Quote, QuoteService } from '../services/quote.service';
import { HttpResourceRef } from '@angular/common/http';

@Component({
  imports: [RouterLink],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {
  private readonly quoteService = inject(QuoteService);
  protected readonly quote: HttpResourceRef<Quote | undefined> = this.quoteService.randomQuote();
}
