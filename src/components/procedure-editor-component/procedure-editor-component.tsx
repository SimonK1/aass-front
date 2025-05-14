import { Component, Host, h, EventEmitter, Event, Prop, State } from '@stencil/core';
import {
  Procedure,
  ProcedureManagementApi,
  Ambulance,
  AmbulanceManagementApi,
  Configuration,
} from '../../api/ambulance';

@Component({
  tag: 'procedure-editor-component',
  styleUrl: 'procedure-editor-component.css',
  shadow: true,
})
export class ProcedureEditorComponent {
  @Prop() procedureId!: string;
  @Prop() apiBase!: string;

  @Event({ eventName: 'procedure-editor-closed' }) editorClosed!: EventEmitter<string>;

  @State() entry!: Procedure;
  @State() ambulances: Ambulance[] = [];
  @State() errorMessage = '';
  @State() isValid = false;

  private formElement!: HTMLFormElement;

  async componentWillLoad() {
    // Load ambulances list first, then procedure
    await Promise.all([this.loadAmbulances(), this.loadProcedure()]);
  }

  private async loadAmbulances() {
    try {
      const api = new AmbulanceManagementApi(
        new Configuration({ basePath: this.apiBase })
      );
      this.ambulances = await api.ambulancesGet();
    } catch (err: any) {
      console.error('Error loading ambulances:', err.message || err);
    }
  }

  private async loadProcedure() {
    this.errorMessage = '';

    if (this.procedureId === '@new') {
      this.entry = {
        id: '@new',
        description: '',
        patient: '',
        price: 0,
        visitType: 'Neschválená',
        payer: '',
        ambulanceId: '',
      };
      this.isValid = false;
      return;
    }

    if (!this.procedureId) {
      this.errorMessage = 'No procedure ID provided';
      this.isValid = false;
      return;
    }

    try {
      const api = new ProcedureManagementApi(
        new Configuration({ basePath: this.apiBase })
      );
      this.entry = await api.proceduresIdGet({ id: this.procedureId });
      this.isValid = true;
    } catch (err: any) {
      this.errorMessage = `Error loading procedure: ${err.message || 'unknown'}`;
      this.isValid = false;
    }
  }

  private handleInput(ev: Event) {
    const tgt = ev.target as HTMLInputElement | HTMLSelectElement;
    const { name, value } = tgt;

    if (name === 'price') {
      this.entry.price = parseFloat(value) || 0;
    } else {
      // @ts-ignore
      this.entry[name] = value;
    }

    this.isValid = this.formElement.checkValidity();
  }

  private async save() {
    this.errorMessage = '';
    try {
      const api = new ProcedureManagementApi(
        new Configuration({ basePath: this.apiBase })
      );

      if (this.procedureId === '@new') {
        const { id, ...createPayload } = this.entry;
        await api.proceduresPost({ procedure: createPayload as any });
      } else {
        await api.proceduresIdPut({ id: this.procedureId, procedure: this.entry });
      }

      this.editorClosed.emit('store');
    } catch (err: any) {
      this.errorMessage = `Save error: ${err.message || 'unknown'}`;
    }
  }

  private async deleteEntry() {
    this.errorMessage = '';
    try {
      const api = new ProcedureManagementApi(
        new Configuration({ basePath: this.apiBase })
      );
      await api.proceduresIdDelete({ id: this.procedureId });
      this.editorClosed.emit('delete');
    } catch (err: any) {
      this.errorMessage = `Delete error: ${err.message || 'unknown'}`;
    }
  }

  render() {
    if (this.errorMessage) {
      return (
        <Host>
          <div class="error">{this.errorMessage}</div>
        </Host>
      );
    }
    if (!this.entry) {
      return (
        <Host>
          <div class="loading">Načítavam...</div>
        </Host>
      );
    }

    return (
      <Host>
        <div class="form-container">
          <form ref={el => (this.formElement = el as HTMLFormElement)}>
            <md-filled-text-field
              name="description"
              label="Popis výkonu"
              required
              value={this.entry.description}
              onInput={ev => this.handleInput(ev)}
            />
            <md-filled-text-field
              name="patient"
              label="Pacient"
              required
              value={this.entry.patient}
              onInput={ev => this.handleInput(ev)}
            />
            <md-filled-text-field
              name="price"
              label="Cena"
              required
              value={this.entry.price}
              onInput={ev => this.handleInput(ev)}
            />
            <md-filled-text-field
              name="payer"
              label="Platca"
              required
              value={this.entry.payer}
              onInput={ev => this.handleInput(ev)}
            />



            {/* Select for existing ambulances */}
            <div class="field select-field">
              <label htmlFor="ambulanceId">Ambulancia</label>
              <select
                name="ambulanceId"
                id="ambulanceId"
                required
                onInput={ev => this.handleInput(ev)}
              >
                <option value="" disabled>Vyberte ambulanciu</option>
                {this.ambulances.map(amb => (
                  <option value={amb.id} key={amb.id}>{amb.name}</option>
                ))}
              </select>
            </div>
          </form>

          <md-divider inset />

          <div class="actions">
            <md-filled-tonal-button
              id="delete"
              disabled={this.procedureId === '@new'}
              onClick={() => this.deleteEntry()}
            >
              <md-icon slot="icon">delete</md-icon>
              Zmazať
            </md-filled-tonal-button>
            <span class="stretch-fill" />
            <md-outlined-button id="cancel" onClick={() => this.editorClosed.emit('cancel')}>
              Zrušiť
            </md-outlined-button>
            <md-filled-button
              id="confirm"
              disabled={!this.isValid}
              onClick={() => this.save()}
            >
              <md-icon slot="icon">save</md-icon>
              Uložiť
            </md-filled-button>
          </div>
        </div>
      </Host>
    );
  }
}
