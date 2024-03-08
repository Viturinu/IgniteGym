import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { Center, Heading, ScrollView, Skeleton, Text, VStack, useToast } from "native-base";
import { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Controller, useForm } from "react-hook-form";
import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"
import { useAuth } from "@hooks/useAuth";

type formDataProps = {
    name: string;
    email: string;
    password: string;
    old_password: string;
    confirm_password: string;
}

export function Profile() {

    const PHOTO_SIZE = 33;
    const [photoIsLoading, setPhotoIsLoading] = useState(false);

    const [userPhoto, setUserPhoto] = useState("https://github.com/viturinu.png")

    const { user } = useAuth();
    const toast = useToast();

    const { control, handleSubmit } = useForm<formDataProps>({
        defaultValues: {
            name: user.name,
            email: user.email
        }
    });

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

    async function handleProfileUpdate(data: formDataProps) {

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
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { value, onChange } }) => (
                            <Input
                                placeholder="Nome"
                                bg="gray.600"
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { value, onChange } }) => (
                            <Input
                                placeholder="E-mail"
                                isDisabled
                                bg="gray.600"
                            />
                        )}
                    />

                </Center>
                <VStack px={10} mt={12} mb={9}>
                    <Heading color="gray.200" fontSize="md" mb={2}>
                        Alterar senha
                    </Heading>

                    <Controller
                        control={control}
                        name="old_password"
                        render={({ field: { onChange } }) => (
                            <Input
                                bg="gray.600"
                                placeholder="Senha antiga"
                                secureTextEntry
                                onChangeText={onChange}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange } }) => (
                            <Input
                                bg="gray.600"
                                placeholder="Nova senha"
                                secureTextEntry
                                onChangeText={onChange}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="confirm_password"
                        render={({ field: { onChange } }) => (
                            <Input
                                bg="gray.600"
                                placeholder="Confirme nova senha"
                                secureTextEntry
                                onChangeText={onChange}
                            />
                        )}
                    />

                    <Button
                        title="Atualizar"
                        mt={4}
                        onPress={handleSubmit(handleProfileUpdate)} />
                </VStack>
            </ScrollView>
        </VStack>
    )
}