import { HStack, Heading, Image, VStack, Text, Icon } from "native-base";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Entypo } from "@expo/vector-icons"

type Props = TouchableOpacityProps & {
    titulo: string;
    descricao: string;
};

export function ExerciseCard({ titulo, descricao, ...rest }: Props) {
    return (
        <TouchableOpacity {...rest}>
            <HStack bg="gray.500" alignItems="center" p={2} pr={4} rounded="md" mb={3}>
                <Image
                    source={{ uri: "https://i.ytimg.com/vi/WxkMoxuMSho/sddefault.jpg" }}
                    alt="Imagem doe exercicio remada baixa"
                    w={16}
                    h={16}
                    rounded="md"
                    mr={4}
                    resizeMode="cover"
                />
                <VStack flex={1}>
                    <Heading fontSize="lg" color="white" numberOfLines={1}>
                        {titulo}
                    </Heading>
                    <Text fontSize="sm" color="gray.200" mt={1} numberOfLines={2}>
                        {descricao}
                    </Text>
                </VStack>
                <Icon as={Entypo} name="chevron-thin-right" />
            </HStack>
        </TouchableOpacity>
    )
}