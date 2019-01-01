import {Injectable} from '@angular/core';
import {Auth} from 'aws-amplify';
import {MD5} from '../../utilities/md5/md5';

export class UserInfo {
    email: string;
    username: string;
    familyId: string;
}

export abstract class AmplifyService {

    abstract signUp(email: string, password: string, familyId: string): Promise<any>;

    abstract signIn(email: string, password: string): Promise<any>;

    abstract signOut(): Promise<any>;

    abstract forgotPassword(email: string): Promise<any>;

    abstract forgotPasswordSubmit(email: string, code: string, password: string): Promise<any>;

    abstract currentUserInfo(): Promise<UserInfo>;

}

@Injectable({
    providedIn: 'root'
})
export class AmplifyServiceAWS extends AmplifyService {

    constructor() {
        super();
        console.log('Instantiating AmplifyProviderAWS');
    }

    signUp(email: string, password: string, familyId: string): Promise<any> {
        const username = this.generateUserName(email);

        const attributes = {
            email: email,
            profile: familyId
        };

        const request = {
            username: username,
            password: password,
            attributes: attributes
        };

        return Auth.signUp(request);
    }

    signIn(email: string, password: string): Promise<any> {
        const username = this.generateUserName(email);
        return Auth.signIn(username, password);
    }

    signOut(): Promise<any> {
        return Auth.signOut();
    }

    forgotPassword(email: string): Promise<any> {
        const username = this.generateUserName(email);
        return Auth.forgotPassword(username);
    }

    forgotPasswordSubmit(email: string, code: string, password: string): Promise<any> {
        const username = this.generateUserName(email);
        return Auth.forgotPasswordSubmit(username, code, password);
    }

    currentUserInfo(): Promise<UserInfo> {
        return new Promise<UserInfo>((resolve, reject) => {
            console.log('starting user info...');
            Auth.currentUserInfo().then(data => {
                if (data && data.attributes) {
                    console.log('got some data: ' + JSON.stringify(data));
                    const familyId = data.attributes.profile;
                    const email = data.attributes.email;
                    const username = data.attributes.username;
                    resolve({
                        email: email,
                        username: username,
                        familyId: familyId
                    });
                } else {
                    console.log('didn\'t get any data...');
                    resolve(null);
                }
            }).catch(err => reject(err));
        });
    }

    generateUserName(email) {
        return MD5.hash(email.toLowerCase());
    }
}
