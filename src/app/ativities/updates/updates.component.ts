import { Component, inject,ViewChild } from '@angular/core';
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
import { ChartData, ChartType, Chart } from 'chart.js';
import {
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  CartesianScaleOptions,
} from 'chart.js';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { lineChartOptions } from '../../chartOptions/chartOptions';

// Register required Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-updates',
  standalone: true,
  imports: [NavBarComponent,FontAwesomeModule,CommonModule,BaseChartDirective,FormsModule],
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

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  $unsubscribe: Subject<void> = new Subject<void>();

  report:string='Weight (kg)';
  period:string = '7';

  public lineChartType: ChartType = 'line';
    public lineChartData: ChartData<'line'> = {
      labels: this.labelsReport,
      datasets: [
        {
          label: this.report,
          data: this.dataReport,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
        },
      ],
    };
    public lineChartOptions = lineChartOptions;

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

  // Update chart dynamically when input properties change
  private updateChart(): void {
    this.lineChartData.labels = this.labelsReport;
    this.lineChartData.datasets[0].data = this.dataReport;

    this.lineChartData.datasets[0].label = this.report;

    // Update the y-axis title dynamically
    const yAxis = this.lineChartOptions.scales!['y'] as CartesianScaleOptions;
    if (yAxis && yAxis.title) {
      yAxis.title.text = this.report; // Update the y-axis title
    }

    // Refresh the chart
    if (this.chart) {
      this.chart.update();
    }
  }

  EditUpdate(updateID:string,updateData:IUpdate){
    console.log(updateData)
    const dialogRef = this.dialog.open(AddUpdateComponent, {
      width: '500px',  // Define a largura do diálogoas
      height:'100vh',
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
        }
        this.updateService.updateUpdate(this.userID,updateID,updateData).subscribe(()=>{
          this.onChangeReport()
        });
      }
    });
  }

  DeleteUpdate(updateID:string){
    this.updateService.deleteUpdate(this.userID,updateID).subscribe(()=>{
      this.onChangeReport()
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddUpdateComponent, {
      width: '500px',  // Define a largura do diálogo
      height:'100vh',
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

        this.updateService.addUpdate(this.userID,updateData).subscribe(()=>{
          this.onChangeReport()
        });
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
  
  onChangeReport() {
    // Clear existing labels and data
    this.labelsReport = [];
    this.dataReport = [];
  
    // Use a Map to track unique dates and their corresponding values
    const dateValueMap = new Map<string, number>();
  
    // Fetch updates from the service
    this.updateService
      .getUserUpdatesLastXDays(this.userID, this.period)
      .pipe(takeUntil(this.$unsubscribe))
      .subscribe((updates) => {
        console.log(updates);
        updates.forEach((update) => {
          const date = this.convertTimestampToShortDate(update.created.seconds);
  
          if (date) {
            // Determine the value to use for the given report type
            let value: number | null = null;
            if (this.report === 'Weight (kg)') {
              value = update.novoPeso;
            } else if (this.report === 'Torax (cm)') {
              value = update.torax;
            } else if (this.report === 'Hips (cm)') {
              value = update.quadril;
            } else if (this.report === 'Waist (cm)') {
              value = update.cintura;
            } else if (this.report === 'Arm (cm)') {
              value = update.braco;
            } else if (this.report === 'Leg (cm)') {
              value = update.coxa;
            }
  
            // Only add date-value pair if the value is not null
            if (value !== null) {
              // Handle duplicates by keeping the latest value for each date
              if (!dateValueMap.has(date) || update.created.seconds > dateValueMap.get(date)!) {
                dateValueMap.set(date, value);
              }
            }
          }
        });
  
        // Populate labels and data arrays from the Map
        this.labelsReport = Array.from(dateValueMap.keys());
        this.dataReport = Array.from(dateValueMap.values());
  
        // Update the chart with the new data
        this.updateChart();
      });
  }
  
}
