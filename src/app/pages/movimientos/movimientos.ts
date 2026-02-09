import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductosService, Producto } from '../../services/productos';
import { MovimientosService, Movimiento } from '../../services/movimientos';
import { AuthService, Usuario } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgIf, NgForOf],
  templateUrl: './movimientos.html',
  styleUrls: ['./movimientos.css']
})
export class MovimientosComponent implements OnInit {

  productos: Producto[] = [];
  movimientos: Movimiento[] = [];

  cargandoProductos: boolean = false;
  cargandoMovimientos: boolean = false;

  errorMsg: string = '';
  successMsg: string = '';

  // Campos del formulario
  producto_id: number | null = null;
  tipo: string = 'ENTRADA';
  cantidad: number = 0;
  observaciones: string = '';

  // Usuario que realiza el movimiento
  usuarioActual: Usuario | null = null;
  usuario_id: number = 0;

  constructor(
    private productosService: ProductosService,
    private movimientosService: MovimientosService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Leer usuario logueado desde AuthService
    this.usuarioActual = this.authService.usuario;
    if (this.usuarioActual) {
      this.usuario_id = this.usuarioActual.id;
    }

    this.cargarProductos();
    this.cargarMovimientos();
  }

  cargarProductos() {
    this.cargandoProductos = true;
    this.productosService.obtenerProductos().subscribe({
      next: (resp) => {
        this.cargandoProductos = false;
        if (resp.ok) {
          this.productos = resp.data;
        } else {
          this.errorMsg = 'No se pudieron cargar los productos';
        }
      },
      error: (err) => {
        this.cargandoProductos = false;
        console.error('Error al cargar productos:', err);
        this.errorMsg = 'Error al cargar productos';
      }
    });
  }

  cargarMovimientos() {
    this.cargandoMovimientos = true;
    this.movimientosService.obtenerMovimientos().subscribe({
      next: (resp) => {
        this.cargandoMovimientos = false;
        if (resp.ok) {
          this.movimientos = resp.data;
        } else {
          this.errorMsg = 'No se pudieron cargar los movimientos';
        }
      },
      error: (err) => {
        this.cargandoMovimientos = false;
        console.error('Error al cargar movimientos:', err);
        this.errorMsg = 'Error al cargar movimientos';
      }
    });
  }

  registrarMovimiento() {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.producto_id) {
      this.errorMsg = 'Debe seleccionar un producto';
      return;
    }

    if (this.cantidad <= 0 && this.tipo !== 'AJUSTE') {
      this.errorMsg = 'La cantidad debe ser mayor que 0';
      return;
    }

    const payload = {
      producto_id: this.producto_id,
      tipo: this.tipo,
      cantidad: this.cantidad,
      usuario_id: this.usuario_id,
      observaciones: this.observaciones || undefined
    };

    this.movimientosService.crearMovimiento(payload).subscribe({
      next: (resp) => {
        if (resp.ok) {
          this.successMsg = `Movimiento registrado. Stock: ${resp.stock_anterior} → ${resp.stock_nuevo}`;
          // limpiar formulario
          this.cantidad = 0;
          this.observaciones = '';
          // recargar lista de movimientos
          this.cargarMovimientos();
        } else {
          this.errorMsg = resp.mensaje || 'Error al registrar movimiento';
        }
      },
      error: (err) => {
        console.error('Error al registrar movimiento:', err);
        this.errorMsg = err.error?.mensaje || 'Error al registrar movimiento';
      }
    });
  }

  // ====== ROLES ======

  get rolUsuario(): string | null {
    return this.usuarioActual ? this.usuarioActual.rol : null;
  }

  // ADMIN y OPERADOR pueden registrar movimientos
  puedeRegistrarMovimientos(): boolean {
    return this.authService.esAdmin() || this.authService.esOperador();
  }

  logout() {
  this.authService.logout();
  this.router.navigate(['/']);
}
}
