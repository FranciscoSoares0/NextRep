// src/app/chart-options.ts
import { ChartOptions,CartesianScaleOptions  } from 'chart.js'; // Make sure ChartOptions is imported from chart.js

export const lineChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        color: 'white',
        font: {
          family: 'League Spartan',
          size: 16,
        },
      },
    },
    tooltip: {
      titleColor: 'white',
      bodyColor: 'white',
      titleFont: {
        family: 'League Spartan',
        size: 16,
        weight: 'bold',
      },
      bodyFont: {
        family: 'League Spartan',
        size: 16,
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: 'white',
      },
      title: {
        display: true,
        text: 'Date', // Default x-axis title
        color: 'white',
        font: {
          family: 'League Spartan',
          size: 16,
        },
      },
    },
    y: {
      ticks: {
        color: 'white',
      },
      title: {
        display: true, // Ensure the title is displayed
        text: 'Weight (kg)', // Default y-axis title
        color: 'white',
        font: {
          family: 'League Spartan',
          size: 16,
        },
      },
    }as CartesianScaleOptions, 
  },
};
