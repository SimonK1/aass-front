import { Component, Host, h, EventEmitter, Event, Prop, State } from '@stencil/core';
import { Ambulance, AmbulanceManagementApi, Configuration } from '../../api/ambulance';

@Component({
  tag: 'ambulance-editor-component',
  styleUrl: 'ambulance-editor-component.css',
  shadow: true,
})
export class AmbulanceEditorComponent {
  @Prop() ambulanceId: string;
  @Prop() apiBase: string;

  @Event({ eventName: 'editor-closed' }) editorClosed: EventEmitter<string>;

  @State() entry!: Ambulance;
  @State() errorMessage = '';
  @State() isValid = false;

  private formElement!: HTMLFormElement;
  private statuses = ['Dostupná', 'Occupied', 'Maintenance'];

  async componentWillLoad() {
    await this.loadAmbulance();
  }

  private async loadAmbulance() {
    this.errorMessage = '';
    if (this.ambulanceId === '@new') {
      this.entry = {
        id: '@new',
        name: '',
        location: '',
        department: '',
        capacity: 1,
        status: this.statuses[0],
      };
      this.isValid = false;
      return;
    }
    if (!this.ambulanceId) {
      this.errorMessage = 'No ambulance ID provided';
      this.isValid = false;
      return;
    }

    try {
      const api = new AmbulanceManagementApi(
        new Configuration({ basePath: this.apiBase })
      );
      this.entry = await api.ambulancesIdGet({ id: this.ambulanceId });
      this.isValid = true;
    } catch (err: any) {
      this.errorMessage = `Error loading ambulance: ${err.message || 'unknown'}`;
      this.isValid = false;
    }
  }

  private handleInput(ev: Event) {
    const tgt = ev.target as HTMLInputElement | HTMLSelectElement;
    const { name, value } = tgt;

    if (name === 'capacity') {
      this.entry.capacity = parseInt(value, 10) || 1;
    } else {
      // @ts-ignore
      this.entry[name] = value;
    }

    this.isValid = this.formElement.checkValidity();
  }

  private async save() {
    this.errorMessage = '';
    try {
      const api = new AmbulanceManagementApi(
        new Configuration({ basePath: this.apiBase })
      );
      if (this.ambulanceId === '@new') {
        // Create new ambulance, stripping out `id` so server assigns one
        const { id, ...createPayload } = this.entry;
        // Cast to any to satisfy generated API signature
        await api.ambulancesPost({ ambulance: createPayload as any });
      } else {
        await api.ambulancesIdPut({ id: this.ambulanceId, ambulance: this.entry });
      }
      this.editorClosed.emit('store');
    } catch (err: any) {
      this.errorMessage = `Save error: ${err.message || 'unknown'}`;
    }
  }

  private async deleteEntry() {
    this.errorMessage = '';
    try {
      const api = new AmbulanceManagementApi(
        new Configuration({ basePath: this.apiBase })
      );
      await api.ambulancesIdDelete({ id: this.ambulanceId });
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
            name="name"
            label="Názov ambulancie"
            required
            value={this.entry.name}
            onInput={ev => this.handleInput(ev)}
          />

          <md-filled-text-field
            name="location"
            label="Adresa"
            required
            value={this.entry.location}
            onInput={ev => this.handleInput(ev)}
          />

          <md-filled-text-field
            name="department"
            label="Oddelenie"
            required
            value={this.entry.department}
            onInput={ev => this.handleInput(ev)}
          />

          <md-filled-text-field
            name="capacity"
            label="Kapacita"
            type="number"
            min="1"
            required
            value={String(this.entry.capacity)}
            onInput={ev => this.handleInput(ev)}
          />


          <md-filled-text-field
            name="status"
            label="Status ambulancie"
            required
            value={this.entry.status}
            onInput={ev => this.handleInput(ev)}
          />


        </form>

        <md-divider inset />

        <div class="actions">
          <md-filled-tonal-button
            id="delete"
            disabled={this.ambulanceId === '@new'}
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