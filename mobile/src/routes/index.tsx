import { Box, useTheme } from "native-base"
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { AuthRoutes } from "./auth.routes";
import { AppRoutes } from "./app.routes";
import { useAuth } from "@hooks/useAuth";
import { Loading } from "@components/Loading";

export function Routes() {
    const { colors } = useTheme();

    const theme = DefaultTheme;
    const { user, isLoadingUserStorageData } = useAuth(); //é um hook, logo sempre que houver atualização nos estados, refletirá aqui.

    theme.colors.background = colors.gray[700];

    if (isLoadingUserStorageData) { //estado de contexto, para nos dizer se está recerregando informações de usuario ou excluiondo informações de usuário; daí a gente coloca o Loading pro usuário saber que algo está acontecendo (carregamento)
        return <Loading /> //retorna pra parar o fluxo, e assim que altera o estado, tudo é re-renderizado
    }

    return (
        <Box flex={1} bg="gray.700">
            <NavigationContainer theme={theme}>
                {user.id ? <AppRoutes /> : <AuthRoutes />}
            </NavigationContainer>
        </Box>
    )
}