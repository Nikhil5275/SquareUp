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
    RadioGroup,
    Radio,
    Icon,
    Text,
} from "@chakra-ui/react";
import { FiCreditCard, FiZap } from "react-icons/fi";
import { Debt } from "../types";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDebt: Debt | null;
    paymentProvider: string;
    isProcessingPayment: boolean;
    onPaymentProviderChange: (provider: string) => void;
    onProcessPayment: () => void;
}

export const PaymentModal = ({
    isOpen,
    onClose,
    selectedDebt,
    paymentProvider,
    isProcessingPayment,
    onPaymentProviderChange,
    onProcessPayment,
}: PaymentModalProps) => {
    const cardBg = "white";
    const borderColor = "gray.200";
    const primary = "#0070BA";
    const primaryLight = "#E6F2FF";
    const textColor = "gray.900";
    const mutedText = "gray.600";
    const hoverBg = "gray.100";
    const subtleBg = "gray.50";

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
                    Complete Payment
                </ModalHeader>
                <ModalCloseButton
                    color={mutedText}
                    _hover={{ color: textColor, bg: hoverBg }}
                    rounded="lg"
                />
                <ModalBody p={8}>
                    {selectedDebt && (
                        <VStack spacing={6} align="stretch">
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
                                        {selectedDebt.to}
                                    </Text>
                                    <Text fontSize="4xl" fontWeight="800" color={primary} letterSpacing="-0.02em">
                                        ${selectedDebt.amount.toFixed(2)}
                                    </Text>
                                </VStack>
                            </Box>

                            <Box>
                                <Text fontSize="sm" fontWeight="700" color={textColor} mb={4}>
                                    Payment Method
                                </Text>
                                <RadioGroup value={paymentProvider} onChange={onPaymentProviderChange}>
                                    <VStack spacing={3} align="stretch">
                                        <Box
                                            p={4}
                                            border="2px solid"
                                            borderColor={paymentProvider === 'stripe' ? primary : borderColor}
                                            rounded="xl"
                                            cursor="pointer"
                                            onClick={() => onPaymentProviderChange('stripe')}
                                            bg={paymentProvider === 'stripe' ? primaryLight : cardBg}
                                            _hover={{
                                                borderColor: primary,
                                                bg: paymentProvider === 'stripe' ? primaryLight : hoverBg
                                            }}
                                            transition="all 0.2s"
                                        >
                                            <Radio value="stripe" colorScheme="blue" size="lg">
                                                <HStack spacing={3} ml={3}>
                                                    <Icon as={FiCreditCard} boxSize={5} color={paymentProvider === 'stripe' ? primary : mutedText} />
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontSize="sm" fontWeight="700" color={textColor}>
                                                            Credit/Debit Card
                                                        </Text>
                                                        <Text fontSize="xs" color={mutedText} fontWeight="400">
                                                            Secure payment via Stripe
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                            </Radio>
                                        </Box>
                                        <Box
                                            p={4}
                                            border="2px solid"
                                            borderColor={paymentProvider === 'venmo' ? primary : borderColor}
                                            rounded="xl"
                                            cursor="pointer"
                                            onClick={() => onPaymentProviderChange('venmo')}
                                            bg={paymentProvider === 'venmo' ? primaryLight : cardBg}
                                            _hover={{
                                                borderColor: primary,
                                                bg: paymentProvider === 'venmo' ? primaryLight : hoverBg
                                            }}
                                            transition="all 0.2s"
                                        >
                                            <Radio value="venmo" colorScheme="blue" size="lg">
                                                <HStack spacing={3} ml={3}>
                                                    <Icon as={FiZap} boxSize={5} color={paymentProvider === 'venmo' ? primary : mutedText} />
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontSize="sm" fontWeight="700" color={textColor}>
                                                            Venmo
                                                        </Text>
                                                        <Text fontSize="xs" color={mutedText} fontWeight="400">
                                                            Pay with your Venmo account
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                            </Radio>
                                        </Box>
                                        <Box
                                            p={4}
                                            border="2px solid"
                                            borderColor={paymentProvider === 'paypal' ? primary : borderColor}
                                            rounded="xl"
                                            cursor="pointer"
                                            onClick={() => onPaymentProviderChange('paypal')}
                                            bg={paymentProvider === 'paypal' ? primaryLight : cardBg}
                                            _hover={{
                                                borderColor: primary,
                                                bg: paymentProvider === 'paypal' ? primaryLight : hoverBg
                                            }}
                                            transition="all 0.2s"
                                        >
                                            <Radio value="paypal" colorScheme="blue" size="lg">
                                                <HStack spacing={3} ml={3}>
                                                    <Icon as={FiCreditCard} boxSize={5} color={paymentProvider === 'paypal' ? primary : mutedText} />
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontSize="sm" fontWeight="700" color={textColor}>
                                                            PayPal
                                                        </Text>
                                                        <Text fontSize="xs" color={mutedText} fontWeight="400">
                                                            Pay with your PayPal account
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                            </Radio>
                                        </Box>
                                    </VStack>
                                </RadioGroup>
                            </Box>
                        </VStack>
                    )}
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
                            isDisabled={isProcessingPayment}
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
                            onClick={onProcessPayment}
                            isLoading={isProcessingPayment}
                            loadingText="Processing..."
                            leftIcon={<Icon as={FiCreditCard} />}
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
                            Pay ${selectedDebt?.amount.toFixed(2) || '0.00'}
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
