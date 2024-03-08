import { HStack, Heading, Icon, VStack, Text, Image, Box, ScrollView, useToast } from "native-base";
import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native";
import { AppNavigatorRoutesProps } from "@routes/app.routes";

import BodySvg from "@assets/body.svg"
import SeriesSvg from "@assets/series.svg"
import RepetitionsSvg from "@assets/repetitions.svg"
import { Button } from "@components/Button";
import { AppError } from "@utils/AppError";
import { api } from "@services/api";
import { useEffect, useState } from "react";
import { ExerciseDTO } from "@dtos/exerciseDTO";
import { Loading } from "@components/Loading";

type RouteParams = {
    exerciseId: string;
}

export function Exercise() {

    const [isLoading, setIsLoading] = useState(true);

    const [exercise, setExercise] = useState<ExerciseDTO>({} as ExerciseDTO);
    const navigation = useNavigation<AppNavigatorRoutesProps>();

    const route = useRoute();
    const { exerciseId } = route.params as RouteParams; //recuperamos o id do exercicio
    const toast = useToast();

    function handleGoBack() {
        navigation.goBack();
    }

    async function fetchExerciseDetails() {
        try {
            setIsLoading(true);
            const response = await api.get(`/exercises/${exerciseId}`); //aqui no axios, ele mesmo já faz o parse na string retornada, não precisamos preocuipar com isso; se usar o fetch puro do js, aí sim precimos fazer o JSON.parse().
            setExercise(response.data);
        } catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : "Não foi possivel buscar os detalhes do exercicio. Tente novamente mais tarde."
            toast.show({
                placement: "top",
                bgColor: "red.500",
                title
            })
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchExerciseDetails();
    }, [exerciseId]);

    return (
        <VStack flex={1}>
            <ScrollView>
                <VStack px={8} pt={12} bg="gray.600">
                    <TouchableOpacity onPress={handleGoBack}>
                        <Icon as={Feather} name="arrow-left" color="green.500" size={6} />
                    </TouchableOpacity>
                    <HStack justifyContent="space-between" mt={4} mb={8} alignItems="center">
                        <Heading color="gray.100" fontSize="lg" flexShrink={1}>
                            {exercise.name}
                        </Heading>
                        <HStack alignItems="center">
                            <BodySvg />
                            <Text color="gray.200" ml={1} textTransform="capitalize">
                                {exercise.group}
                            </Text>
                        </HStack>
                    </HStack>
                </VStack>
                {
                    isLoading ? <Loading /> :
                        <VStack px={8}>
                            <Box rounded="lg" mb={3} overflow="hidden">
                                <Image
                                    w="full"
                                    h={80}
                                    source={{ uri: `${api.defaults.baseURL}/exercise/demo/${exercise.demo}` }} //api nos retorna o nome do gif, porém nós que temos que fazer o caminho do servidor para encontrar esse gif (não é uma chamada get convencional como fazemos por aqui usando api.get() ou fetch(); mas obvio que não deixa de ser uma requisição http)
                                    alt="Nome do exercicio"
                                    resizeMode="cover"
                                    rounded="lg"
                                />
                            </Box>


                            <Box bg="gray.600" rounded="md" py={4} px={4} >
                                <HStack alignItems="center" justifyContent="space-around" mb={6}>
                                    <HStack>
                                        <SeriesSvg />
                                        <Text color="gray.200" ml={2}>
                                            {exercise.series} séries
                                        </Text>
                                    </HStack>
                                    <HStack>
                                        <RepetitionsSvg />
                                        <Text color="gray.200" ml={2}>
                                            {exercise.repetitions} repetições
                                        </Text>
                                    </HStack>
                                </HStack>
                                <Button title="Marcar como resultado" />
                            </Box>
                        </VStack>
                }

            </ScrollView>
        </VStack>
    )
}