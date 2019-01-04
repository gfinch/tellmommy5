import {Component, OnInit} from '@angular/core';
import {EventsService, EventTopic} from '../../services/events/events.service';
import {Kid, KidService} from '../../services/kid/kid.service';
import {AvatarService} from '../../services/avatar/avatar.service';

@Component({
    selector: 'app-setup-kids',
    templateUrl: './setup-kids.page.html',
    styleUrls: ['./setup-kids.page.scss'],
})
export class SetupKidsPage implements OnInit {

    newKidEditorVisible = true;
    kids: Kid[];
    newKid = '';

    constructor(private eventsService: EventsService,
                private kidService: KidService,
                private avatarService: AvatarService) {
        this.kids = kidService.listKids();
        eventsService.subscribe(EventTopic.KidChanged, () => {
            this.kids = kidService.listKids();
        });
        eventsService.subscribe(EventTopic.ClearAll, () => {
            window.setTimeout(() => {
                this.kids = kidService.listKids();
                this.newKidEditorVisible = true;
            }, 500);
        });
    }

    ngOnInit() {
    }

    showNewKidEditor() {
        this.newKidEditorVisible = true;
    }

    saveNewKid() {
        this.newKidEditorVisible = false;
        if (this.newKid) {
            const avatar = this.avatarService.randomAvatar();
            this.kidService.createKid(this.newKid, avatar);
        }
        this.newKid = null;
    }

    cancelNewKid() {
        this.newKid = null;
        this.newKidEditorVisible = false;
    }

    openKidEditPage(kidId) {
        console.log('Go to new kid edit page.');
    }

    reorderKids(event) {
        // Item reordering is a breaking change.
        // Probably kid order needs to be a new entity.
        console.log('Reorder kids.');
    }

    keypress(keyCode) {
        if (keyCode == 'Enter') {
            this.saveNewKid();
            this.newKidEditorVisible = true;
        } else if (keyCode == 'Esc') {
            this.cancelNewKid();
        }
    }

    blur() {
        window.setTimeout(() => {
            if (this.newKidEditorVisible && this.newKid) {
                this.saveNewKid();
            }
        }, 100);
    }
}
