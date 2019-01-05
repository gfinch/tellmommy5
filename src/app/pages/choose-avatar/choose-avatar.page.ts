import {Component, OnInit} from '@angular/core';
import {AvatarService} from '../../services/avatar/avatar.service';
import {KidService} from '../../services/kid/kid.service';
import {ActivatedRoute} from '@angular/router';
import {NavController} from '@ionic/angular';

@Component({
    selector: 'app-choose-avatar',
    templateUrl: './choose-avatar.page.html',
    styleUrls: ['./choose-avatar.page.scss'],
})
export class ChooseAvatarPage implements OnInit {

    kidId: string;
    avatars: string[] = [];

    constructor(private route: ActivatedRoute,
                private avatarService: AvatarService,
                private kidService: KidService,
                private navController: NavController) {
        this.avatars = this.avatarService.avatars;
    }

    ngOnInit() {
        this.kidId = this.route.snapshot.paramMap.get('id');
    }

    avatarSelected(avatar: string) {
        this.kidService.updateKidAvatar(this.kidId, avatar);
        this.navController.goBack();
    }

    showImageCredits() {
        console.log('Show image credits');
    }

}
