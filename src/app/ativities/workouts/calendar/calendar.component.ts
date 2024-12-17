import { Component, inject } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular'; // FullCalendar module
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'; // Required for drag-and-drop
import dayGridPlugin from '@fullcalendar/daygrid'; // Import dayGrid plugin
import timeGridPlugin from '@fullcalendar/timegrid'; // Import timeGrid plugin
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { WorkoutsService } from '../../../services/workouts';
import { IWorkout } from '../../../interfaces/workout';
import {
  faPlus,
  faPen,
  faTrash,
  faDumbbell,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';
import { CalendarService } from '../../../services/calendar';
import { IEvent } from '../../../interfaces/event';
import { AuthService } from '../../../services/auth';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';
import { NavBarComponent } from '../../../layouts/nav-bar/nav-bar.component';
import { OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { EventInput } from '@fullcalendar/core/index.js';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    FullCalendarModule,
    FontAwesomeModule,
    CommonModule,
    FormsModule,
    RouterLink,
    NavBarComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent implements OnInit, OnDestroy {
  workoutsService = inject(WorkoutsService);
  calendarService = inject(CalendarService);
  authService = inject(AuthService);
  toastr = inject(ToastrService);
  router = inject(Router);

  userID: string = '';

  nomeTreino: string = '';
  cor: string = '#000000';
  workoutID: string = '';
  formType: string = 'Add';

  treinos: Array<IWorkout> = [];
  eventos: Array<EventInput> = [];

  // For handling drag
  draggedTreino: any = null;

  $unsubscribe: Subject<void> = new Subject<void>();

  faPlus = faPlus;
  faPen = faPen;
  faTrash = faTrash;
  faDumbbell = faDumbbell;

  calendarOptions = {
    initialView: 'dayGridMonth',
    themeSystem: 'bootstrap5',
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    droppable: true, // Enable drag-and-drop
    editable: true, // Allow events to be edited
    events: [] as EventInput,
    longPressDelay: 300, // Adjust long press delay (in milliseconds)
    eventLongPressDelay: 300, // Delay before event is draggable
    selectLongPressDelay: 300, // Delay for selecting dates on touch devices
    eventContent: this.renderEventContent.bind(this),
    eventReceive: this.handleEventReceive.bind(this), // Handle event drop
    eventDrop: this.handleEventDrop.bind(this), // Handle event move
    eventResize: this.handleEventResize.bind(this), // Handle event resizing
    eventClick: this.handleEventClick.bind(this), // Handle event click
  };

  fetchEvents() {
    this.calendarService
      .getEvents(this.userID)
      .pipe(takeUntil(this.$unsubscribe))
      .subscribe((events: any) => {
        if (events) {
          this.eventos = events.map((event: IEvent) => {
            // Convert the Firebase Timestamp (seconds) to Date object
            const eventDate = new Date(event.start.seconds * 1000); // Convert seconds to milliseconds
            const endDate = new Date(event.end.seconds * 1000); // Convert seconds to milliseconds
            
  
            // Return the event data formatted for FullCalendar
            return {
              title: this.treinos.filter((e) => e.id == event.workoutid)[0].nome, // Event title
              start: eventDate.toISOString().split("T")[0], // Start date as Date object
              end: endDate.toISOString().split("T")[0],     // End date as Date object
              id: event.id, // Event ID (if needed)
              borderColor: this.treinos.filter((e) => e.id == event.workoutid)[0].cor,
              extendedProps: {
                workoutid: event.workoutid, // Add workoutid to extendedProps
                color: this.treinos.filter((e) => e.id == event.workoutid)[0].cor,
              },
            } as EventInput;
          });

          // Assign events to FullCalendar
          this.calendarOptions.events = [...this.eventos];
        }
      });
  }
  

  ngOnInit(): void {
    document.addEventListener(
      'touchmove',
      (e) => {
        const target = e.target as HTMLElement;
  
        // Only prevent scrolling if dragging a workout (with `draggable="true"`)
        if (target && target.closest('.fc-event')) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
    const draggableItems = document.getElementById('external-events')!;
    var self = this;

    new Draggable(draggableItems, {
      itemSelector: '.fc-event',
      eventData: function (eventEl: any) {
        return {
          title: eventEl.innerText,
          eventBackgroundColor: eventEl.dataset.color,
          id: eventEl.dataset.id,
        };
      },
      longPressDelay: 50,
    });

    this.authService.user$
      .pipe(takeUntil(this.$unsubscribe))
      .subscribe((user) => {
        if (user) {
          this.userID = user.uid;
          this.workoutsService
            .getWorkouts(this.userID)
            .pipe(takeUntil(this.$unsubscribe))
            .subscribe((workouts) => {
              this.treinos = workouts;
              this.fetchEvents(); // Now fetch events
            });
        }
      });
  }

  ngOnDestroy(): void {
    this.$unsubscribe.next();
    this.$unsubscribe.complete();
  }

  handleEventClick(info: any) {
    // Access event details
    const workoutId = info.event.extendedProps.workoutid; // Event ID
    this.router.navigate(['/calendar/workout', workoutId]);
  }

  handleEventReceive(info: any) {
    const newEventStartDate = info.event.start;

    if (this.checkIfEventExists(newEventStartDate)) {
      // If an event already exists, prevent adding the new event and show an error
      this.toastr.error('There is already a scheduled workout for that day');
      info.revert(); // Revert the event drop (i.e., return the event to its original position)
    } else {
      // If no event exists, proceed with adding the new event
      if(info){
        const eventData = {
          start: info.event.start,
          end: info.event.start,
          workoutid: info.event.id,
        };
    
        this.calendarService
          .addEvent(this.userID, eventData)
          .subscribe();
      }
    }
  }

  // Callback when an event is moved (dragged to a new date/time)
  handleEventDrop(info: any) {
    const newEventStartDate = info.event.start;

    if (this.checkIfEventExists(newEventStartDate)) {
      // If an event already exists, prevent adding the new event and show an error
      this.toastr.error('There is already a scheduled workout for that day');
      info.revert(); // Revert the event drop (i.e., return the event to its original position)
    } else {
      if (info) {
        const eventData = {
          start: info.event.start,
          end: info.event.start,
        };

        this.calendarService
          .updateEvent(this.userID, info.event.id, eventData)
          .subscribe(() => {});
      }
    }
  }

  // Callback when an event is resized (its duration changes)
  handleEventResize(info: any) {
    const event = info.event;

    // Get the event's start and end time
    const start = event.start;
    const end = event.end;

    // Check if the event is spanning across multiple days
    if (start.toISOString().split('T')[0] !== end.toISOString().split('T')[0]) {
      // If the event is spanning multiple days, revert the resize (cancel the resize)
      info.revert(); // This will undo the resize
      this.toastr.error('Workouts cannot occur in multiple days');
    }
  }

  onSubmit(workoutForm: any) {
    const workoutData = {
      nome: this.nomeTreino,
      cor: this.cor,
    };

    if (this.formType == 'Add') {
      this.workoutsService
        .addWorkout(this.userID, workoutData)
        .subscribe(() => {
          workoutForm.resetForm({
            cor: '#000000', // Reset to default color value (optional)
          });
        });
    } else if (this.formType == 'Edit') {
      this.workoutsService
        .updateWorkout(this.userID, this.workoutID, workoutData)
        .subscribe(() => {
          workoutForm.resetForm({
            cor: '#000000', // Reset to default color value (optional)
          });
          this.formType = 'Add';
        });
    }
  }

  EditWorkout(workoutID: string, workoutData: IWorkout) {
    this.formType = 'Edit';
    this.nomeTreino = workoutData.nome;
    this.cor = workoutData.cor;
    this.workoutID = workoutID;
  }

  DeleteWorkout(workoutID: string) {
    // First delete all events associated with the workout
    this.calendarService
      .deleteEventsByWorkout(this.userID, workoutID)
      .subscribe(() => {
        // Then delete the workout
        this.workoutsService
          .deleteWorkout(this.userID, workoutID)
          .subscribe(() => {
            this.formType = 'Add';
          });
      });
  }

  renderEventContent(arg: any) {
    // Create the delete icon
    const deleteButton = document.createElement('span');
    deleteButton.classList.add('delete-event-icon');
    deleteButton.innerHTML = 'x';
    deleteButton.style.cursor = 'pointer'; // Add a pointer cursor

    // Add touchstart listener
    deleteButton.addEventListener('touchstart', (event) => {
      event.preventDefault(); // Prevent the simulated click event
      event.stopPropagation(); // Prevent bubbling
      this.DeleteEvent(arg.event.id);
    });

    // Add click listener (for non-touch devices)
    deleteButton.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent bubbling
      this.DeleteEvent(arg.event.id);
    });

    // Create a container for the event content
    const eventContainer = document.createElement('div');
    eventContainer.classList.add('custom-event-container');
    eventContainer.style.display = 'flex'; // Flexbox layout
    eventContainer.style.justifyContent = 'space-between'; // Space between title and icon
    eventContainer.style.alignItems = 'center'; // Align vertically in the center
    eventContainer.style.padding = '2px'; // Optional: Padding for better spacing
    eventContainer.style.backgroundColor = arg.event.extendedProps.color;

    // Add the event title and delete icon to the container
    const eventTitle = document.createElement('span');
    eventTitle.classList.add('event-title');
    eventTitle.textContent = arg.event.title;

    eventContainer.appendChild(eventTitle); // Add the title
    eventContainer.appendChild(deleteButton); // Add the delete button

    return { domNodes: [eventContainer] }; // Return the custom DOM nodes
  }

  DeleteEvent(eventID: string) {
    this.calendarService.deleteEvent(this.userID, eventID).subscribe(() => {});
  }

  checkIfEventExists(newEventStartDate: Date): boolean {
    // Loop through existing events and check if any event already exists on the new date
    return this.eventos.some(event => {
      // Check if the start date of the new event matches any existing event
      return event.start == this.formatDateToYYYYMMDD(newEventStartDate);
    });
  }

  formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed, so add 1
    const day = date.getDate().toString().padStart(2, '0'); // Ensure two-digit day
    return `${year}-${month}-${day}`;
  }
  
  
}
