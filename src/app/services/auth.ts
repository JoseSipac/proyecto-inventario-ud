// src/app/services/auth.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments';


export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

export interface LoginResponse {
  ok: boolean;
  mensaje: string;
  usuario?: Usuario;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // ⛔ QUITAMOS la URL fija a localhost
  // private apiUrl = 'http://localhost:3000/api/auth';

  // ✅ Usamos el baseUrl que viene del environment
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly apiUrl = `${this.baseUrl}/api/auth`;

  private _usuario: Usuario | null = null;
  private _token: string | null = null;

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('usuario');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      this._usuario = JSON.parse(savedUser);
      this._token = savedToken;
    }
  }

  // Llamada al backend para hacer login
  login(correo: string, password: string): Observable<LoginResponse> {
    // 👉 ahora apunta a: {apiBaseUrl}/api/auth/login
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      correo,
      password
    });
  }

  setSession(resp: LoginResponse) {
    if (resp.ok && resp.usuario && resp.token) {
      this._usuario = resp.usuario;
      this._token = resp.token;
      localStorage.setItem('usuario', JSON.stringify(resp.usuario));
      localStorage.setItem('token', resp.token);
    }
  }

  get usuario(): Usuario | null {
    return this._usuario;
  }

  get usuarioId(): number | null {
    return this._usuario ? this._usuario.id : null;
  }

  get token(): string | null {
    return this._token;
  }

  isLoggedIn(): boolean {
    return !!this._token;
  }

  logout() {
    this._usuario = null;
    this._token = null;
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  }

  esAdmin(): boolean {
    return this._usuario?.rol === 'ADMIN';
  }

  esOperador(): boolean {
    return this._usuario?.rol === 'OPERADOR';
  }

  esSupervisor(): boolean {
    return this._usuario?.rol === 'SUPERVISOR';
  }
}
