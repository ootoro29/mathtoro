'use client'
import { Box, Container, Text } from "@chakra-ui/react";
import Image from "next/image";
import { Header } from "./components/top/Header";
import { Content } from "./components/top/Content";
import { useState } from "react";
import { useAuth } from "@/context/auth";

export default function Home() {
  const user = useAuth();
  const [waiting,setWaiting] = useState(false);
  return (
    <>
      
      {
        (!waiting)&&(
          <>
            <Header waiting = {waiting} setWaiting = {() => setWaiting} />
            <Content waiting = {waiting} />
          </>
        )
      }
    </>
  );
}
