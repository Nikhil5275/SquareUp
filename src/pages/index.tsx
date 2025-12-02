import { useState, useEffect, useRef } from "react";
import {
  Box, Divider, Button, Heading, Text, Input, VStack, HStack, useToast, Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Avatar,
  Switch,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Icon,
  Select,
  Badge,
  Container,
  Flex,
  IconButton,
  useColorModeValue,
  Stack,
  FormLabel,
  NumberInput,
  NumberInputField,
  Tooltip,
} from "@chakra-ui/react";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiMoon,
  FiSun,
  FiLogOut,
  FiLogIn,
  FiPlus,
  FiCheckCircle,
  FiX,
  FiEdit2,
  FiTrash2,
  FiMenu,
  FiServer,
  FiChevronRight,
  FiSettings,
  FiCreditCard,
  FiZap,
  FiSend,
  FiCheck,
  FiXCircle
} from "react-icons/fi";
import { loadStripe } from '@stripe/stripe-js';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');


// Professional logo matching PayPal/Venmo style
const SquareUpLogo = ({ isDark }: { isDark: boolean }) => (
  <Box
    w="40px"
    h="40px"
    bg="#0070BA"
    display="flex"
    alignItems="center"
    justifyContent="center"
    rounded="xl"
    boxShadow="0 2px 8px rgba(0,112,186,0.2)"
  >
    <Icon viewBox="0 0 24 24" boxSize={6} color="#ffffff">
      <path fill="currentColor" d="M12 4l-6 8h4v8h4v-8h4z" />
    </Icon>
  </Box>
);

interface MoneyRequest {
  id: string;
  from: string; // Person requesting money (logged-in user)
  to: string; // Person who needs to pay
  amount: number;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

interface Server {
  id: string;
  name: string;
  members: string[];
  debts: { from: string; to: string; amount: number }[];
  requests: MoneyRequest[];
  createdAt: number;
  ownerId: string;
}

export default function Home() {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [newServerName, setNewServerName] = useState("");
  const [isCreatingServer, setIsCreatingServer] = useState(false);
  const [newMember, setNewMember] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [requestTo, setRequestTo] = useState("");
  const [requestAmount, setRequestAmount] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedDebt, setSelectedDebt] = useState<{ from: string; to: string; amount: number; index: number } | null>(null);
  const [paymentProvider, setPaymentProvider] = useState<string>('stripe');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const isFirstLoad = useRef(true);

  // Get current server data
  const currentServer = servers.find(s => s.id === selectedServerId);
  const groupMembers = currentServer?.members || [];
  const debts = currentServer?.debts || [];
  const requests = currentServer?.requests || [];

  // Filter requests for current user
  const pendingRequestsToMe = requests.filter(
    r => r.to === (user?.displayName || user?.email) && r.status === 'pending'
  );
  const myPendingRequests = requests.filter(
    r => r.from === (user?.displayName || user?.email) && r.status === 'pending'
  );
  const allRequests = requests;

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check for local storage data and migrate if it exists
        const localStorageServers = localStorage.getItem(`servers_${currentUser.uid}`);
        if (localStorageServers && isFirstLoad.current) {
          const parsedServers = JSON.parse(localStorageServers);
          for (const server of parsedServers) {
            const serverRef = doc(db, "servers", server.id);
            await setDoc(serverRef, { ...server, ownerId: currentUser.uid }, { merge: true });
          }
          localStorage.removeItem(`servers_${currentUser.uid}`);
          toast({
            title: "Data migrated",
            description: "Your local data has been migrated to the cloud!",
            status: "info",
            duration: 5000,
            isClosable: true,
          });
        }

        // Load servers from Firestore
        const q = query(collection(db, "servers"), where("ownerId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        const firestoreServers: Server[] = [];
        querySnapshot.forEach((doc) => {
          firestoreServers.push(doc.data() as Server);
        });
        setServers(firestoreServers);
        if (firestoreServers.length > 0 && !selectedServerId) {
          setSelectedServerId(firestoreServers[0].id);
        }
        isFirstLoad.current = false;
      } else {
        setServers([]);
        setSelectedServerId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Save servers to Firestore (debounced to avoid excessive writes)
  useEffect(() => {
    if (user && servers.length > 0) {
      const saveServersToFirestore = async () => {
        for (const server of servers) {
          const serverRef = doc(db, "servers", server.id);
          await setDoc(serverRef, { ...server, ownerId: user.uid }, { merge: true });
        }
      };
      const handler = setTimeout(() => {
        saveServersToFirestore();
      }, 1000); // Debounce by 1 second
      return () => clearTimeout(handler);
    } else if (user && servers.length === 0 && !isFirstLoad.current) {
      // If user is logged in and there are no servers in state, but it's not the first load,
      // it means all servers were deleted. Delete them from Firestore as well.
      const deleteOldServers = async () => {
        const q = query(collection(db, "servers"), where("ownerId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (document) => {
          await deleteDoc(doc(db, "servers", document.id));
        });
      };
      deleteOldServers();
    }
  }, [servers, user]);

  // Handle payment success callback
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const debtIndex = params.get('debtIndex');

    if (paymentStatus === 'success' && debtIndex !== null) {
      const index = parseInt(debtIndex);
      markDebtAsPaid(index);
      toast({
        title: 'Payment successful!',
        description: 'Your payment has been processed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: 'Payment cancelled',
        description: 'Your payment was cancelled',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create new server
  const createServer = async () => {
    if (!newServerName.trim()) {
      toast({
        title: "Invalid name",
        description: "Please enter a server name",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to create a server",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const newServer: Server = {
      id: Date.now().toString(),
      name: newServerName.trim(),
      members: [user.displayName || user.email], // Add owner as first member
      debts: [],
      requests: [],
      createdAt: Date.now(),
      ownerId: user.uid,
    };

    const serverRef = doc(db, "servers", newServer.id);
    await setDoc(serverRef, newServer);

    setServers([...servers, newServer]);
    setSelectedServerId(newServer.id);
    setNewServerName("");
    setIsCreatingServer(false);
    toast({
      title: "Server created",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  // Delete server
  const deleteServer = async (serverId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "servers", serverId));
    const updated = servers.filter(s => s.id !== serverId);
    setServers(updated);
    if (selectedServerId === serverId) {
      setSelectedServerId(updated.length > 0 ? updated[0].id : null);
    }
    toast({
      title: "Server deleted",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  // Google Login
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      toast({
        title: "Login successful",
        description: `Welcome ${result.user.displayName}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Login failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    toast({
      title: "Logged out",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  // ➕ Add a new person
  const addPerson = async () => {
    if (!currentServer || !user) return;
    if (!newMember.trim()) {
      toast({
        title: "Invalid name",
        description: "Please enter a valid person name",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const memberToAdd = newMember.trim();
    if (groupMembers.includes(memberToAdd)) {
      toast({
        title: "Duplicate name",
        description: "This person is already in the group",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const serverRef = doc(db, "servers", currentServer.id);
    await updateDoc(serverRef, {
      members: arrayUnion(memberToAdd)
    });

    setServers(servers.map(s =>
      s.id === selectedServerId
        ? { ...s, members: [...s.members, memberToAdd] }
        : s
    ));
    setNewMember("");
    toast({
      title: "Person added",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  // ➕ Invite a new person
  const invitePerson = async () => {
    if (!currentServer || !user) return;
    if (!newMember.trim() || !newMember.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const invitedEmail = newMember.trim();

    // Check if member is already in the server
    if (groupMembers.includes(invitedEmail)) {
      toast({
        title: "Duplicate member",
        description: "This person is already a member of this server",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const idToken = await user.getIdToken();

      const tokenResponse = await fetch('/api/generate-invite-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          invitedEmail,
          serverId: currentServer.id,
          serverName: currentServer.name,
          senderName: user.displayName || user.email,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(tokenData.message || 'Failed to generate invite token');
      }

      const { inviteLink } = tokenData;

      // Send actual email invitation
      const emailResponse = await fetch('/api/send-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: invitedEmail,
          inviteLink,
          serverName: currentServer.name,
          senderName: user.displayName || user.email,
        }),
      });

      const emailData = await emailResponse.json();

      if (!emailResponse.ok) {
        throw new Error(emailData.message || 'Failed to send invitation email');
      }

      toast({
        title: "Invitation sent!",
        description: `An invitation email has been sent to ${invitedEmail}. They can now join ${currentServer.name}.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setNewMember("");
    } catch (error) {
      console.error("Error inviting person:", error);
      toast({
        title: "Invitation failed",
        description: (error as Error).message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Remove a person
  const removePerson = async (memberToRemove: string) => {
    if (!currentServer || !user) return;

    // Prevent removing the owner if they are the last member
    if (memberToRemove === (user.displayName || user.email) && currentServer.members.length === 1) {
      toast({
        title: "Cannot remove owner",
        description: "You cannot remove yourself if you are the only member. Delete the server instead.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const serverRef = doc(db, "servers", currentServer.id);
    await updateDoc(serverRef, {
      members: arrayRemove(memberToRemove)
    });

    setServers(servers.map(s =>
      s.id === selectedServerId
        ? { ...s, members: s.members.filter(member => member !== memberToRemove) }
        : s
    ));
    toast({
      title: "Person removed",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  // Mark a debt as paid
  const markDebtAsPaid = async (debtIndex: number) => {
    if (!currentServer || !user) return;

    const serverRef = doc(db, "servers", currentServer.id);
    const updatedDebts = currentServer.debts.filter((_, idx) => idx !== debtIndex);

    await updateDoc(serverRef, {
      debts: updatedDebts,
    });

    setServers(servers.map(s =>
      s.id === selectedServerId
        ? { ...s, debts: updatedDebts }
        : s
    ));

    toast({
      title: "Debt marked as paid",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  // Handle a money request (approve/reject)
  const handleMoneyRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    if (!currentServer || !user) return;

    const serverRef = doc(db, "servers", currentServer.id);
    const updatedRequests = currentServer.requests.map(req =>
      req.id === requestId ? { ...req, status } : req
    );

    await updateDoc(serverRef, {
      requests: updatedRequests,
    });

    setServers(servers.map(s =>
      s.id === selectedServerId
        ? { ...s, requests: updatedRequests }
        : s
    ));

    toast({
      title: `Request ${status}`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  // Send money request
  const sendMoneyRequest = async () => {
    if (!currentServer || !user) return;
    if (!requestTo.trim() || !requestAmount.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter recipient and amount",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newRequest: MoneyRequest = {
      id: Date.now().toString(),
      from: user.displayName || user.email,
      to: requestTo.trim(),
      amount: parseFloat(requestAmount.trim()),
      status: 'pending',
      createdAt: Date.now(),
    };

    const serverRef = doc(db, "servers", currentServer.id);
    await updateDoc(serverRef, {
      requests: arrayUnion(newRequest)
    });

    setServers(servers.map(s =>
      s.id === selectedServerId
        ? { ...s, requests: [...s.requests, newRequest] }
        : s
    ));

    setRequestTo("");
    setRequestAmount("");
    setRequestDescription("");
    toast({
      title: "Money request sent",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  // Handle adding new debt (split bill functionality)
  const handleAddDebt = async () => {
    if (!currentServer || !user) return;
    if (!to.trim() || !amount.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter recipient and amount",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newDebt = {
      from: user.displayName || user.email,
      to: to.trim(),
      amount: parseFloat(amount.trim()),
    };

    const serverRef = doc(db, "servers", currentServer.id);
    await updateDoc(serverRef, {
      debts: arrayUnion(newDebt)
    });

    setServers(servers.map(s =>
      s.id === selectedServerId
        ? { ...s, debts: [...s.debts, newDebt] }
        : s
    ));

    setTo("");
    setAmount("");
    toast({
      title: "Debt added",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  // Stripe checkout logic
  const handleCheckout = async () => {
    if (!selectedDebt || !currentServer || !user) return;

    setIsProcessingPayment(true);
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(selectedDebt.amount * 100), // amount in cents
          serverId: currentServer.id,
          debtIndex: selectedDebt.index,
        }),
      });

      const { clientSecret } = await response.json();

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      const { error } = await stripe.confirmPayment({
        elements: stripe.elements({
          clientSecret,
          appearance: { theme: isDarkMode ? 'night' : 'stripe' },
        }),
        confirmParams: {
          return_url: `${window.location.origin}?payment=success&debtIndex=${selectedDebt.index}`,
        },
      });

      if (error) {
        toast({
          title: "Payment failed",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setIsProcessingPayment(false);
      }
    } catch (error) {
      console.error("Stripe checkout error:", error);
      toast({
        title: "Payment error",
        description: "Failed to initiate payment. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsProcessingPayment(false);
    }
  };

  // UI Components and Render Logic
  const iconColor = useColorModeValue("gray.600", "gray.300");

  const ServerCard = ({ server }: { server: Server }) => (
    <Card
      direction={{ base: 'column', sm: 'row' }}
      overflow='hidden'
      variant='outline'
      my={2}
      bg={selectedServerId === server.id ? useColorModeValue("blue.50", "blue.900") : useColorModeValue("white", "gray.700")}
      onClick={() => setSelectedServerId(server.id)}
      cursor="pointer"
    >
      <Stack flex="1">
        <CardBody>
          <HStack justifyContent="space-between">
            <Box>
              <Text fontWeight="bold">{server.name}</Text>
              <Text fontSize="sm" color="gray.500">Members: {server.members.length}</Text>
            </Box>
            <IconButton
              aria-label="Delete server"
              icon={<FiTrash2 />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={(e) => {
                e.stopPropagation();
                deleteServer(server.id);
              }}
            />
          </HStack>
        </CardBody>
      </Stack>
    </Card>
  );

  const MemberItem = ({ member }: { member: string }) => (
    <HStack justifyContent="space-between" p={2} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="md" mb={2}>
      <Avatar name={member} size="sm" />
      <Text>{member}</Text>
      <IconButton
        aria-label="Remove member"
        icon={<FiX />}
        size="sm"
        variant="ghost"
        colorScheme="red"
        onClick={() => removePerson(member)}
      />
    </HStack>
  );

  const DebtItem = ({ debt, index }: { debt: { from: string; to: string; amount: number }, index: number }) => (
    <Card p={3} my={2} bg={useColorModeValue("red.50", "red.900")} variant="outline">
      <Text fontSize="sm">From: <Text as="span" fontWeight="bold">{debt.from}</Text></Text>
      <Text fontSize="sm">To: <Text as="span" fontWeight="bold">{debt.to}</Text></Text>
      <Text fontSize="lg" fontWeight="bold">Amount: ${debt.amount.toFixed(2)}</Text>
      <Button
        size="sm"
        colorScheme="green"
        leftIcon={<FiCheckCircle />}
        mt={2}
        onClick={() => setSelectedDebt({ ...debt, index })} // Set selected debt for modal
      >
        Mark as Paid
      </Button>
    </Card>
  );

  const RequestItem = ({ request }: { request: MoneyRequest }) => (
    <Card p={3} my={2} bg={useColorModeValue("blue.50", "blue.900")} variant="outline">
      <Text fontSize="sm">From: <Text as="span" fontWeight="bold">{request.from}</Text></Text>
      <Text fontSize="sm">To: <Text as="span" fontWeight="bold">{request.to}</Text></Text>
      <Text fontSize="lg" fontWeight="bold">Amount: ${request.amount.toFixed(2)}</Text>
      <Badge colorScheme={request.status === 'pending' ? "orange" : request.status === 'approved' ? "green" : "red"} mt={2}>
        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
      </Badge>
      {request.status === 'pending' && request.to === (user?.displayName || user?.email) && (
        <HStack mt={2}>
          <Button size="sm" colorScheme="green" leftIcon={<FiCheck />} onClick={() => handleMoneyRequest(request.id, 'approved')}>Approve</Button>
          <Button size="sm" colorScheme="red" leftIcon={<FiXCircle />} onClick={() => handleMoneyRequest(request.id, 'rejected')}>Reject</Button>
        </HStack>
      )}
    </Card>
  );

  return (
    <Flex direction="row" minH="100vh" bg={useColorModeValue("gray.100", "gray.800")}>
      {/* Sidebar */}
      <Box
        as="nav"
        pos="fixed"
        top="0"
        left="0"
        zIndex="sticky"
        h="full"
        pb="10"
        overflowX="hidden"
        overflowY="auto"
        bg={useColorModeValue("white", "gray.900")}
        borderColor={useColorModeValue("gray.200", "gray.700")}
        borderRightWidth="1px"
        w={sidebarOpen ? "280px" : "80px"}
        transition="width 0.2s ease-in-out"
      >
        <VStack h="full" justifyContent="space-between" p={4}>
          <Box w="full">
            <HStack justifyContent={sidebarOpen ? "space-between" : "center"} mb={6}>
              {sidebarOpen && <SquareUpLogo isDark={isDarkMode} />}
              <IconButton
                aria-label="Toggle Sidebar"
                icon={<FiMenu />}
                variant="ghost"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              />
            </HStack>
            {user && (
              <Box mb={6} textAlign={sidebarOpen ? "left" : "center"}>
                <Avatar size="md" name={user.displayName || user.email} src={user.photoURL} mb={2} mx={sidebarOpen ? "0" : "auto"} />
                {sidebarOpen && <Text fontWeight="bold">{user.displayName || user.email}</Text>}
                {sidebarOpen && <Text fontSize="sm" color="gray.500">UID: {user.uid}</Text>}
              </Box>
            )}

            <Divider mb={4} />

            {user && sidebarOpen && (
              <VStack align="stretch" spacing={3}>
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="blue"
                  onClick={onOpen} // Open server creation modal
                >
                  Create Server
                </Button>
                <Heading size="sm" mt={4} mb={2}>Your Servers</Heading>
                {servers.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">No servers yet. Create one!</Text>
                ) : (
                  servers.map((server) => (
                    <ServerCard key={server.id} server={server} />
                  ))
                )}
              </VStack>
            )}
          </Box>

          <VStack w="full" spacing={3}>
            <HStack w="full" justifyContent={sidebarOpen ? "space-between" : "center"}>
              {sidebarOpen && <Text>Dark Mode</Text>}
              <Switch isChecked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
            </HStack>
            {user ? (
              <Button
                w="full"
                leftIcon={<FiLogOut />}
                colorScheme="red"
                onClick={handleLogout}
              >
                {sidebarOpen && "Logout"}
              </Button>
            ) : (
              <Button
                w="full"
                leftIcon={<FiLogIn />}
                colorScheme="green"
                onClick={handleLogin}
              >
                {sidebarOpen && "Login with Google"}
              </Button>
            )}
          </VStack>
        </VStack>
      </Box>

      {/* Main Content */}
      <Box
        flex="1"
        ml={sidebarOpen ? "280px" : "80px"}
        transition="margin-left 0.2s ease-in-out"
        p={4}
      >
        {!user ? (
          <Flex direction="column" align="center" justify="center" h="80vh">
            <Heading mb={4}>Welcome to SquareUp</Heading>
            <Text fontSize="lg" mb={6}>Please log in to manage your servers and debts.</Text>
            <Button leftIcon={<FiLogIn />} colorScheme="green" onClick={handleLogin}>
              Login with Google
            </Button>
          </Flex>
        ) : (
          <Box>
            {currentServer ? (
              <Box>
                <HStack justifyContent="space-between" alignItems="center" mb={4}>
                  <Heading size="xl">{currentServer.name}</Heading>
                  <HStack spacing={2}>
                    {/* Additional server actions could go here */}
                    <Button size="sm" leftIcon={<FiSettings />}>Settings</Button>
                  </HStack>
                </HStack>

                <Tabs isLazy mt={6} colorScheme="blue">
                  <TabList>
                    <Tab><Icon as={FiDollarSign} mr={2} />Debts</Tab>
                    <Tab><Icon as={FiUsers} mr={2} />Members</Tab>
                    <Tab><Icon as={FiSend} mr={2} />Requests ({pendingRequestsToMe.length})</Tab>
                    <Tab><Icon as={FiTrendingUp} mr={2} />Activity</Tab>
                  </TabList>

                  <TabPanels p={4} bg={useColorModeValue("white", "gray.700")} borderRadius="md" mt={2}>
                    {/* Debts Tab */}
                    <TabPanel>
                      <Heading size="md" mb={4}>Split a Bill</Heading>
                      <VStack as="form" onSubmit={(e) => { e.preventDefault(); handleAddDebt(); }} spacing={3} mb={6}>
                        <Select
                          placeholder="Who paid? (You)"
                          value={user?.displayName || user?.email}
                          isDisabled
                        />
                        <Select
                          placeholder="Who owes you?"
                          value={to}
                          onChange={(e) => setTo(e.target.value)}
                        >
                          <option value="">Select a member</option>
                          {groupMembers.filter(member => member !== (user?.displayName || user?.email)).map(member => (
                            <option key={member} value={member}>{member}</option>
                          ))}
                        </Select>
                        <Input
                          placeholder="Amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                        <Button type="submit" colorScheme="blue" leftIcon={<FiPlus />}>Add Debt</Button>
                      </VStack>

                      <Divider mb={6} />

                      <Heading size="md" mb={4}>Current Debts</Heading>
                      {debts.length === 0 ? (
                        <Text>No outstanding debts in this server.</Text>
                      ) : (
                        <VStack align="stretch">
                          {debts.map((debt, index) => (
                            <DebtItem key={index} debt={debt} index={index} />
                          ))}
                        </VStack>
                      )}
                    </TabPanel>

                    {/* Members Tab */}
                    <TabPanel>
                      <Heading size="md" mb={4}>Server Members</Heading>
                      <VStack as="form" onSubmit={(e) => { e.preventDefault(); invitePerson(); }} spacing={3} mb={6}>
                        <Input
                          placeholder="New member email"
                          value={newMember}
                          onChange={(e) => setNewMember(e.target.value)}
                          type="email"
                        />
                        <Button type="submit" colorScheme="blue" leftIcon={<FiSend />}>Invite Person</Button>
                      </VStack>

                      <Divider mb={6} />

                      <VStack align="stretch">
                        {groupMembers.length === 0 ? (
                          <Text>No members yet. Invite some!</Text>
                        ) : (
                          groupMembers.map((member) => (
                            <MemberItem key={member} member={member} />
                          ))
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Requests Tab */}
                    <TabPanel>
                      <Heading size="md" mb={4}>Money Requests</Heading>

                      <Tabs isLazy colorScheme="green">
                        <TabList>
                          <Tab>Incoming ({pendingRequestsToMe.length})</Tab>
                          <Tab>Outgoing ({myPendingRequests.length})</Tab>
                          <Tab>All ({allRequests.length})</Tab>
                        </TabList>
                        <TabPanels mt={2}>
                          <TabPanel p={0}>
                            {pendingRequestsToMe.length === 0 ? (
                              <Text>No pending requests to you.</Text>
                            ) : (
                              <VStack align="stretch" mt={4}>
                                {pendingRequestsToMe.map((request) => (
                                  <RequestItem key={request.id} request={request} />
                                ))}
                              </VStack>
                            )}
                          </TabPanel>
                          <TabPanel p={0}>
                            {myPendingRequests.length === 0 ? (
                              <Text>No pending requests from you.</Text>
                            ) : (
                              <VStack align="stretch" mt={4}>
                                {myPendingRequests.map((request) => (
                                  <RequestItem key={request.id} request={request} />
                                ))}
                              </VStack>
                            )}
                          </TabPanel>
                          <TabPanel p={0}>
                            {allRequests.length === 0 ? (
                              <Text>No requests in this server.</Text>
                            ) : (
                              <VStack align="stretch" mt={4}>
                                {allRequests.map((request) => (
                                  <RequestItem key={request.id} request={request} />
                                ))}
                              </VStack>
                            )}
                          </TabPanel>
                        </TabPanels>
                      </Tabs>

                      <Divider my={6} />

                      <Heading size="md" mb={4}>Send a Money Request</Heading>
                      <VStack as="form" onSubmit={(e) => { e.preventDefault(); sendMoneyRequest(); }} spacing={3}>
                        <Select
                          placeholder="Request money from..."
                          value={requestTo}
                          onChange={(e) => setRequestTo(e.target.value)}
                        >
                          <option value="">Select a member</option>
                          {groupMembers.filter(member => member !== (user?.displayName || user?.email)).map(member => (
                            <option key={member} value={member}>{member}</option>
                          ))}
                        </Select>
                        <Input
                          placeholder="Amount"
                          type="number"
                          value={requestAmount}
                          onChange={(e) => setRequestAmount(e.target.value)}
                        />
                        <Input
                          placeholder="Description (optional)"
                          value={requestDescription}
                          onChange={(e) => setRequestDescription(e.target.value)}
                        />
                        <Button type="submit" colorScheme="blue" leftIcon={<FiSend />}>Send Request</Button>
                      </VStack>
                    </TabPanel>

                    {/* Activity Tab */}
                    <TabPanel>
                      <Heading size="md" mb={4}>Recent Activity</Heading>
                      <Text>Coming soon...</Text>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            ) : (
              <Flex direction="column" align="center" justify="center" h="80vh">
                <Heading mb={4}>Select a Server</Heading>
                <Text fontSize="lg" mb={6}>Please select a server from the sidebar or create a new one.</Text>
              </Flex>
            )}
          </Box>
        )}
      </Box>

      {/* Create Server Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Server</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Server Name"
              value={newServerName}
              onChange={(e) => setNewServerName(e.target.value)}
            />
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={() => { createServer(); onClose(); }}>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Payment Confirmation Modal */}
      <Modal isOpen={!!selectedDebt} onClose={() => setSelectedDebt(null)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedDebt && (
              <Box>
                <Text>You are about to pay <Text as="span" fontWeight="bold">${selectedDebt.amount.toFixed(2)}</Text> to <Text as="span" fontWeight="bold">{selectedDebt.to}</Text>.</Text>
                <Text mt={2}>How would you like to pay?</Text>
                <RadioGroup onChange={setPaymentProvider} value={paymentProvider} mt={2}>
                  <Stack direction="row">
                    <Radio value="stripe">Stripe</Radio>
                    {/* <Radio value="paypal">PayPal</Radio> */}
                  </Stack>
                </RadioGroup>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setSelectedDebt(null)}>Cancel</Button>
            <Button
              colorScheme="blue"
              onClick={handleCheckout}
              isLoading={isProcessingPayment}
              loadingText="Processing..."
              isDisabled={paymentProvider !== 'stripe'}
            >
              Pay with {paymentProvider.charAt(0).toUpperCase() + paymentProvider.slice(1)}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}