import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { Center, Heading, ScrollView, Skeleton, Text, VStack, useToast } from "native-base";
import { useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"

export function Profile() {

    const PHOTO_SIZE = 33;
    const [photoIsLoading, setPhotoIsLoading] = useState(false);
    const toast = useToast();

    const [userPhoto, setUserPhoto] = useState("https://github.com/viturinu.png")

    async function handleUserPhotoSelect() {
        setPhotoIsLoading(true);
        try {
            const photoSelected = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                aspect: [4, 4],
                allowsEditing: true,
            });
            if (photoSelected.canceled) {
                return;
            }
            if (photoSelected.assets[0].uri) {
                const photoInfo = await FileSystem.getInfoAsync(photoSelected.assets[0].uri, { md5: true, size: true });

                if (photoInfo.exists && (photoInfo.size / 1024 / 1024) > 0.001) { //sempre verificar uma promisse, pois pode dar algum erro ao tentar acessar certas propriedades sem a devida verificação
                    return toast.show({
                        title: "Essa imagem é muito grande, escolha uma de até 5Mb",
                        placement: "top",
                        bgColor: "red.500"
                    })
                }
                setUserPhoto(photoSelected.assets[0].uri);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setPhotoIsLoading(false);
        }
    }

    return (
        <VStack flex={1}>
            <ScreenHeader title="Perfil" />
            <ScrollView contentContainerStyle={{ paddingBottom: 56 }}>
                <Center mt={6} px={10}>
                    {photoIsLoading ?
                        <Skeleton
                            w={PHOTO_SIZE}
                            h={PHOTO_SIZE}
                            rounded="full"
                            startColor="gray.500"
                            endColor="gray.400"
                        />
                        : <UserPhoto
                            source={{ uri: userPhoto }}
                            size={PHOTO_SIZE}
                            alt="Foto do usuário"
                        />
                    }
                    <TouchableOpacity onPress={handleUserPhotoSelect}>
                        <Text color="green.500" fontWeight="bold" fontSize="md" mt={2} mb={8}>
                            Alterar foto
                        </Text>
                    </TouchableOpacity>
                    <Input
                        placeholder="Nome"
                        bg="gray.600"
                    />
                    <Input
                        placeholder="E-mail"
                        isDisabled
                        bg="gray.600"
                    />
                </Center>
                <VStack px={10} mt={12} mb={9}>
                    <Heading color="gray.200" fontSize="md" mb={2}>
                        Alterar senha
                    </Heading>
                    <Input
                        bg="gray.600"
                        placeholder="Senha antiga"
                        secureTextEntry
                    />
                    <Input
                        bg="gray.600"
                        placeholder="Nova senha"
                        secureTextEntry
                    />
                    <Input
                        bg="gray.600"
                        placeholder="Confirme nova senha"
                        secureTextEntry
                    />
                    <Button
                        title="Atualizar"
                        mt={4} />
                </VStack>
            </ScrollView>
        </VStack>
    )
}