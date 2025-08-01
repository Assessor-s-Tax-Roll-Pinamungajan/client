import { Routes } from '@angular/router';
// import { PostComponent } from './pages/post/post.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { ViewLandComponent} from './pages/view-land/view-land.component'
import { LandDetailsComponent } from './pages/land-details/land-details.component';
import { LandUpdateComponent } from './pages/land-details/land-update/land-update.component';
import { AddLandComponent } from './pages/land-details/add-land/add-land.component';
import { RecordComponent } from './pages/record/record.component';


export const routes: Routes = [
    {path: 'view-land', component: ViewLandComponent}, 
    // {path: 'post', component: PostComponent}, 
    {path: '', component: WelcomeComponent} ,
    {path: 'land-details/:id', component: LandDetailsComponent },
     { path: 'land-update/:id', component: LandUpdateComponent },
     { path: 'add-land', component: AddLandComponent },
     { path: 'records', component: RecordComponent }
];
