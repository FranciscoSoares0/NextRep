import { Component , inject} from '@angular/core';
import { NavBarComponent } from '../../../layouts/nav-bar/nav-bar.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OnInit } from '@angular/core';
import { ExercisesService } from '../../../services/exercises';
import { AuthService } from '../../../services/auth';
import { IExercise } from '../../../interfaces/exercise';
import { AddExerciseComponent } from '../../../dialogs/add-exercise/add-exercise.component';
import {
  faCircleChevronLeft,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { WorkoutsService } from '../../../services/workouts';
import { OnDestroy } from '@angular/core';
import { Subject,takeUntil } from 'rxjs';
import { ExerciseUpdateService } from '../../../services/exerciseUpdate';
import { WeigthTrainingComponent } from './weigth-training/weigth-training.component';
import { CardioComponent } from './cardio/cardio.component';
import { ICardio } from '../../../interfaces/cardio';
import { CardiosService } from '../../../services/cardio';

@Component({
  selector: 'app-workout',
  standalone: true,
  imports: [NavBarComponent,AddExerciseComponent,FontAwesomeModule,CommonModule,RouterLink,WeigthTrainingComponent,CardioComponent],
  templateUrl: './workout.component.html',
  styleUrl: './workout.component.css'
})
export class WorkoutComponent implements OnInit,OnDestroy {

  route = inject(ActivatedRoute);
  auth = inject(AuthService);
  workoutsService = inject(WorkoutsService);
  exercisesService = inject(ExercisesService);
  exerciseUpdateService = inject(ExerciseUpdateService);
  cardiosService = inject(CardiosService);

  workoutID : string = '';
  workoutName : string = '';
  workoutColor : string = '';
  userID : string = '';
  exercises : Array<IExercise> = [];
  totalVolume : number = 0;

  cardioExercises : Array<ICardio> = [];

  $unsubscribe: Subject<void> = new Subject<void>();
  
  faCircleChevronLeft = faCircleChevronLeft;

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.$unsubscribe)).subscribe((val) => {
      if(val){
        this.workoutID = val['workoutid'];
        this.auth.user$.subscribe((user)=>{
          if(user){
            this.userID = user.uid;
            this.workoutsService.getWorkoutByID(this.userID,this.workoutID).pipe(takeUntil(this.$unsubscribe)).subscribe((workout)=>{
              if(workout){
                this.workoutName = workout.nome;
                this.workoutColor = workout.cor;
                this.exercisesService.getUserExercisesByWorkout(this.userID,this.workoutID).pipe(takeUntil(this.$unsubscribe)).subscribe((exercises)=>{
                  if(exercises){
                    this.exercises = exercises;
                    this.totalVolume = this.CalculateTotalVolume(this.exercises);
                  }
                  this.cardiosService.getUserCardioExercisesByWorkout(this.userID,this.workoutID).pipe(takeUntil(this.$unsubscribe)).subscribe((cardios)=>{
                    if(cardios){
                      this.cardioExercises = cardios;
                    }
                  })

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

  CalculateTotalVolume(exercises:Array<IExercise>):number{
    let totalVolume = 0;
    exercises.map((exercise)=>{
      totalVolume += exercise.series * exercise.repeticoes * exercise.pesoAtual;
    })
    return totalVolume;
  }

}
