import { createNativeStackNavigator, NativeStackNavigationProp } from "@react-navigation/native-stack"
import { SignIn } from "@screens/SignIn";
import { SignUp } from "@screens/SignUp";

type AuthRoutes = {
    signIn: undefined;
    signUp: undefined;
}

export type AuthNavigatorRoutesProps = NativeStackNavigationProp<AuthRoutes> //apenas para acesso externo, mas não necessário para a tipagem local aqui, para essa navegação. (authRoutes aqui é tipagem como no @types, mas local)

const { Navigator, Screen } = createNativeStackNavigator<AuthRoutes>();

export function AuthRoutes() {
    return (
        <Navigator
            initialRouteName="signIn"
            screenOptions={{ headerShown: false }}
        >
            <Screen
                name="signIn"
                component={SignIn}
            />
            <Screen
                name="signUp"
                component={SignUp}
            />
        </Navigator>
    )
}