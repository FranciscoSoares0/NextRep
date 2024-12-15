import { Component, inject } from '@angular/core';
import { NavBarComponent } from '../../layouts/nav-bar/nav-bar.component';
import { IUpdate } from '../../interfaces/update';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus,faTrash, faPen} from '@fortawesome/free-solid-svg-icons';
import { CommonModule,DatePipe } from '@angular/common';
import { OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';
import { UpdateService } from '../../services/updates';
import { Timestamp } from 'firebase/firestore';
import { AddUpdateComponent } from '../../dialogs/add-update/add-update.component';
import { MatDialog } from '@angular/material/dialog';
import { OnDestroy } from '@angular/core';
import { Subject,takeUntil } from 'rxjs';
import { ReportComponent } from './report/report.component';

@Component({
  selector: 'app-updates',
  standalone: true,
  imports: [NavBarComponent,FontAwesomeModule,CommonModule,ReportComponent],
  templateUrl: './updates.component.html',
  styleUrl: './updates.component.css',
  providers: [DatePipe],
})
export class UpdatesComponent implements OnInit,OnDestroy {

  authService = inject(AuthService);
  updateService = inject(UpdateService);
  datePipe = inject(DatePipe);
  dialog = inject(MatDialog);

  atualizacoesData : Array<IUpdate> = [];

  atualizacoesData7days : Array<IUpdate> = [];
  labelsReport : Array<string> = [];
  dataReport : Array<number> = [];

  formType : string = "Add";
  userID : string = '';
  formUpdateID : string = '';
  faPlus = faPlus;
  faTrash = faTrash;
  faPen = faPen;

  $unsubscribe: Subject<void> = new Subject<void>();

  ngOnInit(): void {
    this.authService.user$.pipe(takeUntil(this.$unsubscribe)).subscribe((user)=>{
      if(user){
        this.userID = user.uid;
        this.updateService.getUserUpdates(this.userID).pipe(takeUntil(this.$unsubscribe)).subscribe((updates)=>{
          if(updates)
            this.atualizacoesData = updates;
          this.updateService.getUserUpdatesLastXDays(this.userID,'7').pipe(takeUntil(this.$unsubscribe)).subscribe((updates)=>{
            this.atualizacoesData7days = updates;
            this.atualizacoesData7days.map((update)=>{
                const date = this.convertTimestampToShortDate(update.created.seconds);
                this.labelsReport.push(date!);
                this.dataReport.push(update.novoPeso);
            })
            
          })
        })
      }
    })
  }

  ngOnDestroy(): void {
    this.$unsubscribe.next();
    this.$unsubscribe.complete();
  }

  EditUpdate(updateID:string,updateData:IUpdate){
    console.log(updateData)
    const dialogRef = this.dialog.open(AddUpdateComponent, {
      width: '500px',  // Define a largura do diálogoas
      data:{
        update:updateData,
      },
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updateData = {
          novoPeso:result.novoPeso,
          torax:result.torax,
          quadril:result.quadril,
          cintura:result.cintura,
          braco:result.braco,
          coxa:result.coxa,
          created : Timestamp.now(),
        }
        this.updateService.updateUpdate(this.userID,updateID,updateData).subscribe(()=>{});
      }
    });
  }

  DeleteUpdate(updateID:string){
    this.updateService.deleteUpdate(this.userID,updateID).subscribe(()=>{});
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddUpdateComponent, {
      width: '500px',  // Define a largura do diálogo
      disableClose: true, // Prevents closing when clicking outside
      autoFocus: true,    // Automatically focuses on the first focusable element
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updateData = {
          novoPeso:result.novoPeso,
          torax:result.torax,
          quadril:result.quadril,
          cintura:result.cintura,
          braco:result.braco,
          coxa:result.coxa,
          created : Timestamp.now(),
        }

        this.updateService.addUpdate(this.userID,updateData).subscribe(()=>{});
      } else {
        console.log('O diálogo foi fechado sem dados');
      }
    });
  }

  hasTodaysUpdate(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to the start of the day
  
    return this.atualizacoesData.some((update) => {
      const updateDate = update.created?.toDate(); // Convert Firestore Timestamp to Date
      if (!updateDate) return false;
  
      updateDate.setHours(0, 0, 0, 0); // Reset time
      return updateDate.getTime() === today.getTime();
    });
  }

  convertTimestampToShortDate(seconds: number): string | null {
    // Use DatePipe to format the date
    return this.datePipe.transform(new Date(seconds * 1000), 'yyyy-MM-dd');
  }
}
