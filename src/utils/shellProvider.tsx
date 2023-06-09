import React, { useEffect } from "react"
import { getMainColor } from "@/api"
import { amogus } from "@/data/art"
import { Shell } from "@/interfaces/shell"

import { History } from "../interfaces/history"
import * as bin from "./bin"
import { ascii } from "./bin/ascii"
import { cd } from "./bin/cd"
import { ls } from "./bin/ls"
import { pwd } from "./bin/pwd"
import { useTheme } from "./themeProvider"

const initialContext: Shell = {
  history: [],
  command: "",
  lastCommandIndex: 0,
  setHistory: () => {},
  setCommand: () => {},
  setLastCommandIndex: () => {},
  execute: async () => {},
  clearHistory: () => {},
}

const ShellContext = React.createContext<Shell>(initialContext)

interface ShellProviderProps {
  children: React.ReactNode
}

export const useShell = () => React.useContext(ShellContext)

export const ShellProvider: React.FC<ShellProviderProps> = ({ children }) => {
  const [init, setInit] = React.useState(true)
  const [history, _setHistory] = React.useState<History[]>([])
  const [command, _setCommand] = React.useState<string>("")
  const [lastCommandIndex, _setLastCommandIndex] = React.useState<number>(0)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setCommand("banner")
  }, [])

  useEffect(() => {
    if (!init) {
      execute()
    }
  }, [command, init])

  const setHistory = (output: string) => {
    _setHistory([
      ...history,
      {
        id: history.length,
        date: new Date(),
        command: command.split(" ").slice(1).join(" "),
        output,
      },
    ])
  }

  const setCommand = (command: string) => {
    _setCommand([Date.now(), command].join(" "))

    setInit(false)
  }

  const clearHistory = () => {
    _setHistory([])
  }

  const setLastCommandIndex = (index: number) => {
    _setLastCommandIndex(index)
  }

  const execute = async () => {
    const [cmd, ...args] = command.split(" ").slice(1)
    let output: string
    switch (cmd) {
      case "amogus":
        output = amogus

        setHistory(output)

        break
      case "theme":
        output = await bin.theme(args, setTheme)

        setHistory(output)

        break
      case "clear":
        clearHistory()

        break
      case "cls":
        clearHistory()

        break
      case "ls":
        output = await ls()

        setHistory(output)

        break
      case "pwd":
        output = await pwd()

        setHistory(output)

        break
      case "":
        setHistory("")
        break
      default: {
        if (Object.keys(bin).indexOf(cmd) === -1) {
          setHistory(`Command not found: ${cmd}. Try 'help' to get started.`)
        } else {
          try {
            const output = await bin[cmd](args)

            setHistory(output)
          } catch (error) {
            setHistory(error.message)
          }
        }
      }
    }
  }

  return (
    <ShellContext.Provider
      value={{
        history,
        command,
        lastCommandIndex,
        setHistory,
        setCommand,
        setLastCommandIndex,
        execute,
        clearHistory,
      }}
    >
      {children}
    </ShellContext.Provider>
  )
}
