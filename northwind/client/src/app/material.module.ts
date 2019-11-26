import { NgModule } from "@angular/core";

import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

const COMPONENTS = [ 
    FlexLayoutModule,
    MatToolbarModule, MatIconModule, MatListModule, MatButtonModule,
    MatFormFieldModule, MatInputModule
]

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class MaterialModule { }