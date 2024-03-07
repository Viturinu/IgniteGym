import { ExerciseCard } from "@components/ExerciseCard";
import { Group } from "@components/Group";
import { HomeHeader } from "@components/HomeHeader";
import { exerciseDTO } from "@dtos/exerciseDTO";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AppNavigatorRoutesProps } from "@routes/app.routes";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { FlatList, HStack, Heading, Text, VStack, useToast } from "native-base";
import { useCallback, useEffect, useState } from "react";

export function Home() {

    const [groups, setGroups] = useState<string[]>(["Costas", "Biceps", "Triceps", "Ombros"]);
    const [exercises, setExercises] = useState<exerciseDTO[]>([]);
    const [groupSelected, setGroupSelected] = useState("Costas");

    const toast = useToast();

    const navigation = useNavigation<AppNavigatorRoutesProps>();

    function handleOpenExerciseDetails() {
        navigation.navigate("exercise");
    }

    async function fetchGroups() {
        try {
            const response = await api.get("/groups")
            setGroups(response.data);
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : "Não foi possível carregar os grupos musculares";
            toast.show({
                title,
                placement: "top",
                bgColor: "red.500"
            })
        }
    }

    async function fetchExercises() {
        try {
            const response = await api.get(`/exercises/bygroup/${groupSelected}`);
            setExercises(response.data);
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : "Não foi possível carregar os exercícios da aplicação."
            toast.show({
                placement: "top",
                bgColor: "red.500",
                title
            })
        }
    }

    useEffect(() => {
        fetchGroups();
    }, []);

    useFocusEffect(useCallback(() => {
        fetchExercises();
    }, [groupSelected]))

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
                minH={10}
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
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <ExerciseCard
                            titulo={item.name}
                            descricao="Qualquer coisa"
                            onPress={handleOpenExerciseDetails}
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