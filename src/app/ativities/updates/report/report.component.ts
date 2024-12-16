import {
  Component,
  inject,
  Input,
  ViewChild,
} from '@angular/core';
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
import { BaseChartDirective } from 'ng2-charts';
import { lineChartOptions } from '../../../chartOptions/chartOptions'; // Import the chart options file
import { CommonModule,DatePipe } from '@angular/common';
import { OnInit,OnDestroy,SimpleChanges,OnChanges, } from '@angular/core';
import { Subject,takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth';
import { UpdateService } from '../../../services/updates';
import { FormsModule } from '@angular/forms';

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
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule,BaseChartDirective,FormsModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
  providers: [DatePipe],
})
export class ReportComponent implements OnInit,OnDestroy,OnChanges{

  authService = inject(AuthService);
  updateService = inject(UpdateService);
  datePipe = inject(DatePipe);

  @Input() userID : string = "";
  @Input() labels : Array<string> = [];
  @Input() data : Array<number> = [];

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  $unsubscribe: Subject<void> = new Subject<void>();

  report:string='Weight (kg)';
  period:string = '7';

  public lineChartType: ChartType = 'line';
  public lineChartData: ChartData<'line'> = {
    labels: this.labels,
    datasets: [
      {
        label: this.report,
        data: this.data,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  };
  public lineChartOptions = lineChartOptions;
  

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['labels'] || changes['data']) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    this.$unsubscribe.next();
    this.$unsubscribe.complete();
  }

  // Update chart dynamically when input properties change
  private updateChart(): void {
    this.lineChartData.labels = this.labels;
    this.lineChartData.datasets[0].data = this.data;

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

  onChangeReport(){
    this.labels = [];
    this.data = [];
    this.updateService.getUserUpdatesLastXDays(this.userID,this.period).pipe(takeUntil(this.$unsubscribe)).subscribe((updates)=>{
      updates.map((update)=>{
        const date = this.convertTimestampToShortDate(update.created.seconds);
        // Avoid duplicates using Set or checking directly
        if (!this.labels.includes(date!)) {
          this.labels.push(date!);
          if(this.report == "Weight (kg)")
            this.data.push(update.novoPeso);
          else if(this.report == "Torax (cm)")
            this.data.push(update.torax);
          else if(this.report == "Hips (cm)")
            this.data.push(update.quadril);
          else if(this.report == "Waist (cm)")
            this.data.push(update.cintura);
          else if(this.report == "Waist (cm)")
            this.data.push(update.cintura);
          else if(this.report == "Arm (cm)")
            this.data.push(update.braco);
          else if(this.report == "Leg (cm)")
            this.data.push(update.coxa);
        }
      })
      this.updateChart();
    })
  }

  convertTimestampToShortDate(seconds: number): string | null {
    // Use DatePipe to format the date
    return this.datePipe.transform(new Date(seconds * 1000), 'yyyy-MM-dd');
  }
}
