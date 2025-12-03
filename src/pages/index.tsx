import { useState, useEffect } from "react";
import {
  Box, Divider, Button, Text, Input, VStack, HStack, useToast, Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Avatar,
  Card,
  CardBody,
  CardFooter,
  Icon,
  Select,
  Badge,
  Container,
  FormLabel,
  NumberInput,
  NumberInputField,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiPlus,
  FiCheckCircle,
  FiX,
  FiEdit2,
  FiTrash2,
  FiMenu,
  FiCreditCard,
  FiSend,
  FiCheck,
  FiXCircle,
  FiServer,
  FiLogIn
} from "react-icons/fi";
import { loadStripe } from '@stripe/stripe-js';
import { useDisclosure } from "@chakra-ui/react";

// Components
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { PaymentModal } from "../components/PaymentModal";

// Hooks
import { useAuth } from "../hooks/useAuth";
import { useServers } from "../hooks/useServers";
import { usePayment } from "../hooks/usePayment";

// Types
import { MoneyRequest } from "../types";

// Config
import { primary, successColor, errorColor, warningColor } from "../constants/theme";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Firebase auth and provider imported from firebase.ts

export default function Home() {
  // Local state for forms
  const [newMember, setNewMember] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [requestTo, setRequestTo] = useState("");
  const [requestAmount, setRequestAmount] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Hooks
  const { user, login, logout } = useAuth();
  const {
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
  } = useServers(user);

  const {
    selectedDebt,
    paymentProvider,
    isProcessingPayment,
    setPaymentProvider,
    initiatePayment,
    processPayment,
    closePaymentModal,
  } = usePayment();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Get current server data
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
  const handleCreateServer = () => {
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

    const success = createServer(newServerName.trim());
    if (success) {
      setNewServerName("");
      setIsCreatingServer(false);
      toast({
        title: "Server created",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // Delete server
  const handleDeleteServer = (serverId: string) => {
    deleteServer(serverId);
    toast({
      title: "Server deleted",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  // Google Login
  const handleLogin = async () => {
    const result = await login();
    if (result.success && result.user) {
      toast({
        title: "Login successful",
        description: `Welcome ${result.user.displayName}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Login failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  // ➕ Add a new person
  const handleAddPerson = () => {
    if (!currentServer || !selectedServerId) return;
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

    const success = addMember(selectedServerId, newMember.trim());
    if (!success) {
      toast({
        title: "Duplicate name",
        description: "This person is already in the group",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setNewMember("");
    toast({
      title: "Person added",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleAddDebt = () => {
    if (!currentServer || !selectedServerId || !user) return;
    if (!to || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please select valid friends and amount",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const success = addDebt(
      selectedServerId,
      user.displayName || user.email || "You",
      to,
      parseFloat(amount)
    );

    if (success) {
      setTo("");
      setAmount("");
      toast({
        title: "Expense added",
        description: `Successfully recorded expense of $${parseFloat(amount).toFixed(2)}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // Send email invitation
  const sendInvitation = async () => {
    if (!user || !currentServer || !inviteEmail.trim()) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSendingInvite(true);

    try {
      // Generate invite link (simple version)
      const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/join?email=${encodeURIComponent(inviteEmail.trim())}&server=${encodeURIComponent(currentServer.name)}`;

      // Send the invitation email
      const emailResponse = await fetch('/api/send-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: inviteEmail.trim(),
          inviteLink,
          serverName: currentServer.name,
          senderName: user.displayName || user.email || 'Someone',
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(errorData.message || 'Failed to send invitation email');
      }

      const result = await emailResponse.json();

      toast({
        title: "Invitation sent!",
        description: `An email has been sent to ${inviteEmail}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setInviteEmail("");

    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Failed to send invitation",
        description: error.message || "An error occurred while sending the invitation",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  const toggleBackground = () => setIsDarkMode((prev) => !prev);

  // Handle payment
  const handlePayment = async (debt: { from: string; to: string; amount: number }, index: number) => {
    initiatePayment(debt, index);
    onOpen();
  };

  const handleProcessPayment = async () => {
    if (!user) return;

    try {
      if (paymentProvider === 'stripe') {
        // For Stripe, close modal first since redirect will happen immediately
        onClose();
        closePaymentModal();
        // Note: processPayment will redirect, so code below won't execute for Stripe
      } else if (paymentProvider === 'venmo' || paymentProvider === 'paypal') {
        toast({
          title: `${paymentProvider === 'venmo' ? 'Venmo' : 'PayPal'} Payment`,
          description: `Redirecting to ${paymentProvider === 'venmo' ? 'Venmo' : 'PayPal'}...`,
          status: 'info',
          duration: 3000,
        });
      }

      await processPayment(selectedServerId, user.uid, (debtIndex) => {
        removeDebt(selectedServerId!, debtIndex);
      });

      // Only close modal for non-Stripe payments (Stripe already closed above)
      if (paymentProvider !== 'stripe') {
        onClose();
        closePaymentModal();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment failed',
        description: error.message || 'An error occurred processing your payment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsProcessingPayment(false);
    }
  };

  const markDebtAsPaid = (debtIndex: number) => {
    if (!selectedServerId) return;
    removeDebt(selectedServerId, debtIndex);
    toast({
      title: 'Payment successful',
      description: 'Debt has been marked as paid',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Create money request
  const createRequest = () => {
    if (!currentServer || !user) return;
    if (!requestTo || !requestAmount || isNaN(parseFloat(requestAmount)) || parseFloat(requestAmount) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please select a person and enter a valid amount",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newRequest: MoneyRequest = {
      id: Date.now().toString(),
      from: user.displayName || user.email || "You",
      to: requestTo,
      amount: parseFloat(requestAmount),
      description: requestDescription.trim() || undefined,
      status: 'pending',
      createdAt: Date.now(),
    };

    if (selectedServerId) {
      addRequest(selectedServerId, newRequest);
    }
    setRequestTo("");
    setRequestAmount("");
    setRequestDescription("");

    toast({
      title: "Request sent",
      description: `Request sent to ${requestTo}`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };


  // Reject request
  const rejectRequest = (requestId: string) => {
    if (!selectedServerId) return;
    updateRequest(selectedServerId, requestId, 'rejected');
    toast({
      title: "Request rejected",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  // PayPal/Venmo-inspired professional color scheme
  const primary = "#0070BA"; // PayPal blue
  const primaryHover = "#005EA6";
  const primaryLight = "#E6F2FF";
  const bgColor = useColorModeValue("#F7F9FA", "#0A0E27");
  const cardBg = useColorModeValue("#FFFFFF", "#1A1F3A");
  const borderColor = useColorModeValue("#E1E8ED", "#2A3454");
  const subtleBg = useColorModeValue("#F7F9FA", "#151B35");
  const hoverBg = useColorModeValue("#F0F4F8", "#1F2640");

  const textColor = useColorModeValue("#1C1E21", "#E4E6EB");
  const mutedText = useColorModeValue("#65676B", "#B0B3B8");
  const labelColor = useColorModeValue("#424242", "#CCCCCC");

  // Success/Error colors
  const successColor = "#00A86B";
  const errorColor = "#E53E3E";
  const warningColor = "#FFB800";

  return (
    <Box minHeight="100vh" bg="gray.50" position="relative" display="flex">
      {/* Sidebar */}
      <Sidebar
        servers={servers}
        selectedServerId={selectedServerId}
        isCreatingServer={isCreatingServer}
        newServerName={newServerName}
        user={user}
        isDarkMode={isDarkMode}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onCreateServer={handleCreateServer}
        onCancelCreateServer={() => {
          setIsCreatingServer(false);
          setNewServerName("");
        }}
        onNewServerNameChange={setNewServerName}
        onServerSelect={setSelectedServerId}
        onDeleteServer={handleDeleteServer}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onToggleTheme={toggleBackground}
      />

      {/* Main Content */}
      <Box flex={1} display="flex" flexDirection="column" minW={0}>
        {/* Top Header */}
        <Header
          currentServer={currentServer}
          user={user}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onLogin={handleLogin}
        />

        {/* Main Content Area */}
        <Box flex={1} overflowY="auto">
          {!currentServer ? (
            <Container maxW="1200px" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }}>
              <Box textAlign="center" py={20}>
                <Icon as={FiServer} boxSize={16} color={mutedText} opacity={0.3} mb={4} />
                <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
                  {servers.length === 0 ? "No servers yet" : "Select a server"}
                </Text>
                <Text fontSize="sm" color={mutedText} mb={6}>
                  {servers.length === 0
                    ? "Create a server from the sidebar to get started"
                    : "Choose a server from the sidebar to manage expenses"}
                </Text>
                {servers.length === 0 && user && (
                  <Button
                    leftIcon={<Icon as={FiPlus} />}
                    onClick={() => setIsCreatingServer(true)}
                    bg={primary}
                    color="black"
                    _hover={{ bg: primaryHover }}
                  >
                    Create Server
                  </Button>
                )}
              </Box>
            </Container>
          ) : (
            <Container maxW="1200px" px={{ base: 4, md: 6 }} py={{ base: 8, md: 10 }}>
              <Card
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                shadow="0 1px 3px rgba(0,0,0,0.1)"
                rounded="2xl"
                overflow="hidden"
              >
                <CardBody p={0}>
                  <Tabs variant="unstyled" size="md">
                    <TabList
                      borderBottom="1px solid"
                      borderColor={borderColor}
                      px={8}
                      pt={6}
                      bg={cardBg}
                    >
                      <Tab
                        _selected={{
                          color: primary,
                          borderBottom: `3px solid ${primary}`,
                          fontWeight: "700",
                        }}
                        color={mutedText}
                        fontWeight="500"
                        fontSize="sm"
                        px={5}
                        py={4}
                        mr={6}
                        borderBottom="3px solid transparent"
                        transition="all 0.2s"
                        _hover={{ color: textColor }}
                      >
                        <HStack spacing={2.5}>
                          <Icon as={FiDollarSign} boxSize={4.5} />
                          <Text>Expenses</Text>
                        </HStack>
                      </Tab>
                      <Tab
                        _selected={{
                          color: primary,
                          borderBottom: `3px solid ${primary}`,
                          fontWeight: "700",
                        }}
                        color={mutedText}
                        fontWeight="500"
                        fontSize="sm"
                        px={5}
                        py={4}
                        mr={6}
                        borderBottom="3px solid transparent"
                        transition="all 0.2s"
                        _hover={{ color: textColor }}
                      >
                        <HStack spacing={2.5}>
                          <Icon as={FiTrendingUp} boxSize={4.5} />
                          <Text>Debts</Text>
                        </HStack>
                      </Tab>
                      <Tab
                        _selected={{
                          color: primary,
                          borderBottom: `3px solid ${primary}`,
                          fontWeight: "700",
                        }}
                        color={mutedText}
                        fontWeight="500"
                        fontSize="sm"
                        px={5}
                        py={4}
                        mr={6}
                        borderBottom="3px solid transparent"
                        transition="all 0.2s"
                        _hover={{ color: textColor }}
                      >
                        <HStack spacing={2.5}>
                          <Icon as={FiUsers} boxSize={4.5} />
                          <Text>Group</Text>
                        </HStack>
                      </Tab>
                      <Tab
                        _selected={{
                          color: primary,
                          borderBottom: `3px solid ${primary}`,
                          fontWeight: "700",
                        }}
                        color={mutedText}
                        fontWeight="500"
                        fontSize="sm"
                        px={5}
                        py={4}
                        borderBottom="3px solid transparent"
                        transition="all 0.2s"
                        _hover={{ color: textColor }}
                      >
                        <HStack spacing={2.5}>
                          <Icon as={FiSend} boxSize={4.5} />
                          <Text>Requests</Text>
                          {pendingRequestsToMe.length > 0 && (
                            <Badge
                              bg={primary}
                              color="white"
                              fontSize="xs"
                              rounded="full"
                              px={2}
                              py={0.5}
                              fontWeight="700"
                            >
                              {pendingRequestsToMe.length}
                            </Badge>
                          )}
                        </HStack>
                      </Tab>
                    </TabList>
                    <TabPanels>
                      {/* Add Expense Tab */}
                      <TabPanel px={8} py={10}>
                        <VStack spacing={8} maxW="600px" mx="auto" align="stretch">
                          {!user ? (
                            <Box
                              p={12}
                              bg={subtleBg}
                              rounded="2xl"
                              border="1px solid"
                              borderColor={borderColor}
                              textAlign="center"
                            >
                              <Icon as={FiLogIn} boxSize={10} color={mutedText} opacity={0.5} mb={4} />
                              <Text fontSize="md" fontWeight="600" color={textColor} mb={2}>
                                Sign in to add expenses
                              </Text>
                              <Text fontSize="sm" color={mutedText} mb={6}>
                                Connect your Google account to get started
                              </Text>
                              <Button
                                leftIcon={<Icon as={FiLogIn} />}
                                onClick={handleLogin}
                                bg={primary}
                                color="white"
                                size="lg"
                                px={8}
                                h="48px"
                                fontWeight="600"
                                fontSize="sm"
                                rounded="xl"
                                _hover={{ bg: primaryHover, transform: "translateY(-2px)", boxShadow: "lg" }}
                                _active={{ transform: "translateY(0)" }}
                                transition="all 0.2s"
                              >
                                Sign in with Google
                              </Button>
                            </Box>
                          ) : (
                            <Box
                              p={5}
                              bg={subtleBg}
                              rounded="xl"
                              border="1px solid"
                              borderColor={borderColor}
                            >
                              <HStack spacing={4}>
                                <Avatar
                                  src={user?.photoURL}
                                  name={user?.displayName}
                                  size="md"
                                  border={`2px solid ${borderColor}`}
                                />
                                <VStack align="start" spacing={0.5}>
                                  <Text fontSize="md" color={textColor} fontWeight="600">
                                    {user.displayName}
                                  </Text>
                                  <Text fontSize="xs" color={mutedText} fontWeight="400">
                                    You're adding an expense
                                  </Text>
                                </VStack>
                              </HStack>
                            </Box>
                          )}

                          {user && currentServer && (
                            <>
                              <Box>
                                <FormLabel fontSize="sm" fontWeight="600" color={textColor} mb={3}>
                                  Who paid for this?
                                </FormLabel>
                                <Select
                                  placeholder="Select a group member"
                                  value={to}
                                  onChange={(e) => setTo(e.target.value)}
                                  bg={cardBg}
                                  color={textColor}
                                  size="lg"
                                  h="52px"
                                  border="2px solid"
                                  borderColor={borderColor}
                                  rounded="xl"
                                  fontSize="sm"
                                  _hover={{
                                    borderColor: primary,
                                  }}
                                  _focus={{
                                    borderColor: primary,
                                    boxShadow: `0 0 0 3px ${primaryLight}`,
                                  }}
                                >
                                  {groupMembers.length === 0 ? (
                                    <option disabled>No group members yet</option>
                                  ) : (
                                    groupMembers.map((name, idx) => (
                                      <option key={idx} value={name}>
                                        {name}
                                      </option>
                                    ))
                                  )}
                                </Select>
                              </Box>

                              <Box>
                                <FormLabel fontSize="sm" fontWeight="600" color={textColor} mb={3}>
                                  Amount
                                </FormLabel>
                                <NumberInput
                                  value={amount}
                                  onChange={(valueString) => setAmount(valueString)}
                                  precision={2}
                                  min={0}
                                  w="full"
                                >
                                  <HStack spacing={2} align="center">
                                    <Text fontSize="2xl" fontWeight="700" color={textColor} px={1}>
                                      $
                                    </Text>
                                    <NumberInputField
                                      placeholder="0.00"
                                      bg={cardBg}
                                      color={textColor}
                                      border="2px solid"
                                      borderColor={borderColor}
                                      rounded="xl"
                                      h="52px"
                                      fontSize="lg"
                                      fontWeight="600"
                                      _hover={{
                                        borderColor: primary,
                                      }}
                                      _focus={{
                                        borderColor: primary,
                                        boxShadow: `0 0 0 3px ${primaryLight}`,
                                      }}
                                    />
                                  </HStack>
                                </NumberInput>
                              </Box>

                              <Button
                                leftIcon={<Icon as={FiPlus} />}
                                bg={primary}
                                color="white"
                                size="lg"
                                width="full"
                                fontWeight="700"
                                fontSize="sm"
                                h="52px"
                                rounded="xl"
                                _hover={{
                                  bg: primaryHover,
                                  transform: "translateY(-2px)",
                                  boxShadow: "lg"
                                }}
                                _active={{ transform: "translateY(0)" }}
                                onClick={handleAddDebt}
                                isDisabled={!to || !amount || groupMembers.length === 0}
                                transition="all 0.2s"
                              >
                                Add Expense
                              </Button>
                            </>
                          )}
                        </VStack>
                      </TabPanel>

                      {/* Debts Tab */}
                      <TabPanel px={8} py={10}>
                        <VStack spacing={5} maxW="800px" mx="auto" align="stretch">
                          {debts.length === 0 ? (
                            <Box
                              textAlign="center"
                              py={16}
                              px={8}
                            >
                              <Icon
                                as={FiTrendingUp}
                                boxSize={12}
                                color={mutedText}
                                opacity={0.3}
                                mb={4}
                              />
                              <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
                                No expenses yet
                              </Text>
                              <Text fontSize="sm" color={mutedText}>
                                Add expenses in the Expenses tab to see them here
                              </Text>
                            </Box>
                          ) : (
                            <>
                              {debts.map((d, idx) => (
                                <Box
                                  key={idx}
                                  p={6}
                                  bg={cardBg}
                                  border="1px solid"
                                  borderColor={borderColor}
                                  rounded="2xl"
                                  _hover={{
                                    borderColor: primary,
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                    transform: "translateY(-2px)"
                                  }}
                                  transition="all 0.2s"
                                >
                                  <VStack spacing={4} align="stretch">
                                    <HStack justify="space-between" align="start">
                                      <VStack align="start" spacing={2} flex={1}>
                                        <HStack spacing={3}>
                                          <Box
                                            w="12px"
                                            h="12px"
                                            bg={primary}
                                            rounded="full"
                                            flexShrink={0}
                                            mt={1}
                                          />
                                          <VStack align="start" spacing={1}>
                                            <Text fontSize="md" color={textColor} fontWeight="600">
                                              {d.from} owes {d.to}
                                            </Text>
                                            <Text fontSize="xs" color={mutedText} fontWeight="400">
                                              Expense #{idx + 1}
                                            </Text>
                                          </VStack>
                                        </HStack>
                                      </VStack>
                                      <Text fontSize="2xl" fontWeight="700" color={textColor}>
                                        ${d.amount.toFixed(2)}
                                      </Text>
                                    </HStack>
                                    {user && (
                                      <Button
                                        leftIcon={<Icon as={FiCreditCard} />}
                                        onClick={() => handlePayment(d, idx)}
                                        bg={primary}
                                        color="white"
                                        size="md"
                                        width="full"
                                        fontWeight="600"
                                        fontSize="sm"
                                        h="48px"
                                        rounded="xl"
                                        _hover={{
                                          bg: primaryHover,
                                          transform: "translateY(-2px)",
                                          boxShadow: "lg"
                                        }}
                                        _active={{ transform: "translateY(0)" }}
                                        transition="all 0.2s"
                                      >
                                        Pay Now
                                      </Button>
                                    )}
                                  </VStack>
                                </Box>
                              ))}

                              <Divider borderColor={borderColor} my={2} />

                              <Button
                                leftIcon={<Icon as={FiCheckCircle} />}
                                bg={primary}
                                color="white"
                                size="lg"
                                width="full"
                                fontWeight="700"
                                fontSize="sm"
                                h="52px"
                                rounded="xl"
                                _hover={{
                                  bg: primaryHover,
                                  transform: "translateY(-2px)",
                                  boxShadow: "lg"
                                }}
                                _active={{ transform: "translateY(0)" }}
                                onClick={() => selectedServerId && simplifyDebts(selectedServerId)}
                                transition="all 0.2s"
                              >
                                Simplify All Debts
                              </Button>
                            </>
                          )}
                        </VStack>
                      </TabPanel>

                      {/* Group Tab */}
                      <TabPanel px={6} py={8}>
                        {user ? (
                          <VStack spacing={6} maxW="700px" mx="auto" align="stretch">
                            <Box>
                              <FormLabel
                                fontSize="xs"
                                fontWeight="600"
                                color={labelColor}
                                mb={2}
                                textTransform="uppercase"
                                letterSpacing="0.05em"
                              >
                                Invite Member
                              </FormLabel>
                              <HStack spacing={2}>
                                <Input
                                  placeholder="Enter email address"
                                  value={inviteEmail}
                                  onChange={(e) => setInviteEmail(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      sendInvitation();
                                    }
                                  }}
                                  type="email"
                                  bg={cardBg}
                                  color={textColor}
                                  size="md"
                                  border="1px solid"
                                  borderColor={borderColor}
                                  _hover={{
                                    borderColor: primary,
                                  }}
                                  _focus={{
                                    borderColor: primary,
                                    boxShadow: `0 0 0 1px ${primary}`,
                                  }}
                                />
                                <Button
                                  leftIcon={<Icon as={FiSend} />}
                                  bg={primary}
                                  color="white"
                                  size="md"
                                  px={6}
                                  fontWeight="600"
                                  fontSize="sm"
                                  rounded="lg"
                                  h="44px"
                                  _hover={{
                                    bg: primaryHover,
                                    transform: "translateY(-2px)",
                                    boxShadow: "lg"
                                  }}
                                  _active={{ transform: "translateY(0)" }}
                                  transition="all 0.2s"
                                  onClick={sendInvitation}
                                  isDisabled={!inviteEmail.trim() || isSendingInvite}
                                  isLoading={isSendingInvite}
                                  loadingText="Sending..."
                                >
                                  Send Invite
                                </Button>
                              </HStack>
                              <Text fontSize="xs" color={mutedText} mt={2}>
                                Send an email invitation to add someone to this group
                              </Text>
                            </Box>

                            {groupMembers.length > 0 && (
                              <>
                                <Divider borderColor={borderColor} />
                                <Box>
                                  <Text fontSize="sm" fontWeight="600" color={textColor} mb={4}>
                                    Group Members ({groupMembers.length})
                                  </Text>
                                  <Text fontSize="xs" color={mutedText} mb={4}>
                                    Members who have accepted their email invitations
                                  </Text>
                                  <VStack spacing={3} align="stretch">
                                    {groupMembers.map((name, idx) => (
                                      <HStack
                                        key={idx}
                                        spacing={4}
                                        p={4}
                                        bg={subtleBg}
                                        rounded="xl"
                                        border="1px solid"
                                        borderColor={borderColor}
                                        _hover={{
                                          bg: hoverBg,
                                          borderColor: primary,
                                          transform: "translateX(4px)"
                                        }}
                                        transition="all 0.2s"
                                      >
                                        <Avatar
                                          name={name}
                                          bg={primary}
                                          color="white"
                                          size="md"
                                          fontWeight="700"
                                        />
                                        <Text fontSize="md" fontWeight="600" color={textColor}>
                                          {name}
                                        </Text>
                                      </HStack>
                                    ))}
                                  </VStack>
                                </Box>
                              </>
                            )}

                            {groupMembers.length === 0 && (
                              <Box
                                textAlign="center"
                                py={12}
                                px={8}
                                bg={subtleBg}
                                rounded="2xl"
                                border="2px dashed"
                                borderColor={borderColor}
                              >
                                <Icon
                                  as={FiUsers}
                                  boxSize={10}
                                  color={mutedText}
                                  opacity={0.3}
                                  mb={4}
                                />
                                <Text fontSize="md" fontWeight="600" color={textColor} mb={2}>
                                  No members yet
                                </Text>
                                <Text fontSize="sm" color={mutedText}>
                                  Add your first group member above
                                </Text>
                              </Box>
                            )}
                          </VStack>
                        ) : (
                          <Box
                            textAlign="center"
                            py={16}
                            px={8}
                            maxW="500px"
                            mx="auto"
                          >
                            <Icon
                              as={FiLogIn}
                              boxSize={12}
                              color={mutedText}
                              opacity={0.3}
                              mb={4}
                            />
                            <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
                              Sign in required
                            </Text>
                            <Text fontSize="sm" color={mutedText} mb={8}>
                              Please sign in to manage group members
                            </Text>
                            <Button
                              leftIcon={<Icon as={FiLogIn} />}
                              onClick={handleLogin}
                              bg={primary}
                              color="white"
                              size="lg"
                              px={8}
                              h="52px"
                              fontWeight="700"
                              fontSize="sm"
                              rounded="xl"
                              _hover={{
                                bg: primaryHover,
                                transform: "translateY(-2px)",
                                boxShadow: "lg"
                              }}
                              _active={{ transform: "translateY(0)" }}
                              transition="all 0.2s"
                            >
                              Sign in with Google
                            </Button>
                          </Box>
                        )}
                      </TabPanel>

                      {/* Requests Tab */}
                      <TabPanel px={8} py={10}>
                        {user ? (
                          <VStack spacing={8} maxW="800px" mx="auto" align="stretch">
                            {/* Create Request Section */}
                            <Box
                              p={8}
                              bg={subtleBg}
                              rounded="2xl"
                              border="1px solid"
                              borderColor={borderColor}
                            >
                              <VStack spacing={6} align="stretch">
                                <VStack align="start" spacing={1}>
                                  <Text fontSize="lg" fontWeight="700" color={textColor}>
                                    Request Money
                                  </Text>
                                  <Text fontSize="sm" color={mutedText}>
                                    Send a payment request to a group member
                                  </Text>
                                </VStack>

                                <Box>
                                  <FormLabel fontSize="sm" fontWeight="600" color={textColor} mb={3}>
                                    Request from
                                  </FormLabel>
                                  <Select
                                    placeholder="Select a group member"
                                    value={requestTo}
                                    onChange={(e) => setRequestTo(e.target.value)}
                                    bg={cardBg}
                                    color={textColor}
                                    size="lg"
                                    h="52px"
                                    border="2px solid"
                                    borderColor={borderColor}
                                    rounded="xl"
                                    fontSize="sm"
                                    _hover={{ borderColor: primary }}
                                    _focus={{ borderColor: primary, boxShadow: `0 0 0 3px ${primaryLight}` }}
                                  >
                                    {groupMembers
                                      .filter(name => name !== (user?.displayName || user?.email))
                                      .map((name, idx) => (
                                        <option key={idx} value={name}>
                                          {name}
                                        </option>
                                      ))}
                                  </Select>
                                </Box>

                                <Box>
                                  <FormLabel fontSize="sm" fontWeight="600" color={textColor} mb={3}>
                                    Amount
                                  </FormLabel>
                                  <NumberInput
                                    value={requestAmount}
                                    onChange={(valueString) => setRequestAmount(valueString)}
                                    precision={2}
                                    min={0}
                                    w="full"
                                  >
                                    <HStack spacing={2} align="center">
                                      <Text fontSize="2xl" fontWeight="700" color={textColor} px={1}>
                                        $
                                      </Text>
                                      <NumberInputField
                                        placeholder="0.00"
                                        bg={cardBg}
                                        color={textColor}
                                        border="2px solid"
                                        borderColor={borderColor}
                                        rounded="xl"
                                        h="52px"
                                        fontSize="lg"
                                        fontWeight="600"
                                        _hover={{ borderColor: primary }}
                                        _focus={{ borderColor: primary, boxShadow: `0 0 0 3px ${primaryLight}` }}
                                      />
                                    </HStack>
                                  </NumberInput>
                                </Box>

                                <Box>
                                  <FormLabel fontSize="sm" fontWeight="600" color={textColor} mb={3}>
                                    Description <Text as="span" color={mutedText} fontWeight="400">(optional)</Text>
                                  </FormLabel>
                                  <Input
                                    placeholder="What is this request for?"
                                    value={requestDescription}
                                    onChange={(e) => setRequestDescription(e.target.value)}
                                    bg={cardBg}
                                    color={textColor}
                                    size="lg"
                                    h="52px"
                                    border="2px solid"
                                    borderColor={borderColor}
                                    rounded="xl"
                                    fontSize="sm"
                                    _hover={{ borderColor: primary }}
                                    _focus={{ borderColor: primary, boxShadow: `0 0 0 3px ${primaryLight}` }}
                                  />
                                </Box>

                                <Button
                                  leftIcon={<Icon as={FiSend} />}
                                  bg={primary}
                                  color="white"
                                  size="lg"
                                  width="full"
                                  fontWeight="700"
                                  fontSize="sm"
                                  h="52px"
                                  rounded="xl"
                                  _hover={{
                                    bg: primaryHover,
                                    transform: "translateY(-2px)",
                                    boxShadow: "lg"
                                  }}
                                  _active={{ transform: "translateY(0)" }}
                                  onClick={createRequest}
                                  isDisabled={!requestTo || !requestAmount || groupMembers.length === 0}
                                  transition="all 0.2s"
                                >
                                  Send Request
                                </Button>
                              </VStack>
                            </Box>

                            <Divider borderColor={borderColor} />

                            {/* Pending Requests to Me */}
                            {pendingRequestsToMe.length > 0 && (
                              <Box>
                                <Text fontSize="md" fontWeight="700" color={textColor} mb={5}>
                                  Pending Requests ({pendingRequestsToMe.length})
                                </Text>
                                <VStack spacing={4} align="stretch">
                                  {pendingRequestsToMe.map((request) => (
                                    <Box
                                      key={request.id}
                                      p={6}
                                      bg={cardBg}
                                      border="2px solid"
                                      borderColor={primary}
                                      rounded="2xl"
                                      boxShadow="0 2px 8px rgba(0,112,186,0.1)"
                                    >
                                      <VStack spacing={4} align="stretch">
                                        <HStack justify="space-between" align="start">
                                          <VStack align="start" spacing={2} flex={1}>
                                            <Text fontSize="lg" fontWeight="700" color={textColor}>
                                              {request.from} requests ${request.amount.toFixed(2)}
                                            </Text>
                                            {request.description && (
                                              <Text fontSize="sm" color={mutedText} fontWeight="400">
                                                {request.description}
                                              </Text>
                                            )}
                                          </VStack>
                                          <Badge
                                            bg={primary}
                                            color="white"
                                            fontSize="xs"
                                            px={3}
                                            py={1.5}
                                            fontWeight="700"
                                            rounded="full"
                                          >
                                            Pending
                                          </Badge>
                                        </HStack>
                                        <HStack spacing={3}>
                                          <Button
                                            leftIcon={<Icon as={FiCheck} />}
                                            onClick={() => selectedServerId && approveRequest(selectedServerId, request.id)}
                                            bg={successColor}
                                            color="white"
                                            size="md"
                                            flex={1}
                                            fontWeight="700"
                                            fontSize="sm"
                                            h="48px"
                                            rounded="xl"
                                            _hover={{
                                              bg: "#008A5A",
                                              transform: "translateY(-2px)",
                                              boxShadow: "lg"
                                            }}
                                            _active={{ transform: "translateY(0)" }}
                                            transition="all 0.2s"
                                          >
                                            Approve
                                          </Button>
                                          <Button
                                            leftIcon={<Icon as={FiXCircle} />}
                                            onClick={() => rejectRequest(request.id)}
                                            variant="outline"
                                            size="md"
                                            flex={1}
                                            borderColor={borderColor}
                                            color={textColor}
                                            fontWeight="600"
                                            fontSize="sm"
                                            h="48px"
                                            rounded="xl"
                                            _hover={{
                                              bg: hoverBg,
                                              borderColor: errorColor,
                                              color: errorColor
                                            }}
                                            transition="all 0.2s"
                                          >
                                            Reject
                                          </Button>
                                        </HStack>
                                      </VStack>
                                    </Box>
                                  ))}
                                </VStack>
                              </Box>
                            )}

                            {/* My Pending Requests */}
                            {myPendingRequests.length > 0 && (
                              <Box>
                                <Text fontSize="md" fontWeight="700" color={textColor} mb={5}>
                                  My Pending Requests ({myPendingRequests.length})
                                </Text>
                                <VStack spacing={3} align="stretch">
                                  {myPendingRequests.map((request) => (
                                    <Box
                                      key={request.id}
                                      p={5}
                                      bg={subtleBg}
                                      border="1px solid"
                                      borderColor={borderColor}
                                      rounded="xl"
                                      _hover={{
                                        bg: hoverBg,
                                        borderColor: primary
                                      }}
                                      transition="all 0.2s"
                                    >
                                      <HStack justify="space-between" align="center">
                                        <VStack align="start" spacing={1} flex={1}>
                                          <Text fontSize="md" fontWeight="600" color={textColor}>
                                            Request to {request.to}: ${request.amount.toFixed(2)}
                                          </Text>
                                          {request.description && (
                                            <Text fontSize="sm" color={mutedText} fontWeight="400">
                                              {request.description}
                                            </Text>
                                          )}
                                        </VStack>
                                        <Badge
                                          bg={warningColor}
                                          color="white"
                                          fontSize="xs"
                                          px={3}
                                          py={1.5}
                                          fontWeight="700"
                                          rounded="full"
                                        >
                                          Waiting
                                        </Badge>
                                      </HStack>
                                    </Box>
                                  ))}
                                </VStack>
                              </Box>
                            )}

                            {/* All Requests History */}
                            {allRequests.length > 0 && (
                              <>
                                <Divider borderColor={borderColor} my={2} />
                                <Box>
                                  <Text fontSize="md" fontWeight="700" color={textColor} mb={5}>
                                    Request History
                                  </Text>
                                  <VStack spacing={3} align="stretch">
                                    {allRequests
                                      .sort((a, b) => b.createdAt - a.createdAt)
                                      .map((request) => (
                                        <Box
                                          key={request.id}
                                          p={5}
                                          bg={cardBg}
                                          border="1px solid"
                                          borderColor={borderColor}
                                          rounded="xl"
                                          opacity={request.status !== 'pending' ? 0.6 : 1}
                                          _hover={{
                                            opacity: 1,
                                            borderColor: primary,
                                            transform: "translateX(4px)"
                                          }}
                                          transition="all 0.2s"
                                        >
                                          <HStack justify="space-between" align="center">
                                            <VStack align="start" spacing={1} flex={1}>
                                              <Text fontSize="md" fontWeight="600" color={textColor}>
                                                {request.from} → {request.to}: ${request.amount.toFixed(2)}
                                              </Text>
                                              {request.description && (
                                                <Text fontSize="sm" color={mutedText} fontWeight="400">
                                                  {request.description}
                                                </Text>
                                              )}
                                            </VStack>
                                            <Badge
                                              bg={
                                                request.status === 'approved' ? successColor :
                                                  request.status === 'rejected' ? errorColor :
                                                    warningColor
                                              }
                                              color="white"
                                              fontSize="xs"
                                              px={3}
                                              py={1.5}
                                              fontWeight="700"
                                              rounded="full"
                                            >
                                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </Badge>
                                          </HStack>
                                        </Box>
                                      ))}
                                  </VStack>
                                </Box>
                              </>
                            )}

                            {/* Empty State */}
                            {allRequests.length === 0 && (
                              <Box textAlign="center" py={16} px={8}>
                                <Icon as={FiSend} boxSize={12} color={mutedText} opacity={0.3} mb={4} />
                                <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
                                  No requests yet
                                </Text>
                                <Text fontSize="sm" color={mutedText}>
                                  Create a request above to get started
                                </Text>
                              </Box>
                            )}
                          </VStack>
                        ) : (
                          <Box textAlign="center" py={16} px={8} maxW="500px" mx="auto">
                            <Icon as={FiLogIn} boxSize={12} color={mutedText} opacity={0.3} mb={4} />
                            <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
                              Sign in required
                            </Text>
                            <Text fontSize="sm" color={mutedText} mb={8}>
                              Please sign in to manage requests
                            </Text>
                            <Button
                              leftIcon={<Icon as={FiLogIn} />}
                              onClick={handleLogin}
                              bg={primary}
                              color="white"
                              size="lg"
                              px={8}
                              h="52px"
                              fontWeight="700"
                              fontSize="sm"
                              rounded="xl"
                              _hover={{
                                bg: primaryHover,
                                transform: "translateY(-2px)",
                                boxShadow: "lg"
                              }}
                              _active={{ transform: "translateY(0)" }}
                              transition="all 0.2s"
                            >
                              Sign in with Google
                            </Button>
                          </Box>
                        )}
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </CardBody>

                {/* Professional Footer */}
                <CardFooter
                  flexDirection="column"
                  alignItems="center"
                  gap={5}
                  pt={8}
                  pb={8}
                  bg={subtleBg}
                  borderTop="1px solid"
                  borderColor={borderColor}
                >
                  <HStack spacing={6} flexWrap="wrap" justify="center">
                    {["Kavin", "Nikhil", "Palash", "Rohit"].map((name, idx) => (
                      <HStack key={idx} spacing={2.5}>
                        <Avatar
                          name={name}
                          bg={primary}
                          color="white"
                          size="md"
                          fontWeight="700"
                          border={`2px solid ${borderColor}`}
                        />
                        <Text fontSize="sm" fontWeight="500" color={textColor}>
                          {name}
                        </Text>
                      </HStack>
                    ))}
                  </HStack>
                  <Text fontSize="xs" color={mutedText} fontWeight="400">
                    SquareUp © 2024 · Expense Management Platform
                  </Text>
                </CardFooter>
              </Card>
            </Container>
          )}
        </Box>
      </Box>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          closePaymentModal();
        }}
        selectedDebt={selectedDebt}
        paymentProvider={paymentProvider}
        isProcessingPayment={isProcessingPayment}
        onPaymentProviderChange={setPaymentProvider}
        onProcessPayment={handleProcessPayment}
      />
    </Box>
  );
} // make it so when i add people to groups, i actually add them to the group rather than just typing in a name. basically i invite them through an inivte link to that specific group. this way it actually works across multiple people. also, the icons are too small next to group, debts, etcs. make them bigger
