import { Box, useTheme } from "native-base"
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { AuthRoutes } from "./auth.routes";
import { AppRoutes } from "./app.routes";
import { useAuth } from "@hooks/useAuth";

export function Routes() {
    const { colors } = useTheme();

    const theme = DefaultTheme;
    const authData = useAuth(); //é um hook, logo sempre que houver atualização, refletirá aqui.

    console.log(authData);

    theme.colors.background = colors.gray[700];

    return (
        <Box flex={1} bg="gray.700">
            <NavigationContainer theme={theme}>
                <AuthRoutes />
            </NavigationContainer>
        </Box>
    )
}