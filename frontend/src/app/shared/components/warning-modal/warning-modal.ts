import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Warning } from "../../utils/messages-utils";

@Component({
  selector: 'app-warning-modal',
  imports: [],
  templateUrl: './warning-modal.html',
  styleUrls: [
    '../../styles/_modals.scss',
    '../../styles/_errors.scss',
    '../../styles/_buttons.scss'
  ]
})
export class WarningModal {
    @Input() isWarningOpen: boolean = false;
    @Input() warningType: Warning | null = null;
    @Input() warningId: number | null = null;
    @Input() warningError: string = '';
    @Input() warningMessage: string = '';
    @Input() canSuggestArchive: boolean = false;

    @Output() confirmDelete = new EventEmitter<void>();
    @Output() confirmArchive = new EventEmitter<void>();
    @Output() closeWarning = new EventEmitter<void>();
}