"use client";
import React from "react";
import { SimpleGrid, Text, Image, Flex } from "@chakra-ui/react";

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
       <Flex justify='center' align='center' direction='column' mt={8}>
            <Text fontSize="xl" fontWeight="bold">История генераций:</Text>
            {history.length > 0 ? (
                <SimpleGrid columns={[1, 2, 3, 4]} gap={4} mt={4}>
                    {history.map((item) => (
                        <Flex key={item.id} p={4} borderWidth="1px" borderRadius="lg" textAlign="center" direction="column" align="center">
                            <Text fontWeight="bold">Промт: {item.prompt}</Text>
                            <Text fontSize="sm" color="gray.500">Негативный промт: {item.negative_prompt}</Text>
                            <Image src={item.imageUrl} alt="Сгенерированное изображение" borderRadius="md" boxSize="150px" mt={2} />
                        </Flex>
                    ))}
                </SimpleGrid>
            ) : (
                <Text color="gray.500">История пока пуста</Text>
            )}
        </Flex>
    );
}
