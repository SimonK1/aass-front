import { Component, Event, EventEmitter, Host, h, Prop, State } from '@stencil/core';
import {
  Procedure,
  ProcedureManagementApi,
  Ambulance,
  AmbulanceManagementApi,
  Configuration,
} from '../../api/ambulance';

@Component({
  tag: 'procedure-list-component',
  styleUrl: 'procedure-list-component.css',
  shadow: true,
})
export class ProcedureListComponent {
  /** Emitted with the procedure ID or '@new' */
  @Event({ eventName: 'procedure-clicked' }) procedureClicked!: EventEmitter<string>;

  /** Base URL for your API endpoints */
  @Prop() apiBase!: string;

  /**
   * If provided, only procedures for this ambulance are shown.
   * Otherwise all procedures are listed.
   */
  @Prop() ambulanceId?: string;

  @State() procedures: Procedure[] = [];
  @State() ambulances: Ambulance[] = [];
  @State() isLoading = false;
  @State() errorMessage = '';
  @State() approvingId: string | null = null;

  private get procApiClient() {
    return new ProcedureManagementApi(new Configuration({ basePath: this.apiBase }));
  }

  private get ambApiClient() {
    return new AmbulanceManagementApi(new Configuration({ basePath: this.apiBase }));
  }

  async componentWillLoad() {
    await Promise.all([this.loadAmbulances(), this.fetchProcedures()]);
  }

  private async loadAmbulances() {
    try {
      this.ambulances = await this.ambApiClient.ambulancesGet();
    } catch (err: any) {
      console.error('Error loading ambulances', err);
    }
  }

  private async fetchProcedures() {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      if (this.ambulanceId) {
        this.procedures = await this.ambApiClient.getProceduresByAmbulance({ ambulanceId: this.ambulanceId });
      } else {
        this.procedures = await this.procApiClient.proceduresGet();
      }
    } catch (err: any) {
      this.errorMessage = `Unable to load procedures: ${err.message}`;
      this.procedures = [];
    } finally {
      this.isLoading = false;
    }
  }

  private getAmbulanceName(id: string) {
    const amb = this.ambulances.find(a => a.id === id);
    return amb ? amb.name : id;
  }

  private onRefresh = () => this.fetchProcedures();
  private onAddNew = () => this.procedureClicked.emit('@new');
  private onEdit = (id: string) => () => this.procedureClicked.emit(id);

  /**
   * Call server PUT /api/procedures/:id to set visitType to "Schválená"
   */
  private async approveInvoice(id: string) {

    await new Promise<void>(resolve => setTimeout(resolve, 1500));
    this.errorMessage = '';
    this.approvingId = id;
    try {
      const res = await fetch(
        `http://localhost:8080/api/procedures/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visit_type: 'Schválená' }),
        }
      );
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Approval failed');
      }
      // update local list
      this.procedures = this.procedures.map(p =>
        p.id === id ? { ...p, visitType: 'Schválená' } : p
      );
    } catch (e: any) {
      this.errorMessage = e.message;
    } finally {
      this.approvingId = null;
    }
  }

  render() {
    return (
      <Host>
        {this.errorMessage && <div class="error">{this.errorMessage}</div>}

        {this.isLoading ? (
          <div class="loading-spinner">Loading...</div>
        ) : (
          <div class="table-container">
            <div class="name-container">
              <h2>
                Výkony{this.ambulanceId ? ` pre ambulanciu ${this.getAmbulanceName(this.ambulanceId)}` : ''}
              </h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Názov</th>
                  <th>Ambulancia</th>
                  <th>Pacient</th>
                  <th>Platca</th>
                  <th>Cena</th>
                  <th>Fakturacia</th>
                  <th>Akcie</th>
                </tr>
              </thead>
              <tbody>
                {this.procedures.map(p => (
                  <tr key={p.id}>
                    <td>{p.description}</td>
                    {!this.ambulanceId && (
                      <td>{this.getAmbulanceName(p.ambulanceId)}</td>
                    )}
                    <td>{p.patient}</td>
                    <td>{p.payer}</td>
                    <td>{p.price}</td>
                    <td>{p.visitType}</td>
                    <td class="actions-cell">
                      <button
                        class="stats-btn"
                        disabled={this.approvingId === p.id}
                        onClick={() => this.approveInvoice(p.id)}
                      >
                        {this.approvingId === p.id ? 'Schvaľujem…' : 'Schváliť fakturaciu'}
                      </button>
                      <md-filled-icon-button
                        class="icon-btn"
                        onClick={this.onEdit(p.id)}
                      >
                        <md-icon>edit</md-icon>
                      </md-filled-icon-button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div class="actions-bar">
              <md-filled-icon-button class="icon-btn" onClick={this.onAddNew}>
                <md-icon>add</md-icon>
              </md-filled-icon-button>
              <button class="refresh-btn" onClick={this.onRefresh}>
                Obnoviť
              </button>
            </div>
          </div>
        )}
      </Host>
    );
  }
}
