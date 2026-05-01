import { I18nProvider } from "./lib/i18n";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LandingPage from "./pages/LandingPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    }
  }
});

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <LandingPage />
        </I18nProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
