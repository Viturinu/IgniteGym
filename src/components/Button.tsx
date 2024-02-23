import { IButtonProps, Text, Button as NativeBaseButton } from "native-base"

type Props = IButtonProps & {
    title: string;
    variant?: "solid" | "outline"
}

export function Button({ title, color, variant = "solid", ...rest }: Props) {
    return (
        <NativeBaseButton
            w="full"
            h={14}
            bgColor={variant === "outline" ? "transparent" : "green.700"}
            borderColor="green.500"
            borderWidth={1}
            rounded="sm"
            _pressed={{
                bg: variant === "outline" ? "gray.500" : "green.500"
            }}
            {...rest}
        >
            <Text
                color={variant === "outline" ? "green.500" : "green"}
                fontFamily="heading"
                fontSize="sm"
            >
                {title}
            </Text>
        </NativeBaseButton >
    )
}