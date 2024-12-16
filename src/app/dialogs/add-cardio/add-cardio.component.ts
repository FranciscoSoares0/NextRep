import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Timestamp } from 'firebase/firestore';
import { ICardio } from '../../interfaces/cardio';

@Component({
  selector: 'app-add-cardio',
  templateUrl: './add-cardio.component.html',
  styleUrls: ['./add-cardio.component.css'],
  imports :[ReactiveFormsModule,CommonModule],
  standalone:true
})
export class AddCardioComponent {

  exerciseForm: FormGroup;
  exercicio : ICardio = {
    nome:'',
    minutos:0,
    calorias:0,
    id:'',
    created:Timestamp.now()
  };

  formType: string = 'Add';

  constructor(
    public dialogRef: MatDialogRef<AddCardioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {exercicio : ICardio} | null,
    private fb: FormBuilder
  ) {
    if(data?.exercicio){
      this.exercicio = data.exercicio;
      this.formType = "Edit";
    }

    this.exerciseForm = this.fb.group({
      nome: [this.exercicio.nome || '', Validators.required],
      minutos: [this.exercicio.minutos || '', [Validators.required, Validators.min(0)]],
      calorias: [this.exercicio.calorias || '', [Validators.required, Validators.min(1)]],
    });
  }

  get fc() {
    return this.exerciseForm.controls;
  }

  // Método para fechar o diálogo sem fazer nada
  onNoClick(): void {
    this.dialogRef.close();
  }

  // Método para enviar o formulário
  onSubmit(): void {
    if (this.exerciseForm.valid) {
      this.dialogRef.close(this.exerciseForm.value);  // Envia os dados do formulário de volta
    }
  }
}
