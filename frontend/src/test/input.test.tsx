import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"

describe("Input", () => {
  it("renders with default props", () => {
    render(<Input placeholder="test" />)
    expect(screen.getByPlaceholderText("test")).toBeInTheDocument()
  })

  it("renders icon when provided", () => {
    render(<Input placeholder="test" icon={<Eye data-testid="eye-icon" />} />)
    expect(screen.getByTestId("eye-icon")).toBeInTheDocument()
  })

  it("calls onIconClick when icon button is clicked", async () => {
    const onClick = vi.fn()
    render(
      <Input
        placeholder="test"
        icon={<Eye data-testid="eye-icon" />}
        onIconClick={onClick}
      />
    )
    await userEvent.click(screen.getByTestId("eye-icon"))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("does not render icon when not provided", () => {
    render(<Input placeholder="test" />)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("renders different icon based on prop change", () => {
    const { rerender } = render(
      <Input placeholder="password" type="password" icon={<Eye data-testid="eye-icon" />} />
    )
    expect(screen.getByTestId("eye-icon")).toBeInTheDocument()

    rerender(
      <Input placeholder="password" type="text" icon={<EyeOff data-testid="eye-icon" />} />
    )
    expect(screen.getByTestId("eye-icon")).toBeInTheDocument()
  })
})
