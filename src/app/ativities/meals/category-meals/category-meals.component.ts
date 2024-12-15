import { Component,Input, inject } from '@angular/core';
import { IMeal } from '../../../interfaces/meal';
import { DailyMealsComponent } from '../daily-meals/daily-meals.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus,faTrash, faPen} from '@fortawesome/free-solid-svg-icons';
import { AddMealComponent } from '../../../dialogs/add-meal/add-meal.component';
import { MatDialog } from '@angular/material/dialog';
import { MealsService } from '../../../services/meals';

@Component({
  selector: 'app-category-meals',
  standalone: true,
  imports: [DailyMealsComponent,CommonModule,FontAwesomeModule],
  templateUrl: './category-meals.component.html',
  styleUrl: './category-meals.component.css'
})
export class CategoryMealsComponent {

  dialog = inject(MatDialog);
  mealService = inject(MealsService);

  @Input() categoria : string = '';
  @Input() userID : string = '';
  @Input() refeicoes : Array<IMeal> = [];

  faPlus = faPlus;
  faTrash = faTrash;
  faPen = faPen;

  EditUpdate(mealID:string | undefined,refeicaoData:IMeal){
    const dialogRef = this.dialog.open(AddMealComponent, {
      width: '500px',  // Define a largura do diálogoas
      height:'100vh',
      data:{
        refeicao:refeicaoData,
      },
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const mealData = {
          nome:result.nome,
          categoria:result.categoria,
          calorias:result.calorias,
          proteinas:result.proteinas,
          gorduras:result.gorduras,
          hidratos:result.hidratos,
        }
        this.mealService.updateMeal(this.userID,mealID!,mealData).subscribe(()=>{});
      }
    });
  }

  DeleteUpdate(mealID:string | undefined){
    this.mealService.deleteMeal(this.userID,mealID!).subscribe(()=>{});
  }
}
