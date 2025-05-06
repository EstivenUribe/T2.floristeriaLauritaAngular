import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { AdminComponent } from './components/admin/admin.component';
import { CatalogComponent } from './components/catalog/catalog.component';
import { OffersComponent } from './components/offers/offers.component';
import { OccasionsComponent } from './components/occasions/occasions.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { CartComponent } from './components/cart/cart.component';
import { RegisterComponent } from './components/register/register.component';
import { PrivacyComponent } from './components/privacy/privacy.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'productos', component: CatalogComponent },
  { path: 'ofertas', component: OffersComponent },
  { path: 'ocasiones', component: OccasionsComponent },
  { path: 'nosotros', component: AboutComponent },
  { path: 'contacto', component: ContactComponent },
  { path: 'carrito', component: CartComponent },
  { path: 'registro', component: RegisterComponent },
  { path: 'privacidad', component: PrivacyComponent },
  { path: '**', redirectTo: '' }
];
