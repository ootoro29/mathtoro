"use client"
import { useAuth } from "@/context/auth";
import { Box ,Text, Heading, Center, Container, UnorderedList, ListItem ,Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
export const Content = ({waiting}:{waiting:boolean}) => {
    const user = useAuth();
    const router = useRouter();
    return(
        <Box m={3}>
            {
                (user &&
                    <Center m={10}> 
                        <Box>
                            <Heading >
                                {user.name}さん！ようこそ！
                            </Heading>
                            <Button
                                w={"100%"} 
                                bg={"skyblue"} 
                                _hover = {{
                                    background: "blue.100",
                                }}
                                mt={"16px"}
                                onClick={()=>{router.push('/home')}}
                            >
                                入場
                            </Button>
                        </Box>
                    </Center>
                )
            }
            {
                (user === null && !waiting)&&(
                    <Center m={10}>
                        <Heading>
                            ログインしてください
                        </Heading>
                    </Center>
                )
            }
            <Center>
                <Box maxW={"660px"}>
                    <Heading>
                        Mathtoroとは…
                    </Heading>
                    <Text padding={2} paddingLeft={4} >
                        数学の問題解決を効率よく行うためのWebアプリです。具体的には…
                    </Text>
                    <UnorderedList paddingLeft={8}>
                        <ListItem>「分からないとこいっぱいあるけどたくさん質問するのは申し訳ない…」</ListItem>
                        <ListItem>「いろんな人に質問しに行くのが大変」</ListItem>
                        <ListItem>「同じ問題で何人も質問が来て解説するのが大変だった。」</ListItem>
                        <ListItem>「質問したいけどあまり話したことない人に聞きにくい…」</ListItem>
                    </UnorderedList>
                    <Text padding={2} paddingLeft={4} >
                        こんな悩みを解決することを目標に開発しています。現在、本サービスはβ版です。
                    </Text>
                </Box>
            </Center>
        </Box>
    );
}