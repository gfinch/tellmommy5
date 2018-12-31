import {MD5} from '../../utilities/md5/md5';
import {AmplifyService, UserInfo} from './amplify.service';
import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AmplifyServiceMock extends AmplifyService {

    constructor() {
        super();
        console.log('Instantiating AmplifyProviderMock');
    }

    signUp(email: string, password: string, familyId: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const username = MD5.hash(email);
            resolve({
                email: email,
                username: username,
                familyId: familyId
            });
        });
    }

    signIn(email: string, password: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const username = MD5.hash(email);

            resolve({
                email: email,
                username: username,
                familyId: 'some-family-id'
            });
        });
    }

    forgotPassword(email: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const username = MD5.hash(email);

            resolve({
                email: email,
                username: username,
                familyId: 'some-family-id'
            });
        });
    }

    forgotPasswordSubmit(email: string, code: string, password: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const username = MD5.hash(email);

            resolve({
                email: email,
                username: username,
                familyId: 'some-family-id'
            });
        });
    }

    currentUserInfo(): Promise<UserInfo> {
        return new Promise<UserInfo>((resolve, reject) => {
            resolve({
                email: 'some-email',
                username: 'some-username',
                familyId: 'some-family-id'
            });
        });
    }
}
