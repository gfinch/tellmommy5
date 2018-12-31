import * as md5 from 'md5';

export class MD5 {
    static hash(value) {
        return md5(value);
    }
}
