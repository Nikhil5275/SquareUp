export interface MoneyRequest {
    id: string;
    from: string; // Person requesting money (logged-in user)
    to: string; // Person who needs to pay
    amount: number;
    description?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: number;
}

export interface Server {
    id: string;
    name: string;
    members: string[];
    debts: { from: string; to: string; amount: number }[];
    requests: MoneyRequest[];
    createdAt: number;
    createdBy: string; // UID of the user who created the server
    memberIds: string[]; // Array of user UIDs who have access
}

export interface Debt {
    from: string;
    to: string;
    amount: number;
    index: number;
}
