import {Injectable} from '@angular/core';
import {Kid, KidService} from '../kid/kid.service';
import {Random} from '../../utilities/random/Random';
import {AvatarService} from '../avatar/avatar.service';
import {Chore, ChoreService, Frequency} from '../chore/chore.service';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class TestDataService {

    constructor(private avatarService: AvatarService,
                private kidService: KidService,
                private choreService: ChoreService) {
    }

    generate() {
        this.generateKids();
        window.setTimeout(() => {
            this.randomChoreAssignments(this.kidService);
        }, 1000);
    }

    private generateKids() {
        const count = Random.randomInt(1, 12);
        for (let i = 0; i < count; i++) {
            this.randomKid(i);
        }
    }

    private randomKid(number: number) {
        const name = 'Kid-' + number;
        const avatar = this.avatarService.randomAvatar();
        this.kidService.createKid(name, avatar);
    }

    private randomChoreAssignments(kidService: KidService) {
        this.kidService.listKids().forEach(kid => {
            for (let i = 0; i < 3; i++) {
                this.randomChoreAssignment(kid);
            }
        });
    }

    private randomChoreAssignment(kid: Kid) {
        this.chooseRandomChore().then(chore => {
            const startTime = this.randomStartTime();
            const frequency = this.chooseRandomFrequency();
            const value = Random.randomInt(0, 200);
            this.choreService.assignChore(chore.id, kid.id, value, frequency, startTime);
        });
    }

    private chooseRandomChore(): Promise<Chore> {
        return this.choreService.listChores().then(choreList => {
            const random = Random.randomInt(0, choreList.length);
            return choreList[random];
        });
    }

    private chooseRandomFrequency(): Frequency {
        const random = Random.randomInt(0, 5);
        if (random === 0) {
            return Frequency.Daily;
        } else if (random === 1) {
            return Frequency.TwiceDaily;
        } else if (random === 2) {
            return Frequency.Monthly;
        } else if (random === 3) {
            return Frequency.Weekly;
        } else {
            return Frequency.OneTime;
        }
    }

    private randomStartTime(): number {
        const maximumHoursToSubtract = 24 * 21;
        const randomHoursToSubtract = Random.randomInt(0, maximumHoursToSubtract);
        const now = moment().subtract(randomHoursToSubtract, 'hours');
        return now.toDate().getTime();
    }
}
