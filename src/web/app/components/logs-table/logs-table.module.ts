import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { LogsTableComponent } from './logs-table.component';

/**
 * Module for displaying logs in table.
 */
@NgModule({
  declarations: [LogsTableComponent],
  imports: [CommonModule, NgbTooltipModule],
  exports: [LogsTableComponent],
})
export class LogsTableModule { }
