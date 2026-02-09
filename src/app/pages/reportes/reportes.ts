import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReportesService, StockCategoria, ProductoMasVendido, SugerenciaReabastecimiento } from '../../services/reportes';
import { AuthService, Usuario } from '../../services/auth';
import { Router } from '@angular/router';
@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, RouterLink],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css']
})
export class ReportesComponent implements OnInit {

  stockCategorias: StockCategoria[] = [];
  masVendidos: ProductoMasVendido[] = [];
  sugerencias: SugerenciaReabastecimiento[] = [];
   // Usuario que realiza el movimiento
  usuarioActual: Usuario | null = null;
  usuario_id: number = 0;

  cargandoSugerencias = false;
  cargandoStock = false;
  cargandoVendidos = false;
  errorMsg = '';

  constructor(private reportesService: ReportesService, private router: Router, private authService: AuthService,) {}

  ngOnInit(): void {
    this.cargarStockPorCategoria();
    this.cargarMasVendidos();
    this.cargarSugerencias();
  }

  cargarStockPorCategoria() {
    this.cargandoStock = true;
    this.reportesService.getStockPorCategoria().subscribe({
      next: (resp) => {
        this.cargandoStock = false;
        if (resp.ok) {
          this.stockCategorias = resp.data;
        } else {
          this.errorMsg = 'No se pudo cargar el stock por categoría';
        }
      },
      error: (err) => {
        this.cargandoStock = false;
        console.error('Error stock por categoría:', err);
        this.errorMsg = 'Error al cargar stock por categoría';
      }
    });
  }

  cargarMasVendidos() {
    this.cargandoVendidos = true;
    this.reportesService.getProductosMasVendidos().subscribe({
      next: (resp) => {
        this.cargandoVendidos = false;
        if (resp.ok) {
          this.masVendidos = resp.data;
        } else {
          this.errorMsg = 'No se pudo cargar productos más vendidos';
        }
      },
      error: (err) => {
        this.cargandoVendidos = false;
        console.error('Error productos más vendidos:', err);
        this.errorMsg = 'Error al cargar productos más vendidos';
      }
    });
  }

  cargarSugerencias() {
  this.cargandoSugerencias = true;
  this.reportesService.getSugerenciasReabastecimiento().subscribe({
    next: (resp) => {
      this.cargandoSugerencias = false;
      if (resp.ok) {
        this.sugerencias = resp.data;
      } else {
        this.errorMsg = 'No se pudieron cargar las sugerencias de reabastecimiento';
      }
    },
    error: (err) => {
      this.cargandoSugerencias = false;
      console.error('Error sugerencias reabastecimiento:', err);
      this.errorMsg = 'Error al cargar sugerencias de reabastecimiento';
    }
  });
  }

   get rolUsuario(): string | null {
    return this.authService.usuario ? this.authService.usuario.rol : null;
  }
  
  logout() {
  this.authService.logout();
  this.router.navigate(['/']);
}

}
