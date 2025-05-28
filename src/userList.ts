import fs from 'fs';
import readline from 'readline';

export class UserListManager {
    private static instance: UserListManager;
    private users: string[] = [];

    private constructor() { }

    static getInstance(): UserListManager {
        if (!UserListManager.instance) {
            UserListManager.instance = new UserListManager();
        }
        return UserListManager.instance;
    }

    async loadUsers(filePath: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const fileStream = fs.createReadStream(filePath);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });

            this.users = [];

            rl.on('line', (user) => {
                this.users.push(user);
            });

            rl.on('close', () => {
                resolve(this.users);
            });

            rl.on('error', (error) => {
                reject(error);
            });
        });
    }

    getUsers(): string[] {
        return this.users;
    }
} 