import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-archive-section',
  imports: [],
  templateUrl: './archive-section.html',
  styleUrls: ['./archive-section.scss', '../../styles/_page-layout.scss'],
})
export class ArchiveSection {
  @Input() title: string = '';
  @Input() isEmpty: boolean = true;
  @Input() emptyMessage: string = '';
}
