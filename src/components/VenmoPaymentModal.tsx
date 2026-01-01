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
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    useColorModeValue,
} from "@chakra-ui/react";
import { FiZap, FiExternalLink, FiCopy, FiCheckCircle } from "react-icons/fi";
import { useState } from "react";
import { Debt } from "../types";

interface VenmoPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    debt: Debt | null;
    venmoLink: string | null;
    venmoWebLink: string | null;
    venmoUsername: string | null;
    hasVenmoUsername: boolean;
    onOpenVenmo: () => void;
    onCopyLink: () => void;
    onMarkAsPaid: () => void;
}

export const VenmoPaymentModal = ({
    isOpen,
    onClose,
    debt,
    venmoLink,
    venmoWebLink,
    venmoUsername,
    hasVenmoUsername,
    onOpenVenmo,
    onCopyLink,
    onMarkAsPaid,
}: VenmoPaymentModalProps) => {
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const primary = "#4A7C59"; // Muted sage green
    const primaryLight = "#E8F5E8";
    const textColor = useColorModeValue("gray.900", "gray.100");
    const mutedText = useColorModeValue("gray.600", "gray.400");
    const hoverBg = useColorModeValue("gray.100", "gray.600");
    const subtleBg = useColorModeValue("gray.50", "gray.700");
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (venmoWebLink) {
            navigator.clipboard.writeText(venmoWebLink);
            setCopied(true);
            onCopyLink();
            setTimeout(() => setCopied(false), 2000);
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
                        <Icon as={FiZap} boxSize={6} color={primary} />
                        <Text>Pay with Venmo</Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton
                    color={mutedText}
                    _hover={{ color: textColor, bg: hoverBg }}
                    rounded="lg"
                />
                <ModalBody p={8}>
                    <VStack spacing={6} align="stretch">
                        {debt && (
                            <Box
                                p={6}
                                bg={subtleBg}
                                rounded="xl"
                                border="1px solid"
                                borderColor={borderColor}
                                textAlign="center"
                            >
                                <VStack align="center" spacing={3}>
                                    <Text fontSize="sm" color={mutedText} fontWeight="500">
                                        Payment to
                                    </Text>
                                    <Text fontSize="lg" fontWeight="700" color={textColor}>
                                        {debt.to}
                                    </Text>
                                    <Text fontSize="4xl" fontWeight="800" color={primary} letterSpacing="-0.02em">
                                        ${debt.amount.toFixed(2)}
                                    </Text>
                                </VStack>
                            </Box>
                        )}

                        {!hasVenmoUsername ? (
                            <Alert status="warning" rounded="xl">
                                <AlertIcon />
                                <Box>
                                    <AlertTitle>Venmo Username Not Found</AlertTitle>
                                    <AlertDescription>
                                        {debt?.to} hasn't added their Venmo username yet. You can still pay them manually through Venmo.
                                    </AlertDescription>
                                </Box>
                            </Alert>
                        ) : (
                            <Alert status="info" rounded="xl">
                                <AlertIcon />
                                <Box>
                                    <AlertTitle>Ready to Pay</AlertTitle>
                                    <AlertDescription>
                                        Pay {venmoUsername} directly through Venmo
                                    </AlertDescription>
                                </Box>
                            </Alert>
                        )}

                        {hasVenmoUsername && venmoLink && (
                            <VStack spacing={4}>
                                <Button
                                    bg={primary}
                                    color="white"
                                    onClick={onOpenVenmo}
                                    leftIcon={<Icon as={FiExternalLink} />}
                                    size="lg"
                                    w="full"
                                    h="52px"
                                    fontWeight="700"
                                    fontSize="sm"
                                    rounded="xl"
                                    _hover={{
                                        bg: "#2D7BB8",
                                        transform: "translateY(-2px)",
                                        boxShadow: "lg"
                                    }}
                                    _active={{ transform: "translateY(0)" }}
                                    transition="all 0.2s"
                                >
                                    Open in Venmo App
                                </Button>

                                {venmoWebLink && (
                                    <Button
                                        variant="outline"
                                        onClick={handleCopy}
                                        leftIcon={<Icon as={copied ? FiCheckCircle : FiCopy} />}
                                        size="md"
                                        w="full"
                                        h="44px"
                                        fontWeight="600"
                                        fontSize="sm"
                                        rounded="xl"
                                        borderColor={borderColor}
                                        _hover={{ bg: hoverBg }}
                                    >
                                        {copied ? 'Link Copied!' : 'Copy Payment Link'}
                                    </Button>
                                )}
                            </VStack>
                        )}

                        <Box
                            p={4}
                            bg={subtleBg}
                            rounded="xl"
                            border="1px solid"
                            borderColor={borderColor}
                        >
                            <Text fontSize="xs" color={mutedText} textAlign="center">
                                After completing the payment in Venmo, click "Mark as Paid" below to update the debt.
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
                            flex={1}
                            fontWeight="600"
                            fontSize="sm"
                            h="48px"
                            rounded="xl"
                            _hover={{ bg: hoverBg }}
                        >
                            Cancel
                        </Button>
                        <Button
                            bg={primary}
                            color="white"
                            onClick={onMarkAsPaid}
                            flex={2}
                            fontWeight="700"
                            fontSize="sm"
                            h="48px"
                            rounded="xl"
                            _hover={{
                                bg: "#2D7BB8",
                                transform: "translateY(-2px)",
                                boxShadow: "lg"
                            }}
                            _active={{ transform: "translateY(0)" }}
                            transition="all 0.2s"
                        >
                            Mark as Paid
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

