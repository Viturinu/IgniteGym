import { VStack, Image, Text, Center, Heading, ScrollView } from "native-base"
import Background from "@assets/background.png"
import LogoSvg from "@assets/logo.svg"
import { Input } from "@components/Input"
import { Button } from "@components/Button"
import { useNavigation } from "@react-navigation/native"
import { useForm, Controller } from "react-hook-form"

type FormDataProps = {
    name: string;
    email: string;
    password: string;
    password_confirm: string;
}

export function SignUp() {

    const navigation = useNavigation();

    const { control, handleSubmit } = useForm<FormDataProps>();

    function handleGoBack() {
        navigation.goBack();
    }

    function handleSignUp(data: any) {
        console.log(data)
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
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                placeholder="Confirme senha"
                                onChangeText={onChange}
                                secureTextEntry
                                value={value}
                                onSubmitEditing={handleSubmit(handleSignUp)}
                            />
                        )}
                    />
                    <Button
                        title="Criar e acessar"
                        onPress={handleSubmit(handleSignUp)}
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