
import { MoonIcon, SunIcon } from "lucide-react"
import { Button } from "./ui/button"
import { useTheme } from "@/hooks/use-theme"

export const Header = () => {
  const { theme, setTheme } = useTheme()
  
  return (
    <header className="border-b border-border py-3 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <span className="text-primary-foreground font-bold">PP</span>
        </div>
        <h1 className="text-lg font-semibold">Profit Pilot</h1>
      </div>
      
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  )
}
