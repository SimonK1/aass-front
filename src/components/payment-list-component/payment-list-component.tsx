import { Component, Event, EventEmitter, Host, h, Prop, State } from '@stencil/core';
import { Payment, PaymentManagementApi, Configuration } from '../../api/ambulance';

@Component({
  tag: 'payment-list-component',
  styleUrl: 'payment-list-component.css',
  shadow: true,
})
export class PaymentListComponent {
  @Prop() apiBase!: string;

  @Event({ eventName: 'payment-clicked' }) paymentClicked!: EventEmitter<string>;

  @State() payments: Payment[] = [];
  @State() isLoading = false;
  @State() errorMessage = '';

  private get apiClient(): PaymentManagementApi {
    return new PaymentManagementApi(new Configuration({ basePath: this.apiBase }));
  }

  async componentWillLoad() {
    await this.fetchPayments();
  }

  private async fetchPayments() {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const resp = await this.apiClient.paymentsGetRaw();
      if (!resp.raw.ok) {
        throw new Error(resp.raw.statusText || 'Unknown error');
      }
      this.payments = await resp.value();
    } catch (err: any) {
      this.errorMessage = `Unable to load payments: ${err.message}`;
      this.payments = [];
    } finally {
      this.isLoading = false;
    }
  }

  private onRefresh = () => this.fetchPayments();

  private onAddNew = () => this.paymentClicked.emit('@new');
  private onEdit = (id: string) => () => this.paymentClicked.emit(id);

  render() {
    return (
      <Host>
        {this.errorMessage && <div class="error">{this.errorMessage}</div>}

        {this.isLoading ? (
          <div class="loading-spinner">Loading...</div>
        ) : (
          <div class="table-container">
            <div class="name-container">
            <h2>Payments</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Insurance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {this.payments.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.description}</td>
                    <td>{p.amount}</td>
                    <td>{p.insurance}</td>
                    <td class="actions-cell">
                      <md-filled-icon-button class="icon-btn" onClick={this.onEdit(p.id)}>
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
                Refresh List
              </button>
            </div>
          </div>
        )}
      </Host>
    );
  }
}
