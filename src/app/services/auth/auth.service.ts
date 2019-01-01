import {Injectable} from '@angular/core';
import {AmplifyService} from '../amplify/amplify.service';
import {StorageService} from '../storage/storage.service';
import {UUID} from '../../utilities/uuid/uuid';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    familyId: string = null;

    constructor(private amplify: AmplifyService,
                private storage: StorageService) {
        console.log('Instantiating AuthService');
    }

    isSignedIn(): boolean {
        return this.familyId !== null;
    }

    signUp(email, password): Promise<string> {
        return new Promise((resolve, reject) => {
            this.getFamilyId().then(familyId => {
                console.log('Got familyId during sign up: ' + familyId);
                this.amplify.signUp(email, password, familyId)
                    .then(data => {
                        console.log('Signup result: ' + JSON.stringify(data));
                        resolve(familyId);
                    })
                    .catch(err => {
                        console.log(err);
                        reject(err);
                    });
            }).catch(err => {
                console.log('Sign up error: ' + JSON.stringify(err));
                reject(err);
            });
        });
    }

    signIn(email, password): Promise<string> {
        return new Promise((resolve, reject) => {
            this.amplify.signIn(email, password).then(data => {
                console.log('Signin result: ' + JSON.stringify(data));
                this.getFamilyIdFromCognito().then(familyId => {
                    if (familyId) {
                        this.setFamilyId(familyId)
                            .then(() => resolve(familyId))
                            .catch(err => reject(err));
                    } else {
                        resolve(null);
                    }
                }).catch(err => {
                    reject(err);
                });
            })
                .catch(err => {
                    console.log('Sign in error: ' + JSON.stringify(err));
                    reject(err);
                });
        });
    }

    forgotPassword(email): Promise<any> {
        return new Promise((resolve, reject) => {
            this.amplify.forgotPassword(email).then(data => {
                console.log('Forgot password result: ' + JSON.stringify(data));
                resolve();
            }).catch(err => {
                console.log('Forgot password error: ' + JSON.stringify(err));
                reject(err);
            });
        });
    }

    forgotPasswordSubmit(email, code, password): Promise<any> {
        return new Promise((resolve, reject) => {
            this.amplify.forgotPasswordSubmit(email, code, password).then(data => {
                console.log('Forgot password submit result: ' + JSON.stringify(data));
                resolve();
            }).catch(err => {
                console.log('Forgot password submit error: ' + JSON.stringify(err));
                reject(err);
            });
        });
    }

    signOut(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.amplify.signOut().then(() => {
                this.familyId = null;
                resolve();
            });
        });
    }

    // Called during register process to create a new family id.
    private getFamilyId(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (this.familyId) {
                resolve(this.familyId);
            } else {
                this.storage.get('familyId').then(familyId => {
                    if (familyId) {
                        this.familyId = familyId;
                        resolve(this.familyId);
                    } else {
                        this.familyId = UUID.random();
                        this.setFamilyId(this.familyId).then(
                            () => resolve(this.familyId)
                        ).catch(err => {
                            reject(err);
                        });
                    }
                }).catch(err => {
                    reject(err);
                });
            }
        });
    }

    // Called during sign in process to retrieve family id.
    private getFamilyIdFromCognito(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.amplify.currentUserInfo().then(userInfo => {
                if (userInfo) {
                    console.log('Found family id in Cognito: ' + userInfo.familyId);
                    resolve(userInfo.familyId);
                } else {
                    console.log('Did not find family id in Cognito.');
                    resolve(null);
                }
            }).catch(err => {
                console.log(err);
                reject(err);
            });
        });
    }

    private setFamilyId(familyId) {
        return new Promise((resolve, reject) => {
            this.familyId = familyId;
            this.storage.set('familyId', familyId)
                .then(() => resolve(familyId))
                .catch(err => reject(err));
        });
    }
}
