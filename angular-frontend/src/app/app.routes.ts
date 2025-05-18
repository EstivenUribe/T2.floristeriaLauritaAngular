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
import { authGuard, adminGuard, noAuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'productos', component: CatalogComponent },
  { path: 'ofertas', component: OffersComponent },
  { path: 'nosotros', component: AboutComponent },
  { path: 'contacto', component: ContactComponent },
  { path: 'carrito', component: CartComponent },
  
  { path: 'privacidad', component: PrivacyComponent },
  { path: '**', redirectTo: '' }
];
