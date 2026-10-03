export declare class UsersService {
    private readonly users;
    create(data: {
        email: string;
        password: string;
    }): {
        id: number;
        email: string;
        password: string;
    };
    findByEmail(email: string): {
        id: number;
        email: string;
        password: string;
    };
}
