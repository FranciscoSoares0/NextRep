import {Component, inject} from '@angular/core';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { passwordValidator } from '../../validators/passwordValidator';
import { faGoogle,faFacebook } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../../services/auth';
import { Timestamp } from 'firebase/firestore';
import { Router,RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { birthDateValidator } from '../../validators/birthDateValidator';

@Component({
  selector: 'app-register-new',
  standalone: true,
  imports: [
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    FontAwesomeModule,
    RouterLink
  ],
  templateUrl: './register-new.component.html',
  styleUrl: './register-new.component.css'
})
export class RegisterNewComponent {

  private _formBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  toastr = inject(ToastrService);

  faGoogle = faGoogle;
  faFacebook = faFacebook;

  userDetailsFormGroup = this._formBuilder.group({
    nome: ['', Validators.required],
    apelido: ['', Validators.required],
    dataNascimento: ['', [Validators.required,birthDateValidator(120)]],
    sexo: ['', [Validators.required]],
    atividade: ['', [Validators.required]],
  });

  bodyMetricsFormGroup = this._formBuilder.group({
    peso: [null, [Validators.required,Validators.min(1)]],
    objetivo: [null, [Validators.required,Validators.min(1)]],
    altura: [null, [Validators.required,Validators.min(1)]],
  });

  measurementsFormGroup = this._formBuilder.group({
    torax: [null, [Validators.min(1)]],
    cintura: [null, [Validators.min(1)]],
    quadril: [null, [Validators.min(1)]],
    braco: [null, [Validators.min(1)]],
    coxa: [null, [Validators.min(1)]],
  });

  macrosFormGroup = this._formBuilder.group({
    proteinas: [null, [Validators.required,Validators.pattern(/^\d+$/),Validators.min(1)]],
    gorduras: [null, [Validators.required,Validators.pattern(/^\d+$/),Validators.min(1)]],
    hidratos: [null, [Validators.required,Validators.pattern(/^\d+$/),Validators.min(1)]],
    litrosAgua: [null, [Validators.required]],
  });

  registerFormGroup = this._formBuilder.group({
    email : ['',[Validators.required,Validators.email]],
    password : ['',[Validators.required,passwordValidator()]],
  });

  get fc() {
    return this.userDetailsFormGroup.controls;
  }

  get fc2() {
    return this.bodyMetricsFormGroup.controls;
  }

  get fc3() {
    return this.measurementsFormGroup.controls;
  }

  get fc4() {
    return this.macrosFormGroup.controls;
  }

  get fc5() {
    return this.registerFormGroup.controls;
  }

  onSubmit(){
    
    const userData = this.getUserData();
    const updateData = this.getUserUpdate();
    const registerFormRaw = this.registerFormGroup.getRawValue();

    this.authService.register(userData,updateData,registerFormRaw.password!).subscribe({
      complete: () => {
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        let errorMessage = '';

        switch (err.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Email already in use.';
            break;
          default:
            errorMessage = 'An unknown error occurred. Please try again later.';
        }
        this.toastr.error(errorMessage);
      }
    })
  }

  getUserData():any{
    const userDetailsFormRaw = this.userDetailsFormGroup.getRawValue();
    const bodyMetricsFormRaw = this.bodyMetricsFormGroup.getRawValue();
    const measurementsFormRaw = this.measurementsFormGroup.getRawValue();
    const macrosFormRaw = this.macrosFormGroup.getRawValue();
    const registerFormRaw = this.registerFormGroup.getRawValue();

    let calorias = this.calcularCalorias(userDetailsFormRaw.sexo!,userDetailsFormRaw.dataNascimento!,bodyMetricsFormRaw.peso!,bodyMetricsFormRaw.altura!,userDetailsFormRaw.atividade!,bodyMetricsFormRaw.objetivo!);

    const userData = {
      email: registerFormRaw.email,
      nome: userDetailsFormRaw.nome,
      apelido: userDetailsFormRaw.apelido,
      dataNascimento : new Date(userDetailsFormRaw.dataNascimento!),
      peso: bodyMetricsFormRaw.peso,
      objetivo:bodyMetricsFormRaw.objetivo,
      altura:bodyMetricsFormRaw.altura,
      torax:measurementsFormRaw.torax,
      cintura:measurementsFormRaw.cintura,
      quadril:measurementsFormRaw.quadril,
      coxa:measurementsFormRaw.coxa,
      braco:measurementsFormRaw.braco,
      sexo:userDetailsFormRaw.sexo,
      atividade:userDetailsFormRaw.atividade,
      proteinas : Math.round(((macrosFormRaw.proteinas! / 100) * calorias) / 4),
      gorduras : Math.round(((macrosFormRaw.gorduras! / 100) * calorias) / 9),
      hidratos : Math.round(((macrosFormRaw.hidratos! / 100) * calorias) / 4),
      agua:macrosFormRaw.litrosAgua,
      calorias:calorias,
      cor: this.getRandomHexColor(),
      lastLoginDate: Timestamp.fromDate(new Date()),
      consecutiveDays : 0
    };

    return userData;
  }

  getUserUpdate():any{
    const bodyMetricsFormRaw = this.bodyMetricsFormGroup.getRawValue();
    const measurementsFormRaw = this.measurementsFormGroup.getRawValue();

    const updateData = {
      novoPeso:bodyMetricsFormRaw.peso,
      torax:measurementsFormRaw.torax,
      cintura:measurementsFormRaw.cintura,
      quadril:measurementsFormRaw.quadril,
      coxa:measurementsFormRaw.coxa,
      braco:measurementsFormRaw.braco,
      created : Timestamp.fromDate(new Date()),
    }

    return updateData;
  }

  getRandomHexColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  allowOnlyInteger(event: KeyboardEvent): void {
    const charCode = event.charCode || event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  calcularIdade(birthdate: string): number {
    if (!birthdate) {
      return 0; // Return 0 if no date provided
    }
  
    const today = new Date(); // Current date
    const birthDate = new Date(birthdate); // Input birthdate
  
    let age = today.getFullYear() - birthDate.getFullYear(); // Initial age difference
    const monthDifference = today.getMonth() - birthDate.getMonth();
  
    // Adjust age if the birthdate hasn't occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  
    return age;
  }

  calcularCalorias(genero:string,dataNascimento:string,peso:number,altura:number,atividade:string,objetivo:number){
    let bmr = 0, tdee = 0, calories = 0;
    let idade = this.calcularIdade(dataNascimento);
    if(genero == "Male")
      bmr = (10*peso) + (6.25 * altura) - (5*idade) + 5;
    else
      bmr = (10*peso) + (6.25 * altura) - (5*idade) - 161;

    switch(atividade){
      case "Sedentary (little or no exercise)":
        tdee = bmr * 1.2;
        break;
      case "Lightly active (1-3 days/week)":
        tdee = bmr * 1.375;
        break;
      case "Moderately active (3-5 days/week)":
        tdee = bmr * 1.55;
        break;
      case "Vigorously active (6-7 days/week)":
        tdee = bmr * 1.725;
        break;
      case "Extremely active (everyday/physical job)":
        tdee = bmr * 1.9;
        break;
    }

    if(objetivo > peso)
      calories = tdee + 300;
    else if(objetivo < peso)
      calories = tdee - 500;
    else
      calories = tdee;
    
    return Math.round(calories);

  }

  checkMacroNutrientPercentage():boolean{
    const rawForm = this.macrosFormGroup.getRawValue();

    let totalPercentage = rawForm.proteinas! + rawForm.gorduras! + rawForm.hidratos!;
    
    return totalPercentage === 100;
  }
  

  sanitizeInput(controlName: string): void {
    const control = this.macrosFormGroup.get(controlName);
    if (control) {
      const value = control.value;
      // Remove non-integer values (e.g., decimals or non-digits)
      control.setValue(Math.floor(value) || 0);
    }
  }

  registerWithGoogle() {
    const userData = this.getUserData();
    const updateData = this.getUserUpdate();
    this.authService.registerWithGoogle(userData,updateData).subscribe({
      complete: () => {
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.toastr.error(err.code);
      },
    });
  }

  registerWithFacebook() {
    const userData = this.getUserData();
    const updateData = this.getUserUpdate();

    this.authService.registerWithFacebook(userData,updateData).subscribe({
      complete: () => {
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.toastr.error(err.code);
      }
    });
  }
}
