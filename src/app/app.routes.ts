import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { ProductosComponent } from './pages/productos/productos';
import { MovimientosComponent } from './pages/movimientos/movimientos';
import { ReportesComponent } from './pages/reportes/reportes';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'movimientos', component: MovimientosComponent },
  { path: 'reportes', component: ReportesComponent }
];
