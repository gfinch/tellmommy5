import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {Moment} from 'moment';
import {ChoreAssignment, Frequency} from '../chore/chore.service';

export class ChoreKeyDetails {
    choreKey: string;
    frequency: Frequency;
    startTime: Moment;
    endTime: Moment;
}

@Injectable({
    providedIn: 'root'
})
export class ChoreKeyService {

    constructor() {
    }

    FORMATS = new Map()
        .set(Frequency.TwiceDaily, 'YYYY_[M]MM_[W]ww_DD_A')
        .set(Frequency.Daily, 'YYYY_[M]MM_[W]ww_DD')
        .set(Frequency.Weekly, 'YYYY_[W]ww')
        .set(Frequency.Monthly, 'YYYY_[M]MM')
        .set(Frequency.OneTime, '[ONETIME]');

    REGEX = new Map()
        .set(Frequency.TwiceDaily, new RegExp('^[0-9]{4}_M[0-9]{2}_W[0-9]{2}_[0-9]{2}_[AP]M$'))
        .set(Frequency.Daily, new RegExp('^[0-9]{4}_M[0-9]{2}_W[0-9]{2}_[0-9]{2}$'))
        .set(Frequency.Weekly, new RegExp('^[0-9]{4}_W[0-9]{2}$'))
        .set(Frequency.Monthly, new RegExp('^[0-9]{4}_M[0-9]{2}$'))
        .set(Frequency.OneTime, new RegExp('^ONETIME$'));

    getChoreKeysForNow(nowMoment: Moment): string[] {
        const choreKeys: string[] = [];
        choreKeys.push(nowMoment.format(this.FORMATS.get(Frequency.OneTime)));
        choreKeys.push(nowMoment.format(this.FORMATS.get(Frequency.Monthly)));
        choreKeys.push(nowMoment.format(this.FORMATS.get(Frequency.Weekly)));
        choreKeys.push(nowMoment.format(this.FORMATS.get(Frequency.Daily)));
        choreKeys.push(nowMoment.format(this.FORMATS.get(Frequency.TwiceDaily)));
        if (nowMoment.hours() >= 12) {
            const twelveHoursAgo = nowMoment.clone().subtract(12, 'hours');
            const morningChoreKey = twelveHoursAgo.format(this.FORMATS.get(Frequency.TwiceDaily));
            choreKeys.push(morningChoreKey);
        } else {
            const twelveHoursAhead = nowMoment.clone().add(12, 'hours');
            const afternoonChoreKey = twelveHoursAhead.format(this.FORMATS.get(Frequency.TwiceDaily));
            choreKeys.push(afternoonChoreKey);
        }
        return choreKeys.sort();
    }

    getChoreKeyForAssignment(nowMoment: Moment, assignment: ChoreAssignment): string {
        const format = this.FORMATS.get(assignment.frequency);
        return nowMoment.format(format);
    }

    getChoreKeysForAssignment(assignment: ChoreAssignment): string[] {
        const now = moment();
        return this.getChoreKeysForAssignmentAtTime(now, assignment);
    }

    getChoreKeysForAssignmentAtTime(originalNow: Moment, assignment: ChoreAssignment): string[] {
        let now = originalNow.clone();
        const twoWeeksAgo = originalNow.clone().subtract(2, 'weeks').startOf('week');
        const assignmentStart = moment(assignment.startTime);
        const choreKeys: string[] = [];

        if (assignment.endTime) { // do nothing
        } else if (assignment.frequency == Frequency.OneTime) {
            const choreKey = this.getChoreKeyForAssignment(now, assignment);
            choreKeys.push(choreKey);
        } else if (assignment.frequency == Frequency.Monthly) {
            if (this.activeInMonth(now, assignmentStart)) {
                const choreKey = this.getChoreKeyForAssignment(now, assignment);
                choreKeys.push(choreKey);
            }

            if (twoWeeksAgo.startOf('month').isBefore(now.startOf('month'))) {
                if (this.activeInMonth(twoWeeksAgo, assignmentStart)) {
                    const choreKey = this.getChoreKeyForAssignment(twoWeeksAgo, assignment);
                    choreKeys.push(choreKey);
                }
            }
        } else if (assignment.frequency == Frequency.Weekly) {
            while (now.isAfter(twoWeeksAgo)) {
                if (this.activeInWeek(now, assignmentStart)) {
                    const choreKey = this.getChoreKeyForAssignment(now, assignment);
                    choreKeys.push(choreKey);
                }
                now = now.subtract(1, 'week');
            }
        } else if (assignment.frequency == Frequency.Daily) {
            while (now.isAfter(twoWeeksAgo)) {
                if (this.activeInDay(now, assignmentStart)) {
                    const choreKey = this.getChoreKeyForAssignment(now, assignment);
                    choreKeys.push(choreKey);
                }
                now = now.subtract(1, 'day');
            }
        } else if (assignment.frequency == Frequency.TwiceDaily) {
            while (now.isAfter(twoWeeksAgo)) {
                if (this.activeInDay(now, assignmentStart)) {
                    const morningTime = now.clone().startOf('day').add(6, 'hours');
                    const afternoonTime = morningTime.clone().add(12, 'hours');
                    const morningKey = this.getChoreKeyForAssignment(morningTime, assignment);
                    const afternoonKey = this.getChoreKeyForAssignment(afternoonTime, assignment);
                    choreKeys.push(morningKey);
                    choreKeys.push(afternoonKey);
                }
                now = now.subtract(1, 'day');
            }
        }

        return choreKeys.sort();
    }

    getFrequencyOfChoreKey(choreKey: string): Frequency {
        if (this.REGEX.get(Frequency.TwiceDaily).test(choreKey)) {
            return Frequency.TwiceDaily;
        } else if (this.REGEX.get(Frequency.Daily).test(choreKey)) {
            return Frequency.Daily;
        } else if (this.REGEX.get(Frequency.Weekly).test(choreKey)) {
            return Frequency.Weekly;
        } else if (this.REGEX.get(Frequency.Monthly).test(choreKey)) {
            return Frequency.Monthly;
        } else {
            return Frequency.OneTime;
        }
    }

    getStartTimeOfChoreKey(choreKey: string, frequency: Frequency): Moment {
        if (frequency == Frequency.OneTime) {
            return null;
        } else if (frequency == Frequency.TwiceDaily && choreKey.endsWith('PM')) {
            return moment(choreKey, this.FORMATS.get(frequency)).hours(13);
        } else {
            return moment(choreKey, this.FORMATS.get(frequency));
        }
    }

    getEndTimeOfChoreKey(choreKey: string, frequency: Frequency): Moment {
        if (frequency == Frequency.OneTime) {
            return null;
        } else if (frequency == Frequency.Monthly) {
            return this.getStartTimeOfChoreKey(choreKey, frequency).endOf('month');
        } else if (frequency == Frequency.Weekly) {
            return this.getStartTimeOfChoreKey(choreKey, frequency).endOf('week');
        } else if (frequency == Frequency.Daily || frequency == Frequency.TwiceDaily) {
            return this.getStartTimeOfChoreKey(choreKey, frequency).endOf('day');
        }
    }

    getChoreKeyDetails(choreKey: string): ChoreKeyDetails {
        const frequency = this.getFrequencyOfChoreKey(choreKey);
        const startTime = this.getStartTimeOfChoreKey(choreKey, frequency);
        const endTime = this.getEndTimeOfChoreKey(choreKey, frequency);
        return {
            choreKey: choreKey,
            frequency: frequency,
            startTime: startTime,
            endTime: endTime
        };
    }

    private activeInMonth(now: Moment,
                          startTime: Moment) {
        const currentMonthStart = now.clone().startOf('month');
        const startMonthStart = startTime.clone().startOf('month');
        return startMonthStart.isSameOrBefore(currentMonthStart);
    }

    private activeInWeek(now: Moment,
                         startTime: Moment) {
        const currentWeekStart = now.clone().startOf('week');
        const startWeekStart = startTime.clone().startOf('week');
        return startWeekStart.isSameOrBefore(currentWeekStart);
    }

    private activeInDay(now: Moment,
                        startTime: Moment) {
        const currentDayStart = now.clone().startOf('day');
        const startDayStart = startTime.clone().startOf('day');
        return startDayStart.isSameOrBefore(currentDayStart);
    }
}

