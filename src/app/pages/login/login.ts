import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {

  correo: string = '';
  password: string = '';

  cargando: boolean = false;
  errorMsg: string = '';
  successMsg: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // 👇 Esto evita que se muestre el login si ya hay sesión activa
  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/productos']);
    }
  }

  onSubmit() {
    this.errorMsg = '';
    this.successMsg = '';
    this.cargando = true;

    this.authService.login(this.correo, this.password).subscribe({
      next: (resp) => {
        this.cargando = false;

        if (resp.ok) {
          // Guardar usuario + token en memoria y localStorage
          this.authService.setSession(resp);

          this.successMsg = 'Login exitoso';
          console.log('Usuario logueado:', resp.usuario);
          console.log('Token:', resp.token);

          // Ir a productos
          this.router.navigate(['/productos']);
        } else {
          this.errorMsg = resp.mensaje || 'Error en login';
        }
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error en login:', err);
        this.errorMsg = err.error?.mensaje || 'Error al conectar con el servidor';
      }
    });
  }
}
