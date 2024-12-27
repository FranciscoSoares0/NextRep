import { Component, Input, inject } from '@angular/core';
import { IExercise } from '../../../../interfaces/exercise';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPen,
  faTrash,
  faMagnifyingGlassChart,
  faComment,
} from '@fortawesome/free-solid-svg-icons';
import { AddExerciseComponent } from '../../../../dialogs/add-exercise/add-exercise.component';
import { Timestamp } from 'firebase/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ExercisesService } from '../../../../services/exercises';
import { ExerciseUpdateService } from '../../../../services/exerciseUpdate';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-weigth-training',
  standalone: true,
  imports: [FontAwesomeModule,AddExerciseComponent,RouterLink,CommonModule,MatTooltipModule],
  templateUrl: './weigth-training.component.html',
  styleUrl: './weigth-training.component.css'
})
export class WeigthTrainingComponent {

  dialog = inject(MatDialog);
  exercisesService = inject(ExercisesService);
  exerciseUpdateService = inject(ExerciseUpdateService);
  
  @Input() exercises : Array<IExercise> = [];
  @Input() userID : string = '';
  @Input() workoutID : string = '';
  @Input() totalVolume : number = 0;

  faPen = faPen;
  faTrash = faTrash;
  faMagnifyingGlassChart = faMagnifyingGlassChart;
  faComment = faComment;

  openDialog(): void {
    const dialogRef = this.dialog.open(AddExerciseComponent, {
      width: '500px',  // Define a largura do diálogo
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const exerciseData = {
          nome:result.nome,
          series:result.series,
          repeticoes:result.repeticoes,
          pesoAtual:result.pesoAtual,
          nota:result.nota,
          created : Timestamp.now(),
        }

        this.exercisesService.addExercise(this.userID,this.workoutID,exerciseData).subscribe(()=>{});
      } else {
        console.log('O diálogo foi fechado sem dados');
      }
    });
  }

  EditExercise(exerciseID:string | undefined,exercicioData:IExercise){
    const dialogRef = this.dialog.open(AddExerciseComponent, {
      width: '500px',  // Define a largura do diálogoas
      data:{
        exercicio:exercicioData,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const exerciseData = {
          nome:result.nome,
          series:result.series,
          repeticoes:result.repeticoes,
          pesoAtual:result.pesoAtual,
          nota:result.nota,
        }

        const exerciseUpdateData = {
          series : exercicioData.series,
          repeticoes : exercicioData.repeticoes,
          peso : exercicioData.pesoAtual,
          nota: exercicioData.nota,
          created : exercicioData.created,
          exerciseid : exerciseID!,
        }

        this.exercisesService.updateExercise(this.userID,this.workoutID,exerciseID!,exerciseData).subscribe(()=>{
          this.exerciseUpdateService.addUpdate(this.userID,this.workoutID,exerciseID!,exerciseUpdateData).subscribe(()=>{});
        });
      }
    });
  }

  DeleteExercise(exerciseID:string | undefined){
    this.exercisesService.deleteExercise(this.userID,this.workoutID,exerciseID!).subscribe(()=>{});
  }

}
