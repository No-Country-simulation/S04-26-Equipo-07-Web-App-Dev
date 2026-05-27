import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BrowserRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { LoginPage } from "./LoginPage"

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock("@/contexts/UserAuthContext", () => ({
  useUserAuth: () => ({
    login: mockLogin,
    logout: vi.fn(),
    token: null,
    userId: null,
    credits: 0,
    isAuthenticated: false,
  }),
}))

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderLoginPage() {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  )
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the login form", () => {
    renderLoginPage()
    expect(screen.getByText("Bienvenido de nuevo")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("name@company.com")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument()
  })

  it("toggles password visibility when eye icon is clicked", async () => {
    renderLoginPage()
    const passwordInput = screen.getByPlaceholderText("••••••••")
    expect(passwordInput).toHaveAttribute("type", "password")

    const eyeButton = screen.getByRole("button", { name: /toggle password visibility/i })
    await userEvent.click(eyeButton)
    expect(passwordInput).toHaveAttribute("type", "text")

    await userEvent.click(eyeButton)
    expect(passwordInput).toHaveAttribute("type", "password")
  })

  it("shows error message on failed login", async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { error: "credenciales invalidas" } },
    })

    renderLoginPage()
    await userEvent.type(screen.getByPlaceholderText("name@company.com"), "test@test.com")
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "wrong")

    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByText("credenciales invalidas")).toBeInTheDocument()
    })
  })

  it("shows generic error when backend returns no message", async () => {
    mockLogin.mockRejectedValueOnce(new Error("network error"))

    renderLoginPage()
    await userEvent.type(screen.getByPlaceholderText("name@company.com"), "test@test.com")
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "wrong")

    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByText("Credenciales invalidas. Intenta nuevamente.")).toBeInTheDocument()
    })
  })
})
