import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-delete-account',
  templateUrl: './delete-account.component.html',
  styleUrls: ['./delete-account.component.css'],
  imports :[CommonModule],
  standalone:true
})
export class DeleteAccountComponent {

  userService = inject(UserService);

  constructor(
    public dialogRef: MatDialogRef<DeleteAccountComponent>
  ) {

  }

  // Método para fechar o diálogo sem fazer nada
  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.dialogRef.close();
    this.userService.deleteUserData().subscribe(()=>{});
  }
}
