import {Component, OnInit} from '@angular/core';
import {EventsService, EventTopic} from '../../services/events/events.service';
import {Kid, KidService} from '../../services/kid/kid.service';
import {AvatarService} from '../../services/avatar/avatar.service';
import {NavController} from '@ionic/angular';

@Component({
    selector: 'app-setup-kids',
    templateUrl: './setup-kids.page.html',
    styleUrls: ['./setup-kids.page.scss'],
})
export class SetupKidsPage implements OnInit {

    newKidEditorVisible = false;
    kids: Kid[];
    newKid = '';

    constructor(private eventsService: EventsService,
                private kidService: KidService,
                private avatarService: AvatarService,
                private navController: NavController) {
        this.kids = kidService.listKids();
        eventsService.subscribe(EventTopic.KidChanged, () => {
            this.kids = kidService.listKids();
            if (this.kids.length == 0) {
                this.showNewKidEditor();
            }
        });
        eventsService.subscribe(EventTopic.ClearAll, () => {
            window.setTimeout(() => {
                this.kids = kidService.listKids();
                this.showNewKidEditor();
            }, 500);
        });
    }

    ngOnInit() {
    }

    showNewKidEditor() {
        console.log('Enabling new kid editor');
        this.newKidEditorVisible = true;
    }

    hideNewKidEditor() {
        console.log('Disabling new kid editor');
        this.newKidEditorVisible = false;
    }

    saveNewKid() {
        this.hideNewKidEditor();
        if (this.newKid) {
            const avatar = this.avatarService.randomAvatar();
            this.kidService.createKid(this.newKid, avatar);
        }
        this.newKid = null;
    }

    cancelNewKid() {
        this.newKid = null;
        this.hideNewKidEditor();
    }

    openKidEditPage(kidId) {
        this.hideNewKidEditor();
        this.navController.navigateForward('/setup-kid-edit/' + kidId);
    }

    reorderKids(event) {
        // Item reordering is a breaking change.
        // Probably kid order needs to be a new entity.
        console.log('Reorder kids.');
    }

    keypress(keyCode) {
        if (keyCode == 'Enter') {
            this.saveNewKid();
            this.showNewKidEditor();
        }
    }

    blur() {
        window.setTimeout(() => {
            if (this.newKidEditorVisible && this.newKid) {
                this.saveNewKid();
            } else {
                this.hideNewKidEditor();
            }
        }, 100);
    }
}
