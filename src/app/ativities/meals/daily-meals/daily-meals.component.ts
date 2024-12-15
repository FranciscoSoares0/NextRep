import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { IMeal } from '../../../interfaces/meal';
import { CategoryMealsComponent } from '../category-meals/category-meals.component';
import { AddMealComponent } from '../../../dialogs/add-meal/add-meal.component';
import { MatDialog } from '@angular/material/dialog';

import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MealsService } from '../../../services/meals';
import { AuthService } from '../../../services/auth';
import { IUser } from '../../../interfaces/user';
import { Timestamp } from 'firebase/firestore';
import { OnDestroy } from '@angular/core';
import { Subject,takeUntil } from 'rxjs';

@Component({
  selector: 'app-daily-meals',
  standalone: true,
  imports: [CommonModule,FormsModule, CategoryMealsComponent,MatDialogModule,MatButtonModule],
  templateUrl: './daily-meals.component.html',
  styleUrl: './daily-meals.component.css',
})
export class DailyMealsComponent implements OnInit,OnDestroy{

  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  authService = inject(AuthService);
  mealsService = inject(MealsService);

  @Input() userData : IUser = {
    uid:'',
    email: '',
    nome: '',
    apelido: '',
    altura:0,
    peso:0,
    objetivo:0,
    torax:0,
    cintura:0,
    quadril:0,
    coxa:0,
    braco:0,
    sexo:'',
    dataNascimento:Timestamp.now(),
    atividade:'',
    calorias:0,
    proteinas:0,
    gorduras:0,
    hidratos:0,
    agua:0,
    cor:'',
    lastLoginDate:Timestamp.now(),
    consecutiveDays:0,
  } 

  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedDateTime : Date = new Date(this.selectedDate);
  queryParams: any = {}; 
  userID : string = '';

  refeicoes : Array<IMeal> = [];
  pequenoAlmoco : Array<IMeal> = [];
  almoco : Array<IMeal> = [];
  jantar : Array<IMeal> = [];
  lanches : Array<IMeal> = [];

  totalCalorias: number = 0;
  totalProteinas: number = 0;
  totalGorduras: number = 0;
  totalHidratos: number = 0;

  restantesCalorias: number = 0;
  restantesProteinas: number = 0;
  restantesGorduras: number = 0;
  restantesHidratos: number = 0;

  $unsubscribe: Subject<void> = new Subject<void>();

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(takeUntil(this.$unsubscribe)).subscribe((params)=>{
      this.queryParams = params;
      if(params["data"]){
        this.selectedDate = params['data'];
        this.selectedDateTime = new Date(this.selectedDate);
      }
      this.authService.user$.pipe(takeUntil(this.$unsubscribe)).subscribe((user)=>{
        if(user){
          this.userID = user.uid;
          this.mealsService.getUserMealsByDay(this.userID,this.selectedDateTime).pipe(takeUntil(this.$unsubscribe)).subscribe((mealData)=>{
            // Reset arrays
            this.refeicoes = [];
            this.pequenoAlmoco = [];
            this.almoco = [];
            this.jantar = [];
            this.lanches = [];
            // Use reduce to group meals into categories
            // Group meals into their respective categories
            mealData.forEach((meal) => {
              this.refeicoes.push(meal);

              switch (meal.categoria) {
                case 'Breakfast':
                  this.pequenoAlmoco.push(meal);
                  break;
                case 'Lunch':
                  this.almoco.push(meal);
                  break;
                case 'Dinner':
                  this.jantar.push(meal);
                  break;
                case 'Snacks':
                  this.lanches.push(meal);
                  break;
                default:
                  console.warn(`Unknown category: ${meal.categoria}`, meal);
              }
            });

            // Calculate totals
          this.calculateTotals();
          this.calculateRestantes();
          })
        }
      })
      
    })
  }

  ngOnDestroy(): void {
    this.$unsubscribe.next();
    this.$unsubscribe.complete();
  }
  
  calculateTotals(): void {
    this.totalCalorias = this.refeicoes.reduce((sum, meal) => sum + (meal.calorias || 0), 0);
    this.totalProteinas = this.refeicoes.reduce((sum, meal) => sum + (meal.proteinas || 0), 0);
    this.totalGorduras = this.refeicoes.reduce((sum, meal) => sum + (meal.gorduras || 0), 0);
    this.totalHidratos = this.refeicoes.reduce((sum, meal) => sum + (meal.hidratos || 0), 0);
  }

  calculateRestantes(): void {
    this.restantesCalorias = this.userData.calorias! - this.totalCalorias;
    this.restantesProteinas = this.userData.proteinas! - this.totalProteinas;
    this.restantesGorduras = this.userData.gorduras! - this.totalGorduras;
    this.restantesHidratos = this.userData.hidratos! - this.totalHidratos;
  }

  
  onDateChange() {
    if (this.selectedDate) {
      this.router.navigate([], {
        queryParams: { data: this.selectedDate },
      });
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddMealComponent, {
      width: '500px',  // Define a largura do diálogo
      height:'100vh',
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      if (result) {
        const mealData = {
          product_name:result.nome,
          categoria:result.categoria,
          calorias:result.calorias,
          proteinas:result.proteinas,
          gorduras:result.gorduras,
          hidratos:result.hidratos,
          quantidade:result.quantidade,
          barcode:result.barcode,
          nutriments:result.nutriments,
          created: this.selectedDateTime,
        }
        console.log(mealData);

        this.mealsService.addMeal(this.userID,mealData).subscribe(()=>{});
        console.log('Dados da refeição:', result);  // Aqui você pode pegar os dados do formulário
      } else {
        console.log('O diálogo foi fechado sem dados');
      }
    });
  }

}
