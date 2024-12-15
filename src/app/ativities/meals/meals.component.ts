import { Component, inject } from '@angular/core';
import { NavBarComponent } from '../../layouts/nav-bar/nav-bar.component';
import { UserService } from '../../services/user';
import { AuthService } from '../../services/auth';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  faFloppyDisk,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DailyMealsComponent } from './daily-meals/daily-meals.component';
import { LoadingComponent } from '../../layouts/loading/loading.component';
import { IUser } from '../../interfaces/user';
import { Timestamp } from 'firebase/firestore';
import { OnDestroy } from '@angular/core';
import { Subject,takeUntil } from 'rxjs';

@Component({
  selector: 'app-meals',
  standalone: true,
  imports: [
    NavBarComponent,
    CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    DailyMealsComponent,
    LoadingComponent,
  ],
  templateUrl: './meals.component.html',
  styleUrl: './meals.component.css',
})
export class MealsComponent implements OnInit,OnDestroy {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  userService = inject(UserService);

  userID: string = '';
  userData: IUser = {
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
  };

  loading: boolean = true;

  $unsubscribe: Subject<void> = new Subject<void>();

  macroNutrientesForm: FormGroup = this.fb.group({
    proteinas: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    gorduras: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    hidratos: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
  });

  aguaForm: FormGroup = this.fb.group({
    litrosAgua: ['', [Validators.required]],
  });

  caloriasTotais: number | undefined;

  faFloppyDisk = faFloppyDisk;

  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  isCollapsed: boolean = true;
  isWaterCollapsed: boolean = true;

  ngOnInit(): void {
    this.authService.user$.pipe(takeUntil(this.$unsubscribe)).subscribe((user) => {
      if (user)
        this.userService.getUserById(user.uid).pipe(takeUntil(this.$unsubscribe)).subscribe((userData) => {
          this.userData = userData!;
          this.caloriasTotais = userData?.calorias;
          this.userID = userData!.uid;
          this.macroNutrientesForm = this.fb.group({
            proteinas: [
              Math.round(
                ((userData!.proteinas * 4) / this.caloriasTotais!) * 100
              ),
              [Validators.required, Validators.pattern(/^\d+$/)],
            ],
            gorduras: [
              Math.round(
                ((userData!.gorduras * 9) / this.caloriasTotais!) * 100
              ),
              [Validators.required, Validators.pattern(/^\d+$/)],
            ],
            hidratos: [
              Math.round(
                ((userData!.hidratos * 4) / this.caloriasTotais!) * 100
              ),
              [Validators.required, Validators.pattern(/^\d+$/)],
            ],
          });

          this.aguaForm = this.fb.group({
            litrosAgua: [userData!.agua, [Validators.required]],
          });

          this.loading = false;
        });
    });
  }

  ngOnDestroy(): void {
    this.$unsubscribe.next();
    this.$unsubscribe.complete();
  }

  get fc() {
    return this.macroNutrientesForm.controls;
  }

  get fcAgua() {
    return this.aguaForm.controls;
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleWaterCollapse() {
    this.isWaterCollapsed = !this.isWaterCollapsed;
  }

  onSubmit() {
    const rawForm = this.macroNutrientesForm.getRawValue();
    console.log(rawForm);

    const macrosData = {
      proteinas: Math.round(
        ((rawForm.proteinas / 100) * this.caloriasTotais!) / 4
      ),
      gorduras: Math.round(
        ((rawForm.gorduras / 100) * this.caloriasTotais!) / 9
      ),
      hidratos: Math.round(
        ((rawForm.hidratos / 100) * this.caloriasTotais!) / 4
      ),
    };

    this.userService.updateUser(this.userID, macrosData).subscribe(() => {});
  }

  onSubmitAgua() {
    const rawForm = this.aguaForm.getRawValue();
    console.log(rawForm);

    const aguaData = {
      agua: rawForm.litrosAgua,
    };

    this.userService.updateUser(this.userID, aguaData).subscribe(() => {});
  }

  checkMacroNutrientPercentage(): boolean {
    const rawForm = this.macroNutrientesForm.getRawValue();

    let totalPercentage =
      rawForm.proteinas + rawForm.gorduras + rawForm.hidratos;

    return totalPercentage === 100;
  }

  allowOnlyInteger(event: KeyboardEvent): void {
    const charCode = event.charCode || event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  sanitizeInput(controlName: string): void {
    const control = this.macroNutrientesForm.get(controlName);
    if (control) {
      const value = control.value;
      // Remove non-integer values (e.g., decimals or non-digits)
      control.setValue(Math.floor(value) || 0);
    }
  }
}
