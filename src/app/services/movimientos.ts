// src/app/services/movimientos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments';
export interface Movimiento {
  id: number;
  producto_id: number;
  codigo_producto: string;
  nombre_producto: string;
  tipo: string;
  cantidad: number;
  fecha: string;
  usuario_id: number;
  nombre_usuario: string;
  observaciones: string | null;
}

interface MovimientosResponse {
  ok: boolean;
  total: number;
  data: Movimiento[];
}

interface CrearMovimientoResponse {
  ok: boolean;
  mensaje: string;
  movimiento_id: number;
  stock_anterior: number;
  stock_nuevo: number;
}

@Injectable({
  providedIn: 'root'
})
export class MovimientosService {

 private readonly baseUrl = environment.apiBaseUrl;
  private readonly apiUrl = `${this.baseUrl}/api/movimientos`;

  constructor(private http: HttpClient) { }

  obtenerMovimientos(): Observable<MovimientosResponse> {
    return this.http.get<MovimientosResponse>(this.apiUrl);
  }

  crearMovimiento(payload: {
    producto_id: number;
    tipo: string;
    cantidad: number;
    usuario_id: number;
    observaciones?: string;
  }): Observable<CrearMovimientoResponse> {
    return this.http.post<CrearMovimientoResponse>(this.apiUrl, payload);
  }

  
}
