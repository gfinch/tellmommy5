import {Injectable} from '@angular/core';
import {Transaction, TransactionAction, TransactionService, TransactionType} from '../transaction/transaction.service';
import {RewardSystem, RewardSystemService} from '../reward-system/reward-system.service';
import {BankService} from '../bank/bank.service';
import {EventsService, EventTopic} from '../events/events.service';
import {Chore, ChoreAssignment, ChoreService, Frequency} from '../chore/chore.service';
import {ChoreKeyDetails, ChoreKeyService} from '../chore-key/chore-key.service';
import {Kid, KidService} from '../kid/kid.service';
import * as moment from 'moment';
import {Moment} from 'moment';

export enum ReportingGroup {
    Remaining = 1,
    FinishedToday,
    EndedYesterday,
    EndedThisWeek,
    EndedLastWeek,
    EndedTwoWeeksAgo
}

export class CompleteChore {
    id: string;
    assignmentId: string;
    choreKey: string;
    value: number;
    lastUpdated: number;
    deleted: boolean;
}

export class CompletableChore extends CompleteChore {
    completed: boolean;
    rewardSystem: RewardSystem;
    choreKeyDetails: ChoreKeyDetails;
    kid: Kid;
    chore: Chore;
    assignment: ChoreAssignment;
}

@Injectable({
    providedIn: 'root'
})
export class ChoreChartService {

    initialized = false;

    // KidId -> AssignmentId -> ChoreKey -> CompleteChore
    completedChoreMap: Map<string, Map<string, Map<string, CompleteChore>>> = new Map();

    // KidId -> AssignmentId -> ChoreKey -> CompletableChore
    completableChoreMap: Map<string, Map<string, Map<string, CompletableChore>>> = new Map();

    // AssignmentId -> CompletedChore[]
    pendingCompletedChores: Map<string, CompleteChore[]> = new Map();

    constructor(private transactionService: TransactionService,
                private bankService: BankService,
                private choreService: ChoreService,
                private kidService: KidService,
                private rewardSystemService: RewardSystemService,
                private choreKeyService: ChoreKeyService,
                private eventService: EventsService) {

        this.eventService.subscribe(EventTopic.DoAssignmentTransaction, (transactions: Transaction[]) => {
            this.handleDoAssignmentTransactions(transactions);
            this.refreshCompletableChoreMap();
            this.eventService.publish(EventTopic.DoAssignment);
            this.initialized = true;
        });

        this.eventService.subscribe(EventTopic.AssignmentChanged, () => {
            this.handleAssignmentChanged();
            this.refreshCompletableChoreMap();
        });

        this.eventService.subscribe(EventTopic.RewardSystemChanged, () => {
            this.refreshCompletableChoreMap();
        });

        this.eventService.subscribe(EventTopic.KidChanged, () => {
            this.refreshCompletableChoreMap();
        });

        this.transactionService.replayTransactionsSince(TransactionType.DoAssignment, -1);
    }

    completeChore(cc: CompletableChore) {
        const assignmentTransactionId = this.assignmentTransactionId(cc.assignmentId, cc.choreKey);
        const completedChore: CompleteChore = {
            id: assignmentTransactionId,
            assignmentId: cc.assignmentId,
            choreKey: cc.choreKey,
            value: cc.value,
            lastUpdated: new Date().getTime(),
            deleted: false
        };

        this.transactionService.logTransaction(TransactionType.DoAssignment,
            TransactionAction.Upsert, completedChore.id, completedChore, true).then(() => {
            this.bankService.depositToAllAccounts(cc.rewardSystem as RewardSystem, cc.kid.id, cc.value,
                assignmentTransactionId, cc.chore.name);
        });
    }

    uncompleteChore(cc: CompletableChore) {
        if (cc.completed) {
            const uncompletedChore: CompleteChore = {
                id: cc.id,
                assignmentId: cc.assignmentId,
                choreKey: cc.choreKey,
                value: cc.value,
                lastUpdated: new Date().getTime(),
                deleted: true
            };

            this.transactionService.logTransaction(TransactionType.DoAssignment,
                TransactionAction.Delete, uncompletedChore.id, uncompletedChore, true).then(() => {
                this.bankService.cancelAssignmentTransactions(cc.rewardSystem as RewardSystem,
                    cc.kid.id, uncompletedChore.id);
            });
        }
    }

    makeChoreChartForKid(kid: Kid, now: Moment = moment()): Map<ReportingGroup, CompletableChore[]> {
        const allChoresToDo = this.listChoresForKid(kid);
        console.log('Got some chores for my kiddo ' + kid.name + '/' + allChoresToDo);

        const activeKeys = this.choreKeyService.getChoreKeysForNow(now);
        const todayStart = now.clone().startOf('day');
        const todayEnd = now.clone().endOf('day');
        const yesterdayStart = todayStart.clone().subtract(1, 'day');
        const yesterdayEnd = todayEnd.clone().subtract(1, 'day');
        const weekStart = now.clone().startOf('week');
        const weekEnd = now.clone().endOf('week');
        const lastWeekStart = weekStart.clone().subtract(1, 'week');
        const lastWeekEnd = weekEnd.clone().subtract(1, 'week');
        const priorWeekStart = weekStart.clone().subtract(2, 'weeks');
        const priorWeekEnd = weekEnd.clone().subtract(2, 'weeks');

        const [remaining, finishedToday, endedYesterday, endedThisWeek, endedLastWeek, endedTwoWeeksAgo, expiredChores] =
            allChoresToDo.reduce((result, choreToDo) => {
                if (!choreToDo.completed && activeKeys.find(key => choreToDo.choreKey == key)) {
                    result[0].push(choreToDo);
                } else if (this.choreEndsInRange(choreToDo, todayStart, todayEnd)) {
                    result[1].push(choreToDo);
                } else if (this.choreEndsInRange(choreToDo, yesterdayStart, yesterdayEnd)) {
                    result[2].push(choreToDo);
                } else if (this.choreEndsInRange(choreToDo, weekStart, weekEnd)) {
                    result[3].push(choreToDo);
                } else if (this.choreEndsInRange(choreToDo, lastWeekStart, lastWeekEnd)) {
                    result[4].push(choreToDo);
                } else if (this.choreEndsInRange(choreToDo, priorWeekStart, priorWeekEnd)) {
                    result[5].push(choreToDo);
                } else {
                    result[6].push(choreToDo);
                }
                return result;
            }, [[], [], [], [], [], [], []]);

        console.log('Done mapping chores for my kiddo ' + kid.name + '/' + remaining);

        return new Map()
            .set(ReportingGroup.Remaining, this.sortChores(remaining))
            .set(ReportingGroup.FinishedToday, this.sortChores(finishedToday))
            .set(ReportingGroup.EndedYesterday, this.sortChores(endedYesterday))
            .set(ReportingGroup.EndedThisWeek, this.sortChores(endedThisWeek))
            .set(ReportingGroup.EndedLastWeek, this.sortChores(endedLastWeek))
            .set(ReportingGroup.EndedTwoWeeksAgo, this.sortChores(endedTwoWeeksAgo));
    }

    findAssignment(assignmentTransactionId: string): ChoreAssignment {
        const tokens = assignmentTransactionId.split('-');
        const assignmentId = tokens[0];
        return this.choreService.getAssignmentById(assignmentId);
    }

    private choreEndsInRange(chore: CompletableChore, rangeStart: Moment, rangeEnd: Moment): boolean {
        if (chore.assignment.frequency == Frequency.OneTime || chore.assignment.frequency == Frequency.Monthly) {
            if (chore.completed) {
                const finishTime = moment(chore.lastUpdated);
                return finishTime.isSameOrAfter(rangeStart) && finishTime.isSameOrBefore(rangeEnd);
            } else {
                return false;
            }
        } else if (chore.assignment.frequency == Frequency.Weekly) {
            const endTime = this.choreKeyService.getEndTimeOfChoreKey(chore.choreKey, chore.assignment.frequency);
            if (chore.completed && endTime.isAfter(rangeEnd)) {
                const finishTime = moment(chore.lastUpdated);
                return finishTime.isSameOrAfter(rangeStart) && finishTime.isSameOrBefore(rangeEnd);
            } else {
                return endTime.isSameOrAfter(rangeStart) && endTime.isSameOrBefore(rangeEnd);
            }
        } else {
            const endTime = this.choreKeyService.getEndTimeOfChoreKey(chore.choreKey, chore.assignment.frequency);
            return endTime.isSameOrAfter(rangeStart) && endTime.isSameOrBefore(rangeEnd);
        }
    }

    private sortChores(chores: CompletableChore[]): CompletableChore[] {
        return chores.sort((a, b) => {
            if (a.completed && b.completed) {
                return b.lastUpdated - a.lastUpdated;
            } else if (a.completed) {
                return -1;
            } else if (b.completed) {
                return 1;
            } else if (b.choreKeyDetails && a.choreKeyDetails && b.choreKeyDetails.endTime && a.choreKeyDetails.endTime) {
                return b.choreKeyDetails.endTime.valueOf() - a.choreKeyDetails.endTime.valueOf();
            } else {
                return 0;
            }
        });
    }

    private assignmentTransactionId(assignmentId: string, choreKey: string): string {
        return assignmentId + '_' + choreKey;
    }

    private handleDoAssignmentTransactions(transactions: Transaction[]) {
        transactions.forEach(transaction => {
            const completedChore = transaction.entity as CompleteChore;
            this.handleCompletedChore(completedChore);
        });
    }

    private handleCompletedChore(completedChore: CompleteChore) {
        const assignment = this.choreService.getAssignmentById(completedChore.assignmentId);
        if (assignment) {
            const kidMap = this.completedChoreMap.get(assignment.kidId) || new Map();
            const assignmentMap = kidMap.get(assignment.id) || new Map();
            if (completedChore.deleted) {
                assignmentMap.delete(completedChore.choreKey);
            } else {
                assignmentMap.set(completedChore.choreKey, completedChore);
            }
            kidMap.set(assignment.id, assignmentMap);
            this.completedChoreMap.set(assignment.kidId, kidMap);
        } else {
            const pendingForAssignment = this.pendingCompletedChores.get(completedChore.assignmentId) || [];
            pendingForAssignment.push(completedChore);
            this.pendingCompletedChores.set(completedChore.assignmentId, pendingForAssignment);
        }
    }

    private handleAssignmentChanged() {
        this.pendingCompletedChores.forEach((completedChores, assignmentId) => {
            if (this.choreService.getAssignmentById(assignmentId)) {
                this.pendingCompletedChores.delete(assignmentId);
                completedChores.forEach(completedChore => {
                    this.handleCompletedChore(completedChore);
                });
            }
        });
    }

    private refreshCompletableChoreMap() {
        this.completableChoreMap = new Map();
        this.kidService.listKids().forEach(kid => {
            const kidMap = new Map();
            this.choreService.listAssignmentsForKid(kid.id).forEach(assignment => {
                const assignmentMap = new Map();
                this.choreKeyService.getChoreKeysForAssignment(assignment).forEach(choreKey => {
                    const completeChore = this.findCompletedChore(kid, assignment, choreKey);
                    if (completeChore) {
                        const completableChore = this.mapToCompleteableChore(completeChore);
                        assignmentMap.set(choreKey, completableChore);
                    } else {
                        const completableChore = this.createCompleteableChore(kid, assignment, choreKey);
                        assignmentMap.set(choreKey, completableChore);
                    }
                });
                kidMap.set(assignment.id, assignmentMap);
            });
            this.completableChoreMap.set(kid.id, kidMap);
        });
    }

    private mapToCompleteableChore(completedChore: CompleteChore): CompletableChore {
        const rewardSystem = this.rewardSystemService.rewardSystem;
        const choreKeyDetails = this.choreKeyService.getChoreKeyDetails(completedChore.choreKey);
        const assigment = this.choreService.getAssignmentById(completedChore.assignmentId);
        const kid = this.kidService.getKid(assigment.kidId);
        const chore = this.choreService.getChore(assigment.choreId);

        return {
            id: completedChore.id,
            rewardSystem: rewardSystem,
            assignmentId: completedChore.assignmentId,
            choreKey: completedChore.choreKey,
            value: completedChore.value,
            lastUpdated: completedChore.lastUpdated,
            deleted: completedChore.deleted,
            completed: true,
            choreKeyDetails: choreKeyDetails,
            kid: kid,
            chore: chore,
            assignment: assigment
        };
    }

    private createCompleteableChore(kid: Kid, assignment: ChoreAssignment, choreKey: string): CompletableChore {
        const rewardSystem = this.rewardSystemService.rewardSystem;
        const choreKeyDetails = this.choreKeyService.getChoreKeyDetails(choreKey);
        const chore = this.choreService.getChore(assignment.choreId);
        const id = this.assignmentTransactionId(assignment.id, choreKey);

        return {
            id: id,
            rewardSystem: rewardSystem,
            assignmentId: assignment.id,
            choreKey: choreKey,
            value: assignment.value,
            lastUpdated: -1,
            deleted: false,
            completed: false,
            choreKeyDetails: choreKeyDetails,
            kid: kid,
            chore: chore,
            assignment: assignment
        };
    }

    private findCompletedChore(kid: Kid, assignment: ChoreAssignment, choreKey: string): CompleteChore {
        const kidMap = this.completedChoreMap.get(kid.id) || new Map();
        const assignmentMap = kidMap.get(assignment.id) || new Map();
        return assignmentMap.get(choreKey);
    }

    private listChoresForKid(kid: Kid): CompletableChore[] {
        const results: CompletableChore[] = [];
        const assigmentMap = this.completableChoreMap.get(kid.id);
        assigmentMap.forEach(choreKeyMap => {
            choreKeyMap.forEach(completableChore => {
                results.push(completableChore);
            });
        });
        return results;
    }
}
