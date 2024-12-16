import { Component, Inject, inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IMeal } from '../../interfaces/meal';
import { Observable,Subject,takeUntil} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { IFoodProduct } from '../../interfaces/foodProduct';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faBarcode } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { OpenFoodFactsService } from '../../services/openFoodFacts';

@Component({
  selector: 'app-add-meal',
  templateUrl: './add-meal.component.html',
  styleUrls: ['./add-meal.component.css'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatAutocompleteModule,
    MatInputModule,
    MatInputModule,
    MatFormFieldModule,
    MatListModule,
    FontAwesomeModule,
  ],
  standalone: true,
})
export class AddMealComponent implements OnDestroy {
  $unsubscribe: Subject<void> = new Subject<void>();

  filteredFoods: Observable<IFoodProduct[]> = new Observable<IFoodProduct[]>();
  selectedFood: IFoodProduct | null = null;

  http = inject(HttpClient);
  toastr = inject(ToastrService);
  openFoodFactsService = inject(OpenFoodFactsService);

  faSearch = faSearch;
  faBarcode = faBarcode;

  mealForm: FormGroup;
  refeicao: IMeal = {
    product_name: '',
    barcode: '',
    categoria: '',
    quantidade: 0,
    calorias: 0,
    proteinas: 0,
    gorduras: 0,
    hidratos: 0,
  };

  formType: string = 'Add';

  constructor(
    public dialogRef: MatDialogRef<AddMealComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { refeicao: IMeal } | null,
    private fb: FormBuilder
  ) {
    if (data?.refeicao) {
      this.refeicao = data.refeicao;
      this.formType = 'Edit';
      if (data.refeicao.barcode) {
        this.selectedFood = this.refeicao;
      }
    }

    this.mealForm = this.fb.group({
      barcode: [this.refeicao.barcode || ''],
      nome: [this.refeicao.product_name || '', Validators.required],
      categoria: [
        this.refeicao.categoria || '',
        [Validators.required, Validators.min(1)],
      ],
      calorias: [{ value: this.refeicao.calorias, disabled: true }],
      quantidade: [
        this.refeicao.quantidade || '',
        [Validators.required, Validators.min(0)],
      ],
      proteinas: [
        this.refeicao.proteinas || '',
        [Validators.required, Validators.min(0)],
      ],
      gorduras: [
        this.refeicao.gorduras || '',
        [Validators.required, Validators.min(0)],
      ],
      hidratos: [
        this.refeicao.hidratos || '',
        [Validators.required, Validators.min(0)],
      ],
    });

    // Watch for changes on proteinas, gorduras, and hidratos
    this.mealForm.get('proteinas')?.valueChanges.pipe(takeUntil(this.$unsubscribe)).subscribe(() => {
      this.calculateCalories();
    });

    this.mealForm.get('gorduras')?.valueChanges.pipe(takeUntil(this.$unsubscribe)).subscribe(() => {
      this.calculateCalories();
    });

    this.mealForm.get('hidratos')?.valueChanges.pipe(takeUntil(this.$unsubscribe)).subscribe(() => {
      this.calculateCalories();
    });
  }

  ngOnDestroy(): void {
    this.$unsubscribe.next();
    this.$unsubscribe.complete();
  }

  onBarcodeSearch(): void {
    const barcode = this.fc['barcode'].value;
    if (barcode!?.length >= 8) {
      // Ensure barcode is valid
      this.openFoodFactsService
        .searchFoodsByBarcode(barcode!)
        .pipe(takeUntil(this.$unsubscribe))
        .subscribe((product) => {
          if (product) {
            this.selectedFood = product;
            this.updateFormWithProductDetails();
            this.toastr.success(product.displayName + ' found.');
          } else {
            this.toastr.error(
              'No product found for this barcode. Please fill the data yourself.'
            );
          }
        });
    } else {
      this.toastr.error('Invalid barcode input');
    }
  }

  updateFormWithProductDetails(): void {
    if (this.selectedFood) {
      const nutriments = this.selectedFood.nutriments;
      const quantity = this.mealForm.get('quantidade')?.value || 0;

      this.mealForm.patchValue({
        nome: this.selectedFood.product_name,
        proteinas: Math.round(
          (quantity * (nutriments.proteins_100g || 0)) / 100
        ),
        hidratos: Math.round(
          (quantity * (nutriments.carbohydrates_100g || 0)) / 100
        ),
        gorduras: Math.round((quantity * (nutriments.fat_100g || 0)) / 100),
      });

      // Recalculate calories
      this.calculateCalories();
    }
  }

  get fc() {
    return this.mealForm.controls;
  }

  // Método para fechar o diálogo sem fazer nada
  onNoClick(): void {
    this.dialogRef.close();
  }

  // Método para enviar o formulário
  onSubmit(): void {
    if (this.mealForm.valid) {
      let dataToSend = {
        ...this.mealForm.getRawValue(),
        nutriments:{},
      };

      if (this.selectedFood) {
        const macros_100 = {
          nutriments: {
            proteins_100g: this.selectedFood.nutriments.proteins_100g,
            fat_100g: this.selectedFood.nutriments.fat_100g,
            carbohydrates_100g: this.selectedFood.nutriments.carbohydrates_100g,
          },
        };
        
        dataToSend = {
          ...this.mealForm.getRawValue(),
          ...macros_100,
        };
      }

      this.dialogRef.close(dataToSend); // Envia os dados do formulário de volta
    }
  }

  // Method to calculate total calories based on macronutrients
  calculateCalories(): void {
    const proteinas = this.mealForm.get('proteinas')?.value || 0;
    const gorduras = this.mealForm.get('gorduras')?.value || 0;
    const hidratos = this.mealForm.get('hidratos')?.value || 0;

    // Example calorie calculation (using typical values: 4 kcal per protein and carbohydrate, 9 kcal per fat)
    const totalCalories = proteinas * 4 + gorduras * 9 + hidratos * 4;

    // Update calorias field with calculated value
    this.mealForm.get('calorias')?.setValue(totalCalories);
  }
}
