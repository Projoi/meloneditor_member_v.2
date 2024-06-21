import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { PaymentPromoComponent } from './pages/payment-promo/payment-promo.component';

export const routes: Routes = [
    {path:"", component:DashboardComponent},
    {path:"payment/plus", component:PaymentComponent},
    {path:"payment/pro", component:PaymentComponent},
    {path:"payment/special", component:PaymentPromoComponent},
    {path: '**',redirectTo: ''} //Redirect ke home kalau route yang dicari tidak ditemukan
];
