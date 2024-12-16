import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IExercise } from '../../interfaces/exercise';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-add-exercise',
  templateUrl: './add-exercise.component.html',
  styleUrls: ['./add-exercise.component.css'],
  imports :[ReactiveFormsModule,CommonModule],
  standalone:true
})
export class AddExerciseComponent {

  exerciseForm: FormGroup;
  exercicio : IExercise = {
    nome:'',
    series:0,
    repeticoes:0,
    pesoAtual:0,
    id:'',
    created:Timestamp.now()
  };

  formType: string = 'Add';

  constructor(
    public dialogRef: MatDialogRef<AddExerciseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {exercicio : IExercise} | null,
    private fb: FormBuilder
  ) {
    if(data?.exercicio){
      this.exercicio = data.exercicio;
      this.formType = "Edit";
    }

    this.exerciseForm = this.fb.group({
      nome: [this.exercicio.nome || '', Validators.required],
      series: [this.exercicio.series || '', [Validators.required, Validators.min(1)]],
      repeticoes: [this.exercicio.repeticoes || '', [Validators.required, Validators.min(0)]],
      pesoAtual: [this.exercicio.pesoAtual || '', [Validators.required, Validators.min(0)]],
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
