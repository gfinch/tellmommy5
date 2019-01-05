import {Component, OnInit} from '@angular/core';
import {Kid, KidService} from '../../services/kid/kid.service';
import {ActivatedRoute} from '@angular/router';
import {EventsService, EventTopic} from '../../services/events/events.service';
import {NavController} from '@ionic/angular';

@Component({
    selector: 'app-setup-kid-edit',
    templateUrl: './setup-kid-edit.page.html',
    styleUrls: ['./setup-kid-edit.page.scss'],
})
export class SetupKidEditPage implements OnInit {

    undefinedKid = {
        id: '',
        name: '',
        avatar: '',
        lastUpdated: -1
    };

    kidId: string;
    kidToEdit: Kid;
    isEditable: boolean;

    constructor(private route: ActivatedRoute,
                private kidService: KidService,
                private eventsService: EventsService,
                private navController: NavController) {
        this.kidToEdit = this.undefinedKid;
        eventsService.subscribe(EventTopic.KidChanged, (kid: Kid) => {
            if (kid.id == this.kidId) {
                this.refreshKid();
            }
        });
        eventsService.subscribe(EventTopic.ClearAll, () => {
            this.kidToEdit = this.undefinedKid;
        });
    }

    ngOnInit() {
        this.kidId = this.route.snapshot.paramMap.get('id');
        this.refreshKid();
    }

    private refreshKid() {
        this.kidToEdit = this.kidService.getKid(this.kidId);
    }

    private saveEditedKid() {
        this.kidService.updateKid(this.kidId, this.kidToEdit.name, this.kidToEdit.avatar);
    }

    private okButton() {
        this.isEditable = false;
        this.saveEditedKid();
        this.navController.goBack();
    }

    private cancelButton() {
        this.isEditable = false;
        this.navController.goBack();
    }

    chooseNewAvatar() {
        this.navController.navigateForward('/choose-avatar/' + this.kidId);
    }

}
