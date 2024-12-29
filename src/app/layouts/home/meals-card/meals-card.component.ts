import { Component, inject, Input,OnChanges, SimpleChanges } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  NgCircleProgressModule,
  CircleProgressOptions,
} from 'ng-circle-progress';
import { MealsService } from '../../../services/meals';
import { AuthService } from '../../../services/auth';
import { IMeal } from '../../../interfaces/meal';
import { faFlag, faUtensils, faFireFlameCurved, faGlassWater,faPersonRunning } from '@fortawesome/free-solid-svg-icons';
import { OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject,takeUntil } from 'rxjs';

@Component({
  selector: 'app-meals-card',
  standalone: true,
  imports: [FontAwesomeModule, NgCircleProgressModule,CommonModule],
  templateUrl: './meals-card.component.html',
  styleUrl: './meals-card.component.css',
  providers: [
    {
      provide: CircleProgressOptions,
      useValue: {
        backgroundPadding: 7,
        radius: 50,
        space: -2,
        outerStrokeWidth: 10,
        outerStrokeColor: '#004AAD',
        innerStrokeColor: 'whitesmoke',
        innerStrokeWidth: 5,
        title: [0],
        subtitle: ['RESTANTES'],
        titleFontSize: 24,
        subtitleFontSize: 18,
        titleColor: '#212529',
        subtitleColor: '#212529',
        backgroundColor: 'white',
        animateTitle: false,
        animationDuration: 1000,
        showUnits: false,
      },
    },
  ],
})
export class MealsCardComponent implements OnInit,OnDestroy,OnChanges {
  authService = inject(AuthService);
  mealsService = inject(MealsService);

  @Input() userID: string = '';
  @Input() calorias: number = 0;
  @Input() proteinas: number = 0;
  @Input() gorduras: number = 0;
  @Input() hidratos: number = 0;
  @Input() agua: number = 0;
  @Input() caloriasCardio: number = 0;
  currentDate: Date = new Date;

  refeicoes: Array<IMeal> = [];
  usadasCalorias: number = 0;
  usadasProteinas: number = 0;
  usadasGorduras: number = 0;
  usadasHidratos: number = 0;

  restantesCalorias: number = 0;
  restantesProteinas: number = 0;
  restantesGorduras: number = 0;
  restantesHidratos: number = 0;

  percentage: number = 0;
  percentageProteinas: number = 0;
  percentageGorduras: number = 0;
  percentageHidratos: number = 0;

  faFlag = faFlag;
  faUtensils = faUtensils;
  faFireFlameCurved = faFireFlameCurved;
  faGlassWater = faGlassWater;
  faPersonRunning = faPersonRunning;

  $unsubscribe: Subject<void> = new Subject<void>();

  ngOnInit(): void {
    this.mealsService
      .getUserMealsByDay(this.userID, this.currentDate)
      .pipe(takeUntil(this.$unsubscribe))
      .subscribe((meals) => {
        this.refeicoes = meals;
        this.calculateTotals();
        this.calculateRestantes();
        this.calculatePercentagens();
      });
  }

  ngOnDestroy(): void {
    this.$unsubscribe.next();
    this.$unsubscribe.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Recalculate remaining calories if caloriasCardio changes
    if (changes['caloriasCardio']) {
      this.calculateRestantes(); // Recalculate when inputs change
      this.calculatePercentagens();
    }
  }

  calculateTotals(): void {
    this.usadasCalorias = this.refeicoes.reduce(
      (sum, meal) => sum + (meal.calorias || 0),
      0
    );
    this.usadasProteinas = this.refeicoes.reduce(
      (sum, meal) => sum + (meal.proteinas || 0),
      0
    );
    this.usadasGorduras = this.refeicoes.reduce(
      (sum, meal) => sum + (meal.gorduras || 0),
      0
    );
    this.usadasHidratos = this.refeicoes.reduce(
      (sum, meal) => sum + (meal.hidratos || 0),
      0
    );
  }

  calculateRestantes(): void {
    this.restantesCalorias = this.calorias - this.usadasCalorias + this.caloriasCardio;
    this.restantesProteinas = this.proteinas - this.usadasProteinas;
    this.restantesGorduras = this.gorduras - this.usadasGorduras;
    this.restantesHidratos = this.hidratos - this.usadasHidratos;
  }

  calculatePercentagens(): void {
    this.percentage = (this.usadasCalorias / (this.calorias+ this.caloriasCardio)) * 100;
    this.percentageProteinas = (this.usadasProteinas / this.proteinas) * 100;
    this.percentageGorduras = (this.usadasGorduras / this.gorduras) * 100;
    this.percentageHidratos = (this.usadasHidratos / this.hidratos) * 100;
  }

}
