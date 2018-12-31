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

    set(key: string, value: any): Promise<any> {
        return new Promise<any>((resolve) => {
            this.data.set(key, value);
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
