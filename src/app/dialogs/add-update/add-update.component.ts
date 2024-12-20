import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IUpdate } from '../../interfaces/update';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-add-update',
  templateUrl: './add-update.component.html',
  styleUrls: ['./add-update.component.css'],
  imports :[ReactiveFormsModule,CommonModule],
  standalone:true
})
export class AddUpdateComponent {

  updateForm: FormGroup;
  update : IUpdate = {
    novoPeso:0,
    created: Timestamp.now(),
    torax:0,
    quadril:0,
    cintura:0,
    braco:0,
    coxa:0,
    id:''
  };

  formType: string = 'Add';

  constructor(
    public dialogRef: MatDialogRef<AddUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {update : IUpdate} | null,
    private fb: FormBuilder
  ) {
    if(data?.update){
      this.update = data.update;
      this.formType = "Edit";
    }

    this.updateForm = this.fb.group({
      novoPeso: [this.update.novoPeso || null, [Validators.required, Validators.min(1)]],
      torax: [this.update.torax || null, [Validators.min(1)]],
      quadril: [this.update.quadril || null, [Validators.min(1)]],
      cintura: [this.update.cintura || null, [Validators.min(1)]],
      braco: [this.update.braco || null, [Validators.min(1)]],
      coxa: [this.update.coxa || null, [ Validators.min(1)]],
    });
  }

  get fc() {
    return this.updateForm.controls;
  }

  // Método para fechar o diálogo sem fazer nada
  onNoClick(): void {
    this.dialogRef.close();
  }

  // Método para enviar o formulário
  onSubmit(): void {
    if (this.updateForm.valid) {
      this.dialogRef.close(this.updateForm.value);  // Envia os dados do formulário de volta
    }
  }
  
}
