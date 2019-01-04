import {Injectable} from '@angular/core';
import {Random} from '../../utilities/random/Random';

@Injectable({
    providedIn: 'root'
})
export class AvatarService {

    avatars: string[];

    constructor() {
        console.log('Initializing AvatarService');
        this.initializeAvatars();
    }

    private initializeAvatars() {
        const avatars = ['/assets/avatars/girl.svg', '/assets/avatars/boy.svg'];
        for (let i = 1; i <= 23; i++) {
            const girl = '/assets/avatars/girl-' + i + '.svg';
            const boy = '/assets/avatars/boy-' + i + '.svg';
            avatars.push(girl);
            avatars.push(boy);
        }
        avatars.push('/assets/avatars/girl-24.svg');
        avatars.push('/assets/avatars/girl-25.svg');
        this.avatars = avatars;
    }

    randomAvatar(): string {
        const index = Random.randomInt(0, 50);
        return this.avatars[index];
    }
}
