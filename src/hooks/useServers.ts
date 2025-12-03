import { useState, useEffect } from "react";
import { Server, MoneyRequest } from "../types";

export const useServers = (user: any) => {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [isCreatingServer, setIsCreatingServer] = useState(false);
  const [newServerName, setNewServerName] = useState("");

  // Load servers from localStorage
  useEffect(() => {
    if (user) {
      const savedServers = localStorage.getItem(`servers_${user.uid}`);
      if (savedServers) {
        const parsed = JSON.parse(savedServers);
        // Add requests property for backward compatibility
        const serversWithRequests = parsed.map((server: any) => ({
          ...server,
          requests: server.requests || [],
        }));
        setServers(serversWithRequests);
        if (serversWithRequests.length > 0 && !selectedServerId) {
          setSelectedServerId(serversWithRequests[0].id);
        }
      }
    }
  }, [user]);

  // Save servers to localStorage
  useEffect(() => {
    if (user && servers.length > 0) {
      localStorage.setItem(`servers_${user.uid}`, JSON.stringify(servers));
    }
  }, [servers, user]);

  const createServer = (name: string) => {
    if (!name.trim() || !user) return false;

    const newServer: Server = {
      id: Date.now().toString(),
      name: name.trim(),
      members: [],
      debts: [],
      requests: [],
      createdAt: Date.now(),
    };

    setServers(prev => [...prev, newServer]);
    setSelectedServerId(newServer.id);
    return true;
  };

  const deleteServer = (serverId: string) => {
    const updated = servers.filter(s => s.id !== serverId);
    setServers(updated);
    if (selectedServerId === serverId) {
      setSelectedServerId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const addMember = (serverId: string, memberName: string) => {
    if (!memberName.trim()) return false;

    const updated = servers.map(s => {
      if (s.id === serverId) {
        if (s.members.includes(memberName.trim().toLowerCase())) {
          return s; // Already exists
        }
        return { ...s, members: [...s.members, memberName.trim()] };
      }
      return s;
    });

    setServers(updated);
    return true;
  };

  const addDebt = (serverId: string, from: string, to: string, amount: number) => {
    if (!from || !to || !amount || amount <= 0) return false;

    const newDebt = { from, to, amount };
    const updated = servers.map(s =>
      s.id === serverId
        ? { ...s, debts: [...s.debts, newDebt] }
        : s
    );

    setServers(updated);
    return true;
  };

  const simplifyDebts = (serverId: string) => {
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

    const updated = servers.map(s =>
      s.id === serverId
        ? { ...s, debts: simplified }
        : s
    );

    setServers(updated);
  };

  const addRequest = (serverId: string, request: MoneyRequest) => {
    const updated = servers.map(s =>
      s.id === serverId
        ? { ...s, requests: [...s.requests, request] }
        : s
    );
    setServers(updated);
  };

  const updateRequest = (serverId: string, requestId: string, status: 'pending' | 'approved' | 'rejected') => {
    const updated = servers.map(s => {
      if (s.id === serverId) {
        const updatedRequests = s.requests.map(r =>
          r.id === requestId ? { ...r, status } : r
        );
        return { ...s, requests: updatedRequests };
      }
      return s;
    });
    setServers(updated);
  };

  const approveRequest = (serverId: string, requestId: string) => {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;

    const request = server.requests.find(r => r.id === requestId);
    if (!request) return;

    // Update request status and add to debts
    const updated = servers.map(s => {
      if (s.id === serverId) {
        const updatedRequests = s.requests.map(r =>
          r.id === requestId ? { ...r, status: 'approved' as const } : r
        );
        const newDebt = { from: request.to, to: request.from, amount: request.amount };
        return { ...s, requests: updatedRequests, debts: [...s.debts, newDebt] };
      }
      return s;
    });

    setServers(updated);
  };

  const removeDebt = (serverId: string, debtIndex: number) => {
    const updated = servers.map(s => {
      if (s.id === serverId) {
        const newDebts = s.debts.filter((_, idx) => idx !== debtIndex);
        return { ...s, debts: newDebts };
      }
      return s;
    });
    setServers(updated);
  };

  const currentServer = servers.find(s => s.id === selectedServerId);

  return {
    servers,
    selectedServerId,
    currentServer,
    isCreatingServer,
    newServerName,
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
