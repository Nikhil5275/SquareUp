import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    VStack,
    HStack,
    Box,
    Button,
    Text,
    Icon,
    Badge,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    useColorModeValue,
} from "@chakra-ui/react";
import { FiCreditCard, FiCheckCircle, FiAlertCircle, FiExternalLink } from "react-icons/fi";

interface StripeConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
    accountStatus: {
        hasAccount: boolean;
        accountId?: string;
        status: 'none' | 'pending' | 'active';
        detailsSubmitted?: boolean;
        chargesEnabled?: boolean;
        payoutsEnabled?: boolean;
    };
    isLoading: boolean;
    isCreatingAccount: boolean;
    onConnect: () => void;
}

export const StripeConnectModal = ({
    isOpen,
    onClose,
    accountStatus,
    isLoading,
    isCreatingAccount,
    onConnect,
}: StripeConnectModalProps) => {
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const primary = "#4A7C59"; // Muted sage green
    const primaryLight = "#E8F5E8";
    const textColor = useColorModeValue("gray.900", "gray.100");
    const mutedText = useColorModeValue("gray.600", "gray.400");
    const hoverBg = useColorModeValue("gray.100", "gray.600");
    const subtleBg = useColorModeValue("gray.50", "gray.700");

    const getStatusBadge = () => {
        if (accountStatus.status === 'active') {
            return (
                <Badge colorScheme="green" px={3} py={1} rounded="full" fontSize="xs">
                    <HStack spacing={1}>
                        <Icon as={FiCheckCircle} boxSize={3} />
                        <Text>Connected</Text>
                    </HStack>
                </Badge>
            );
        } else if (accountStatus.status === 'pending') {
            return (
                <Badge colorScheme="yellow" px={3} py={1} rounded="full" fontSize="xs">
                    <HStack spacing={1}>
                        <Icon as={FiAlertCircle} boxSize={3} />
                        <Text>Pending</Text>
                    </HStack>
                </Badge>
            );
        } else {
            return (
                <Badge colorScheme="gray" px={3} py={1} rounded="full" fontSize="xs">
                    Not Connected
                </Badge>
            );
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
            <ModalContent
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                rounded="2xl"
                boxShadow="0 20px 60px rgba(0,0,0,0.3)"
                maxW="500px"
            >
                <ModalHeader
                    color={textColor}
                    fontSize="xl"
                    fontWeight="700"
                    pb={4}
                    borderBottom="1px solid"
                    borderColor={borderColor}
                >
                    <HStack spacing={3}>
                        <Icon as={FiCreditCard} boxSize={6} color={primary} />
                        <Text>Stripe Payment Setup</Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton
                    color={mutedText}
                    _hover={{ color: textColor, bg: hoverBg }}
                    rounded="lg"
                />
                <ModalBody p={8}>
                    <VStack spacing={6} align="stretch">
                        {accountStatus.status === 'active' ? (
                            <Alert status="success" rounded="xl">
                                <AlertIcon />
                                <Box>
                                    <AlertTitle>Account Connected!</AlertTitle>
                                    <AlertDescription>
                                        You can now receive payments directly to your bank account.
                                    </AlertDescription>
                                </Box>
                            </Alert>
                        ) : accountStatus.status === 'pending' ? (
                            <Alert status="warning" rounded="xl">
                                <AlertIcon />
                                <Box>
                                    <AlertTitle>Account Setup Incomplete</AlertTitle>
                                    <AlertDescription>
                                        Please complete your account setup to receive payments.
                                    </AlertDescription>
                                </Box>
                            </Alert>
                        ) : (
                            <Alert status="info" rounded="xl">
                                <AlertIcon />
                                <Box>
                                    <AlertTitle>Connect Your Account</AlertTitle>
                                    <AlertDescription>
                                        Connect your Stripe account to receive payments directly. It only takes a few minutes.
                                    </AlertDescription>
                                </Box>
                            </Alert>
                        )}

                        <Box
                            p={6}
                            bg={subtleBg}
                            rounded="xl"
                            border="1px solid"
                            borderColor={borderColor}
                        >
                            <VStack spacing={4} align="stretch">
                                <HStack justify="space-between">
                                    <Text fontSize="sm" fontWeight="600" color={textColor}>
                                        Account Status
                                    </Text>
                                    {getStatusBadge()}
                                </HStack>

                                {accountStatus.status === 'active' && (
                                    <VStack align="start" spacing={2} mt={2}>
                                        <HStack spacing={2}>
                                            <Icon as={FiCheckCircle} boxSize={4} color="green.500" />
                                            <Text fontSize="xs" color={mutedText}>
                                                Details submitted
                                            </Text>
                                        </HStack>
                                        <HStack spacing={2}>
                                            <Icon as={FiCheckCircle} boxSize={4} color="green.500" />
                                            <Text fontSize="xs" color={mutedText}>
                                                Payments enabled
                                            </Text>
                                        </HStack>
                                        <HStack spacing={2}>
                                            <Icon as={FiCheckCircle} boxSize={4} color="green.500" />
                                            <Text fontSize="xs" color={mutedText}>
                                                Payouts enabled
                                            </Text>
                                        </HStack>
                                    </VStack>
                                )}
                            </VStack>
                        </Box>

                        <Box>
                            <Text fontSize="sm" color={mutedText} mb={4}>
                                {accountStatus.status === 'active'
                                    ? 'Your account is fully set up and ready to receive payments.'
                                    : accountStatus.status === 'pending'
                                    ? 'Complete your account setup to start receiving payments.'
                                    : 'Connect your Stripe account to receive payments directly to your bank account. The setup process is secure and takes just a few minutes.'}
                            </Text>
                        </Box>
                    </VStack>
                </ModalBody>

                <ModalFooter
                    p={6}
                    borderTop="1px solid"
                    borderColor={borderColor}
                    bg={subtleBg}
                >
                    <HStack spacing={3} width="full">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            isDisabled={isLoading || isCreatingAccount}
                            flex={1}
                            fontWeight="600"
                            fontSize="sm"
                            h="48px"
                            rounded="xl"
                            _hover={{ bg: hoverBg }}
                        >
                            {accountStatus.status === 'active' ? 'Close' : 'Cancel'}
                        </Button>
                        {accountStatus.status !== 'active' && (
                            <Button
                                bg={primary}
                                color="white"
                                onClick={onConnect}
                                isLoading={isLoading || isCreatingAccount}
                                loadingText="Setting up..."
                                leftIcon={<Icon as={FiExternalLink} />}
                                flex={2}
                                fontWeight="700"
                                fontSize="sm"
                                h="48px"
                                rounded="xl"
                                _hover={{
                                    bg: "#005EA6",
                                    transform: "translateY(-2px)",
                                    boxShadow: "lg"
                                }}
                                _active={{ transform: "translateY(0)" }}
                                transition="all 0.2s"
                            >
                                {accountStatus.status === 'pending' ? 'Complete Setup' : 'Connect Account'}
                            </Button>
                        )}
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

