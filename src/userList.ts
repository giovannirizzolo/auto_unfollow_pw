import fs from 'fs';
import readline from 'readline';
import path from 'path';

export class UserListManager {
    private static instance: UserListManager;
    private users: string[] = [];
    private unavailableUsers: { username: string; reason: string; timestamp: Date }[] = [];

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

    addUnavailableUser(username: string, reason: string): void {
        this.unavailableUsers.push({
            username,
            reason,
            timestamp: new Date()
        });
    }

    getUnavailableUsers(): { username: string; reason: string; timestamp: Date }[] {
        return this.unavailableUsers;
    }

    async saveUnavailableUsers(filePath?: string): Promise<void> {
        const outputPath = filePath || 'lists/unavailable_users.txt';

        // Ensure the directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const content = this.unavailableUsers
            .map(entry => `${entry.username} - ${entry.reason} (${entry.timestamp.toISOString()})`)
            .join('\n');

        await fs.promises.writeFile(outputPath, content, 'utf8');
        console.log(`Saved ${this.unavailableUsers.length} unavailable users to ${outputPath}`);
    }
} 