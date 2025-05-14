// src/components/login-component/login-component.tsx
import { Component, Event, EventEmitter, h, State } from '@stencil/core';

@Component({
  tag: 'login-component',
  styleUrl: 'login-component.css',
  shadow: false,
})
export class LoginComponent {
  @State() username: string = '';
  @State() password: string = '';

  @Event() login: EventEmitter<{ username: string; password: string }>;

  private handleUsername(e: Event) {
    this.username = (e.target as HTMLInputElement).value;
  }

  private handlePassword(e: Event) {
    this.password = (e.target as HTMLInputElement).value;
  }

  private handleSubmit(e: Event) {
    e.preventDefault();
    this.login.emit({ username: this.username, password: this.password });
  }

  render() {
    return (
      <form class="login-form" onSubmit={e => this.handleSubmit(e)}>
        <h2>Login</h2>

        <label>
          <p>Používateľské meno</p>
          <input
            type="text"
            value={this.username}
            onInput={e => this.handleUsername(e)}
            placeholder="doctor or director"
          />
        </label>

        <label>
          <p>Heslo</p>
          <input
            type="password"
            value={this.password}
            onInput={e => this.handlePassword(e)}
            placeholder="password"
          />
        </label>

        <button  type="submit">Prihlásiť</button>
      </form>
    );
  }
}

