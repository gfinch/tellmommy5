const uuidv4 = require('uuid/v4');

export class UUID {
    static random() {
        return uuidv4();
    }
}
