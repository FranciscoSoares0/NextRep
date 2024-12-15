import { Component, Input, inject, Output, EventEmitter } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { ExercisesService } from '../../../services/exercises';
import { faDumbbell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { IExercise } from '../../../interfaces/exercise';
import { RouterLink } from '@angular/router';
import { CalendarService } from '../../../services/calendar';
import { WorkoutsService } from '../../../services/workouts';
import { Subject, takeUntil } from 'rxjs';
import { IWorkout } from '../../../interfaces/workout';
import { CardiosService } from '../../../services/cardio';
import { ICardio } from '../../../interfaces/cardio';

@Component({
  selector: 'app-workouts-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink],
  templateUrl: './workouts-card.component.html',
  styleUrl: './workouts-card.component.css',
})
export class WorkoutsCardComponent implements OnInit, OnDestroy {
  exercisesService = inject(ExercisesService);
  eventsService = inject(CalendarService);
  workoutsService = inject(WorkoutsService);
  exerciseService = inject(ExercisesService);
  cardiosService = inject(CardiosService);

  $unsubscribe: Subject<void> = new Subject<void>();

  @Output() caloriasGastasEvent = new EventEmitter<number>();
  sendDataToHomeComponent(calorias: any): void {
    this.caloriasGastasEvent.emit(calorias); // Emit data to HomeComponent
  }

  @Input() userID: string = '';
  exercises: Array<IExercise> = [];
  cardioExercises : Array<ICardio> = [];
  workoutID: string = '';
  todayWorkout: IWorkout = {
    id: '',
    nome: '',
    cor: '',
    exercicios: [],
  };
  totalVolume : number = 0;
  caloriasGastas : number = 0;

  faDumbbell = faDumbbell;

  ngOnInit(): void {
    this.eventsService
      .getTodaysEvents(this.userID)
      .pipe(takeUntil(this.$unsubscribe))
      .subscribe((events) => {
        if (events && events.length > 0) {
          this.workoutID = events[0].workoutid;
          this.workoutsService
            .getWorkoutByID(this.userID, this.workoutID)
            .pipe(takeUntil(this.$unsubscribe))
            .subscribe((workout) => {
              if (workout) {
                this.todayWorkout = workout;
                this.exerciseService
                  .getUserExercisesByWorkout(this.userID, this.workoutID)
                  .pipe(takeUntil(this.$unsubscribe))
                  .subscribe((exercises) => {
                    this.exercises = exercises;
                    this.totalVolume = this.CalculateTotalVolume(this.exercises);
                  });
                this.cardiosService.getUserCardioExercisesByWorkout(this.userID, this.workoutID).pipe(takeUntil(this.$unsubscribe)).subscribe((cardios)=>{
                  if(cardios){
                    this.cardioExercises = cardios;
                    cardios.map((cardio)=>{
                      this.caloriasGastas += cardio.calorias;
                    })
                    this.sendDataToHomeComponent(this.caloriasGastas);
                  }
                })
              }
            });
        }
      });
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
