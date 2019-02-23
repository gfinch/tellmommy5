import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {plainToClass} from 'class-transformer';
import {EventsService, EventTopic} from '../events/events.service';
import {Transaction, TransactionAction, TransactionService, TransactionType} from '../transaction/transaction.service';
import {Kid} from '../kid/kid.service';

export class Chore {
    id: string;
    name: string;
    category: string;
    value: number;
    icon: string;
    author: string;
    sort: number;
}

export enum Frequency {
    TwiceDaily = 'TwiceDaily',
    Daily = 'Daily',
    Weekly = 'Weekly',
    Monthly = 'Monthly',
    OneTime = 'OneTime'
}

export class ChoreAssignment {
    id: string;
    choreId: string;
    kidId: string;
    frequency: Frequency;
    value: number;
    startTime: number;
    endTime: number;
    deleted: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ChoreService {

    choreList: Chore[] = [];
    lastUpdated = -1;
    initialized = false;

    // ChoreId --> KidId --> Assignment
    assignments: Map<string, Map<string, ChoreAssignment>> = new Map();

    constructor(private http: HttpClient,
                private eventsService: EventsService,
                private transactionService: TransactionService) {
        console.log('Instantiating Chore Service');
        this.eventsService.subscribe(EventTopic.AssignmentTransaction, (transactions: Transaction[]) => {
            this.addAssignmentsFromTransaction(transactions);
            this.listChores().then(() => {
                this.initialized = true;
            });
        });
        this.eventsService.subscribe(EventTopic.ClearAll, () => {
            this.choreList = [];
            this.assignments = new Map();
        });
        this.eventsService.subscribe(EventTopic.KidChanged, (kid: Kid) => {
            if (kid.deleted) {
                this.removeKidAssignments(kid);
            }
        });
        this.replayTransactions();
    }

    listChores(): Promise<Chore[]> {
        return new Promise((resolve, reject) => {
            if (this.choreList && this.choreList.length > 0) {
                resolve(this.choreList);
            } else {
                this.http.get<Chore[]>('assets/json/chores.json').subscribe(data => {
                    this.choreList = plainToClass(Chore, data);
                    this.eventsService.publish(EventTopic.ChoreListChanged, this.choreList);
                    resolve(this.choreList);
                }, error => reject(error));
            }
        });
    }

    getChore(choreId: string): Chore {
        return this.choreList.find(chore => {
            return chore.id === choreId;
        });
    }

    assignChore(choreId: string, kidId: string, value: number, frequency: Frequency, startTime: number = new Date().getTime()) {
        const entityId = choreId + '_' + kidId;
        const assignment = {
            id: entityId,
            choreId: choreId,
            kidId: kidId,
            frequency: frequency,
            value: value,
            startTime: startTime,
            endTime: null,
            deleted: false
        };
        this.logTransaction(assignment);
    }

    unassignChore(choreId: string, kidId: string) {
        const assignment = this.getAssignmentForKid(kidId, choreId);
        if (assignment) {
            assignment.deleted = true;
            assignment.endTime = new Date().getTime();
            this.logTransaction(assignment);
        }
    }

    listAssignmentsForChore(choreId: string): ChoreAssignment[] {
        const assignments = this.assignments.get(choreId);
        if (assignments) {
            return Array.from(assignments.values());
        } else {
            return [];
        }
    }

    listAssignmentsForKid(kidId: string): ChoreAssignment[] {
        const assignmentsForKid: ChoreAssignment[] = [];
        this.assignments.forEach((kidMap: Map<string, ChoreAssignment>) => {
            if (kidMap.get(kidId)) {
                assignmentsForKid.push(kidMap.get(kidId));
            }
        });
        return assignmentsForKid;
    }

    isKidAssignedChore(kidId: string, choreId: string): boolean {
        return this.getAssignmentForKid(kidId, choreId) != null;
    }

    getAssignmentById(assignmentId: string): ChoreAssignment {
        let result: ChoreAssignment = null;
        this.assignments.forEach((kidMap: Map<string, ChoreAssignment>) => {
            kidMap.forEach(choreAssignment => {
                if (choreAssignment.id === assignmentId) {
                    result = choreAssignment;
                }
            });
        });
        return result;
    }

    private replayTransactions() {
        this.transactionService
            .replayTransactionsSince(TransactionType.Assignment, this.lastUpdated)
            .catch(err => {
                console.log('Failed to replay transactionMap because ' + err);
            });
    }

    private logTransaction(assignment: ChoreAssignment) {
        const action = assignment.deleted ? TransactionAction.Delete : TransactionAction.Upsert;
        this.transactionService.logTransaction(TransactionType.Assignment, action, assignment.id, assignment, true)
            .catch(err => {
                console.log('Unable to record assignment' + assignment.choreId + ' to ' + assignment.kidId + 'because' + err);
            });
    }

    private getAssignmentForKid(kidId: string, choreId: string): ChoreAssignment {
        const assignments = this.assignments.get(choreId);
        if (assignments) {
            return assignments.get(kidId);
        } else {
            return null;
        }
    }

    private addAssignmentsFromTransaction(transactions: Transaction[]) {
        transactions.forEach(transaction => {
            const assignment = transaction.entity as ChoreAssignment;
            if (!assignment.deleted) {
                this.addAssignment(assignment);
            } else {
                this.removeAssignment(assignment);
            }
            this.eventsService.publish(EventTopic.AssignmentChanged, assignment);
        });
    }

    private addAssignment(assignment: ChoreAssignment) {
        const assignmentsForChore = this.assignments.get(assignment.choreId) || new Map();
        assignmentsForChore.set(assignment.kidId, assignment);
        this.assignments.set(assignment.choreId, assignmentsForChore);
    }

    private removeAssignment(assignment: ChoreAssignment) {
        const assigmentsForChore = this.assignments.get(assignment.choreId) || new Map();
        assigmentsForChore.delete(assignment.kidId);
        if (assigmentsForChore.size === 0) {
            this.assignments.delete(assignment.choreId);
        } else {
            this.assignments.set(assignment.choreId, assigmentsForChore);
        }
    }

    private removeKidAssignments(kid: Kid) {
        Array.from(this.assignments.keys()).forEach(choreId => {
            this.unassignChore(choreId, kid.id);
        });
    }
}
