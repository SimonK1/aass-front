// import { Component, Host, h, EventEmitter, Event, Prop, State } from '@stencil/core';
// import { Procedure, ProcedureManagementApi, Configuration } from '../../api/ambulance';

// @Component({
//   tag: 'procedure-editor-component',
//   styleUrl: 'procedure-editor-component.css',
//   shadow: true,
// })

// export class AmbulanceEditorComponent {
//   @Prop() procedureId: string;
//   @Prop() apiBase: string;

//   @Event({ eventName: 'editor-closed' }) editorClosed: EventEmitter<string>;

//   @State() entry: Procedure;
//   @State() errorMessage: string;
//   @State() isValid: boolean;

//   private formElement: HTMLFormElement;

//   async componentWillLoad() {
//     this.getProceduereAsync();
//   }

//   private async getProceduereAsync(): Promise<Procedure> {
//     console.log(this.procedureId);
//     if (this.procedureId === '@new') {
//       this.isValid = false;
//       this.entry = {
//         id: '@new',
//         visitType: '',
//         price:'',

//       };
//       return this.entry;
//     }
//     if (!this.procedureId) {
//       this.isValid = false;
//       return undefined;
//     }
//     try {
//       const configuration = new Configuration({
//         basePath: this.apiBase,
//       });

//       const procedureApi = new ProcedureManagementApi(configuration);

//       const response = await procedureApi.getProcedureByIdRaw({ procedureId: this.procedureId });

//       if (response.raw.status < 299) {
//         this.entry = await response.value();
//         this.isValid = true;
//       } else {
//         this.errorMessage = `Cannot retrieve procedure with id ${this.procedureId}: ${response.raw.statusText}`;
//       }
//     } catch (err: any) {
//       this.errorMessage = `Cannot retrieve procedure with id ${this.procedureId}: ${err.message || 'unknown'}`;
//     }
//     return undefined;
//   }

//   render() {
//     if (this.errorMessage) {
//       return (
//         <Host>
//           <div class="error">{this.errorMessage}</div>
//         </Host>
//       );
//     }
//     return (
//       <Host>
//         <form ref={el => this.formElement = el}>
//           <md-filled-text-field label="Typ procedúry"
//                                 required value={this.entry?.visitType}
//                                 oninput={(ev: InputEvent) => {
//                                   if (this.entry) {
//                                     this.entry.visitType = this.handleInputEvent(ev);
//                                   }
//                                 }}>
//             <md-icon slot="leading-icon">person</md-icon>
//           </md-filled-text-field>

//           <md-filled-text-field label="Pacient"
//                                 required value={this.entry?.patient}
//                                 oninput={(ev: InputEvent) => {
//                                   if (this.entry) {
//                                     this.entry.patient = this.handleInputEvent(ev);
//                                   }
//                                 }}>
//             <md-icon slot="leading-icon">fingerprint</md-icon>
//           </md-filled-text-field>

//           <md-filled-text-field label="Platca"
//                                 required value={this.entry?.payer}
//                                 oninput={(ev: InputEvent) => {
//                                   if (this.entry) {
//                                     this.entry.payer = this.handleInputEvent(ev);
//                                   }
//                                 }}>
//             <md-icon slot="leading-icon">fingerprint</md-icon>
//           </md-filled-text-field>

//         </form>

//         <md-divider inset></md-divider>

//         <div class="actions">
//           <md-filled-tonal-button id="delete" disabled={!this.entry}
//                                   onClick={() => this.deleteEntry()}>
//             <md-icon slot="icon">delete</md-icon>
//             Zmazať
//           </md-filled-tonal-button>
//           <span class="stretch-fill"></span>
//           <md-outlined-button id="cancel"
//                               onClick={() => this.editorClosed.emit('cancel')}>
//             Zrušiť
//           </md-outlined-button>
//           <md-filled-button id="confirm" disabled={!this.isValid}
//                             onClick={() => this.updateEntry()}
//           >
//             <md-icon slot="icon">save</md-icon>
//             Uložiť
//           </md-filled-button>
//         </div>
//       </Host>
//     );
//   }

//   private handleInputEvent(ev: InputEvent): string {
//     const target = ev.target as HTMLInputElement;
//     // check validity of elements
//     this.isValid = true;
//     for (let i = 0; i < this.formElement.children.length; i++) {
//       const element = this.formElement.children[i];
//       if ('reportValidity' in element) {
//         const valid = (element as HTMLInputElement).reportValidity();
//         this.isValid &&= valid;
//       }
//     }
//     return target.value;
//   }


//   private async updateEntry() {
//     try {
//       const configuration = new Configuration({
//         basePath: this.apiBase,
//       });

//       const ambulanceApi = new ProcedureManagementApi(configuration);

//       const response = this.procedureId == '@new' ?
//         await ambulanceApi.createProcedureRaw({ procedure: this.entry }) :
//         await ambulanceApi.updateProcedureRaw({
//           procedureId: this.procedureId,
//           procedure: this.entry,
//         });

//       if (response.raw.status < 299) {
//         this.editorClosed.emit('store');
//       } else {
//         this.errorMessage = `Cannot store entry: ${response.raw.statusText}`;
//       }
//     } catch (err: any) {
//       this.errorMessage = `Cannot store entry: ${err.message || 'unknown'}`;
//     }
//   }

//   private async deleteEntry() {
//     try {
//       const configuration = new Configuration({
//         basePath: this.apiBase,
//       });

//       const ambulanceApi = new ProcedureManagementApi(configuration);

//       const response = await ambulanceApi.deleteProcedureRaw({ procedureId: this.procedureId });
//       if (response.raw.status < 299) {
//         this.editorClosed.emit('delete');
//       } else {
//         this.errorMessage = `Cannot delete entry: ${response.raw.statusText}`;
//       }
//     } catch (err: any) {
//       this.errorMessage = `Cannot delete entry: ${err.message || 'unknown'}`;
//     }
//   }
// }
