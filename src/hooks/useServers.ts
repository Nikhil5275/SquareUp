import { useState, useEffect } from "react";
import { Server, MoneyRequest } from "../types";
import {
    db,
    serversCollection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    onSnapshot,
    query,
    where,
    addDoc,
    deleteDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp
} from "../firebase";

export const useServers = (user: any) => {
    const [servers, setServers] = useState<Server[]>([]);
    const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
    const [isCreatingServer, setIsCreatingServer] = useState(false);
    const [newServerName, setNewServerName] = useState("");
    const [loading, setLoading] = useState(true);

    // Load servers from Firestore with real-time updates
    useEffect(() => {
        if (!user) {
            setServers([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        // Query servers where the user is a member
        const q = query(serversCollection, where('memberIds', 'array-contains', user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const serverData: Server[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                const server = {
                    id: doc.id,
                    name: data.name,
                    members: data.members || [],
                    debts: data.debts || [],
                    requests: data.requests || [],
                    createdAt: data.createdAt?.toMillis() || Date.now(),
                    createdBy: data.createdBy,
                    memberIds: data.memberIds || [],
                };
                serverData.push(server);
                
                // Log member updates for debugging
                if (server.members.length > 0) {
                    console.log(`Server "${server.name}" has ${server.members.length} members:`, server.members);
                }
            });

            setServers(serverData);
            setLoading(false);

            // Auto-select first server if none selected
            if (serverData.length > 0 && !selectedServerId) {
                setSelectedServerId(serverData[0].id);
            }
        }, (error) => {
            console.error('Firestore listener error:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const createServer = async (name: string) => {
        if (!name.trim() || !user) return false;

        try {
            const serverData = {
                name: name.trim(),
                members: [user.displayName || user.email || 'Anonymous'],
                debts: [],
                requests: [],
                createdAt: serverTimestamp(),
                createdBy: user.uid,
                memberIds: [user.uid],
            };

            const docRef = await addDoc(serversCollection, serverData);

            // The onSnapshot listener will automatically update the servers state
            setSelectedServerId(docRef.id);
            return true;
        } catch (error) {
            console.error('Error creating server:', error);
            return false;
        }
    };

    const deleteServer = async (serverId: string) => {
        try {
            await deleteDoc(doc(serversCollection, serverId));
            // The onSnapshot listener will automatically update the servers state
            if (selectedServerId === serverId) {
                const remainingServers = servers.filter(s => s.id !== serverId);
                setSelectedServerId(remainingServers.length > 0 ? remainingServers[0].id : null);
            }
        } catch (error) {
            console.error('Error deleting server:', error);
        }
    };

    const addMember = async (serverId: string, memberName: string, memberUid?: string) => {
        if (!memberName.trim()) return false;

        try {
            const serverRef = doc(serversCollection, serverId);
            const serverDoc = await getDoc(serverRef);

            if (!serverDoc.exists()) return false;

            const currentData = serverDoc.data();
            const currentMembers = currentData?.members || [];
            const currentMemberIds = currentData?.memberIds || [];

            // Check if member already exists
            if (currentMembers.includes(memberName.trim())) {
                return false; // Already exists
            }

            const updateData: any = {
                members: arrayUnion(memberName.trim())
            };

            // If we have a member UID (for invited users), add it to memberIds
            if (memberUid && !currentMemberIds.includes(memberUid)) {
                updateData.memberIds = arrayUnion(memberUid);
            }

            await updateDoc(serverRef, updateData);
            return true;
        } catch (error) {
            console.error('Error adding member:', error);
            return false;
        }
    };

    const addDebt = async (serverId: string, from: string, to: string, amount: number) => {
        if (!from || !to || !amount || amount <= 0) return false;

        try {
            const serverRef = doc(serversCollection, serverId);
            const newDebt = { from, to, amount };

            await updateDoc(serverRef, {
                debts: arrayUnion(newDebt)
            });
            return true;
        } catch (error) {
            console.error('Error adding debt:', error);
            return false;
        }
    };

    const simplifyDebts = async (serverId: string) => {
        const server = servers.find(s => s.id === serverId);
        if (!server) return;

        const balance: Record<string, number> = {};
        server.debts.forEach(({ from, to, amount }) => {
            balance[from] = (balance[from] || 0) - amount;
            balance[to] = (balance[to] || 0) + amount;
        });

        const debtors = Object.entries(balance).filter(([_, bal]) => bal < 0);
        const creditors = Object.entries(balance).filter(([_, bal]) => bal > 0);

        const simplified: { from: string; to: string; amount: number }[] = [];
        let i = 0, j = 0;

        while (i < debtors.length && j < creditors.length) {
            const [debtor, debt] = debtors[i];
            const [creditor, credit] = creditors[j];
            const settle = Math.min(-debt, credit);
            simplified.push({ from: debtor, to: creditor, amount: settle });

            debtors[i][1] += settle;
            creditors[j][1] -= settle;

            if (debtors[i][1] === 0) i++;
            if (creditors[j][1] === 0) j++;
        }

        try {
            const serverRef = doc(serversCollection, serverId);
            await updateDoc(serverRef, {
                debts: simplified
            });
        } catch (error) {
            console.error('Error simplifying debts:', error);
        }
    };

    const addRequest = async (serverId: string, request: MoneyRequest) => {
        try {
            const serverRef = doc(serversCollection, serverId);
            await updateDoc(serverRef, {
                requests: arrayUnion(request)
            });
        } catch (error) {
            console.error('Error adding request:', error);
        }
    };

    const updateRequest = async (serverId: string, requestId: string, status: 'pending' | 'approved' | 'rejected') => {
        try {
            const server = servers.find(s => s.id === serverId);
            if (!server) return;

            const updatedRequests = server.requests.map(r =>
                r.id === requestId ? { ...r, status } : r
            );

            const serverRef = doc(serversCollection, serverId);
            await updateDoc(serverRef, {
                requests: updatedRequests
            });
        } catch (error) {
            console.error('Error updating request:', error);
        }
    };

    const approveRequest = async (serverId: string, requestId: string) => {
        const server = servers.find(s => s.id === serverId);
        if (!server) return;

        const request = server.requests.find(r => r.id === requestId);
        if (!request) return;

        try {
            const serverRef = doc(serversCollection, serverId);

            // Update request status
            const updatedRequests = server.requests.map(r =>
                r.id === requestId ? { ...r, status: 'approved' as const } : r
            );

            // Add new debt
            const newDebt = { from: request.to, to: request.from, amount: request.amount };

            await updateDoc(serverRef, {
                requests: updatedRequests,
                debts: arrayUnion(newDebt)
            });
        } catch (error) {
            console.error('Error approving request:', error);
        }
    };

    const removeDebt = async (serverId: string, debtIndex: number) => {
        const server = servers.find(s => s.id === serverId);
        if (!server) return;

        try {
            const debtToRemove = server.debts[debtIndex];
            if (!debtToRemove) return;

            const serverRef = doc(serversCollection, serverId);
            await updateDoc(serverRef, {
                debts: arrayRemove(debtToRemove)
            });
        } catch (error) {
            console.error('Error removing debt:', error);
        }
    };

    const currentServer = servers.find(s => s.id === selectedServerId);

    return {
        servers,
        selectedServerId,
        currentServer,
        isCreatingServer,
        newServerName,
        loading,
        setSelectedServerId,
        setIsCreatingServer,
        setNewServerName,
        createServer,
        deleteServer,
        addMember,
        addDebt,
        simplifyDebts,
        addRequest,
        updateRequest,
        approveRequest,
        removeDebt,
    };
};
