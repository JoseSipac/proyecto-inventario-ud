import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments';

export interface StockCategoria {
  categoria: string;
  total_productos: number;
  total_stock: number;
  productos_criticos: number;
}

export interface SugerenciaReabastecimiento {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  proveedor: string | null;
  stock_actual: number;
  stock_minimo: number;
  cantidad_sugerida: number;
}

export interface ProductoMasVendido {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string | null;
  total_vendido: number;
}

interface StockCategoriaResponse {
  ok: boolean;
  data: StockCategoria[];
}

interface ProductosMasVendidosResponse {
  ok: boolean;
  data: ProductoMasVendido[];
}

interface SugerenciasResponse {
  ok: boolean;
  data: SugerenciaReabastecimiento[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private readonly baseUrl = environment.apiBaseUrl;
  private readonly apiUrl = `${this.baseUrl}/api/reportes`;

  constructor(private http: HttpClient) {}

  getStockPorCategoria(): Observable<StockCategoriaResponse> {
    return this.http.get<StockCategoriaResponse>(`${this.apiUrl}/stock-categoria`);
  }

  getProductosMasVendidos(): Observable<ProductosMasVendidosResponse> {
    return this.http.get<ProductosMasVendidosResponse>(`${this.apiUrl}/productos-mas-vendidos`);
  }

  getSugerenciasReabastecimiento(): Observable<SugerenciasResponse> {
  return this.http.get<SugerenciasResponse>(`${this.apiUrl}/sugerencias-reabastecimiento`);
}

}
