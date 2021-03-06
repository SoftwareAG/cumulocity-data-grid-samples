import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule as ngRouterModule } from '@angular/router';
import { CoreModule, BootstrapComponent, RouterModule, PluginsModule } from '@c8y/ngx-components';
import { LocalDataGridModule } from './local-data-example/local-data-grid.module';
import { RemoteDataGridModule } from './remote-data-example/remote-data-grid.module';
import { CustomizationExampleModule } from './customization-example/customization-example.module';
import { MinimumDataGridModule } from './minimum-example/minimum-data-grid.module';
import { QueryPlaygrounModule } from './query-playground/query-playground.module';

@NgModule({
  imports: [
    // Grid example modules
    QueryPlaygrounModule,
    LocalDataGridModule,
    RemoteDataGridModule,
    CustomizationExampleModule,
    MinimumDataGridModule,
    // Cumulocity imports
    BrowserAnimationsModule,
    RouterModule.forRoot(),
    ngRouterModule.forRoot([], { enableTracing: false, useHash: true }),
    CoreModule.forRoot(),
    PluginsModule.forRoot()
  ],
  bootstrap: [BootstrapComponent]
})
export class AppModule {}
