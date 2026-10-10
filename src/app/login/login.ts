import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, FormField, required, submit } from '@angular/forms/signals';

interface LoginModel {
  userId: string;
  password: string;
}

@Component({
  imports: [FormField],
  selector: 'app-login',
  templateUrl: './login.html',
})
export class Login {
  private readonly router = inject(Router);

  protected readonly loginModel = signal<LoginModel>({ userId: '', password: '' });

  protected readonly loginForm = form(this.loginModel, (path) => {
    required(path.userId, { message: 'User ID is required' });
    required(path.password, { message: 'Password is required' });
  });

  protected onSubmit(event: Event) {
    event.preventDefault();
    // No real authentication yet: any non-empty user ID and password is accepted.
    // submit() marks all fields as touched and only runs the action when the form is valid.
    submit(this.loginForm, async () => {
      await this.router.navigate(['/home']);
    });
  }
}
