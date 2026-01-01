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
    Input,
    FormLabel,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    useColorModeValue,
} from "@chakra-ui/react";
import { FiZap, FiCheckCircle } from "react-icons/fi";
import { useState } from "react";

interface VenmoSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUsername: string | null;
    onSave: (username: string) => Promise<void>;
    isLoading: boolean;
}

export const VenmoSettingsModal = ({
    isOpen,
    onClose,
    currentUsername,
    onSave,
    isLoading,
}: VenmoSettingsModalProps) => {
    const [username, setUsername] = useState(currentUsername || '');
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const primary = "#4A7C59"; // Muted sage green
    const textColor = useColorModeValue("gray.900", "gray.100");
    const mutedText = useColorModeValue("gray.600", "gray.400");
    const hoverBg = useColorModeValue("gray.100", "gray.600");
    const subtleBg = useColorModeValue("gray.50", "gray.700");

    const handleSave = async () => {
        if (!username.trim()) {
            return;
        }
        // Remove @ symbol if user included it
        const cleanUsername = username.trim().replace(/^@/, '');
        await onSave(cleanUsername);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
            <ModalContent
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                rounded="2xl"
                boxShadow="0 20px 60px rgba(0,0,0,0.3)"
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
                        <Text>Venmo Settings</Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton
                    color={mutedText}
                    _hover={{ color: textColor, bg: hoverBg }}
                    rounded="lg"
                />
                <ModalBody p={8}>
                    <VStack spacing={6} align="stretch">
                        <Alert status="info" rounded="xl">
                            <AlertIcon />
                            <Box>
                                <AlertTitle>Add Your Venmo Username</AlertTitle>
                                <AlertDescription fontSize="xs">
                                    This allows others to pay you directly through Venmo. Your username is the part after @ in your Venmo profile.
                                </AlertDescription>
                            </Box>
                        </Alert>

                        <Box>
                            <FormLabel fontSize="sm" fontWeight="600" color={textColor} mb={2}>
                                Venmo Username
                            </FormLabel>
                            <Input
                                placeholder="your-venmo-username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                size="lg"
                                rounded="xl"
                                borderColor={borderColor}
                                _focus={{ borderColor: primary, boxShadow: `0 0 0 1px ${primary}` }}
                            />
                            <Text fontSize="xs" color={mutedText} mt={2}>
                                Enter your Venmo username (without @). Find it in your Venmo profile.
                            </Text>
                        </Box>

                        {currentUsername && (
                            <Box
                                p={4}
                                bg={subtleBg}
                                rounded="xl"
                                border="1px solid"
                                borderColor={borderColor}
                            >
                                <HStack spacing={2}>
                                    <Icon as={FiCheckCircle} color="green.500" />
                                    <Text fontSize="sm" color={mutedText}>
                                        Current: <Text as="span" fontWeight="600" color={textColor}>@{currentUsername}</Text>
                                    </Text>
                                </HStack>
                            </Box>
                        )}
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
                            isDisabled={isLoading}
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
                            onClick={handleSave}
                            isLoading={isLoading}
                            loadingText="Saving..."
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
                            Save Username
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

