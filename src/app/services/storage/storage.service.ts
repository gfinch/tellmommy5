import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage';

export abstract class StorageService {

    abstract get(key: string): Promise<any>;

    abstract set(key: string, value: any): Promise<any>;

    abstract clear(): Promise<void>;

}

@Injectable({
    providedIn: 'root'
})
export class StorageServiceIonic extends StorageService {
    constructor(private storage: Storage) {
        super();
    }

    get(key: string): Promise<any> {
        return this.storage.get(key);
    }

    set(key: string, value: any): Promise<any> {
        return this.storage.set(key, value);
    }

    clear(): Promise<void> {
        return this.storage.clear();
    }
}
