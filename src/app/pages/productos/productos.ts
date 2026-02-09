import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService, Producto } from '../../services/productos';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';


@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink,NgIf,NgForOf],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css']
})
export class ProductosComponent implements OnInit {

  productos: Producto[] = [];
  cargando: boolean = false;
  errorMsg: string = '';
  successMsg: string = '';

  // Campos del formulario
  codigo: string = '';
  nombre: string = '';
  categoria: string = '';
  proveedor: string = '';
  stock_minimo: number = 0;

  constructor(private productosService: ProductosService, private authService: AuthService,
  private router: Router) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos() {
    this.cargando = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.productosService.obtenerProductos().subscribe({
      next: (resp) => {
        this.cargando = false;
        if (resp.ok) {
          this.productos = resp.data;
        } else {
          this.errorMsg = 'No se pudieron cargar los productos';
        }
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error al cargar productos:', err);
        this.errorMsg = 'Error al cargar productos';
      }
    });
  }
  
  logout() {
  this.authService.logout();    // limpia usuario + token + localStorage
  this.router.navigate(['/']);  // envía al login
  }

  crearProducto() {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.codigo || !this.nombre) {
      this.errorMsg = 'Código y nombre son obligatorios';
      return;
    }

    this.productosService.crearProducto({
      codigo: this.codigo,
      nombre: this.nombre,
      categoria: this.categoria || undefined,
      proveedor: this.proveedor || undefined,
      stock_minimo: this.stock_minimo || 0
    }).subscribe({
      next: (resp) => {
        if (resp.ok) {
          this.successMsg = 'Producto creado correctamente';
          // Limpiar formulario
          this.codigo = '';
          this.nombre = '';
          this.categoria = '';
          this.proveedor = '';
          this.stock_minimo = 0;
          // Recargar lista
          this.cargarProductos();
        } else {
          this.errorMsg = resp.mensaje || 'Error al crear producto';
        }
      },
      error: (err) => {
        console.error('Error al crear producto:', err);
        this.errorMsg = err.error?.mensaje || 'Error al crear producto';
      }
    });
  }

  
  getClaseStock(p: Producto): string {
  // Sin stock mínimo configurado
  if (p.stock_minimo === 0) {
    return 'stock-sin-minimo';
  }

  // Sin existencias
  if (p.stock_actual <= 0) {
    return 'stock-critico';
  }

  // Crítico: igual o por debajo del mínimo
  if (p.stock_actual <= p.stock_minimo) {
    return 'stock-bajo';
  }

  // Normal
  return 'stock-ok';
}

get productosCriticos(): Producto[] {
  return this.productos.filter(p =>
    p.stock_minimo > 0 &&
    p.stock_actual <= p.stock_minimo
  );
} 


  get rolUsuario(): string | null {
    return this.authService.usuario ? this.authService.usuario.rol : null;
  }

  esAdmin(): boolean {
    return this.authService.esAdmin();
  }


}
