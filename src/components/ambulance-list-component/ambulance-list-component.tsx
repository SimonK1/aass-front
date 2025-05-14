// src/components/ambulance-list-component/ambulance-list-component.tsx
import { Component, Event, EventEmitter, Host, h, Prop, State } from '@stencil/core';
import { Ambulance, AmbulanceManagementApi, Configuration } from '../../api/ambulance';

@Component({
  tag: 'ambulance-list-component',
  styleUrl: 'ambulance-list-component.css',
  shadow: true,
})
export class AmbulanceListComponent {
  /** Emitted when clicking the edit/add icons */
  @Event({ eventName: 'entry-clicked' }) entryClicked!: EventEmitter<string>;

  /** Emitted when clicking “View Procedures” on a row */
  @Event({ eventName: 'view-procedures' }) viewProcedures!: EventEmitter<string>;

  @Prop() apiBase!: string;

  @State() ambulances: Ambulance[] = [];
  @State() isLoading = false;
  @State() errorMessage = '';

  private get apiClient(): AmbulanceManagementApi {
    return new AmbulanceManagementApi(new Configuration({ basePath: this.apiBase }));
  }

  async componentWillLoad() {
    await this.fetchAmbulances();
  }

  private async fetchAmbulances() {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const resp = await this.apiClient.ambulancesGetRaw();
      if (!resp.raw.ok) {
        throw new Error(resp.raw.statusText || 'Unknown error');
      }
      this.ambulances = await resp.value();
    } catch (err: any) {
      this.errorMessage = `Unable to load ambulances: ${err.message}`;
      this.ambulances = [];
    } finally {
      this.isLoading = false;
    }
  }

  private onRefresh = () => this.fetchAmbulances();
  private onAddNew = () => this.entryClicked.emit('@new');
  private onEdit = (id: string) => () => this.entryClicked.emit(id);
  private onStats = (id: string) => () => console.log('Stats for', id);

  /** Emit with the ambulance ID to show its procedures */
  private onViewProcedures = (id: string) => () => this.viewProcedures.emit(id);

  render() {
    return (
      <Host>
        {this.errorMessage && <div class="error">{this.errorMessage}</div>}
        {this.isLoading ? (
          <div class="loading-spinner">Loading...</div>
        ) : (
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Názov</th>
                  <th>Adresa</th>
                  <th>Oddelenie</th>
                  <th>Kapacita</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {this.ambulances.map(a => (
                  <tr key={a.id}>
                    <td>{a.name}</td>
                    <td>{a.location}</td>
                    <td>{a.department}</td>
                    <td>{a.capacity}</td>
                    <td>{a.status}</td>
                    <td class="actions-cell">
                      {/* New “View Procedures” button */}
                      <button class="proc-btn" onClick={this.onViewProcedures(a.id)}>
                        Prezrieť výkony
                      </button>
                      <button class="stats-btn" onClick={this.onStats(a.id)}>
                        Sumár výdavkov
                      </button>
                      <md-filled-icon-button class="icon-btn" onClick={this.onEdit(a.id)}>
                        <md-icon>edit</md-icon>
                      </md-filled-icon-button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div class="actions-bar">

              <button class="refresh-btn" onClick={this.onRefresh}>Refresh</button>
              <md-filled-icon-button class="icon-btn" onClick={this.onAddNew}>
                <md-icon>add</md-icon>
              </md-filled-icon-button>
            </div>
          </div>
        )}
      </Host>
    );
  }
}