import { Component, Input } from "@angular/core";

type IconName = 'plus' | 'edit' | 'delete' | 'check' | 'close' | 'view' | 'restore';

@Component({
    selector: 'app-icon',
    templateUrl: './icon.html',
    styleUrls: ['./icon.scss']
})
export class Icon {
    @Input() name: IconName = 'plus';
}