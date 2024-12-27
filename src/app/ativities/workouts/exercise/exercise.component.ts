import { Component, inject } from '@angular/core';
import { NavBarComponent } from '../../../layouts/nav-bar/nav-bar.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { WorkoutsService } from '../../../services/workouts';
import { ExercisesService } from '../../../services/exercises';
import { OnInit,OnDestroy } from '@angular/core';
import { Subject,takeUntil } from 'rxjs';
import { IExercise } from '../../../interfaces/exercise';
import { Timestamp } from 'firebase/firestore';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCircleChevronLeft,
  faComment
} from '@fortawesome/free-solid-svg-icons';
import { ExerciseUpdateService } from '../../../services/exerciseUpdate';
import { IExerciseUpdate } from '../../../interfaces/exerciseUpdate';
import { CommonModule } from '@angular/common';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-exercise',
  standalone: true,
  imports: [NavBarComponent,FontAwesomeModule,RouterLink,CommonModule,MatTooltipModule],
  templateUrl: './exercise.component.html',
  styleUrl: './exercise.component.css'
})
export class ExerciseComponent implements OnInit, OnDestroy{

  dialog = inject(MatDialog);
  route = inject(ActivatedRoute);
  auth = inject(AuthService);
  workoutsService = inject(WorkoutsService);
  exercisesService = inject(ExercisesService);
  exerciseUpdateService = inject(ExerciseUpdateService);

  userID : string = '';
  workoutID : string = '';
  exerciseID : string = '';
  exerciseUpdates : Array<IExerciseUpdate> = [];

  exercise : IExercise = {
    id : '',
    nome:'',
    series:0,
    repeticoes:0,
    pesoAtual:0,
    nota:'',
    created : Timestamp.now()
  }

  faCircleChevronLeft = faCircleChevronLeft;
  faComment = faComment;

  $unsubscribe: Subject<void> = new Subject<void>();

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.$unsubscribe)).subscribe((val) => {
      console.log(val)
      if(val){
        this.workoutID = val['workoutid'];
        this.exerciseID = val['exerciseid'];
        this.auth.user$.pipe(takeUntil(this.$unsubscribe)).subscribe((user)=>{
          if(user){
            this.userID = user.uid;
            this.exercisesService.getExerciseByID(user.uid,this.workoutID,this.exerciseID).pipe(takeUntil(this.$unsubscribe)).subscribe((exercise)=>{
              console.log(exercise);
              if(exercise){
                this.exercise = exercise;
                this.exerciseUpdateService.getUserUpdatesByExercise(this.userID,this.workoutID,this.exerciseID).pipe(takeUntil(this.$unsubscribe)).subscribe((exerciseUpdates)=>{
                  if(exerciseUpdates)
                    this.exerciseUpdates = exerciseUpdates;
                  console.log(exerciseUpdates);
                })
              }
            })
          }
            
        })
        

        
      }
    })
  }

  ngOnDestroy(): void {
    this.$unsubscribe.next();
    this.$unsubscribe.complete();
  }

  calcularVolumeExercicio(series:number,repeticoes:number,peso:number){
    return series * repeticoes * peso;
  }

}
