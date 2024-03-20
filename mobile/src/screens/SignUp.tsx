import { VStack, Image, Text, Center, Heading, ScrollView, useToast } from "native-base"
import Background from "@assets/background.png"
import LogoSvg from "@assets/logo.svg"
import { Input } from "@components/Input"
import { Button } from "@components/Button"
import { useNavigation } from "@react-navigation/native"
import { useForm, Controller } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup";
import { api } from "@services/api"
import { AppError } from "@utils/AppError"
import { useState } from "react"
import { useAuth } from "@hooks/useAuth"

type FormDataProps = {
    name: string;
    email: string;
    password: string;
    password_confirm: string;
}

const signUpSchema = yup.object({
    name: yup.string().required("Informe o nome"),
    email: yup.string().required("Informe o e-mail").email("E-mail inválido"),
    password: yup.string().required("Você precisa inserir uma senha").min(6, "A senha deve ter pelo menos 6 dígitos"),
    password_confirm: yup.string().required("Confirme a senha").oneOf([yup.ref("password")], "A confirmação da senha não confere")

})

export function SignUp() {

    const { signIn } = useAuth();

    const navigation = useNavigation();

    const [isLoading, setIsLoading] = useState(false);

    const toast = useToast();

    const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({ //este error será carregado com o estados de erros verificados pelo resolver abaixo
        resolver: yupResolver(signUpSchema)
    });

    function handleGoBack() {
        navigation.goBack();
    }

    async function handleSignUp({ name, email, password }: FormDataProps) {
        try {
            setIsLoading(true);
            const response = await api.post("/users", { name, email, password }); //já vem convertida em json (diferente do fetch ali embaixo)
            await signIn(email, password);
        } catch (error) {
            setIsLoading(false);
            const isAppError = error instanceof AppError; //se for, ele é um erro tratado
            const title = isAppError ? error.message : "Não foi possível criar a conta, tente novamente mais tarde"
            toast.show({
                title,
                placement: "top",
                bgColor: "red.500"
            })
            /*
            if (axios.isAxiosError(error)) //verifica se essa excessão vem do backend
                Alert.alert(error.response?.data.message); //se for do axios, a gente consegue acessar essas estruturas subsequentes    
                */
        }
        /*
        const response = await fetch("http://192.168.1.12:3333/users", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        console.log(data);
        */
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
                        Crie sua conta
                    </Heading>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                placeholder="Nome"
                                onChangeText={onChange}
                                value={value}
                                errorMessage={errors.name?.message} //erro no name?
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                placeholder="Email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onChangeText={onChange}
                                value={value}
                                errorMessage={errors.email?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                placeholder="Senha"
                                onChangeText={onChange}
                                secureTextEntry
                                value={value}
                                errorMessage={errors.password?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password_confirm"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                placeholder="Confirme senha"
                                onChangeText={onChange}
                                secureTextEntry
                                value={value}
                                onSubmitEditing={handleSubmit(handleSignUp)}
                                errorMessage={errors.password_confirm?.message}
                            />
                        )}
                    />

                    <Button
                        title="Criar e acessar"
                        onPress={handleSubmit(handleSignUp)}
                        isLoading={isLoading}
                        mb={2}
                    />
                </Center>
                <Button
                    title="Voltar para o login"
                    variant="outline"
                    mb={2}
                    onPress={handleGoBack}
                />
            </VStack>
        </ScrollView >

    )
}