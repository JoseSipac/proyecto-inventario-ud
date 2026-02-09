// src/app/services/productos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments';

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string | null;
  proveedor: string | null;
  stock_actual: number;
  stock_minimo: number;
  creado_en: string;
  actualizado_en: string;
}

interface ProductosResponse {
  ok: boolean;
  total: number;
  data: Producto[];
}

interface CrearProductoResponse {
  ok: boolean;
  mensaje: string;
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private readonly baseUrl = environment.apiBaseUrl;
  private readonly apiUrl = `${this.baseUrl}/api/productos`;

  constructor(private http: HttpClient) { }

  obtenerProductos(): Observable<ProductosResponse> {
    return this.http.get<ProductosResponse>(this.apiUrl);
  }

  crearProducto(payload: {
    codigo: string;
    nombre: string;
    categoria?: string;
    proveedor?: string;
    stock_minimo?: number;
  }): Observable<CrearProductoResponse> {
    return this.http.post<CrearProductoResponse>(this.apiUrl, payload);
  }
}
