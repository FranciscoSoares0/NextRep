import { Component,Input, inject } from '@angular/core';
import { ICardio } from '../../../../interfaces/cardio';
import { CardiosService } from '../../../../services/cardio';
import { MatDialog } from '@angular/material/dialog';
import { Timestamp } from 'firebase/firestore';
import { CommonModule } from '@angular/common';
import { AddCardioComponent } from '../../../../dialogs/add-cardio/add-cardio.component';
import {
  faPen,
  faTrash,
  faComment
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-cardio',
  standalone: true,
  imports: [CommonModule,AddCardioComponent,FontAwesomeModule,MatTooltipModule],
  templateUrl: './cardio.component.html',
  styleUrl: './cardio.component.css'
})
export class CardioComponent {

  cardiosService = inject(CardiosService);
  dialog = inject(MatDialog);

  @Input() cardioExercises: Array<ICardio> = [];
  @Input() userID : string = '';
  @Input() workoutID : string = '';

  faPen = faPen;
  faTrash = faTrash;
  faComment = faComment;

  openDialog(): void {
    const dialogRef = this.dialog.open(AddCardioComponent, {
      width: '500px',  // Define a largura do diálogo
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const exerciseData = {
          nome:result.nome,
          minutos:result.minutos,
          calorias:result.calorias,
          nota:result.nota,
          created : Timestamp.now(),
        }

        this.cardiosService.addCardioExercise(this.userID,this.workoutID,exerciseData).subscribe(()=>{});
      }
    });
  }

  EditExercise(exerciseID:string | undefined,exercicioData:ICardio){
    const dialogRef = this.dialog.open(AddCardioComponent, {
      width: '500px',  // Define a largura do diálogoas
      data:{
        exercicio:exercicioData,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const exerciseData = {
          nome:result.nome,
          minutos:result.minutos,
          calorias:result.calorias,
          nota:result.nota
        }

        const exerciseUpdateData = {
          nome : exercicioData.nome,
          minutos : exercicioData.minutos,
          calorias : exercicioData.calorias,
          nota: exercicioData.nota,
          created : Timestamp.now(),
          exerciseid : exerciseID!,
        }

        this.cardiosService.updateCardioExercise(this.userID,this.workoutID,exerciseID!,exerciseData).subscribe(()=>{});
      }
    });
  }

  DeleteExercise(exerciseID:string | undefined){
    this.cardiosService.deleteCardioExercise(this.userID,this.workoutID,exerciseID!).subscribe(()=>{});
  }
}
