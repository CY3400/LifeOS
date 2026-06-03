import { Component, EventEmitter, Input, Output } from "@angular/core";
import { hasAnyErrors } from "../../utils/ui-utils";

type ModalErrors = {
    global: string;
};

@Component({
    selector: 'app-schedule-action-modal',
    templateUrl: './schedule-action-modal.html',
    styleUrls: ['../../styles/_errors.scss', '../../styles/_modals.scss', '../../styles/_buttons.scss']
})
export class ScheduleActionModal {
    @Input() isDeleteModalOpen: boolean = false;
    @Input() isUpdateModalOpen: boolean = false;
    @Input() deleteErrors: ModalErrors = { global: '' };
    @Input() updateErrors: ModalErrors = { global: '' };
    @Input() selectedScheduleId: number = 0;

    @Output() deleteOne = new EventEmitter<number>();
    @Output() updateOne = new EventEmitter<number>();
    @Output() deleteFollowing = new EventEmitter<number>();
    @Output() updateFollowing = new EventEmitter<number>();
    @Output() closeDelete = new EventEmitter<void>();
    @Output() closeUpdate = new EventEmitter<void>();

    protected hasAnyErrors = hasAnyErrors;
}