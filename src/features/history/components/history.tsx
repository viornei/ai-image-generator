"use client";
import React from "react";
import { SimpleGrid, Text, Image, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
type HistoryItem = {
    id: number;
    prompt: string;
    negative_prompt: string;
    imageUrl: string;
};

type HistoryProps = {
    history: HistoryItem[];
};

export default function History({ history }: HistoryProps) {
    return (
       <Flex justify='center' align='center' direction='column' mt={12} gap={4}>
            <Text fontSize="xl" fontWeight="bold">История генераций:</Text>
            {history.length > 0 ? (
                <SimpleGrid columns={[1, 2, 3, 4]} gap={4} >
                    {history.map((item, index) => (
                           <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                        <Flex key={item.id} p={4} borderWidth="1px" borderRadius="lg" textAlign="center" direction="column" align="center">
                            <Text fontWeight="bold">Промт: {item.prompt}</Text>
                            <Text fontSize="sm" color="gray.500">Негативный промт: {item.negative_prompt}</Text>
                            <Image src={item.imageUrl} alt="Сгенерированное изображение" borderRadius="md" boxSize="150px" mt={2} />
                            </Flex>
                            </motion.div>
                    ))}
                </SimpleGrid>
            ) : (
                <Text color="gray.500">История пока пуста</Text>
            )}
        </Flex>
    );
}
