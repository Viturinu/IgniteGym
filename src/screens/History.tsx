import { HistoryCard } from "@components/HistoryCard";
import { ScreenHeader } from "@components/ScreenHeader";
import { Heading, SectionList, VStack, Text } from "native-base";
import { useState } from "react";

export function History() {

    const [exercises, setExercises] = useState([
        {
            title: "26.08.24",
            data: ["Puxada frontal", "Remada unilateral"]
        },
        {
            title: "29.12.24",
            data: ["Puxada costa", "Unilateral"]
        },
        {
            title: "02.02.24",
            data: ["Remada unilateral", "Remada unilateral"]
        },
    ])

    return (
        <VStack flex={1}>
            <ScreenHeader title="Histórico de Exercícios" />
            <SectionList
                sections={exercises}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                    <HistoryCard />
                )}
                renderSectionHeader={({ section }) => (
                    <Heading color="gray.200" fontSize="md" mt={10} mb={3}>
                        {section.title}
                    </Heading>
                )}
                px={8}
                contentContainerStyle={[].length === 0 && {
                    flex: 1,
                    justifyContent: "center"
                }}
                ListEmptyComponent={() => (
                    <Text color="gray.100" textAlign="center">
                        Não há exercicios registrados ainda. {"\n"}
                        Vamos fazer exercicios hoje?
                    </Text>
                )}
                showsVerticalScrollIndicator={false}
            />
        </VStack>
    )
}