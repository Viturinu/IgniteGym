import { VStack, Image, Text, Center, Heading, ScrollView, useToast } from "native-base"
import Background from "@assets/background.png"
import LogoSvg from "@assets/logo.svg"
import { Input } from "@components/Input"
import { Button } from "@components/Button"
import { useNavigation } from "@react-navigation/native"
import { AuthNavigatorRoutesProps } from "@routes/auth.routes"
import { useForm, Controller } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useAuth } from "@hooks/useAuth"
import { AppError } from "@utils/AppError"
import { useState } from "react"

type FormDataProps = {
    email: string;
    password: string;
}

const signInSchema = yup.object({
    email: yup.string().required("É necessário inserir o e-mail cadastrado").email("É necessário inserir um e-mail válido"),
    password: yup.string().required("É necessário inserir a senha").min(6, "Senha contém mínimo de 6 digitos")
})

export function SignIn() {

    const [isLoading, setIsLoading] = useState(false);
    const { signIn } = useAuth();
    const navigation = useNavigation<AuthNavigatorRoutesProps>();
    const toast = useToast();

    const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
        resolver: yupResolver(signInSchema)
    });

    async function handleSignIn({ email, password }: FormDataProps) {
        try {
            setIsLoading(true);
            await signIn(email, password);
        } catch (error) { //error é um objeto... neste caso da nossa classe criada no backend (AppError, que tem uma message e um status code)
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : "Não foi possível entrar. Tente novamente mais tarde"

            setIsLoading(false); //não no finally porque vamos encaminhar o usuário para outra rota, assim vamos perder a referência no momento do finally, podendo dar erro de memoria;

            toast.show({
                title,
                placement: "top",
                bgColor: "red.500"
            })
        }
    }

    function handleNewAccount() {
        navigation.navigate("signUp");
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            <VStack flex={1} px={10}>
                <Image
                    source={Background}
                    defaultSource={Background}
                    alt="Pessoas treinando"
                    resizeMode="contain"
                    position="absolute"
                />
                <Center my={20}>
                    <LogoSvg />
                    <Text color="gray.100" fontSize="sm">
                        Treine sua mente e seu corpo
                    </Text>
                </Center>
                <Center>
                    <Heading color="gray.100" fontSize="xl" mb={6} fontFamily="heading">
                        Acesse sua conta
                    </Heading>
                    <Controller
                        name="email"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <Input
                                placeholder="E-mail"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={value}
                                onChangeText={onChange}
                                errorMessage={errors.email?.message}
                            />
                        )}
                    />
                    <Controller
                        name="password"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <Input
                                placeholder="Senha"
                                onChangeText={onChange}
                                value={value}
                                errorMessage={errors.password?.message}
                                secureTextEntry
                                onSubmitEditing={handleSubmit(handleSignIn)}
                            />
                        )}
                    />

                    <Button
                        title="Acessar"
                        variant="outline"
                        onPress={handleSubmit(handleSignIn)}
                        isLoading={isLoading}
                    />
                </Center>

                <Center mb={4}>
                    <Text color="gray.100" fontSize="sm" mb={3} fontFamily="body">
                        Ainda não tem acesso?
                    </Text>
                    <Button title="Criar conta" onPress={handleNewAccount} />
                </Center>
            </VStack>
        </ScrollView >

    )
}