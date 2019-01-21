import {Injectable, Optional} from '@angular/core';
import {StorageService} from './storage.service';

@Injectable({
    providedIn: 'root'
})
export class StorageServiceMock extends StorageService {

    data: Map<string, any> = new Map();

    constructor(@Optional() private dataOption?: Map<string, any>) {
        super();
        if (dataOption) {
            this.data = dataOption;
        }
    }

    get(key: string): Promise<any> {
        return new Promise<any>((resolve) => {
            resolve(this.data.get(key));
        });
    }

    waitGet(key, resolver, callback, maxWaitTime?: number) {
        if (this.data.get(key) && resolver(this.data.get(key))) {
            callback(null, true);
        } else {
            console.log('Waiting 100ms for ' + key);
            let waitTime = maxWaitTime ? maxWaitTime : 3000;
            waitTime = waitTime - 100;
            if (waitTime <= 0) {
                callback('Timeout waiting to get ' + key);
            } else {
                window.setTimeout(() => {
                    this.waitGet(key, callback, waitTime);
                }, 100);
            }
        }
    }

    set(key: string, value: any): Promise<any> {
        this.data.set(key, value);
        return new Promise<any>((resolve) => {
            resolve(value);
        });
    }

    clear(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.data.clear();
            resolve();
        });
    }
}
