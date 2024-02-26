import { ExerciseCard } from "@components/ExerciseCard";
import { Group } from "@components/Group";
import { HomeHeader } from "@components/HomeHeader";
import { Center, FlatList, HStack, Heading, Text, VStack } from "native-base";
import { useState } from "react";

export function Home() {

    const [groups, setGroups] = useState<string[]>(["Costas", "Biceps", "Triceps", "Ombros"]);
    const [exercises, setExercises] = useState(["Puxada frontal", "Remada cruzada", "Remada unilateral", "Levantamento peso"]);
    const [groupSelected, setGroupSelected] = useState("Costas");

    return (
        <VStack flex={1}>
            <HomeHeader />

            <FlatList
                data={groups}
                keyExtractor={item => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                _contentContainerStyle={{
                    px: 8
                }}
                my={10}
                maxH={10}
                renderItem={({ item }) => (
                    <Group
                        name={item}
                        isActive={groupSelected.toLowerCase() === item.toLowerCase()}
                        onPress={() => setGroupSelected(item)}
                    />
                )}
            />
            <VStack flex={1} px={8}>
                <HStack
                    justifyContent="space-between"
                    mb={5}
                >
                    <Heading color="gray.200" fontSize="md">
                        Exercícios
                    </Heading>
                    <Text color="gray.200" fontSize="sm">
                        {exercises.length}
                    </Text>
                </HStack>
                <FlatList
                    data={exercises}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <ExerciseCard
                            titulo={item}
                            descricao="Qualquer coisa"
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                    _contentContainerStyle={{
                        paddingBottom: 20
                    }}
                />
            </VStack>
        </VStack>
    )
}