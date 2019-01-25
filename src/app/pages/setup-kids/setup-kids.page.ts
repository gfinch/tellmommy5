import {Component, OnInit} from '@angular/core';
import {EventsService, EventTopic} from '../../services/events/events.service';
import {Kid, KidService} from '../../services/kid/kid.service';
import {AvatarService} from '../../services/avatar/avatar.service';
import {NavController} from '@ionic/angular';
import {ChoreService} from '../../services/chore/chore.service';

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
                private navController: NavController,
                private choreService: ChoreService) {
        this.kids = kidService.listKids();
        this.listChores();
        this.refreshKids();
        eventsService.subscribe(EventTopic.KidChanged, () => {
            this.refreshKids();
        });
        eventsService.subscribe(EventTopic.ClearAll, () => {
            window.setTimeout(() => {
                this.refreshKids();
            }, 500);
        });
    }

    ngOnInit() {
    }

    listChores() {
        this.choreService.listChores().then(chores => {
            chores.forEach(chore => {
                console.log(chore.name);
            });
        });
    }

    showNewKidEditor() {
        console.log('Enabling new kid editor');
        this.newKidEditorVisible = true;
    }

    hideNewKidEditor() {
        console.log('Disabling new kid editor');
        this.newKidEditorVisible = false;
    }

    refreshKids() {
        this.kids = this.kidService.listKids();
        if (this.kids.length == 0) {
            this.showNewKidEditor();
        }
    }

    saveNewKid() {
        this.hideNewKidEditor();
        if (this.newKid) {
            const avatar = this.avatarService.randomAvatar();
            const kidId = this.kidService.createKid(this.newKid, avatar);
        }
        this.newKid = null;
    }

    cancelNewKid() {
        this.newKid = null;
        this.hideNewKidEditor();
    }

    openKidEditPage(kidId) {
        this.hideNewKidEditor();
        this.navController.navigateForward('/tellmommy/tabs/setup-kids/kids/' + kidId);
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
