import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { AdminComponent } from './components/admin/admin.component';
import { CatalogComponent } from './components/catalog/catalog.component';
import { OffersComponent } from './components/offers/offers.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { CartComponent } from './components/cart/cart.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { ProfileComponent } from './components/profile/profile.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { AdminOrdersComponent } from './components/admin-orders/admin-orders.component';
import { authGuard, adminGuard, noAuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'admin-orders', component: AdminOrdersComponent, canActivate: [adminGuard] },
  { path: 'productos', component: CatalogComponent },
  { path: 'ofertas', component: OffersComponent },
  { path: 'nosotros', component: AboutComponent },
  { path: 'contacto', component: ContactComponent },
  { path: 'carrito', component: CartComponent },
  { path: 'perfil', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'historial-compras', component: OrderHistoryComponent, canActivate: [authGuard] },
  { 
    path: 'verificar-email', 
    loadComponent: () => import('./components/email-verification/email-verification.component').then(m => m.EmailVerificationComponent) 
  },
  { path: 'privacidad', component: PrivacyComponent },
  { 
    path: 'terminos', 
    loadComponent: () => import('./components/terms/terms.component').then(m => m.TermsComponent) 
  },
  { path: '**', redirectTo: '' }
];
