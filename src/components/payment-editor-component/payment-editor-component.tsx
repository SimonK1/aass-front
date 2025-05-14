import { Component, Host, h, EventEmitter, Event, Prop, State } from '@stencil/core';
import { Payment, PaymentManagementApi, Configuration } from '../../api/ambulance';

@Component({
  tag: 'payment-editor-component',
  styleUrl: 'payment-editor-component.css',
  shadow: true,
})
export class PaymentEditorComponent {
  @Prop() paymentId!: string;
  @Prop() apiBase!: string;

  @Event({ eventName: 'payment-editor-closed' }) editorClosed!: EventEmitter<string>;

  @State() entry!: Payment;
  @State() errorMessage = '';
  @State() isValid = false;

  private formElement!: HTMLFormElement;

  async componentWillLoad() {
    await this.loadPayment();
  }

  private async loadPayment() {
    this.errorMessage = '';

    if (this.paymentId === '@new') {
      this.entry = {
        id: '@new',
        description: '',
        amount: 0,
        insurance: '',
        procedureId: '',
      };
      this.isValid = false;
      return;
    }

    if (!this.paymentId) {
      this.errorMessage = 'No payment ID provided';
      this.isValid = false;
      return;
    }

    try {
      const api = new PaymentManagementApi(
        new Configuration({ basePath: this.apiBase })
      );
      this.entry = await api.paymentsIdGet({ id: this.paymentId });
      this.isValid = true;
    } catch (err: any) {
      this.errorMessage = `Error loading payment: ${err.message || 'unknown'}`;
      this.isValid = false;
    }
  }

  private handleInput(ev: Event) {
    const tgt = ev.target as HTMLInputElement;
    const { name, value } = tgt;

    if (name === 'amount') {
      this.entry.amount = parseFloat(value) || 0;
    } else {
      // @ts-ignore
      this.entry[name] = value;
    }

    this.isValid = this.formElement.checkValidity();
  }

  private async save() {
    this.errorMessage = '';
    try {
      const api = new PaymentManagementApi(
        new Configuration({ basePath: this.apiBase })
      );

      if (this.paymentId === '@new') {
        const { id, ...createPayload } = this.entry;
        await api.paymentsPost({ payment: createPayload as any });
      } else {
        await api.paymentsIdPut({ id: this.paymentId, payment: this.entry });
      }

      this.editorClosed.emit('store');
    } catch (err: any) {
      this.errorMessage = `Save error: ${err.message || 'unknown'}`;
    }
  }

  private async deleteEntry() {
    this.errorMessage = '';
    try {
      const api = new PaymentManagementApi(
        new Configuration({ basePath: this.apiBase })
      );
      await api.paymentsIdDelete({ id: this.paymentId });
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
              label="Popis platby"
              required
              value={this.entry.description}
              onInput={ev => this.handleInput(ev)}
            />
            <md-filled-text-field
              name="amount"
              label="Suma"
              type="number"
              min="0"
              step="0.01"
              required
              value={String(this.entry.amount)}
              onInput={ev => this.handleInput(ev)}
            />
            <md-filled-text-field
              name="insurance"
              label="Poisťovňa"
              required
              value={this.entry.insurance}
              onInput={ev => this.handleInput(ev)}
            />
            <md-filled-text-field
              name="procedureId"
              label="ID výkonu"
              required
              value={this.entry.procedureId}
              onInput={ev => this.handleInput(ev)}
            />
          </form>

          <md-divider inset />

          <div class="actions">
            <md-filled-tonal-button
              id="delete"
              disabled={this.paymentId === '@new'}
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
