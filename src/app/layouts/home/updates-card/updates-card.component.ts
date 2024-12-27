import { Component, inject, Input, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth';
import { UpdateService } from '../../../services/updates';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule, DatePipe } from '@angular/common';
import { faScaleUnbalancedFlip } from '@fortawesome/free-solid-svg-icons';
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
} from 'chart.js';
import { Subject, takeUntil } from 'rxjs';
import { lineChartOptions } from '../../../chartOptions/chartOptions';
import { IUpdate } from '../../../interfaces/update';

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
  selector: 'app-updates-card',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, BaseChartDirective],
  templateUrl: './updates-card.component.html',
  styleUrl: './updates-card.component.css',
  providers: [DatePipe],
})
export class UpdatesCardComponent implements OnInit, OnDestroy {
  @Input() userID: string = '';
  @Input() pesoInicial: number = 0;
  @Input() objetivo: number = 0;

  authService = inject(AuthService);
  updateService = inject(UpdateService);
  datePipe = inject(DatePipe);

  updates: Array<IUpdate> = [];
  labels: Array<string> = [];
  dataPeso: Array<number> = [];
  pesoAtual: number = 0;
  percentagemPeso: number = 0;

  faScaleUnbalancedFlip = faScaleUnbalancedFlip;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public lineChartType: ChartType = 'line';
  public lineChartData: ChartData<'line'> = {
    labels: this.labels,
    datasets: [
      {
        label: 'Weight (Kg)',
        data: this.dataPeso,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  };

  lineChartOptions = lineChartOptions;

  $unsubscribe: Subject<void> = new Subject<void>();

  ngOnInit(): void {
    this.updateService
      .getUserUpdatesLastXDays(this.userID, '7')
      .pipe(takeUntil(this.$unsubscribe))
      .subscribe((updates) => {
        this.updates = updates;
        if (this.updates.length > 0) {
          this.pesoAtual = this.updates[this.updates.length - 1].novoPeso;
          this.calculateWeigthPercentage(this.pesoInicial, this.pesoAtual);

          this.updates.forEach((update) => {
            const date = this.convertTimestampToShortDate(
              update.created.seconds
            );

            // Avoid duplicates using Set or checking directly
            if (!this.labels.includes(date!)) {
              this.labels.push(date!);
              this.dataPeso.push(update.novoPeso);
            }
          });

          if (this.chart) {
            this.chart.update();
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.$unsubscribe.next();
    this.$unsubscribe.complete();
  }

  calculateWeigthPercentage(pesoInicial: number, pesoAtual: number) {
    this.percentagemPeso = parseFloat((pesoAtual / pesoInicial).toFixed(2));
  }

  convertTimestampToShortDate(seconds: number): string | null {
    // Use DatePipe to format the date
    return this.datePipe.transform(new Date(seconds * 1000), 'yyyy-MM-dd');
  }
}
