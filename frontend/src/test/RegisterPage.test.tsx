import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BrowserRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { RegisterPage } from "@/app/RegisterPage"

const mockNavigate = vi.fn()

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock("@/lib/api/auth", () => ({
  register: vi.fn(),
}))

function renderRegisterPage() {
  return render(
    <BrowserRouter>
      <RegisterPage />
    </BrowserRouter>
  )
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the registration form", () => {
    renderRegisterPage()
    expect(screen.getByText("Crea tu cuenta")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Tu nombre completo")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("name@company.com")).toBeInTheDocument()
    const passwordInputs = screen.getAllByPlaceholderText("••••••••")
    expect(passwordInputs).toHaveLength(2)
  })

  it("toggles password visibility", async () => {
    renderRegisterPage()
    const passwordInputs = screen.getAllByPlaceholderText("••••••••")
    const passwordInput = passwordInputs[0]

    expect(passwordInput).toHaveAttribute("type", "password")

    const toggleButtons = screen.getAllByRole("button")
    await userEvent.click(toggleButtons[0])

    expect(passwordInput).toHaveAttribute("type", "text")

    await userEvent.click(toggleButtons[0])
    expect(passwordInput).toHaveAttribute("type", "password")
  })

  it("toggles confirm password visibility independently", async () => {
    renderRegisterPage()
    const passwordInputs = screen.getAllByPlaceholderText("••••••••")
    const passwordInput = passwordInputs[0]
    const confirmInput = passwordInputs[1]

    const toggleButtons = screen.getAllByRole("button")
    const confirmToggle = toggleButtons[1]

    await userEvent.click(confirmToggle)
    expect(passwordInput).toHaveAttribute("type", "password")
    expect(confirmInput).toHaveAttribute("type", "text")

    await userEvent.click(confirmToggle)
    expect(confirmInput).toHaveAttribute("type", "password")
  })
})
