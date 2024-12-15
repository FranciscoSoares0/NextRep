import { Component,inject } from '@angular/core';
import { NavBarComponent } from '../../layouts/nav-bar/nav-bar.component';
import { OnInit, OnDestroy } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user';
import { AuthService } from '../../services/auth';
import { UpdateService } from '../../services/updates';
import { Subject,takeUntil } from 'rxjs';
import { birthDateValidator } from '../../validators/birthDateValidator';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [NavBarComponent,ReactiveFormsModule, CommonModule],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css'
})
export class UserDetailsComponent implements OnInit,OnDestroy {

  fb = inject(FormBuilder);
  userService = inject(UserService);
  authService = inject(AuthService);
  updatesService = inject(UpdateService);

  imgSrc: any = '';
  selectedFile: File | null = null;
  userUID : string = '';
  pesoInicial : number = 0;

  $unsubscribe: Subject<void> = new Subject<void>();
  
  detailsForm: FormGroup = this.fb.group({
    image: [''],
    dataNascimento: ['', [Validators.required,birthDateValidator(120)]],
    objetivo: ['', [Validators.required]],
    altura: ['', [Validators.required]],
    sexo: ['', [Validators.required]],
    atividade: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.authService.user$.pipe(takeUntil(this.$unsubscribe)).subscribe((user)=>{
      if(user){
        console.log(user)
        this.userUID = user.uid;
        //this.imgSrc = user.photoURL;
        this.userService.getUserById(this.userUID).pipe(takeUntil(this.$unsubscribe)).subscribe((userData)=>{
          console.log(userData)
          if(userData){
            this.pesoInicial = userData.peso;
          }

          this.detailsForm = this.fb.group({
            //image: [''],
            dataNascimento: [this.timestampToDateInput(userData?.dataNascimento.seconds! * 1000), [Validators.required,birthDateValidator(120)]],
            objetivo: [userData?.objetivo, [Validators.required]],
            altura: [userData?.altura, [Validators.required]],
            sexo: [userData?.sexo, [Validators.required]],
            atividade: [userData?.atividade, [Validators.required]],
          });
        })
      }
 
    })
  }

  ngOnDestroy(): void {
    this.$unsubscribe.next();
    this.$unsubscribe.complete();
  }

  get fc() {
    return this.detailsForm.controls;
  }

  onSubmit() {
    const rawForm = this.detailsForm.getRawValue();
    console.log(rawForm);
    let caloriasTotais = this.calcularCalorias(rawForm.genero,rawForm.idade,this.pesoInicial,rawForm.altura,rawForm.atividade,rawForm.objetivo);
    let userData = {
      idade: rawForm.idade,
      objetivo: rawForm.objetivo,
      altura:rawForm.altura,
      sexo: rawForm.sexo,
      atividade: rawForm.atividade,
      calorias: caloriasTotais,
    }

    /*if(rawForm.image != null){
      this.userService.uploadImage(this.selectedFile!,userData,this.userUID);
    }*/
    this.userService.updateUser(this.userUID,userData).subscribe(()=>{});
    
  }

   // Function to convert a timestamp to 'YYYY-MM-DD' format
   timestampToDateInput(timestamp: number): string {
    const date = new Date(timestamp);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid timestamp');
      return '';
    }

    // Format the date to 'YYYY-MM-DD' for date input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading zero
    const day = String(date.getDate()).padStart(2, '0'); // Add leading zero

    return `${year}-${month}-${day}`;
  }

  showPreview(event: Event): void {
    const fileInput = event.target as HTMLInputElement;

    if (fileInput.files && fileInput.files[0]) {
      this.selectedFile = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imgSrc = e.target?.result; // `result` contains the base64 string
      };

      reader.readAsDataURL(this.selectedFile);
    }
  }

  calcularCalorias(genero:string,idade:number,peso:number,altura:number,atividade:string,objetivo:number){
    let bmr = 0, tdee = 0, calories = 0;
    if(genero == "Masculine")
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
}
