// src/components/app-component/app-component.tsx
import { Component, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'app-component',
  styleUrl: 'app-component.css',
  shadow: false,
})
export class AppComponent {
  /** Base URL for your API endpoints */
  @Prop() apiBase!: string;
  @State() private role: 'doctor' | 'director' | null = null;

  @State() private loggedIn: boolean = false;

  /** Which view to render */
  @State()
  view:
    | 'ambulances'
    | 'editor'
    | 'ambulance-procedures'
    | 'procedures'
    | 'procedure-editor'
    | 'payments'
    | 'payment-editor' = 'ambulances';

  /** IDs for the entity being edited or viewed */
  @State() ambulanceId: string = '';
  @State() procedureId: string = '';
  @State() paymentId: string = '';

  componentWillLoad() {
    this.updateView(window.location.pathname);
    window.addEventListener('popstate', () => {
      this.updateView(window.location.pathname);
    });
  }

 private handleLogin(ev: CustomEvent<{ username: string; password: string }>) {
    const { username, password } = ev.detail;
    // mock authentication based on username
    if (username === 'director' && password === 'password') {
      this.role = 'director';
      this.loggedIn = true;
    } else if (username === 'doctor' && password === 'password') {
      this.role = 'doctor';
      this.loggedIn = true;
    } else {
      alert('Invalid credentials. Use "doctor" or "director" with password "password".');
    }
  }



  private updateView(path: string) {
    const parts = path.split('/').filter(p => p);
    const [first, second, third] = parts;

    // Drill into procedures for a specific ambulance
    if (first === 'ambulances' && second && third === 'procedures') {
      this.view = 'ambulance-procedures';
      this.ambulanceId = second;
      return;
    }

    switch (first) {
  case 'entry':
    this.view = 'editor';
    this.ambulanceId = second || '';
    break;

  case 'procedures':
    this.view = second ? 'procedure-editor' : 'procedures';
    this.procedureId = second || '';
    break;

  case 'procedure': // OK
    this.view = 'procedure-editor';
    this.procedureId = second || '';
    break;

  case 'payments':
    this.view = second ? 'payment-editor' : 'payments';
    this.paymentId = second || '';
    break;

  case 'payment':
    this.view = 'payment-editor';
    this.paymentId = second || '';
  break;

  default:
    this.view = 'ambulances';
    break;
}
  }

  private navigate(url: string) {
    window.history.pushState({}, '', url);
    this.updateView(window.location.pathname);
  }

  render() {
    if (!this.loggedIn) {
      return (
        <login-component
          onLogin={(ev: CustomEvent<{ username: string; password: string }>) =>
            this.handleLogin(ev)
          }
        />
      );
    }

    return (
      <div class="app-container">
       <header-nav-component />
        {/* Ambulances list with “View Procedures” button */}
        {this.view === 'ambulances' && (
          <ambulance-list-component
            apiBase={this.apiBase}
            onEntry-clicked={(ev: CustomEvent<string>) =>
              this.navigate(`/entry/${ev.detail}`)
            }
            onView-procedures={(ev: CustomEvent<string>) =>
              this.navigate(`/ambulances/${ev.detail}/procedures`)
            }
          />
        )}

        {/* Ambulance editor */}
        {this.view === 'editor' && (
          <ambulance-editor-component
            ambulanceId={this.ambulanceId}
            apiBase={this.apiBase}
            onEditor-closed={() => this.navigate('/ambulances')}
          />
        )}

        {/* Procedures for a specific ambulance */}
        {this.view === 'ambulance-procedures' && (
          <procedure-list-component
            apiBase={this.apiBase}
            ambulanceId={this.ambulanceId}
            onProcedure-clicked={(ev: CustomEvent<string>) =>
              this.navigate(`/procedures/${ev.detail}`) // ✅ use plural
            }
          />
        )}



        {/* Global procedures list */}
        {this.view === 'procedures' && (
          <procedure-list-component
            apiBase={this.apiBase}
            onProcedure-clicked={(ev: CustomEvent<string>) =>
              this.navigate(`/procedure/${ev.detail}`)
            }
          />
        )}

        {/* Procedure editor */}
        {this.view === 'procedure-editor' && (
          <procedure-editor-component
            procedureId={this.procedureId}
            apiBase={this.apiBase}
            onProcedure-editor-closed={() =>
              this.navigate('/procedures')
            }
          />
        )}

        {/* Global payments list */}
        {this.view === 'payments' && (
          <payment-list-component
            apiBase={this.apiBase}
            onPayment-clicked={(ev: CustomEvent<string>) =>
              this.navigate(`/payment/${ev.detail}`) 
            }
          />
        )}

        {/* Payment editor */}
        {this.view === 'payment-editor' && (
          <payment-editor-component
            paymentId={this.paymentId}
            apiBase={this.apiBase}
            onPayment-editor-closed={() =>
              this.navigate('/payments')
            }
          />
        )}
      </div>
    );
  }
}
