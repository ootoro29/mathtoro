'use client'
import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { useAuth } from "@/context/auth";
import {login,logout} from "@/lib/firebase/auth";
import { Dispatch, SetStateAction } from "react";

export const Header = ({waiting,setWaiting}:{waiting:boolean,setWaiting:Dispatch<SetStateAction<boolean>>}) => {
    const user = useAuth();
    const signIn = () => {
        setWaiting(true);
        login()
        .catch((error) => {
            console.error(error);
        })
        .finally(() => {
            setWaiting(false);
        })
    }
    return (
      <>
        <Box>
            <Flex
                bg = {'black'}
                color = {'white'}
                minH = {'60px'}
                py = {{base:2}}
                px = {{base:4}}
                borderBottom={1}
                borderStyle={'solid'}
                borderColor={'gray.500'}
                align={'center'}>
                <Text
                    fontFamily={'heading'}
                    fontSize={'28px'}
                    fontWeight={'bold'}
                    flex={1}
                >
                    Mathtoro
                </Text>
                {
                    (user === null && !waiting && 
                        <Button
                            onClick={signIn}
                        >
                            <Text
                                fontFamily={'heading'}
                                fontSize={'20px'}
                            >
                                ログイン
                            </Text>
                        </Button>
                    )
                }
                {
                    (user&& 
                        <Button
                            onClick={logout}
                        >
                            <Text
                                fontFamily={'heading'}
                                fontSize={'20px'}
                            >
                                ログアウト
                            </Text>
                        </Button>
                    )
                }
            </Flex>
        </Box>
      </>  
    );
}